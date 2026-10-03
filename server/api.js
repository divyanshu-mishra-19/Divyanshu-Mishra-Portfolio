import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, hashPassword, verifyPassword, logAudit } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../data/uploads');

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper: apply CORS headers only if ALLOWED_ORIGIN is set and matches
export function applyCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  const origin = req.headers && req.headers['origin'];
  if (allowedOrigin && origin && origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin');
    res.setHeader('Vary', 'Origin');
  }
}

// Helper: send JSON response
export function sendJson(res, statusCode, data, method = 'GET') {
  const payload = JSON.stringify(data);
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(statusCode);
  if (method === 'HEAD') {
    return res.end();
  }
  res.end(payload);
}

// Helper: parse JSON body with strict size limit
export async function parseJsonBody(req, limit = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    let exceeded = false;
    req.on('data', chunk => {
      if (exceeded) return;
      body += chunk;
      if (body.length > limit) {
        exceeded = true;
        const err = new Error('Payload too large');
        err.statusCode = 413;
        reject(err);
      }
    });
    req.on('end', () => {
      if (exceeded) return;
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        const jsonErr = new Error('Invalid JSON payload');
        jsonErr.statusCode = 400;
        reject(jsonErr);
      }
    });
    req.on('error', (err) => {
      if (!exceeded) reject(err);
    });
  });
}

// Hash raw 64-hex token with SHA-256 for storage at rest
export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

// Extract client IP safely respecting TRUST_PROXY and rightmost-trusted hop count
export function getClientIp(req) {
  if (process.env.TRUST_PROXY === 'true') {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded && typeof forwarded === 'string') {
      const parts = forwarded.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 0) {
        const hops = Math.max(1, parseInt(process.env.TRUST_PROXY_HOPS || '1', 10));
        const targetIndex = Math.max(0, parts.length - hops);
        return parts[targetIndex];
      }
    }
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Origin validation: reject mismatched Origin on state-mutating requests, allow missing Origin
export function checkOrigin(req) {
  const method = (req.method || '').toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true; // Safe methods exempt
  }
  const origin = req.headers && req.headers['origin'];
  if (!origin) {
    return true; // Missing Origin allowed (Bearer token is primary control)
  }

  // 1. Expected origin must be ALLOWED_ORIGIN if set
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  if (allowedOrigin) {
    return origin === allowedOrigin;
  }

  // 2. Otherwise derived from Host plus X-Forwarded-Proto ONLY when TRUST_PROXY=true
  const host = req.headers && req.headers['host'];
  if (!host) {
    return false;
  }

  const isTrustProxy = process.env.TRUST_PROXY === 'true';
  let protocol = 'http';
  if (isTrustProxy) {
    const forwardedProto = req.headers['x-forwarded-proto'];
    if (forwardedProto) {
      protocol = String(forwardedProto).split(',')[0].trim().toLowerCase();
    } else if (req.socket && req.socket.encrypted) {
      protocol = 'https';
    }
  } else if (req.socket && req.socket.encrypted) {
    protocol = 'https';
  }

  const expectedOrigin = `${protocol}://${host}`;
  return origin === expectedOrigin;
}

// Configurable Rate Limiting: public GET, login, and write requests
export const RATE_LIMIT_PUBLIC = parseInt(process.env.RATE_LIMIT_PUBLIC || '300', 10);
export const RATE_LIMIT_LOGIN = parseInt(process.env.RATE_LIMIT_LOGIN || '10', 10);
export const RATE_LIMIT_WRITE = parseInt(process.env.RATE_LIMIT_WRITE || '60', 10);

const rateLimitWindows = new Map();

export function checkMemoryRateLimit(key, limit, windowMs = 60000) {
  const now = Date.now();
  let entry = rateLimitWindows.get(key);
  if (!entry || (now - entry.resetTime) > windowMs) {
    entry = { count: 1, resetTime: now };
    rateLimitWindows.set(key, entry);
    return { allowed: true };
  }
  entry.count++;
  if (entry.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime + windowMs - now) / 1000) };
  }
  return { allowed: true };
}

// Clean up stale rate limiting windows periodically
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitWindows.entries()) {
    if (now - v.resetTime > 60000) rateLimitWindows.delete(k);
  }
}, 300000).unref();

// Mask phone numbers on output only (e.g. +91-77******53)
export function maskPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '+91-77******53';
  const trimmed = phone.trim();
  if (!trimmed) return '+91-77******53';
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last2 = digits.slice(-2);
    const first2 = digits.length > 10 ? digits.slice(-10, -8) : digits.slice(0, 2);
    return `+91-${first2}******${last2}`;
  }
  return '+91-77******53';
}

const MAX_SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000; // 8 hours absolute maximum

export function getInactivityTimeoutMinutes() {
  try {
    const row = db.prepare("SELECT value FROM website_settings WHERE key = 'inactivity_timeout_minutes'").get();
    if (row && row.value) {
      const parsed = parseInt(JSON.parse(row.value), 10);
      if (!isNaN(parsed)) {
        return Math.max(5, Math.min(120, parsed)); // Clamp 5..120
      }
    }
  } catch {}
  return 30; // default 30 minutes
}

// Purge expired sessions
export function purgeExpiredSessions() {
  const now = Date.now();
  try {
    db.prepare('DELETE FROM sessions WHERE expires_at <= ? OR (created_at + ?) <= ?')
      .run(now, MAX_SESSION_LIFETIME_MS, now);
  } catch (err) {
    console.error('Failed to purge expired sessions:', err);
  }
}

// Authentication Middleware with SHA-256 token hashing at rest and sliding + absolute expiry
export function authenticateRequest(req) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  const rawToken = authHeader.substring(7).trim();
  // Valid token must be exactly 64 hex characters
  if (!rawToken || !/^[0-9a-fA-F]{64}$/.test(rawToken)) {
    return null;
  }

  const tokenHash = hashToken(rawToken);
  const now = Date.now();

  const session = db.prepare(`
    SELECT s.token, s.admin_id, s.expires_at, s.created_at, a.username, a.email, a.full_name, a.avatar
    FROM sessions s
    JOIN admins a ON s.admin_id = a.id
    WHERE s.token = ?
  `).get(tokenHash);

  if (!session) return null;

  // Enforce absolute max lifetime (8h) and sliding expiry
  if (now > session.expires_at || (session.created_at && (now - session.created_at) > MAX_SESSION_LIFETIME_MS)) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(tokenHash);
    return null;
  }

  // Refresh expiration on activity: sliding window clamped to max lifetime
  const inactivityMs = getInactivityTimeoutMinutes() * 60 * 1000;
  const newExpiry = Math.min(now + inactivityMs, (session.created_at || now) + MAX_SESSION_LIFETIME_MS);
  db.prepare('UPDATE sessions SET expires_at = ? WHERE token = ?').run(newExpiry, tokenHash);

  return {
    ...session,
    tokenHash
  };
}

// Unified rate limiting for IP and per-user throttling
export function checkRateLimit(key) {
  const now = Date.now();
  const record = db.prepare('SELECT * FROM login_attempts WHERE ip = ?').get(key);
  if (!record) return { allowed: true };

  if (record.locked_until && record.locked_until > now) {
    const secondsLeft = Math.ceil((record.locked_until - now) / 1000);
    const minutesLeft = Math.ceil(secondsLeft / 60);
    return {
      allowed: false,
      message: `Too many failed login attempts. Temporarily locked. Please try again in ${minutesLeft > 1 ? minutesLeft + ' minutes' : secondsLeft + ' seconds'}.`
    };
  }
  return { allowed: true };
}

export function recordLoginFailure(key) {
  const now = Date.now();
  const record = db.prepare('SELECT * FROM login_attempts WHERE ip = ?').get(key);
  if (!record) {
    db.prepare('INSERT INTO login_attempts (ip, attempts, locked_until, last_attempt) VALUES (?, 1, 0, ?)').run(key, now);
  } else {
    // Reset attempt count if last attempt was more than 15 minutes ago
    const newAttempts = (now - record.last_attempt > 15 * 60 * 1000) ? 1 : record.attempts + 1;
    let lockedUntil = 0;
    // Progressive lockouts:
    // 5 failures -> 1 min (60s)
    // 8 failures -> 5 min (300s)
    // 10+ failures -> max 15 min (900s)
    if (newAttempts >= 10) {
      lockedUntil = now + 15 * 60 * 1000;
    } else if (newAttempts >= 8) {
      lockedUntil = now + 5 * 60 * 1000;
    } else if (newAttempts >= 5) {
      lockedUntil = now + 60 * 1000;
    }
    db.prepare('UPDATE login_attempts SET attempts = ?, locked_until = ?, last_attempt = ? WHERE ip = ?')
      .run(newAttempts, lockedUntil, now, key);
  }
}

export function recordLoginSuccess(key) {
  db.prepare('DELETE FROM login_attempts WHERE ip = ?').run(key);
}

// Safe JSON parser for DB fields
function safeJson(str, fallback = []) {
  if (!str) return fallback;
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// Structured error logger for production: writes timestamp, route, and message to stderr without sensitive data
export function logServerError(err, req = null, context = 'Server') {
  const timestamp = new Date().toISOString();
  const method = req?.method || 'INTERNAL';
  const rawUrl = req?.url || 'unknown';
  // Strip query strings to ensure no tokens or secrets in URLs are logged
  const route = rawUrl.split('?')[0];
  const message = err?.message || String(err);
  process.stderr.write(`[${timestamp}] [${context} Error] ${method} ${route}: ${message}\n`);
}

// Generic error responder for production
export function handleServerError(res, err, defaultMsg = 'Internal server error', req = null) {
  logServerError(err, req, 'API');
  const isProd = process.env.NODE_ENV === 'production';
  return sendJson(res, 500, {
    error: isProd ? 'Internal server error' : (err?.message || defaultMsg)
  });
}

// -------------------------------------------------------------
// STRICT SCHEMA & COLUMN ALLOWLISTS
// -------------------------------------------------------------
export const ENTITY_SCHEMAS = {
  projects: {
    columns: new Set([
      'file', 'title', 'spine_title', 'tagline', 'description', 'tags', 'status',
      'image', 'spine_bg', 'spine_accent', 'live_url', 'github_url', 'video_url',
      'features', 'contribution', 'project_date', 'category', 'featured', 'published',
      'display_order'
    ]),
    urls: ['live_url', 'github_url', 'video_url'],
    numbers: ['featured', 'published', 'display_order']
  },
  achievements: {
    columns: new Set([
      'file', 'title', 'spine_title', 'desc', 'year', 'badge', 'issuer', 'category',
      'images', 'detailed_description', 'key_highlights', 'skills', 'certificate',
      'metric', 'featured', 'published', 'display_order'
    ]),
    urls: [],
    numbers: ['featured', 'published', 'display_order']
  },
  positions: {
    columns: new Set([
      'period', 'company', 'role', 'type', 'badge_color', 'metric', 'description',
      'highlights', 'skills', 'logo', 'images', 'external_link', 'featured', 'published',
      'display_order'
    ]),
    urls: ['external_link'],
    numbers: ['featured', 'published', 'display_order']
  },
  education: {
    columns: new Set([
      'institution', 'degree', 'period', 'grade', 'status', 'badge_color',
      'description', 'coursework', 'highlights', 'logo', 'published', 'display_order'
    ]),
    urls: [],
    numbers: ['published', 'display_order']
  },
  certifications: {
    columns: new Set([
      'name', 'issuing_organization', 'issue_date', 'expiry_date', 'credential_id',
      'credential_url', 'certificate_file', 'description', 'published', 'display_order'
    ]),
    urls: ['credential_url'],
    numbers: ['published', 'display_order']
  },
  skills: {
    columns: new Set([
      'name', 'category', 'color', 'level', 'icon_name', 'published', 'display_order'
    ]),
    urls: [],
    numbers: ['level', 'published', 'display_order']
  },
  gallery: {
    columns: new Set([
      'title', 'section', 'category', 'date', 'location', 'role', 'metric',
      'images', 'captions', 'description', 'featured', 'published', 'display_order'
    ]),
    urls: [],
    numbers: ['featured', 'published', 'display_order']
  },
  blog_posts: {
    columns: new Set([
      'file', 'title', 'category', 'read_time', 'author', 'date', 'description',
      'content', 'image', 'url', 'status', 'featured', 'display_order'
    ]),
    urls: ['url'],
    numbers: ['featured', 'display_order']
  }
};

export function validateEntityPayload(entity, body, isUpdate = false) {
  const schema = ENTITY_SCHEMAS[entity];
  if (!schema) return { valid: false, error: 'Invalid entity' };

  for (const [key, value] of Object.entries(body)) {
    const snake = key.replace(/([A-Z])/g, '_$1').toLowerCase();

    // Id handling
    if (snake === 'id') {
      if (isUpdate) continue; // Ignore id on PUT
      if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(value)) {
        return { valid: false, error: 'Invalid id format' };
      }
      continue;
    }

    // Timestamps are managed server-side only
    if (snake === 'created_at' || snake === 'updated_at') {
      continue;
    }

    // Reject unknown keys strictly
    if (!schema.columns.has(snake)) {
      return { valid: false, error: `Unknown or disallowed column: "${key}"` };
    }

    // URL validation: must begin with http:// or https://
    if (schema.urls.includes(snake) && value !== null && value !== undefined && value !== '') {
      if (typeof value !== 'string' || !/^https?:\/\//i.test(value.trim())) {
        return { valid: false, error: `Invalid URL format for "${key}". URL must begin with http:// or https://` };
      }
    }

    // Number validation
    if (schema.numbers.includes(snake) && value !== null && value !== undefined && value !== '') {
      const num = Number(value);
      if (isNaN(num)) {
        return { valid: false, error: `Invalid number format for "${key}"` };
      }
    }

    // Max text length constraint
    if (typeof value === 'string' && value.length > 65535) {
      return { valid: false, error: `Field "${key}" exceeds maximum allowed length` };
    }
  }

  return { valid: true };
}

// -------------------------------------------------------------
// PUBLIC CONTENT HANDLER
// -------------------------------------------------------------
export function buildFullPublicData() {
  // Profile (phone masked on output)
  const profileRow = db.prepare('SELECT * FROM profile LIMIT 1').get();
  let profile = null;
  if (profileRow) {
    profile = {
      name: profileRow.name,
      titles: safeJson(profileRow.titles, []),
      heroSubtitle: profileRow.hero_subtitle,
      avatar: profileRow.avatar,
      workspaceIllustration: profileRow.workspace_illustration,
      status: profileRow.status,
      email: profileRow.email,
      phone: maskPhoneNumber(profileRow.phone),
      github: profileRow.github,
      linkedin: profileRow.linkedin,
      about: {
        tagline: profileRow.about_tagline,
        paragraphs: safeJson(profileRow.about_paragraphs, []),
        highlights: safeJson(profileRow.about_highlights, [])
      }
    };
  }

  // Projects (published only, ordered)
  const projectRows = db.prepare('SELECT * FROM projects WHERE published = 1 ORDER BY display_order ASC, created_at DESC').all();
  const projects = projectRows.map(p => ({
    id: p.id,
    file: p.file,
    title: p.title,
    spineTitle: p.spine_title,
    tagline: p.tagline,
    description: p.description,
    tags: safeJson(p.tags, []),
    status: p.status,
    image: p.image,
    spineBg: p.spine_bg,
    spineAccent: p.spine_accent,
    liveUrl: p.live_url,
    githubUrl: p.github_url,
    videoUrl: p.video_url,
    features: safeJson(p.features, []),
    contribution: p.contribution,
    projectDate: p.project_date,
    category: p.category,
    featured: Boolean(p.featured)
  }));

  // Achievements (published only, ordered)
  const achRows = db.prepare('SELECT * FROM achievements WHERE published = 1 ORDER BY display_order ASC').all();
  const achievements = achRows.map(a => ({
    id: a.id,
    file: a.file,
    title: a.title,
    spineTitle: a.spine_title,
    desc: a.desc,
    year: a.year,
    badge: a.badge,
    issuer: a.issuer,
    category: a.category,
    images: safeJson(a.images, []),
    detailedDescription: a.detailed_description,
    keyHighlights: safeJson(a.key_highlights, []),
    skills: safeJson(a.skills, []),
    certificate: safeJson(a.certificate, {}),
    metric: a.metric,
    featured: Boolean(a.featured)
  }));

  // Positions (published only, ordered)
  const posRows = db.prepare('SELECT * FROM positions WHERE published = 1 ORDER BY display_order ASC').all();
  const positionsOfResponsibility = posRows.map(p => ({
    id: p.id,
    period: p.period,
    company: p.company,
    role: p.role,
    type: p.type,
    badgeColor: p.badge_color,
    metric: p.metric,
    description: p.description,
    highlights: safeJson(p.highlights, []),
    skills: safeJson(p.skills, []),
    logo: p.logo,
    images: safeJson(p.images, []),
    externalLink: p.external_link,
    featured: Boolean(p.featured)
  }));

  // Education (published only, ordered)
  const eduRows = db.prepare('SELECT * FROM education WHERE published = 1 ORDER BY display_order ASC').all();
  const education = eduRows.map(e => ({
    id: e.id,
    institution: e.institution,
    degree: e.degree,
    period: e.period,
    grade: e.grade,
    status: e.status,
    badgeColor: e.badge_color,
    description: e.description,
    coursework: safeJson(e.coursework, []),
    highlights: safeJson(e.highlights, []),
    logo: e.logo
  }));

  // Certifications (published only, ordered)
  const certRows = db.prepare('SELECT * FROM certifications WHERE published = 1 ORDER BY display_order ASC').all();
  const certifications = certRows.map(c => ({
    id: c.id,
    name: c.name,
    issuingOrganization: c.issuing_organization,
    issueDate: c.issue_date,
    expiryDate: c.expiry_date,
    credentialId: c.credential_id,
    credentialUrl: c.credential_url,
    certificateFile: c.certificate_file,
    description: c.description
  }));

  // Skills (published only, ordered)
  const skillRows = db.prepare('SELECT * FROM skills WHERE published = 1 ORDER BY display_order ASC').all();
  const skills = skillRows.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category,
    color: s.color,
    level: s.level,
    icon: s.icon_name
  }));

  // Gallery (published only, ordered)
  const galRows = db.prepare('SELECT * FROM gallery WHERE published = 1 ORDER BY display_order ASC').all();
  const gallery = galRows.map(g => ({
    id: g.id,
    title: g.title,
    section: g.section,
    category: g.category,
    date: g.date,
    location: g.location,
    role: g.role,
    metric: g.metric,
    images: safeJson(g.images, []),
    captions: safeJson(g.captions, []),
    description: g.description,
    featured: Boolean(g.featured)
  }));

  // Blog (published only, ordered)
  const blogRows = db.prepare('SELECT * FROM blog_posts WHERE status = ? ORDER BY display_order ASC, created_at DESC').all('published');
  const blog = blogRows.map(b => ({
    id: b.id,
    file: b.file,
    title: b.title,
    category: b.category,
    readTime: b.read_time,
    author: b.author,
    date: b.date,
    description: b.description,
    content: b.content,
    image: b.image,
    url: b.url,
    featured: Boolean(b.featured)
  }));

  // Website Settings
  const settingRows = db.prepare('SELECT key, value FROM website_settings').all();
  const settings = {};
  settingRows.forEach(r => {
    settings[r.key] = safeJson(r.value, r.value);
  });

  return {
    profile,
    skills,
    projects,
    achievements,
    positionsOfResponsibility,
    education,
    certifications,
    gallery,
    blog,
    settings,
    experience: [],
    audio: {
      title: "Focus Flow & Lo-Fi Beats",
      artist: "Deep Work Engineering Session",
      file: "playlist.spotify",
      duration: "3:12",
      cover: "/images/workspace.png"
    },
    contact: {
      name: profile?.name || 'Divyanshu Mishra',
      email: profile?.email || 'divyanshu.nit.28@gmail.com',
      phone: profile?.phone || '+91-77******53',
      github: profile?.github || 'https://github.com/divyanshu1911',
      linkedin: profile?.linkedin || 'https://www.linkedin.com/in/divyanshu-mishra-nit20241033',
      location: 'NIT Nagaland, India',
      footerText: 'Designed & Built by Divyanshu Mishra • React + Vite + Tailwind',
      heartbeatPort: ':4317'
    }
  };
}

export function syncDbToPortfolioDataJs() {
  if (process.env.NODE_ENV === 'production') {
    return; // In production, DB is the source of truth; avoid modifying source code
  }
  try {
    const fullData = buildFullPublicData();
    const filePath = path.resolve(__dirname, '../src/data/portfolioData.js');
    const code = `export const portfolioData = ${JSON.stringify(fullData, null, 2)};\n`;
    if (fs.existsSync(filePath)) {
      const current = fs.readFileSync(filePath, 'utf8');
      if (current === code) {
        return; // Content is identical; avoid triggering Vite watcher restart loop
      }
    }
    fs.writeFileSync(filePath, code, 'utf8');
  } catch (err) {
    console.error('[Sync Error]: Failed to write portfolioData.js:', err);
  }
}

export function handleGetPublicContent(res, req = null) {
  try {
    const data = buildFullPublicData();
    sendJson(res, 200, data, req?.method);
  } catch (err) {
    handleServerError(res, err, 'Failed to retrieve portfolio content', req);
  }
}

// -------------------------------------------------------------
// UPLOAD SECURITY & METADATA HELPERS (PHASE 5)
// -------------------------------------------------------------
export function stripJpegMetadata(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  const chunks = [buf.subarray(0, 2)]; // Keep SOI (0xFFD8)
  let offset = 2;
  let hasSos = false;

  while (offset < buf.length) {
    if (buf[offset] !== 0xFF) return null;
    const marker = buf[offset + 1];

    // RST markers, 0x00, EOI
    if (marker === 0xD9 || marker === 0x00 || (marker >= 0xD0 && marker <= 0xD7)) {
      chunks.push(buf.subarray(offset, offset + 2));
      offset += 2;
      continue;
    }

    if (marker === 0xDA) { // SOS (Start of Scan)
      hasSos = true;
      let eoiOffset = -1;
      for (let i = offset + 2; i < buf.length - 1; i++) {
        if (buf[i] === 0xFF && buf[i + 1] === 0xD9) {
          eoiOffset = i + 2;
          break;
        }
      }
      if (eoiOffset === -1) return null; // Corrupted: SOS without EOI
      chunks.push(buf.subarray(offset, eoiOffset)); // Strip any trailing data after EOI
      break;
    }

    if (offset + 4 > buf.length) return null;
    const len = buf.readUInt16BE(offset + 2);
    if (len < 2) return null;
    const end = offset + 2 + len;
    if (end > buf.length) return null;

    // Strip 0xE1 (APP1 EXIF/XMP), 0xED (APP13 Photoshop IPTC), 0xFE (COM)
    // Preserves 0xE0 (JFIF standard) and 0xE2 (APP2 ICC Colour Profile)
    if (marker === 0xE1 || marker === 0xED || marker === 0xFE) {
      offset = end;
      continue;
    }

    chunks.push(buf.subarray(offset, end));
    offset = end;
  }

  if (!hasSos) return null;
  return Buffer.concat(chunks);
}

export function stripPngMetadata(buf) {
  const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  if (!Buffer.isBuffer(buf) || buf.length < 8 || !buf.subarray(0, 8).equals(PNG_MAGIC)) return null;

  const chunks = [buf.subarray(0, 8)];
  let offset = 8;
  let hasIend = false;
  // Strip EXIF, text, comments, time; strictly PRESERVE color profiles (iCCP, sRGB, gAMA, cHRM)
  const stripTypes = new Set(['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME']);

  while (offset + 12 <= buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.subarray(offset + 4, offset + 8).toString('ascii');
    const totalChunkLen = 12 + len;
    const end = offset + totalChunkLen;
    if (end > buf.length) return null; // Corrupt chunk length

    if (stripTypes.has(type)) {
      offset = end;
      continue;
    }

    chunks.push(buf.subarray(offset, end));
    offset = end;
    if (type === 'IEND') {
      hasIend = true;
      break; // Truncate any polyglot data after IEND
    }
  }

  if (!hasIend) return null; // Corrupted PNG without IEND
  return Buffer.concat(chunks);
}

export function stripWebpMetadata(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf.subarray(0, 4).toString('ascii') !== 'RIFF' || buf.subarray(8, 12).toString('ascii') !== 'WEBP') {
    return null;
  }

  let offset = 12;
  const retainedChunks = [];
  let vp8xChunkIndex = -1;
  let hasVisualChunk = false;

  while (offset + 8 <= buf.length) {
    const fourCC = buf.subarray(offset, offset + 4).toString('ascii');
    const chunkSize = buf.readUInt32LE(offset + 4);
    const paddedSize = chunkSize + (chunkSize % 2);
    const end = offset + 8 + paddedSize;
    if (end > buf.length) return null; // Truncated chunk

    if (fourCC === 'VP8 ' || fourCC === 'VP8L' || fourCC === 'ANIM' || fourCC === 'ANMF') {
      hasVisualChunk = true;
    }

    // Strip EXIF and XMP chunks; preserve ALPH, ICCP, and visual data
    if (fourCC === 'EXIF' || fourCC === 'XMP ') {
      offset = end;
      continue;
    }

    const chunkBuf = buf.subarray(offset, end);
    if (fourCC === 'VP8X') {
      vp8xChunkIndex = retainedChunks.length;
    }
    retainedChunks.push(chunkBuf);
    offset = end;
  }

  if (!hasVisualChunk) return null; // Corrupt WebP without image frame

  if (vp8xChunkIndex !== -1) {
    const vp8xBuf = Buffer.from(retainedChunks[vp8xChunkIndex]);
    if (vp8xBuf.length >= 9) {
      // Clear EXIF flag (bit 3, 0x08) and XMP flag (bit 2, 0x04)
      vp8xBuf[8] = vp8xBuf[8] & ~0x08 & ~0x04;
      retainedChunks[vp8xChunkIndex] = vp8xBuf;
    }
  }

  const totalChunksPayload = Buffer.concat(retainedChunks);
  const totalRiffSize = 4 + totalChunksPayload.length;
  const header = Buffer.alloc(12);
  header.write('RIFF', 0, 4, 'ascii');
  header.writeUInt32LE(totalRiffSize, 4);
  header.write('WEBP', 8, 4, 'ascii');

  return Buffer.concat([header, totalChunksPayload]);
}

const ALLOWED_UPLOAD_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'pdf']);

export function detectFileTypeAndValidate(fileName, buffer) {
  if (!fileName || typeof fileName !== 'string') {
    return { valid: false, error: 'Invalid filename' };
  }
  const ext = path.extname(fileName).toLowerCase().replace(/^\./, '');
  if (!ALLOWED_UPLOAD_EXTS.has(ext)) {
    return { valid: false, error: `Disallowed file type (.${ext}). Allowed types: png, jpg, jpeg, webp, pdf` };
  }

  const isJpeg = buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isPng = buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A;
  const isWebp = buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  const isPdf = buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-';

  let detectedType = null;
  if (isJpeg) detectedType = 'jpg';
  else if (isPng) detectedType = 'png';
  else if (isWebp) detectedType = 'webp';
  else if (isPdf) detectedType = 'pdf';

  if (!detectedType) {
    return { valid: false, error: 'File content does not match any allowed file signatures (PNG, JPEG, WebP, PDF)' };
  }

  const claimedType = (ext === 'jpeg') ? 'jpg' : ext;
  if (claimedType !== detectedType) {
    return {
      valid: false,
      error: `File signature mismatch: claimed .${ext} but content detected as ${detectedType.toUpperCase()}`
    };
  }

  const mimeMap = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    pdf: 'application/pdf'
  };

  return {
    valid: true,
    detectedExt: detectedType,
    mimeType: mimeMap[detectedType],
    isDocument: detectedType === 'pdf'
  };
}

export function checkUploadQuotas(newUploadBytes) {
  const dailyLimit = parseInt(process.env.UPLOAD_DAILY_LIMIT || '50', 10);
  const maxStorage = parseInt(process.env.UPLOAD_MAX_STORAGE_BYTES || (500 * 1024 * 1024).toString(), 10);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const countRow = db.prepare('SELECT COUNT(*) as count FROM media_files WHERE created_at > ?').get(oneDayAgo);
  if (countRow && countRow.count >= dailyLimit) {
    return { allowed: false, status: 429, error: `Daily upload count limit (${dailyLimit}) reached. Try again tomorrow.` };
  }

  const sumRow = db.prepare('SELECT COALESCE(SUM(file_size), 0) as totalSize FROM media_files').get();
  const currentTotal = sumRow ? sumRow.totalSize : 0;
  if (currentTotal + newUploadBytes > maxStorage) {
    return { allowed: false, status: 413, error: `Total upload storage quota (${Math.round(maxStorage / (1024 * 1024))} MB) exceeded.` };
  }

  return { allowed: true };
}

export function checkMediaReferences(filename, filePath) {
  const referencedIn = [];
  const patterns = [filename, filePath].filter(Boolean);

  const profileRow = db.prepare('SELECT avatar FROM profile').get();
  if (profileRow && profileRow.avatar && patterns.some(p => profileRow.avatar.includes(p))) {
    referencedIn.push('profile');
  }

  const projectRow = db.prepare('SELECT COUNT(*) as c FROM projects WHERE image LIKE ? OR image LIKE ?').get(`%${filename}%`, `%${filePath}%`);
  if (projectRow && projectRow.c > 0) referencedIn.push('projects');

  const achRow = db.prepare('SELECT COUNT(*) as c FROM achievements WHERE images LIKE ? OR images LIKE ? OR certificate LIKE ? OR certificate LIKE ?').get(`%${filename}%`, `%${filePath}%`, `%${filename}%`, `%${filePath}%`);
  if (achRow && achRow.c > 0) referencedIn.push('achievements');

  const posRow = db.prepare('SELECT COUNT(*) as c FROM positions WHERE logo LIKE ? OR logo LIKE ? OR images LIKE ? OR images LIKE ?').get(`%${filename}%`, `%${filePath}%`, `%${filename}%`, `%${filePath}%`);
  if (posRow && posRow.c > 0) referencedIn.push('positions');

  const eduRow = db.prepare('SELECT COUNT(*) as c FROM education WHERE logo LIKE ? OR logo LIKE ?').get(`%${filename}%`, `%${filePath}%`);
  if (eduRow && eduRow.c > 0) referencedIn.push('education');

  const certRow = db.prepare('SELECT COUNT(*) as c FROM certifications WHERE certificate_file LIKE ? OR certificate_file LIKE ?').get(`%${filename}%`, `%${filePath}%`);
  if (certRow && certRow.c > 0) referencedIn.push('certifications');

  const galRow = db.prepare('SELECT COUNT(*) as c FROM gallery WHERE images LIKE ? OR images LIKE ?').get(`%${filename}%`, `%${filePath}%`);
  if (galRow && galRow.c > 0) referencedIn.push('gallery');

  const blogRow = db.prepare('SELECT COUNT(*) as c FROM blog_posts WHERE image LIKE ? OR image LIKE ?').get(`%${filename}%`, `%${filePath}%`);
  if (blogRow && blogRow.c > 0) referencedIn.push('blog_posts');

  const setRow = db.prepare('SELECT COUNT(*) as c FROM website_settings WHERE value LIKE ? OR value LIKE ?').get(`%${filename}%`, `%${filePath}%`);
  if (setRow && setRow.c > 0) referencedIn.push('website_settings');

  return referencedIn;
}

// -------------------------------------------------------------
// MAIN API ROUTER
// -------------------------------------------------------------
export async function handleApiRequest(req, res) {
  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;
  const method = req.method.toUpperCase();
  const clientIp = getClientIp(req);

  // Reject unsupported methods across API with 405 Method Not Allowed
  if (['PATCH', 'TRACE'].includes(method)) {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  // Apply CORS if configured (same-origin by default; no wildcard)
  applyCorsHeaders(req, res);

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Origin check for state-mutating requests (POST, PUT, DELETE)
  if (!checkOrigin(req)) {
    return sendJson(res, 403, { error: 'Forbidden: Origin mismatch' });
  }

  // 1. Public Content Endpoint: GET /api/content
  if (pathname === '/api/content') {
    if (method !== 'GET' && method !== 'HEAD') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }
    const rl = checkMemoryRateLimit(`pub:${clientIp}`, RATE_LIMIT_PUBLIC);
    if (!rl.allowed) {
      return sendJson(res, 429, { error: 'Too many requests. Please try again later.' });
    }
    return handleGetPublicContent(res, req);
  }

  // General write rate limit for other state-changing requests
  if (['POST', 'PUT', 'DELETE'].includes(method) && pathname !== '/api/auth/login') {
    const rl = checkMemoryRateLimit(`write:${clientIp}`, RATE_LIMIT_WRITE);
    if (!rl.allowed) {
      return sendJson(res, 429, { error: 'Too many write requests. Please try again later.' });
    }
  }

  // Determine body size limit: 7MB for /api/upload (accounting for base64 overhead), 1MB for all others
  const bodyLimit = pathname === '/api/upload' ? 7 * 1024 * 1024 : 1 * 1024 * 1024;

  // Helper to parse JSON body with appropriate size limit
  const getBody = async () => {
    return parseJsonBody(req, bodyLimit);
  };

  // 2. Auth: Login
  if (pathname === '/api/auth/login') {
    if (method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    // IP-level rate limit for login attempts
    const rl = checkMemoryRateLimit(`login_ip:${clientIp}`, RATE_LIMIT_LOGIN);
    if (!rl.allowed) {
      return sendJson(res, 429, { error: 'Too many login attempts. Please try again later.' });
    }

    let body;
    try {
      body = await getBody();
    } catch (err) {
      if (err.statusCode === 413) return sendJson(res, 413, { error: 'Payload too large' });
      return sendJson(res, 400, { error: 'Invalid JSON payload' });
    }

    const { username, password } = body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return sendJson(res, 400, { error: 'Username/email and password are required' });
    }

    const normalizedUser = username.trim().toLowerCase();
    const sanitizedUser = String(username).slice(0, 64).replace(/[\r\n\t\u0000-\u001f\u007f]/g, '');
    const userKey = `user:${normalizedUser}`;

    // Rate limiting checks: both IP and account progressive lockouts
    const ipLimit = checkRateLimit(clientIp);
    if (!ipLimit.allowed) {
      logAudit('LOCKOUT', 'AUTH', clientIp, `IP rate limit locked: ${clientIp}`);
      return sendJson(res, 429, { error: ipLimit.message });
    }
    const userLimit = checkRateLimit(userKey);
    if (!userLimit.allowed) {
      logAudit('LOCKOUT', 'AUTH', sanitizedUser, `Account rate limit locked: ${sanitizedUser}`);
      return sendJson(res, 429, { error: userLimit.message });
    }

    // Query admin by normalized username or email
    const admin = db.prepare(`
      SELECT * FROM admins WHERE LOWER(username) = ? OR LOWER(email) = ?
    `).get(normalizedUser, normalizedUser);

    // Constant-time execution defense: run dummy scrypt if user not found to prevent timing side-channel enumeration
    const DUMMY_SALT = '0123456789abcdef0123456789abcdef';
    const DUMMY_HASH = crypto.scryptSync('dummy_timing_protection_password', DUMMY_SALT, 64).toString('hex');

    const hashToTest = admin ? admin.password_hash : DUMMY_HASH;
    const saltToTest = admin ? admin.salt : DUMMY_SALT;
    const isValid = verifyPassword(password, hashToTest, saltToTest);

    if (!admin || !isValid) {
      recordLoginFailure(clientIp);
      recordLoginFailure(userKey);
      logAudit('LOGIN_FAILED', 'AUTH', sanitizedUser, `Failed login attempt from IP ${clientIp}`);
      return sendJson(res, 401, { error: 'Invalid credentials' });
    }

    // Clear failure attempts upon successful authentication
    recordLoginSuccess(clientIp);
    recordLoginSuccess(userKey);

    // Purge any expired sessions
    purgeExpiredSessions();

    // Create session: generate raw 64-hex token, store SHA-256 hash at rest
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const now = Date.now();
    const inactivityMinutes = getInactivityTimeoutMinutes();
    const expiresAt = now + inactivityMinutes * 60 * 1000;

    db.prepare(`
      INSERT INTO sessions (token, admin_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenHash, admin.id, expiresAt, now);

    logAudit('LOGIN', 'ADMIN', admin.id, `Admin logged in from IP ${clientIp}`);

    return sendJson(res, 200, {
      token: rawToken,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
        avatar: admin.avatar
      },
      expiresAt
    });
  }

  // 3. Auth: Logout
  if (pathname === '/api/auth/logout') {
    if (method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }
    const session = authenticateRequest(req);
    if (!session) {
      return sendJson(res, 401, { error: 'Unauthorized or session expired' });
    }
    db.prepare('DELETE FROM sessions WHERE token = ?').run(session.tokenHash);
    logAudit('LOGOUT', 'ADMIN', session.admin_id, 'Admin logged out');
    return sendJson(res, 200, { success: true, message: 'Logged out successfully' });
  }

  // 4. Auth: Me
  if (pathname === '/api/auth/me') {
    if (method !== 'GET') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }
    const session = authenticateRequest(req);
    if (!session) {
      return sendJson(res, 401, { error: 'Unauthorized or session expired' });
    }
    return sendJson(res, 200, {
      admin: {
        id: session.admin_id,
        username: session.username,
        email: session.email,
        fullName: session.full_name,
        avatar: session.avatar
      }
    });
  }

  // 5. Auth: Change Password
  if (pathname === '/api/auth/change-password') {
    if (method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }
    const session = authenticateRequest(req);
    if (!session) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }

    let body;
    try {
      body = await getBody();
    } catch (err) {
      if (err.statusCode === 413) return sendJson(res, 413, { error: 'Payload too large' });
      return sendJson(res, 400, { error: 'Invalid JSON payload' });
    }

    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return sendJson(res, 400, { error: 'Current password and new password are required' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 12) {
      return sendJson(res, 400, { error: 'New password must be at least 12 characters long' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(session.admin_id);
    if (!admin || !verifyPassword(currentPassword, admin.password_hash, admin.salt)) {
      logAudit('CHANGE_PASSWORD_FAILED', 'ADMIN', session.admin_id, 'Failed password change: incorrect current password');
      return sendJson(res, 400, { error: 'Current password does not match' });
    }

    const { hash, salt } = hashPassword(newPassword);
    db.prepare('UPDATE admins SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?')
      .run(hash, salt, new Date().toISOString(), session.admin_id);

    // Invalidate ALL sessions for this admin (force re-login)
    db.prepare('DELETE FROM sessions WHERE admin_id = ?').run(session.admin_id);

    logAudit('CHANGE_PASSWORD', 'ADMIN', session.admin_id, 'Password changed successfully; all sessions invalidated');
    return sendJson(res, 200, { success: true, message: 'Password changed successfully. Please log in again.' });
  }

  // --- PROTECTED ADMIN ROUTES ---
  const session = authenticateRequest(req);
  if (!session) {
    return sendJson(res, 401, { error: 'Unauthorized: admin access token required' });
  }

  // 6. Admin Overview Statistics & Activity
  if (pathname === '/api/admin/overview') {
    if (method !== 'GET') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }
    const projectCount = db.prepare('SELECT count(*) as c FROM projects').get().c;
    const publishedProjects = db.prepare('SELECT count(*) as c FROM projects WHERE published = 1').get().c;
    const achCount = db.prepare('SELECT count(*) as c FROM achievements').get().c;
    const posCount = db.prepare('SELECT count(*) as c FROM positions').get().c;
    const eduCount = db.prepare('SELECT count(*) as c FROM education').get().c;
    const certCount = db.prepare('SELECT count(*) as c FROM certifications').get().c;
    const skillCount = db.prepare('SELECT count(*) as c FROM skills').get().c;
    const galCount = db.prepare('SELECT count(*) as c FROM gallery').get().c;
    const blogCount = db.prepare('SELECT count(*) as c FROM blog_posts').get().c;
    const mediaCount = db.prepare('SELECT count(*) as c FROM media_files').get().c;

    const recentLogs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10').all();

    return sendJson(res, 200, {
      stats: {
        projects: { total: projectCount, published: publishedProjects },
        achievements: { total: achCount },
        positions: { total: posCount },
        education: { total: eduCount },
        certifications: { total: certCount },
        skills: { total: skillCount },
        gallery: { total: galCount },
        blog: { total: blogCount },
        media: { total: mediaCount }
      },
      recentLogs
    });
  }

  // 7. Profile Edit (GET & PUT)
  if (pathname === '/api/admin/profile') {
    if (method === 'GET') {
      const p = db.prepare('SELECT * FROM profile LIMIT 1').get();
      return sendJson(res, 200, {
        ...p,
        titles: safeJson(p?.titles, []),
        about_paragraphs: safeJson(p?.about_paragraphs, []),
        about_highlights: safeJson(p?.about_highlights, [])
      });
    }
    if (method === 'PUT') {
      let body;
      try {
        body = await getBody();
      } catch (err) {
        if (err.statusCode === 413) return sendJson(res, 413, { error: 'Payload too large' });
        return sendJson(res, 400, { error: 'Invalid JSON payload' });
      }

      const current = db.prepare('SELECT * FROM profile WHERE id = ?').get('main_profile') || {};

      const name = body.name !== undefined ? String(body.name) : (current.name || '');
      const titles = body.titles !== undefined ? JSON.stringify(body.titles) : (current.titles || '[]');
      const hero_subtitle = body.hero_subtitle !== undefined
        ? String(body.hero_subtitle)
        : (body.bio !== undefined ? String(body.bio) : (current.hero_subtitle || ''));
      const avatar = body.avatar !== undefined ? String(body.avatar) : (current.avatar || '');
      const workspace_illustration = body.workspace_illustration !== undefined
        ? String(body.workspace_illustration)
        : (current.workspace_illustration || '');
      const status = body.status !== undefined ? String(body.status) : (current.status || '');
      const email = body.email !== undefined ? String(body.email) : (current.email || '');
      const phone = body.phone !== undefined ? String(body.phone) : (current.phone || '');
      const github = body.github !== undefined ? String(body.github) : (current.github || '');
      const linkedin = body.linkedin !== undefined ? String(body.linkedin) : (current.linkedin || '');
      const about_tagline = body.about_tagline !== undefined
        ? String(body.about_tagline)
        : (body.tagline !== undefined ? String(body.tagline) : (current.about_tagline || ''));
      const about_paragraphs = body.about_paragraphs !== undefined
        ? JSON.stringify(body.about_paragraphs)
        : (current.about_paragraphs || '[]');
      const about_highlights = body.about_highlights !== undefined
        ? JSON.stringify(body.about_highlights)
        : (current.about_highlights || '[]');

      db.prepare(`
        UPDATE profile SET
          name = ?, titles = ?, hero_subtitle = ?, avatar = ?, workspace_illustration = ?,
          status = ?, email = ?, phone = ?, github = ?, linkedin = ?,
          about_tagline = ?, about_paragraphs = ?, about_highlights = ?, updated_at = ?
        WHERE id = 'main_profile'
      `).run(
        name,
        titles,
        hero_subtitle,
        avatar,
        workspace_illustration,
        status,
        email,
        phone,
        github,
        linkedin,
        about_tagline,
        about_paragraphs,
        about_highlights,
        new Date().toISOString()
      );
      logAudit('UPDATE', 'PROFILE', 'main_profile', 'Updated profile information');
      syncDbToPortfolioDataJs();
      return sendJson(res, 200, { success: true, message: 'Profile updated successfully' });
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  // 8. Website Settings (GET & PUT)
  if (pathname === '/api/admin/settings') {
    if (method === 'GET') {
      const rows = db.prepare('SELECT key, value FROM website_settings').all();
      const settings = {};
      rows.forEach(r => { settings[r.key] = safeJson(r.value, r.value); });
      return sendJson(res, 200, settings);
    }
    if (method === 'PUT') {
      let body;
      try {
        body = await getBody();
      } catch (err) {
        if (err.statusCode === 413) return sendJson(res, 413, { error: 'Payload too large' });
        return sendJson(res, 400, { error: 'Invalid JSON payload' });
      }

      const updateStmt = db.prepare(`
        INSERT INTO website_settings (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `);
      Object.entries(body).forEach(([k, v]) => {
        updateStmt.run(k, JSON.stringify(v), new Date().toISOString());
      });
      logAudit('UPDATE', 'SETTINGS', 'website_settings', 'Updated website settings');
      syncDbToPortfolioDataJs();
      return sendJson(res, 200, { success: true, message: 'Settings saved successfully' });
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  // 9. Media Upload: POST /api/upload
  if (pathname === '/api/upload') {
    if (method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }
    try {
      let body;
      try {
        body = await getBody();
      } catch (err) {
        if (err.statusCode === 413) return sendJson(res, 413, { error: 'Payload too large' });
        return sendJson(res, 400, { error: 'Invalid JSON payload' });
      }

      const { fileName, fileData, tags } = body;
      if (!fileName || !fileData) {
        return sendJson(res, 400, { error: 'fileName and fileData (base64) are required' });
      }

      // 1. Strict base64 format validation
      const b64Parts = String(fileData).split(';base64,');
      const cleanB64 = (b64Parts.length > 1 ? b64Parts[1] : b64Parts[0]).trim().replace(/[\r\n\s]/g, '');

      if (cleanB64.length === 0) {
        return sendJson(res, 400, { error: 'File cannot be empty' });
      }

      if (!/^[A-Za-z0-9+/=]+$/.test(cleanB64) || (cleanB64.length % 4 !== 0 && cleanB64.includes('='))) {
        return sendJson(res, 400, { error: 'Malformed base64 data' });
      }

      let buffer;
      try {
        buffer = Buffer.from(cleanB64, 'base64');
      } catch {
        return sendJson(res, 400, { error: 'Malformed base64 data' });
      }

      // 2. Size check: 0 bytes or > 5MB
      if (buffer.length === 0) {
        return sendJson(res, 400, { error: 'File cannot be empty' });
      }
      if (buffer.length > 5 * 1024 * 1024) {
        return sendJson(res, 413, { error: 'File size exceeds maximum allowed limit (5 MB)' });
      }

      // 3. Magic bytes detection & format validation (allowlist: png, jpg, webp, pdf)
      const detection = detectFileTypeAndValidate(fileName, buffer);
      if (!detection.valid) {
        return sendJson(res, 400, { error: detection.error });
      }

      const { detectedExt, mimeType, isDocument } = detection;

      // 4. Quotas check (per-day upload count & total disk storage)
      const quotas = checkUploadQuotas(buffer.length);
      if (!quotas.allowed) {
        return sendJson(res, quotas.status, { error: quotas.error });
      }

      // 5. EXIF / Metadata stripping in pure JavaScript
      let finalBuffer = buffer;
      if (detectedExt === 'jpg') {
        finalBuffer = stripJpegMetadata(buffer);
      } else if (detectedExt === 'png') {
        finalBuffer = stripPngMetadata(buffer);
      } else if (detectedExt === 'webp') {
        finalBuffer = stripWebpMetadata(buffer);
      }

      if (!finalBuffer) {
        return sendJson(res, 400, { error: 'Invalid or corrupt image metadata; upload rejected' });
      }

      // 6. Storage filename: crypto.randomUUID() + extension (never client filename!)
      const storageName = `${crypto.randomUUID()}.${detectedExt}`;
      const filePath = path.join(UPLOADS_DIR, storageName);
      fs.writeFileSync(filePath, finalBuffer);

      // 7. Sanitize original client filename for display metadata (strip control chars & path separators)
      const sanitizedOriginal = String(fileName)
        .replace(/[\r\n\t\u0000-\u001f\u007f/\\]/g, '_')
        .slice(0, 255);

      const publicUrl = `/uploads/${storageName}`;
      const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      db.prepare(`
        INSERT INTO media_files (id, filename, original_name, file_path, mime_type, file_size, file_type, upload_date, tags, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        mediaId,
        storageName,
        sanitizedOriginal,
        publicUrl,
        mimeType,
        finalBuffer.length,
        isDocument ? 'document' : 'image',
        new Date().toISOString().split('T')[0],
        JSON.stringify(tags || ['uploaded']),
        new Date().toISOString()
      );

      logAudit('UPLOAD', 'MEDIA', mediaId, `Uploaded file: ${sanitizedOriginal} (${finalBuffer.length} bytes, stored as ${storageName})`);
      syncDbToPortfolioDataJs();

      return sendJson(res, 201, {
        success: true,
        id: mediaId,
        url: publicUrl,
        filename: storageName,
        originalName: sanitizedOriginal,
        size: finalBuffer.length
      });
    } catch (err) {
      return handleServerError(res, err, 'Upload failed', req);
    }
  }

  // 10. Media Library List & Delete
  if (pathname === '/api/media') {
    if (method === 'GET') {
      const files = db.prepare('SELECT * FROM media_files ORDER BY created_at DESC').all();
      return sendJson(res, 200, files.map(f => ({
        ...f,
        tags: safeJson(f.tags, [])
      })));
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (pathname.startsWith('/api/media/')) {
    if (method !== 'DELETE') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }
    const id = pathname.replace('/api/media/', '');
    const media = db.prepare('SELECT * FROM media_files WHERE id = ?').get(id);
    if (!media) return sendJson(res, 404, { error: 'Media file not found' });

    // Check if media file is still referenced by any content table
    const referencedIn = checkMediaReferences(media.filename, media.file_path);

    if (media.file_path && media.file_path.startsWith('/uploads/')) {
      const diskFilename = path.basename(media.file_path);
      const diskPath = path.resolve(UPLOADS_DIR, diskFilename);
      try {
        const realPath = fs.realpathSync(diskPath);
        const realUploadDir = fs.realpathSync(UPLOADS_DIR);
        if (realPath.startsWith(realUploadDir) && fs.existsSync(realPath)) {
          fs.unlinkSync(realPath);
        }
      } catch (e) {
        // file already unlinked or outside uploads
      }
    }

    db.prepare('DELETE FROM media_files WHERE id = ?').run(id);
    const auditDetails = referencedIn.length > 0
      ? `Deleted media file: ${media.filename} (WARNING: referenced in ${referencedIn.join(', ')})`
      : `Deleted media file: ${media.filename}`;
    logAudit('DELETE', 'MEDIA', id, auditDetails);
    syncDbToPortfolioDataJs();

    const response = {
      success: true,
      message: 'Media file deleted'
    };
    if (referencedIn.length > 0) {
      response.warning = 'File was still referenced in content tables';
      response.referencedIn = referencedIn;
    }
    return sendJson(res, 200, response);
  }

  // 11. Generic Entity Handlers (Strictly Whitelisted)
  const validEntities = [
    'projects',
    'achievements',
    'positions',
    'education',
    'certifications',
    'skills',
    'gallery',
    'blog_posts',
    'blog'
  ];
  const resolveEntity = (e) => (e === 'blog' ? 'blog_posts' : e);

  // Reorder endpoint: POST /api/admin/:entity/reorder
  const reorderMatch = pathname.match(/^\/api\/admin\/([a-zA-Z0-9_-]+)\/reorder$/);
  if (reorderMatch) {
    if (method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }
    let entity = reorderMatch[1];
    if (!validEntities.includes(entity)) return sendJson(res, 404, { error: 'Invalid entity' });
    entity = resolveEntity(entity);

    let body;
    try {
      body = await getBody();
    } catch (err) {
      if (err.statusCode === 413) return sendJson(res, 413, { error: 'Payload too large' });
      return sendJson(res, 400, { error: 'Invalid JSON payload' });
    }

    const { orderedIds } = body;
    if (!Array.isArray(orderedIds)) return sendJson(res, 400, { error: 'orderedIds array required' });

    const updateStmt = db.prepare(`UPDATE ${entity} SET display_order = ? WHERE id = ?`);
    orderedIds.forEach((id, idx) => {
      updateStmt.run(idx, id);
    });

    logAudit('REORDER', entity.toUpperCase(), 'ALL', `Reordered ${orderedIds.length} items`);
    return sendJson(res, 200, { success: true, message: 'Items reordered successfully' });
  }

  // Toggle endpoint: POST /api/admin/:entity/:id/toggle
  const toggleMatch = pathname.match(/^\/api\/admin\/([a-zA-Z0-9_-]+)\/([^/]+)\/toggle$/);
  if (toggleMatch) {
    if (method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }
    let entity = toggleMatch[1];
    const id = toggleMatch[2];
    if (!validEntities.includes(entity)) return sendJson(res, 404, { error: 'Invalid entity' });
    entity = resolveEntity(entity);

    let body;
    try {
      body = await getBody();
    } catch (err) {
      if (err.statusCode === 413) return sendJson(res, 413, { error: 'Payload too large' });
      return sendJson(res, 400, { error: 'Invalid JSON payload' });
    }

    const { field } = body;
    if (!['published', 'featured'].includes(field)) {
      return sendJson(res, 400, { error: 'Can only toggle published or featured' });
    }

    // Special handling for blog_posts: map published to status ('published'/'draft')
    if (entity === 'blog_posts' && field === 'published') {
      const current = db.prepare('SELECT status FROM blog_posts WHERE id = ?').get(id);
      if (!current) return sendJson(res, 404, { error: 'Item not found' });
      const newStatus = current.status === 'published' ? 'draft' : 'published';
      db.prepare('UPDATE blog_posts SET status = ? WHERE id = ?').run(newStatus, id);
      logAudit('TOGGLE', 'BLOG_POSTS', id, `Toggled published to ${newStatus}`);
      syncDbToPortfolioDataJs();
      return sendJson(res, 200, { success: true, published: newStatus === 'published' ? 1 : 0 });
    }

    const current = db.prepare(`SELECT ${field} FROM ${entity} WHERE id = ?`).get(id);
    if (!current) return sendJson(res, 404, { error: 'Item not found' });

    const newValue = current[field] === 1 ? 0 : 1;
    db.prepare(`UPDATE ${entity} SET ${field} = ? WHERE id = ?`).run(newValue, id);

    logAudit('TOGGLE', entity.toUpperCase(), id, `Toggled ${field} to ${newValue}`);
    syncDbToPortfolioDataJs();
    return sendJson(res, 200, { success: true, [field]: newValue });
  }

  // Entity List: GET /api/admin/:entity and POST /api/admin/:entity
  const listMatch = pathname.match(/^\/api\/admin\/([a-zA-Z0-9_-]+)$/);
  if (listMatch) {
    let rawEntity = listMatch[1];
    if (!validEntities.includes(rawEntity)) {
      return sendJson(res, 404, { error: 'Invalid entity' });
    }
    const entity = resolveEntity(rawEntity);

    if (method === 'GET') {
      const rows = db.prepare(`SELECT * FROM ${entity} ORDER BY display_order ASC, rowid DESC`).all();
      const parsed = rows.map(r => {
        const obj = { ...r };
        Object.keys(obj).forEach(k => {
          if (typeof obj[k] === 'string' && (obj[k].startsWith('[') || obj[k].startsWith('{'))) {
            obj[k] = safeJson(obj[k], obj[k]);
          }
        });
        return obj;
      });
      return sendJson(res, 200, parsed);
    }

    if (method === 'POST') {
      let body;
      try {
        body = await getBody();
      } catch (err) {
        if (err.statusCode === 413) return sendJson(res, 413, { error: 'Payload too large' });
        return sendJson(res, 400, { error: 'Invalid JSON payload' });
      }

      // Strict column allowlist and payload validation
      const validation = validateEntityPayload(entity, body, false);
      if (!validation.valid) {
        return sendJson(res, 400, { error: validation.error });
      }

      const id = body.id || `${entity.slice(0, 4)}_${Date.now()}`;
      const now = new Date().toISOString();

      // Get table columns and schema
      const schema = ENTITY_SCHEMAS[entity];
      const tableCols = db.prepare(`PRAGMA table_info(${entity})`).all().map(c => c.name);
      const colSet = new Set(tableCols);
      const resolveCol = (k) => {
        if (colSet.has(k)) return k;
        const snake = k.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (colSet.has(snake)) return snake;
        return null;
      };

      const maxOrderRow = db.prepare(`SELECT MAX(display_order) as maxOrder FROM ${entity}`).get();
      const nextOrder = (maxOrderRow?.maxOrder ?? -1) + 1;

      const keys = ['id'];
      const placeholders = ['?'];
      const values = [id];
      const usedCols = new Set(['id']);

      if (body.display_order === undefined && body.displayOrder === undefined && schema.columns.has('display_order')) {
        keys.push('display_order');
        placeholders.push('?');
        values.push(nextOrder);
        usedCols.add('display_order');
      }
      if (body.published === undefined && schema.columns.has('published')) {
        keys.push('published');
        placeholders.push('?');
        values.push(1);
        usedCols.add('published');
      }
      if (['projects', 'blog_posts'].includes(entity)) {
        keys.push('created_at');
        placeholders.push('?');
        values.push(now);
        usedCols.add('created_at');
      }
      keys.push('updated_at');
      placeholders.push('?');
      values.push(now);
      usedCols.add('updated_at');

      Object.entries(body).forEach(([k, v]) => {
        const col = resolveCol(k);
        if (col && schema.columns.has(col) && !usedCols.has(col)) {
          usedCols.add(col);
          keys.push(col);
          placeholders.push('?');
          let val = v;
          if (typeof val === 'boolean') val = val ? 1 : 0;
          else if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          values.push(val);
        }
      });

      try {
        db.prepare(`INSERT INTO ${entity} (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`).run(...values);
        logAudit('CREATE', entity.toUpperCase(), id, `Created new ${entity} item: ${id}`);
        syncDbToPortfolioDataJs();
        return sendJson(res, 201, { success: true, id, message: 'Item created successfully' });
      } catch (err) {
        return handleServerError(res, err, 'Failed to create item', req);
      }
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  // Single Item: GET / PUT / DELETE /api/admin/:entity/:id
  const itemMatch = pathname.match(/^\/api\/admin\/([a-zA-Z0-9_-]+)\/([^/]+)$/);
  if (itemMatch) {
    let rawEntity = itemMatch[1];
    const id = itemMatch[2];
    if (!validEntities.includes(rawEntity)) {
      return sendJson(res, 404, { error: 'Invalid entity' });
    }
    const entity = resolveEntity(rawEntity);

    if (method === 'GET') {
      const row = db.prepare(`SELECT * FROM ${entity} WHERE id = ?`).get(id);
      if (!row) return sendJson(res, 404, { error: 'Item not found' });
      const obj = { ...row };
      Object.keys(obj).forEach(k => {
        if (typeof obj[k] === 'string' && (obj[k].startsWith('[') || obj[k].startsWith('{'))) {
          obj[k] = safeJson(obj[k], obj[k]);
        }
      });
      return sendJson(res, 200, obj);
    }

    if (method === 'PUT') {
      let body;
      try {
        body = await getBody();
      } catch (err) {
        if (err.statusCode === 413) return sendJson(res, 413, { error: 'Payload too large' });
        return sendJson(res, 400, { error: 'Invalid JSON payload' });
      }

      // Check item existence first
      const existing = db.prepare(`SELECT id FROM ${entity} WHERE id = ?`).get(id);
      if (!existing) return sendJson(res, 404, { error: 'Item not found' });

      // Validate payload strictly against schema
      const validation = validateEntityPayload(entity, body, true);
      if (!validation.valid) {
        return sendJson(res, 400, { error: validation.error });
      }

      const schema = ENTITY_SCHEMAS[entity];
      const tableCols = db.prepare(`PRAGMA table_info(${entity})`).all().map(c => c.name);
      const colSet = new Set(tableCols);
      const resolveCol = (k) => {
        if (colSet.has(k)) return k;
        const snake = k.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (colSet.has(snake)) return snake;
        return null;
      };

      const assignments = [];
      const values = [];
      const usedCols = new Set();

      Object.entries(body).forEach(([k, v]) => {
        const col = resolveCol(k);
        // Explicitly forbid overwriting id or created_at
        if (col && col !== 'id' && col !== 'created_at' && schema.columns.has(col) && !usedCols.has(col)) {
          usedCols.add(col);
          assignments.push(`${col} = ?`);
          let val = v;
          if (typeof val === 'boolean') val = val ? 1 : 0;
          else if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          values.push(val);
        }
      });

      // Always update updated_at timestamp
      assignments.push('updated_at = ?');
      values.push(new Date().toISOString());

      values.push(id);

      try {
        db.prepare(`UPDATE ${entity} SET ${assignments.join(', ')} WHERE id = ?`).run(...values);
        logAudit('UPDATE', entity.toUpperCase(), id, `Updated ${entity} item: ${id}`);
        syncDbToPortfolioDataJs();
        return sendJson(res, 200, { success: true, message: 'Item updated successfully' });
      } catch (err) {
        return handleServerError(res, err, 'Failed to update item', req);
      }
    }

    if (method === 'DELETE') {
      const existing = db.prepare(`SELECT id FROM ${entity} WHERE id = ?`).get(id);
      if (!existing) return sendJson(res, 404, { error: 'Item not found' });

      db.prepare(`DELETE FROM ${entity} WHERE id = ?`).run(id);
      logAudit('DELETE', entity.toUpperCase(), id, `Deleted ${entity} item: ${id}`);
      syncDbToPortfolioDataJs();
      return sendJson(res, 200, { success: true, message: 'Item deleted successfully' });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  // Not Found
  return sendJson(res, 404, { error: 'API route not found' });
}

// Initial sync on startup
try {
  syncDbToPortfolioDataJs();
} catch (e) {
  console.error('[Initial Sync Warning]:', e.message);
}
