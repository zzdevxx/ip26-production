#!/usr/bin/env node
/**
 * Stage the static site into dist/ for Cloudflare Workers deployment.
 * The repository root also holds docs, CI config, scripts, and the .git history,
 * none of which belong on the edge. This copies only runtime files.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Runtime files and directories that make up the live site.
const RUNTIME = [
  'index.html',
  'archive.html',
  'inventory.html',
  'switcher.html',
  'presenter.html',
  'archive/index.html',
  'inventory/index.html',
  'switcher/index.html',
  'presenter/index.html',
  'style.css',
  'landing.css',
  'switcher/switcher.css',
  'presenter/presenter.css',
  'app.js',
  'landing.js',
  'switcher/switcher.js',
  'presenter/presenter.js',
  'favicon.svg',
  'data/playlist.js',
  'data/playlist.json',
  'data/songs.js',
];

// Optional files: copied when present, skipped silently otherwise.
const OPTIONAL = [
  'presenter/songs.js',
  'supabase-schema.sql',
];

function copyFile(rel) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) {
    return false;
  }
  const dest = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

let copied = 0;
RUNTIME.forEach((rel) => {
  if (copyFile(rel)) {
    copied += 1;
  } else {
    console.error(`MISSING required runtime file: ${rel}`);
    process.exitCode = 1;
  }
});
OPTIONAL.forEach((rel) => {
  if (copyFile(rel)) {
    copied += 1;
  }
});

console.log(`Staged ${copied} files into dist/`);
