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

          const candidatePaths = [
            path.resolve(UPLOADS_DIR, decodedSubPath),
            path.resolve(process.cwd(), 'public', 'uploads', decodedSubPath),
            path.resolve(process.cwd(), 'public', 'images', decodedSubPath),
          ];

          let foundFilePath = null;
          for (const candidate of candidatePaths) {
            if (fs.existsSync(candidate)) {
              try {
                const stat = fs.statSync(candidate);
                if (stat.isFile()) {
                  foundFilePath = candidate;
                  break;
                }
              } catch {}
            }
          }

          if (!foundFilePath) {
            res.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
            return res.end('Not Found');
          }

          const ext = path.extname(foundFilePath).toLowerCase();
          const contentType = UPLOAD_MIME_TYPES[ext] || 'application/octet-stream';

          const headers = {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, must-revalidate',
            'X-Content-Type-Options': 'nosniff',
          };
          if (ext === '.pdf') {
            headers['Content-Disposition'] = `attachment; filename="${path.basename(foundFilePath)}"`;
          }

          res.writeHead(200, headers);
          fs.createReadStream(foundFilePath).pipe(res);
          return;
        } else {
          next();
        }
      });
    }
  };
}
