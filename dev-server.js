const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const siteApi = require('./api/site.js');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const contentTypeByExtension = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function loadLocalEnvironment() {
  const envFile = path.join(root, '.env.local');
  if (!fs.existsSync(envFile)) return;

  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const separator = line.indexOf('=');
    if (separator <= 0 || line.trimStart().startsWith('#')) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function sendText(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(message);
}

async function handleApi(req, res) {
  if (req.method === 'GET') return siteApi(req, res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendText(res, 405, 'Method not allowed.');
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
      if (size > 5 * 1024 * 1024) return sendText(res, 413, 'Request is too large.');
    chunks.push(chunk);
  }

  try {
    req.body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    return sendText(res, 400, 'Invalid request body.');
  }
  return siteApi(req, res);
}

loadLocalEnvironment();
process.env.NODE_ENV = 'development';

http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/api/site') return handleApi(req, res);
  if (!['GET', 'HEAD'].includes(req.method)) return sendText(res, 405, 'Method not allowed.');

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return sendText(res, 400, 'Invalid path.');
  }
  if (decodedPath.split('/').some((part) => part.startsWith('.'))) return sendText(res, 404, 'Not found.');

  const filePath = path.resolve(root, `.${decodedPath === '/' ? '/index.html' : decodedPath}`);
  if (!filePath.startsWith(`${root}${path.sep}`)) return sendText(res, 404, 'Not found.');

  try {
    const file = await fs.promises.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': contentTypeByExtension[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : file);
  } catch {
    sendText(res, 404, 'Not found.');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Portfolio editor preview: http://localhost:${port}`);
});