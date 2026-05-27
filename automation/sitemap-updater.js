'use strict';
const fs   = require('fs');
const path = require('path');

const SITEMAP = path.join(__dirname, '..', 'sitemap.xml');

function updateSitemap(slug, priority = 0.7) {
  let content = fs.readFileSync(SITEMAP, 'utf-8');
  const url   = `https://wensurco.fr/${slug}`;

  if (content.includes(url)) return false; // idempotent

  const today = new Date().toISOString().split('T')[0];
  const entry = `  <url><loc>${url}</loc><changefreq>yearly</changefreq><priority>${priority.toFixed(1)}</priority><lastmod>${today}</lastmod></url>`;

  content = content.replace('</urlset>', `${entry}\n</urlset>`);
  fs.writeFileSync(SITEMAP, content, 'utf-8');
  return true;
}

module.exports = { updateSitemap };
