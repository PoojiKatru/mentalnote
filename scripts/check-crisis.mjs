// Fails the build if any public page is missing a crisis resource or the quick
// exit (brief §9 / §19.1 / §19.1b). Checks the BUILT output in dist/, because
// that is what a visitor actually receives — not the source.
//
// "Crisis resources disappearing from a page is the only bug on this site that
// can actually hurt someone." Keep this check strict.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

// Every one of these strings must appear on every page.
const REQUIRED = ['988', '741741', '800-799-7233', '88788'];
const QUICK_EXIT = 'data-quick-exit';

// /admin is the Sveltia CMS tool, not a site page — it has no footer by design.
const EXCLUDE = [/^admin\//];

async function htmlFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = await htmlFiles(DIST);
if (files.length === 0) {
  console.error('✗ no HTML found in dist/ — did the build run?');
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  const rel = relative(DIST, file);
  if (EXCLUDE.some((re) => re.test(rel))) continue;
  const html = await readFile(file, 'utf8');
  const missing = REQUIRED.filter((s) => !html.includes(s));
  if (!html.includes(QUICK_EXIT)) missing.push(`${QUICK_EXIT} (quick exit)`);
  if (missing.length) {
    console.error(`✗ ${rel} missing: ${missing.join(', ')}`);
    failed++;
  }
}

const checked = files.filter((f) => !EXCLUDE.some((re) => re.test(relative(DIST, f)))).length;
if (failed) {
  console.error(`\n${failed} page(s) failed the crisis-resource check.`);
  process.exit(1);
}
console.log(`✓ crisis resources + quick exit present on all ${checked} pages`);
