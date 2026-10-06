import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './api.js';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../data/uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const UPLOAD_MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

export function viteApiPlugin() {
  return {
    name: 'vite-plugin-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = req.url.split('?')[0];

        if (urlPath.startsWith('/api')) {
          handleApiRequest(req, res).catch(err => {
            console.error('[API Error]:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal API Server Error', details: err.message }));
          });
        } else if (urlPath.startsWith('/uploads/')) {
          let decodedSubPath;
          try {
            decodedSubPath = decodeURIComponent(urlPath.replace(/^\/uploads\//, ''));
          } catch {
            res.writeHead(400, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
            return res.end('Bad Request');
          }

          if (!decodedSubPath || decodedSubPath.includes('\0') || decodedSubPath.includes('/') || decodedSubPath.includes('\\')) {
            res.writeHead(403, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
            return res.end('Forbidden');
          }

          const mediaRow = db.prepare('SELECT id, filename, original_name FROM media_files WHERE filename = ?').get(decodedSubPath);
          if (!mediaRow) {
            const fallbackPath = path.resolve(process.cwd(), 'public', 'images', decodedSubPath);
            if (fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).isFile()) {
              const ext = path.extname(fallbackPath).toLowerCase();
              const contentType = UPLOAD_MIME_TYPES[ext] || 'image/png';
              res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
              fs.createReadStream(fallbackPath).pipe(res);
              return;
            }
            res.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
            return res.end('Not Found');
          }

          const filePath = path.resolve(UPLOADS_DIR, decodedSubPath);
          try {
            const realUploadDir = fs.realpathSync(UPLOADS_DIR);
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
            const contentType = UPLOAD_MIME_TYPES[ext];
            if (!contentType) {
              res.writeHead(403, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
              return res.end('Forbidden');
            }

            const headers = {
              'Content-Type': contentType,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'X-Content-Type-Options': 'nosniff',
              'Content-Security-Policy': "default-src 'none'"
            };
            if (ext === '.pdf') {
              const rawName = (mediaRow.original_name || path.basename(realFilePath)).replace(/[\r\n]/g, '');
              const asciiFallback = rawName.replace(/["\\;]/g, '_').replace(/[^\x20-\x7E]/g, '_').trim() || 'document.pdf';
              const percentEncoded = encodeURIComponent(rawName);
              headers['Content-Disposition'] = `attachment; filename="${asciiFallback}"; filename*=UTF-8''${percentEncoded}`;
            }

            res.writeHead(200, headers);
            fs.createReadStream(realFilePath).pipe(res);
            return;
          } catch {
            const fallbackPath = path.resolve(process.cwd(), 'public', 'images', decodedSubPath);
            if (fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).isFile()) {
              const ext = path.extname(fallbackPath).toLowerCase();
              const contentType = UPLOAD_MIME_TYPES[ext] || 'image/png';
              res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
              fs.createReadStream(fallbackPath).pipe(res);
              return;
            }
            res.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
            return res.end('Not Found');
          }
        } else {
          next();
        }
      });
    }
  };
}
