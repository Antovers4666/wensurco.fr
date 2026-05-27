'use strict';
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

// Fichiers/dossiers à exclure du déploiement
const EXCLUDE_DIRS  = new Set(['automation', 'node_modules', '.git']);
const EXCLUDE_FILES = new Set([
  'deploy-netlify.ps1', 'launch-browser.ps1',
  'CLAUDE.md', 'MODIFICATIONS.md', 'ANTIGRAVITY_CONTEXT.md',
  'GEMINI_BRIEFING.md', 'PROPOSALS.md', 'DEPLOYMENT_READY.txt',
  'package.json', 'package-lock.json', '.env',
  'racourcis vers claude code.txt',
]);
const WEB_EXTS = new Set(['.html', '.css', '.js', '.xml', '.txt', '.ico', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff', '.woff2']);
const ALWAYS_INCLUDE = new Set(['ads.txt', 'robots.txt', 'sitemap.xml']);

function scanFiles(dir, base = dir) {
  const map = {}; // netlifyPath → { diskPath, content }

  function walk(current, rel) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        if (!EXCLUDE_DIRS.has(e.name)) walk(path.join(current, e.name), rel + '/' + e.name);
      } else {
        const name = e.name;
        const ext  = path.extname(name).toLowerCase();
        const isTop = rel === '';

        if (isTop && EXCLUDE_FILES.has(name)) continue;
        if (!ALWAYS_INCLUDE.has(name) && !WEB_EXTS.has(ext)) continue;

        const diskPath    = path.join(current, name);
        const netlifyPath = (rel ? rel + '/' + name : '/' + name).replace(/\\/g, '/');
        const content     = fs.readFileSync(diskPath);
        map[netlifyPath]  = { diskPath, content };
      }
    }
  }

  walk(base, '');
  return map;
}

function sha1(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex');
}

async function netlifyRequest(method, url, token, body, contentType = 'application/json') {
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  contentType,
    },
    body: body instanceof Buffer ? body : (body ? JSON.stringify(body) : undefined),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Netlify API ${method} ${url} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.headers.get('content-type')?.includes('json') ? res.json() : res.text();
}

async function deploy(projectRoot, token, siteId, log) {
  const info = log || { info: () => {}, ok: () => {} };

  // 1. Scanner les fichiers
  const fileMap = scanFiles(projectRoot, projectRoot);
  const fileCount = Object.keys(fileMap).length;
  info.info(`Netlify : ${fileCount} fichiers à analyser`);

  // 2. Construire le manifeste SHA1
  const manifest = {};
  const sha1Map   = {}; // sha1 → netlifyPath
  for (const [netlifyPath, { content }] of Object.entries(fileMap)) {
    const hash = sha1(content);
    manifest[netlifyPath] = hash;
    sha1Map[hash] = netlifyPath;
  }

  // 3. Créer le déploiement
  const deploy = await netlifyRequest(
    'POST',
    `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
    token,
    { files: manifest }
  );

  const deployId  = deploy.id;
  const required  = deploy.required || [];
  info.info(`Netlify deploy créé : ${deployId} — ${required.length} fichier(s) à uploader`);

  // 4. Uploader les fichiers manquants (par lots de 5)
  const BATCH = 5;
  let uploaded = 0;
  for (let i = 0; i < required.length; i += BATCH) {
    const batch = required.slice(i, i + BATCH);
    await Promise.all(batch.map(async (hash) => {
      const netlifyPath = sha1Map[hash];
      if (!netlifyPath) return;
      const { content } = fileMap[netlifyPath];
      const encodedPath = netlifyPath.split('/').map(encodeURIComponent).join('/');
      await netlifyRequest(
        'PUT',
        `https://api.netlify.com/api/v1/deploys/${deployId}/files${encodedPath}`,
        token,
        content,
        'application/octet-stream'
      );
      uploaded++;
    }));
  }

  info.ok(`Netlify : ${uploaded} fichier(s) uploadé(s)`);
  return deploy;
}

module.exports = { deploy };
