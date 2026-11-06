const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const siteContent = require('../content/site.json');

const CONTENT_PATH = 'content/site.json';
const SESSION_COOKIE = 'site_editor';
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const UPLOADS = {
  portraitImage: {
    'image/jpeg': { filename: 'editor-portrait.jpg', signature: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
    'image/png': { filename: 'editor-portrait.png', signature: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
    'image/webp': { filename: 'editor-portrait.webp', signature: (buffer) => buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' },
  },
  resumeUrl: {
    'application/pdf': { filename: 'editor-resume.pdf', signature: (buffer) => buffer.toString('ascii', 0, 5) === '%PDF-' },
  },
};

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function cookieOptions(req, maxAge) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const secure = forwardedProto === 'https' || (!forwardedProto && process.env.NODE_ENV === 'production');
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

function signSession(expiresAt) {
  const payload = Buffer.from(JSON.stringify({ expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function hasValidSession(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = cookie?.slice(SESSION_COOKIE.length + 1);
  if (!token || !process.env.SESSION_SECRET) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url');
  if (!safeEqual(signature, expected)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isInteger(session.expiresAt) && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function hasSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  return origin === `${protocol}://${req.headers.host}`;
}

async function getGithubFile(token, repository, branch) {
  return getGithubFileAtPath(token, repository, CONTENT_PATH, branch);
}

async function getGithubFileAtPath(token, repository, filePath, branch) {
  const response = await fetch(`https://api.github.com/repos/${repository}/contents/${filePath}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GitHub read failed with ${response.status}`);
  return response.json();
}

async function saveGithubFile(token, repository, branch, filePath, content, message) {
  const existing = await getGithubFileAtPath(token, repository, filePath, branch).catch((error) => {
    if (error.message === 'GitHub read failed with 404') return null;
    throw error;
  });
  const response = await fetch(`https://api.github.com/repos/${repository}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      message,
      content: content.toString('base64'),
      ...(existing ? { sha: existing.sha } : {}),
      branch,
    }),
  });
  if (!response.ok) throw new Error(`GitHub write failed with ${response.status}`);
}

async function handleRead(res) {
  return sendJson(res, 200, siteContent);
}

function handleLogin(req, res, body) {
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return sendJson(res, 503, { error: 'Editor authentication is not configured.' });
  }
  if (typeof body.password !== 'string' || !safeEqual(body.password, process.env.ADMIN_PASSWORD)) {
    return sendJson(res, 401, { error: 'Incorrect password.' });
  }
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${signSession(expiresAt)}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${SESSION_TTL_SECONDS}${secure}`);
  return sendJson(res, 200, { ok: true });
}

function localStorageEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.LOCAL_EDITOR_STORAGE === 'true';
}

function decodeUpload(body) {
  if (typeof body.contentBase64 !== 'string' || body.contentBase64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(body.contentBase64)) {
    return { error: 'Invalid file data.' };
  }
  const buffer = Buffer.from(body.contentBase64, 'base64');
  if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES || buffer.toString('base64') !== body.contentBase64) {
    return { error: 'Files must be no larger than 3 MB.' };
  }

  const fieldUploads = UPLOADS[body.field];
  const fileType = fieldUploads?.[body.mimeType];
  if (!fileType?.signature(buffer)) {
    return { error: body.field === 'resumeUrl' ? 'Choose a valid PDF resume.' : 'Choose a valid JPEG, PNG, or WebP image.' };
  }
  return { buffer, filename: fileType.filename, path: `assests/images/${fileType.filename}` };
}

async function saveUpload(res, body) {
  const upload = decodeUpload(body);
  if (upload.error) return sendJson(res, 400, { error: upload.error });

  if (localStorageEnabled()) {
    await fs.writeFile(path.join(process.cwd(), upload.path), upload.buffer);
    return sendJson(res, 200, { ok: true, local: true, path: upload.path });
  }

  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY) {
    return sendJson(res, 503, { error: 'Publishing is not configured on the server.' });
  }
  const branch = process.env.GITHUB_BRANCH || 'main';
  await saveGithubFile(
    process.env.GITHUB_TOKEN,
    process.env.GITHUB_REPOSITORY,
    branch,
    upload.path,
    upload.buffer,
    `Update portfolio ${body.field === 'resumeUrl' ? 'resume' : 'portrait'}`,
  );
  return sendJson(res, 200, { ok: true, path: upload.path });
}

function uploadErrorMessage(error) {
  const statusMatch = /GitHub (?:read|write) failed with (\d+)/.exec(error.message);
  const githubStatus = Number(statusMatch?.[1]);
  if (githubStatus === 401) return 'GitHub rejected GITHUB_TOKEN. Replace it with an active fine-grained token.';
  if (githubStatus === 403) return 'GitHub denied this write. Give the token Contents read and write access to this repository.';
  if (githubStatus === 404) return 'GitHub could not find the repository, branch, or upload path. Check GITHUB_REPOSITORY and GITHUB_BRANCH.';
  if (githubStatus === 409 || githubStatus === 422) return 'GitHub rejected the file update. Retry once; if it persists, check repository write access.';
  if (Number.isInteger(githubStatus) && githubStatus > 0) return `GitHub upload failed with status ${githubStatus}. Check the token and repository permissions.`;
  return 'Could not save the uploaded file. Check the Vercel function logs and GitHub settings.';
}

async function saveContent(res, updated) {
  const isLocalStorageEnabled = localStorageEnabled();
  let current;
  let file;
  let branch;
  let token;
  let repository;

  if (isLocalStorageEnabled) {
    const currentText = await fs.readFile(path.join(process.cwd(), CONTENT_PATH), 'utf8');
    current = JSON.parse(currentText);
  } else if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY) {
    return sendJson(res, 503, { error: 'Publishing is not configured on the server.' });
  } else {
    branch = process.env.GITHUB_BRANCH || 'main';
    token = process.env.GITHUB_TOKEN;
    repository = process.env.GITHUB_REPOSITORY;
    file = await getGithubFile(token, repository, branch);
    current = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
  }

  const allowedKeys = Object.keys(current);
  if (!updated || typeof updated !== 'object' || Array.isArray(updated)) {
    return sendJson(res, 400, { error: 'Invalid site content.' });
  }
  if (Object.keys(updated).some((key) => !allowedKeys.includes(key)) || allowedKeys.some((key) => typeof updated[key] !== 'string' || updated[key].length > 4000)) {
    return sendJson(res, 400, { error: 'Site content has invalid fields or values.' });
  }

  if (isLocalStorageEnabled) {
    await fs.writeFile(path.join(process.cwd(), CONTENT_PATH), `${JSON.stringify(updated, null, 2)}\n`);
    return sendJson(res, 200, { ok: true, local: true, content: updated });
  }

  const response = await fetch(`https://api.github.com/repos/${repository}/contents/${CONTENT_PATH}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      message: 'Update portfolio content from site editor',
      content: Buffer.from(`${JSON.stringify(updated, null, 2)}\n`).toString('base64'),
      sha: file.sha,
      branch,
    }),
  });
  if (!response.ok) throw new Error(`GitHub write failed with ${response.status}`);
  return sendJson(res, 200, { ok: true, content: updated });
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return handleRead(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }
  if (!hasSameOrigin(req)) return sendJson(res, 403, { error: 'Request origin is not allowed.' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    return sendJson(res, 400, { error: 'Invalid request body.' });
  }
  if (body.action === 'login') return handleLogin(req, res, body);
  if (body.action === 'logout') {
    res.setHeader('Set-Cookie', cookieOptions(req, 0));
    return sendJson(res, 200, { ok: true });
  }
  if (!hasValidSession(req)) {
    return sendJson(res, 401, { error: 'Please sign in to save changes.' });
  }
  if (body.action === 'upload') {
    try {
      return await saveUpload(res, body);
    } catch (error) {
      console.error('Portfolio upload failed:', error.message);
      return sendJson(res, 502, { error: uploadErrorMessage(error) });
    }
  }
  if (body.action !== 'save') return sendJson(res, 400, { error: 'Unknown editor action.' });

  try {
    return await saveContent(res, body.content);
  } catch (error) {
    console.error('Portfolio publish failed:', error.message);
    return sendJson(res, 502, { error: 'Could not publish changes. Check the server configuration and try again.' });
  }
};
