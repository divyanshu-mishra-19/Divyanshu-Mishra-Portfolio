import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '../portfolio.db');

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');

// Helper for hashing password
export function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
}

// Initialize tables and seed
export async function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      salt TEXT,
      full_name TEXT,
      avatar TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      admin_id TEXT,
      expires_at INTEGER,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      ip TEXT PRIMARY KEY,
      attempts INTEGER DEFAULT 0,
      locked_until INTEGER DEFAULT 0,
      last_attempt INTEGER
    );

    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY,
      name TEXT,
      titles TEXT,
      hero_subtitle TEXT,
      avatar TEXT,
      workspace_illustration TEXT,
      status TEXT,
      email TEXT,
      phone TEXT,
      github TEXT,
      linkedin TEXT,
      about_tagline TEXT,
      about_paragraphs TEXT,
      about_highlights TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      file TEXT,
      title TEXT,
      spine_title TEXT,
      tagline TEXT,
      description TEXT,
      tags TEXT,
      status TEXT,
      image TEXT,
      spine_bg TEXT,
      spine_accent TEXT,
      live_url TEXT,
      github_url TEXT,
      video_url TEXT,
      features TEXT,
      contribution TEXT,
      project_date TEXT,
      category TEXT,
      featured INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      file TEXT,
      title TEXT,
      spine_title TEXT,
      desc TEXT,
      year TEXT,
      badge TEXT,
      issuer TEXT,
      category TEXT,
      images TEXT,
      detailed_description TEXT,
      key_highlights TEXT,
      skills TEXT,
      certificate TEXT,
      metric TEXT,
      featured INTEGER DEFAULT 1,
      published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS positions (
      id TEXT PRIMARY KEY,
      period TEXT,
      company TEXT,
      role TEXT,
      type TEXT,
      badge_color TEXT,
      metric TEXT,
      description TEXT,
      highlights TEXT,
      skills TEXT,
      logo TEXT,
      images TEXT,
      external_link TEXT,
      featured INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS education (
      id TEXT PRIMARY KEY,
      institution TEXT,
      degree TEXT,
      period TEXT,
      grade TEXT,
      status TEXT,
      badge_color TEXT,
      description TEXT,
      coursework TEXT,
      highlights TEXT,
      logo TEXT,
      published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      name TEXT,
      issuing_organization TEXT,
      issue_date TEXT,
      expiry_date TEXT,
      credential_id TEXT,
      credential_url TEXT,
      certificate_file TEXT,
      description TEXT,
      published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      color TEXT,
      level INTEGER DEFAULT 85,
      icon_name TEXT,
      published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      title TEXT,
      section TEXT,
      category TEXT,
      date TEXT,
      location TEXT,
      role TEXT,
      metric TEXT,
      images TEXT,
      captions TEXT,
      description TEXT,
      featured INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      file TEXT,
      title TEXT,
      category TEXT,
      read_time TEXT,
      author TEXT,
      date TEXT,
      description TEXT,
      content TEXT,
      image TEXT,
      url TEXT,
      status TEXT DEFAULT 'published',
      featured INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS media_files (
      id TEXT PRIMARY KEY,
      filename TEXT,
      original_name TEXT,
      file_path TEXT,
      mime_type TEXT,
      file_size INTEGER,
      file_type TEXT,
      upload_date TEXT,
      tags TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS website_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      timestamp TEXT
    );
  `);

  // Check if admin exists; if not, require ADMIN_INITIAL_PASSWORD or refuse to seed
  const adminCheck = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  if (!adminCheck || adminCheck.count === 0) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (initialPassword && initialPassword.length >= 12) {
      const { hash, salt } = hashPassword(initialPassword);
      const now = new Date().toISOString();
      
      db.prepare(`
        INSERT INTO admins (id, username, email, password_hash, salt, full_name, avatar, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'admin_root',
        adminUsername,
        'divyanshu.nit.28@gmail.com',
        hash,
        salt,
        'Divyanshu Mishra',
        '/images/avatar.png',
        now,
        now
      );
      console.log(`[Database] Initial admin account initialized for username: ${adminUsername}`);
    } else {
      console.warn('[Database] No admin account exists and ADMIN_INITIAL_PASSWORD (min 12 chars) was not provided. Skipping seed. Run scripts/reset-admin.js to configure admin credentials.');
    }
  }

  // Lazy loader for initial seed data (prevents static build dependency)
  let seed = null;
  const getSeed = async () => {
    if (!seed) {
      try {
        const mod = await import('../src/data/portfolioData.js');
        seed = mod.portfolioData || {};
      } catch {
        seed = {};
      }
    }
    return seed;
  };

  // Seed Profile
  const profileCheck = db.prepare('SELECT COUNT(*) as count FROM profile').get();
  if (!profileCheck || profileCheck.count === 0) {
    const portfolioData = await getSeed();
    const p = portfolioData.profile || {};
    db.prepare(`
      INSERT INTO profile (id, name, titles, hero_subtitle, avatar, workspace_illustration, status, email, phone, github, linkedin, about_tagline, about_paragraphs, about_highlights, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'main_profile',
      p.name || 'Divyanshu Mishra',
      JSON.stringify(p.titles || []),
      p.heroSubtitle || '',
      p.avatar || '/images/avatar.png',
      p.workspaceIllustration || '/images/workspace.png',
      p.status || 'Active & Building',
      p.email || 'divyanshu.nit.28@gmail.com',
      p.phone || '',
      p.github || 'https://github.com/divyanshu1911',
      p.linkedin || 'https://www.linkedin.com/in/divyanshu-mishra-nit20241033',
      p.about?.tagline || '',
      JSON.stringify(p.about?.paragraphs || []),
      JSON.stringify(p.about?.highlights || []),
      new Date().toISOString()
    );
    console.log('[Database] Seeded profile');
  }

  // Seed Projects
  const projectCheck = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (!projectCheck || projectCheck.count === 0) {
    const portfolioData = await getSeed();
    const insertProj = db.prepare(`
      INSERT INTO projects (id, file, title, spine_title, tagline, description, tags, status, image, spine_bg, spine_accent, live_url, github_url, video_url, features, contribution, project_date, category, featured, published, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    (portfolioData.projects || []).forEach((proj, idx) => {
      insertProj.run(
        proj.id,
        proj.file || `${proj.id}.py`,
        proj.title,
        proj.spineTitle || proj.title,
        proj.tagline || '',
        proj.description || '',
        JSON.stringify(proj.tags || []),
        proj.status || 'Active',
        proj.image || '',
        proj.spineBg || '#1e293b',
        proj.spineAccent || '#38bdf8',
        proj.liveUrl || '',
        proj.githubUrl || '',
        proj.videoUrl || '',
        JSON.stringify(proj.features || []),
        proj.contribution || '',
        proj.projectDate || '2025-2026',
        proj.category || 'Engineering',
        idx < 3 ? 1 : 0,
        1,
        idx,
        new Date().toISOString(),
        new Date().toISOString()
      );
    });
    console.log(`[Database] Seeded ${(portfolioData.projects || []).length} projects`);
  }

  // Seed Achievements
  const achCheck = db.prepare('SELECT COUNT(*) as count FROM achievements').get();
  if (!achCheck || achCheck.count === 0) {
    const portfolioData = await getSeed();
    const insertAch = db.prepare(`
      INSERT INTO achievements (id, file, title, spine_title, desc, year, badge, issuer, category, images, detailed_description, key_highlights, skills, certificate, metric, featured, published, display_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    (portfolioData.achievements || []).forEach((ach, idx) => {
      insertAch.run(
        ach.id,
        ach.file || `${ach.id}.md`,
        ach.title,
        ach.spineTitle || ach.title,
        ach.desc || '',
        ach.year || '2025',
        ach.badge || 'Award',
        ach.issuer || '',
        ach.category || 'National Innovation',
        JSON.stringify(ach.images || []),
        ach.detailedDescription || '',
        JSON.stringify(ach.keyHighlights || []),
        JSON.stringify(ach.skills || []),
        JSON.stringify(ach.certificate || {}),
        ach.metric || '',
        1,
        1,
        idx,
        new Date().toISOString()
      );
    });
    console.log(`[Database] Seeded ${(portfolioData.achievements || []).length} achievements`);
  }

  // Seed Positions
  const posCheck = db.prepare('SELECT COUNT(*) as count FROM positions').get();
  if (!posCheck || posCheck.count === 0) {
    const portfolioData = await getSeed();
    const insertPos = db.prepare(`
      INSERT INTO positions (id, period, company, role, type, badge_color, metric, description, highlights, skills, logo, images, external_link, featured, published, display_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    (portfolioData.positionsOfResponsibility || []).forEach((pos, idx) => {
      insertPos.run(
        pos.id,
        pos.period || '',
        pos.company || '',
        pos.role || '',
        pos.type || '',
        pos.badgeColor || '#38bdf8',
        pos.metric || '',
        pos.description || '',
        JSON.stringify(pos.highlights || []),
        JSON.stringify(pos.skills || []),
        pos.logo || '',
        JSON.stringify(pos.images || []),
        pos.externalLink || '',
        1,
        1,
        idx,
        new Date().toISOString()
      );
    });
    console.log(`[Database] Seeded ${(portfolioData.positionsOfResponsibility || []).length} positions`);
  }

  // Seed Education
  const eduCheck = db.prepare('SELECT COUNT(*) as count FROM education').get();
  if (!eduCheck || eduCheck.count === 0) {
    const portfolioData = await getSeed();
    const insertEdu = db.prepare(`
      INSERT INTO education (id, institution, degree, period, grade, status, badge_color, description, coursework, highlights, logo, published, display_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    (portfolioData.education || []).forEach((edu, idx) => {
      insertEdu.run(
        edu.id,
        edu.institution || '',
        edu.degree || '',
        edu.period || '',
        edu.grade || '',
        edu.status || '',
        edu.badgeColor || '#38bdf8',
        edu.description || '',
        JSON.stringify(edu.coursework || []),
        JSON.stringify(edu.highlights || []),
        edu.logo || '',
        1,
        idx,
        new Date().toISOString()
      );
    });
    console.log(`[Database] Seeded ${(portfolioData.education || []).length} education entries`);
  }

  // Seed Skills
  const skillsCheck = db.prepare('SELECT COUNT(*) as count FROM skills').get();
  if (!skillsCheck || skillsCheck.count === 0) {
    const portfolioData = await getSeed();
    const insertSkill = db.prepare(`
      INSERT INTO skills (id, name, category, color, level, icon_name, published, display_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    (portfolioData.skills || []).forEach((skill, idx) => {
      insertSkill.run(
        `skill_${idx}_${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        skill.name,
        skill.category || 'General',
        skill.color || '#38bdf8',
        85,
        skill.icon || '',
        1,
        idx,
        new Date().toISOString()
      );
    });
    console.log(`[Database] Seeded ${(portfolioData.skills || []).length} skills`);
  }

  // Seed Gallery
  const galCheck = db.prepare('SELECT COUNT(*) as count FROM gallery').get();
  if (!galCheck || galCheck.count === 0) {
    const portfolioData = await getSeed();
    const insertGal = db.prepare(`
      INSERT INTO gallery (id, title, section, category, date, location, role, metric, images, captions, description, featured, published, display_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    (portfolioData.gallery || []).forEach((g, idx) => {
      insertGal.run(
        g.id,
        g.title,
        g.section || 'events',
        g.category || 'Events',
        g.date || '',
        g.location || '',
        g.role || '',
        g.metric || '',
        JSON.stringify(g.images || []),
        JSON.stringify(g.captions || []),
        g.description || '',
        idx < 2 ? 1 : 0,
        1,
        idx,
        new Date().toISOString()
      );
    });
    console.log(`[Database] Seeded ${(portfolioData.gallery || []).length} gallery entries`);
  }

  // Seed Blog
  const blogCheck = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get();
  if (!blogCheck || blogCheck.count === 0) {
    const portfolioData = await getSeed();
    const insertBlog = db.prepare(`
      INSERT INTO blog_posts (id, file, title, category, read_time, author, date, description, content, image, url, status, featured, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    (portfolioData.blog || []).forEach((b, idx) => {
      insertBlog.run(
        b.id,
        b.file || `${b.id}.md`,
        b.title,
        b.category || 'ENGINEERING',
        b.readTime || '5 min read',
        b.author || 'Divyanshu Mishra',
        b.date || '2026',
        b.description || '',
        `# ${b.title}\n\n${b.description}\n\n## Architecture & Implementation Overview\n\nThis article outlines key technical decisions, benchmark evaluations, and real-world system resilience strategies engineered by Divyanshu Mishra.`,
        b.image || '/images/workspace.png',
        b.url || '',
        'published',
        idx === 0 ? 1 : 0,
        idx,
        new Date().toISOString(),
        new Date().toISOString()
      );
    });
    console.log(`[Database] Seeded ${(portfolioData.blog || []).length} blog posts`);
  }

  // Seed Website Settings
  const settingsCheck = db.prepare('SELECT COUNT(*) as count FROM website_settings').get();
  if (!settingsCheck || settingsCheck.count === 0) {
    const insertSetting = db.prepare(`
      INSERT INTO website_settings (key, value, updated_at)
      VALUES (?, ?, ?)
    `);

    const initialSettings = {
      hero_badge: "NIT NAGALAND • ACTIVE & BUILDING",
      hero_greeting: "HELLO, WORLD! I AM",
      hero_name: "DIVYANSHU MISHRA",
      hero_roles: ["AI & COMPUTER VISION", "FULL-STACK DEVELOPER", "AGENTIC AI / WORKFLOWS", "DATA SCIENCE & ML"],
      hero_tagline: "Electrical & Electronics Engineer by degree, AI & Full-Stack Developer by passion. Specializing in edge computer vision, multimodal diagnostic AI, and distributed systems.",
      cta_primary_text: "Explore My Projects",
      cta_primary_link: "#projects",
      cta_secondary_text: "Get In Touch",
      cta_secondary_link: "#contact",
      stats: [
        { label: "Engineering Projects", value: "6+" },
        { label: "National Recognitions", value: "4+" },
        { label: "Hackers Mentored", value: "200+" },
        { label: "CGPA at NIT Nagaland", value: "8.81" }
      ],
      contact_notice: "Always open to high-impact software engineering roles, research collaborations in computer vision & multimodal AI, and speaking or hackathon mentoring engagements.",
      inactivity_timeout_minutes: 30
    };

    Object.entries(initialSettings).forEach(([key, val]) => {
      insertSetting.run(key, JSON.stringify(val), new Date().toISOString());
    });
    console.log('[Database] Seeded initial website settings');
  }

  // Seed initial media files by scanning public/images
  const mediaCheck = db.prepare('SELECT COUNT(*) as count FROM media_files').get();
  if (!mediaCheck || mediaCheck.count === 0) {
    const imagesDir = path.resolve(__dirname, '../public/images');
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      const insertMedia = db.prepare(`
        INSERT INTO media_files (id, filename, original_name, file_path, mime_type, file_size, file_type, upload_date, tags, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      files.forEach((file, idx) => {
        const fullPath = path.join(imagesDir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && !file.startsWith('.')) {
          const ext = path.extname(file).toLowerCase();
          const mime = ext === '.png' ? 'image/png' : ext === '.svg' ? 'image/svg+xml' : 'image/jpeg';
          insertMedia.run(
            `media_img_${idx}`,
            file,
            file,
            `/images/${file}`,
            mime,
            stat.size,
            'image',
            new Date().toISOString().split('T')[0],
            JSON.stringify(['system', 'portfolio']),
            new Date().toISOString()
          );
        }
      });
      console.log(`[Database] Seeded initial media files from /images`);
    }
  }
}

export function logAudit(action, entityType, entityId, details) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, action, entity_type, entity_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      action,
      entityType,
      String(entityId || ''),
      typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
      new Date().toISOString()
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// Log SYSTEM_BOOT once per real process startup, only in production
let hasLoggedBoot = false;
export function logSystemBootOnce() {
  if (!hasLoggedBoot && process.env.NODE_ENV === 'production') {
    hasLoggedBoot = true;
    logAudit('SYSTEM_BOOT', 'PROCESS', 'SERVER', `Server process started (PID: ${process.pid})`);
  }
}

// Initialize tables on load (without audit log side effects)
await initDatabase();
