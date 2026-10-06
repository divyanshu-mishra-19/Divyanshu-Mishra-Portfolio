process.env.NODE_ENV ??= 'production';

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { handleApiRequest, purgeExpiredSessions, checkMemoryRateLimit, RATE_LIMIT_PUBLIC, getClientIp, logServerError, applyCorsHeaders } from './api.js';
import { logSystemBootOnce, db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'production';
const DIST_DIR = path.resolve(__dirname, '../dist');
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../data/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

// Unified CORS logic exported from ./api.js (applyCorsHeaders)


const CLIENT_ROUTES = new Set(['/', '/admin', '/admin/']);

// In-memory cache for processed index.html with SITE_URL token replacement
let cachedIndexHtmlBuffer = null;
let cachedIndexHtmlEtag = null;
let cachedIndexHtmlLastModified = null;
let cachedIndexHtmlBrotli = null;
let cachedIndexHtmlGzip = null;

function getProcessedIndexHtml() {
  if (cachedIndexHtmlBuffer) {
    return {
      raw: cachedIndexHtmlBuffer,
      etag: cachedIndexHtmlEtag,
      lastModified: cachedIndexHtmlLastModified,
      br: cachedIndexHtmlBrotli,
      gzip: cachedIndexHtmlGzip
    };
  }

  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) return null;

  const stat = fs.statSync(indexPath);
  let html = fs.readFileSync(indexPath, 'utf8');

  const siteUrl = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (siteUrl) {
    const metaTags = [
      `    <link rel="canonical" href="${siteUrl}/" />`,
      `    <meta property="og:url" content="${siteUrl}/" />`,
      `    <meta property="og:image" content="${siteUrl}/og-image.jpg" />`,
      `    <meta name="twitter:image" content="${siteUrl}/og-image.jpg" />`
    ].join('\n');
    html = html.replace('<!-- __SITE_URL__ -->', metaTags);
  } else {
    // If unset, omit canonical/og:url/og:image rather than emit wrong domain
    html = html.replace('<!-- __SITE_URL__ -->', '');
  }

  const buf = Buffer.from(html, 'utf8');
  let hash = buf.length.toString(16);
  try {
    if (typeof zlib.crc32 === 'function') hash = zlib.crc32(buf).toString(16);
  } catch {}
  cachedIndexHtmlBuffer = buf;
  cachedIndexHtmlEtag = `W/"${buf.length.toString(16)}-${hash}"`;
  cachedIndexHtmlLastModified = stat.mtime.toUTCString();
  try {
    cachedIndexHtmlBrotli = zlib.brotliCompressSync(buf);
  } catch {}
  try {
    cachedIndexHtmlGzip = zlib.gzipSync(buf);
  } catch {}

  return {
    raw: cachedIndexHtmlBuffer,
    etag: cachedIndexHtmlEtag,
    lastModified: cachedIndexHtmlLastModified,
    br: cachedIndexHtmlBrotli,
    gzip: cachedIndexHtmlGzip
  };
}

function serveIndexHtml(req, res) {
  const data = getProcessedIndexHtml();
  if (!data) {
    res.writeHead(500, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
    return res.end('Index not found');
  }

  const clientEtag = req.headers['if-none-match'];
  if (clientEtag === data.etag) {
    res.writeHead(304, {
      'ETag': data.etag,
      'Last-Modified': data.lastModified,
      'Cache-Control': 'no-cache, must-revalidate'
    });
    return res.end();
  }

  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-cache, must-revalidate',
    'ETag': data.etag,
    'Last-Modified': data.lastModified,
    'Vary': 'Accept-Encoding'
  };

  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (acceptEncoding.includes('br') && data.br) {
    headers['Content-Encoding'] = 'br';
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    return res.end(data.br);
  } else if (acceptEncoding.includes('gzip') && data.gzip) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    return res.end(data.gzip);
  }

  headers['Content-Length'] = data.raw.length;
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  res.end(data.raw);
}

function serve404(req, res) {
  const filePath404 = path.join(DIST_DIR, '404.html');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (fs.existsSync(filePath404)) {
    const content = fs.readFileSync(filePath404);
    res.writeHead(404, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Length': content.length
    });
    if (req.method === 'HEAD') return res.end();
    return res.end(content);
  }
  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow'
  });
  if (req.method === 'HEAD') return res.end();
  res.end('Not Found');
}

// In-memory cache for precompressed static text assets (key: filePath + ':' + mtimeMs + ':' + encoding)
const compressionCache = new Map();
const COMPRESSIBLE_EXTENSIONS = new Set(['.html', '.css', '.js', '.json', '.svg']);

function serveStaticFile(req, res, filePath, urlPath, customHeaders = {}) {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const mtimeMs = Math.floor(stat.mtimeMs);
  const etag = `W/"${stat.size.toString(16)}-${mtimeMs.toString(16)}"`;
  const lastModified = stat.mtime.toUTCString();

  let cacheControl = 'no-cache, must-revalidate';
  if (urlPath.startsWith('/assets/')) {
    cacheControl = 'public, max-age=31536000, immutable';
  } else if (urlPath.startsWith('/uploads/')) {
    cacheControl = 'public, max-age=31536000, immutable';
  } else if (urlPath.startsWith('/images/') || urlPath.startsWith('/fonts/') || urlPath.startsWith('/audio/')) {
    cacheControl = 'public, max-age=86400, must-revalidate';
  }

  // 304 Revalidation
  const clientEtag = req.headers['if-none-match'];
  const clientIfModifiedSince = req.headers['if-modified-since'];
  if (clientEtag === etag || (clientIfModifiedSince && new Date(clientIfModifiedSince) >= stat.mtime)) {
    res.writeHead(304, {
      'ETag': etag,
      'Last-Modified': lastModified,
      'Cache-Control': cacheControl,
      ...customHeaders
    });
    return res.end();
  }

  const headers = {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': cacheControl,
    'ETag': etag,
    'Last-Modified': lastModified,
    ...customHeaders
  };

  if (COMPRESSIBLE_EXTENSIONS.has(ext)) {
    headers['Vary'] = headers['Vary'] ? `${headers['Vary']}, Accept-Encoding` : 'Accept-Encoding';
    const acceptEncoding = req.headers['accept-encoding'] || '';

    let encoding = null;
    if (acceptEncoding.includes('br') && typeof zlib.brotliCompressSync === 'function') {
      encoding = 'br';
    } else if (acceptEncoding.includes('gzip')) {
      encoding = 'gzip';
    }

    if (encoding) {
      const cacheKey = `${filePath}:${mtimeMs}:${encoding}`;
      let compressed = compressionCache.get(cacheKey);
      if (!compressed) {
        const raw = fs.readFileSync(filePath);
        if (encoding === 'br') {
          compressed = zlib.brotliCompressSync(raw, {
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 }
          });
        } else {
          compressed = zlib.gzipSync(raw, { level: 6 });
        }
        compressionCache.set(cacheKey, compressed);
      }

      headers['Content-Encoding'] = encoding;
      headers['Content-Length'] = compressed.length;
      res.writeHead(200, headers);
      if (req.method === 'HEAD') return res.end();
      return res.end(compressed);
    }
  }

  headers['Content-Length'] = stat.size;
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  return fs.createReadStream(filePath).pipe(res);
}

function applyGlobalSecurityHeaders(req, res, urlPath) {
  // Hide server fingerprint
  res.removeHeader('X-Powered-By');

  // MIME type sniffing defense
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy: deny invasive capabilities; preserve audio for app features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');

  // Clickjacking / framing defense
  res.setHeader('X-Frame-Options', 'DENY');

  // Window isolation (COOP)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // Search engine indexing defense: do not index admin portal or API responses
  if (urlPath.startsWith('/admin') || urlPath.startsWith('/api')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }

  // Cross-Origin Resource Policy (CORP):
  // For uploads and assets, allow cross-origin so social crawlers (og:image) and CDNs work without COEP blockage.
  if (urlPath.startsWith('/uploads/') || urlPath.startsWith('/assets/')) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }

  // Strict-Transport-Security (HSTS): only when HTTPS is real (never on localhost)
  const isHttps = (process.env.FORCE_HTTPS === 'true') ||
    (process.env.TRUST_PROXY === 'true' && req.headers['x-forwarded-proto'] === 'https');
  if (isHttps) {
    res.setHeader('Strict-Transport-Security', 'max-age=15768000');
  }

  // Content-Security-Policy
  if (urlPath.startsWith('/uploads/')) {
    res.setHeader('Content-Security-Policy', "default-src 'none'");
  } else {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data: blob:",
      "media-src 'self' blob:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ];
    if (isHttps) {
      cspDirectives.push('upgrade-insecure-requests');
    }
    const cspPolicy = cspDirectives.join('; ');
    const cspHeaderName = process.env.CSP_MODE === 'enforce'
      ? 'Content-Security-Policy'
      : 'Content-Security-Policy-Report-Only';
    res.setHeader(cspHeaderName, cspPolicy);
  }

  // Cache-Control based on route
  if (urlPath.startsWith('/api/auth/') || urlPath.startsWith('/api/admin/') || urlPath.startsWith('/api/media')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  } else if (urlPath === '/api/content') {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  } else if (urlPath.startsWith('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (urlPath === '/' || urlPath === '/index.html') {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = req.url.split('?')[0];
    const clientIp = getClientIp(req);

    // Apply global security headers to ALL responses (API, uploads, static, errors, 404/405)
    applyGlobalSecurityHeaders(req, res, urlPath);

    // Health check endpoint (GET /healthz)
    if (urlPath === '/healthz') {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'text/plain', 'Allow': 'GET, HEAD' });
        return res.end('Method Not Allowed');
      }
      const payload = JSON.stringify({ ok: true });
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Length': Buffer.byteLength(payload)
      });
      if (req.method === 'HEAD') return res.end();
      return res.end(payload);
    }

    // Dynamic robots.txt
    if (urlPath === '/robots.txt') {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'text/plain', 'Allow': 'GET, HEAD' });
        return res.end('Method Not Allowed');
      }
      const siteUrl = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
      let robots = 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n';
      if (siteUrl) {
        robots += `Sitemap: ${siteUrl}/sitemap.xml\n`;
      }
      const buf = Buffer.from(robots, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=86400, must-revalidate',
        'Content-Length': buf.length
      });
      if (req.method === 'HEAD') return res.end();
      return res.end(buf);
    }

    // Dynamic sitemap.xml
    if (urlPath === '/sitemap.xml') {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'text/plain', 'Allow': 'GET, HEAD' });
        return res.end('Method Not Allowed');
      }
      const siteUrl = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
      if (!siteUrl) {
        return serve404(req, res);
      }
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`;
      const buf = Buffer.from(sitemap, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=86400, must-revalidate',
        'Content-Length': buf.length
      });
      if (req.method === 'HEAD') return res.end();
      return res.end(buf);
    }

    // 1. API routes
    if (urlPath.startsWith('/api')) {
      return await handleApiRequest(req, res);
    }

    // Rate limiting for public static files & uploads
    const rl = checkMemoryRateLimit(`pub:${clientIp}`, RATE_LIMIT_PUBLIC);
    if (!rl.allowed) {
      res.writeHead(429, { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' });
      return res.end(JSON.stringify({ error: 'Too many requests. Please try again later.' }));
    }

  // 2. Uploaded media serving (from UPLOAD_DIR)
  if (urlPath.startsWith('/uploads/')) {
    let decodedSubPath;
    try {
      decodedSubPath = decodeURIComponent(urlPath.replace(/^\/uploads\//, ''));
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
      return res.end('Bad Request');
    }

    // Path containment check: reject directory traversal attempts, path separators, and null bytes
    if (!decodedSubPath || decodedSubPath.includes('\0') || decodedSubPath.includes('/') || decodedSubPath.includes('\\')) {
      res.writeHead(403, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
      return res.end('Forbidden');
    }

    // Only serve files registered in media_files SQLite table
    const mediaRow = db.prepare('SELECT id, filename, original_name FROM media_files WHERE filename = ?').get(decodedSubPath);
    if (!mediaRow) {
      // Fallback: check if asset exists in dist/images or public/images
      const fallbackDistPath = path.resolve(DIST_DIR, 'images', decodedSubPath);
      const fallbackPublicPath = path.resolve(process.cwd(), 'public', 'images', decodedSubPath);
      const candidatePath = fs.existsSync(fallbackDistPath) ? fallbackDistPath : (fs.existsSync(fallbackPublicPath) ? fallbackPublicPath : null);
          if (candidatePath) {
            return serveStaticFile(req, res, candidatePath, `/images/${decodedSubPath}`);
          }
      res.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
      return res.end('Not Found');
    }

    const filePath = path.resolve(UPLOAD_DIR, decodedSubPath);
    try {
      const realUploadDir = fs.realpathSync(UPLOAD_DIR);
      const realFilePath = fs.realpathSync(filePath);

      if (!realFilePath.startsWith(realUploadDir + path.sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
        return res.end('Forbidden');
      }

      const stat = fs.statSync(realFilePath);
      if (!stat.isFile()) {
        res.writeHead(403, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
        return res.end('Forbidden');
      }

      const ext = path.extname(realFilePath).toLowerCase();
      const UPLOAD_MIME_TYPES = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf'
      };
      const contentType = UPLOAD_MIME_TYPES[ext];
      if (!contentType) {
        res.writeHead(403, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
        return res.end('Forbidden');
      }

      applyCorsHeaders(req, res);
      const headers = {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'",
        'Cache-Control': 'public, max-age=86400'
      };

      if (ext === '.pdf') {
        const rawName = (mediaRow.original_name || path.basename(realFilePath)).replace(/[\r\n]/g, '');
        const asciiFallback = rawName.replace(/["\\;]/g, '_').replace(/[^\x20-\x7E]/g, '_').trim() || 'document.pdf';
        const percentEncoded = encodeURIComponent(rawName);
        headers['Content-Disposition'] = `attachment; filename="${asciiFallback}"; filename*=UTF-8''${percentEncoded}`;
      }

      res.writeHead(200, headers);
      return fs.createReadStream(realFilePath).pipe(res);
    } catch {
      // Fallback: check if asset exists in dist/images or public/images
      const fallbackDistPath = path.resolve(DIST_DIR, 'images', decodedSubPath);
      const fallbackPublicPath = path.resolve(process.cwd(), 'public', 'images', decodedSubPath);
      const candidatePath = fs.existsSync(fallbackDistPath) ? fallbackDistPath : (fs.existsSync(fallbackPublicPath) ? fallbackPublicPath : null);
      if (candidatePath) {
        return serveStaticFile(req, res, candidatePath, `/images/${decodedSubPath}`);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
      return res.end('Not Found');
    }
  }

  // 3. Static files and client routes
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain', 'Allow': 'GET, HEAD' });
    return res.end('Method Not Allowed');
  }

  // Exact client routes from App.jsx: /, /admin, /admin/
  if (CLIENT_ROUTES.has(urlPath)) {
    return serveIndexHtml(req, res);
  }

  const safeReqPath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\\\])+/, '');
  const filePath = path.resolve(DIST_DIR, '.' + safeReqPath);

  // Prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
    return res.end('Forbidden');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveStaticFile(req, res, filePath, safeReqPath);
  }

  // Unmatched routes return real 404
  return serve404(req, res);
  } catch (err) {
    logServerError(err, req, 'HTTP');
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

server.listen(PORT, () => {
  logSystemBootOnce();
  purgeExpiredSessions();
  console.log(`[Portfolio Server] Running in ${NODE_ENV} mode on http://localhost:${PORT}`);
  console.log(`[Portfolio Server] Serving dist from: ${DIST_DIR}`);
  console.log(`[Portfolio Server] Serving uploads from: ${UPLOAD_DIR}`);
});
