/**
 * خادم ثابت بسيط لمعاينة نسخة البناء (dist) بدون الاعتماد على أدوات خارجية.
 *
 * السبب: مسار المشروع يحتوي على الرمز "#" (`D:\ORABI\c#\OrabiAcademy`)، وخادم
 * التطوير الخاص بـ Vite لا يستطيع خدمة الملفات من هذا المسار، لذا يُستخدم هذا
 * الخادم لمعاينة نسخة الإنتاج مباشرة.
 *
 * الاستخدام:
 *   npm run build:prod
 *   node tools/static-server.mjs            (المنفذ الافتراضي 4300)
 *   node tools/static-server.mjs 5000       (منفذ مخصص)
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, resolve, normalize, sep } from 'node:path';

const port = Number(process.argv[2] ?? process.env['PORT'] ?? 4300);
const root = resolve(process.cwd(), 'dist', 'orabi-academy-web', 'browser');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
};

if (!existsSync(root)) {
  console.error(`✖ لم يتم العثور على مجلد البناء: ${root}`);
  console.error('  شغّل أولاً: npm run build:prod');
  process.exit(1);
}

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let filePath = join(root, normalize(urlPath));

  // حماية من الخروج خارج مجلد البناء
  if (!filePath.startsWith(root + sep) && filePath !== root) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  // دعم مسارات تطبيق أحادي الصفحة (SPA fallback)
  if (!existsSync(filePath)) {
    filePath = join(root, 'index.html');
  }

  res.writeHead(200, {
    'Content-Type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`✔ معاينة نسخة البناء على: http://localhost:${port}/`);
});
