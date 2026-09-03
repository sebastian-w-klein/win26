/**
 * Bundles the app into a single self-contained HTML file in dist/.
 *
 * The published Artifact is one file with no module loading and no external
 * stylesheet, so this inlines the bundled JS and the CSS into the page. Google
 * Fonts is left as a <link> because that host is allowed; every face has a real
 * fallback stack, so the page is correct if the fonts never arrive.
 */
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'dist');
await mkdir(out, { recursive: true });

const bundled = await build({
  entryPoints: [resolve(root, 'src/main.js')],
  bundle: true, format: 'iife', minify: false, write: false,
  target: ['es2022'], charset: 'utf8'
});
const js = bundled.outputFiles[0].text;
const css = await readFile(resolve(root, 'assets/styles.css'), 'utf8');
const html = await readFile(resolve(root, 'index.html'), 'utf8');

const fontLink = html.match(/<link href="https:\/\/fonts\.googleapis[^>]*>/)?.[0] ?? '';
const favicon = html.match(/<link rel="icon"[^>]*>/)?.[0] ?? '';
const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? 'War Room Draft 2028';
const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';

// Written as a page body: the Artifact host supplies doctype/html/head/body.
const page = `<title>${title}</title>
<meta name="description" content="${desc}">
${favicon}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontLink}
<style>
${css}
</style>
<div id="app"></div>
<script>
${js}
</script>
`;

await writeFile(resolve(out, 'index.html'), page, 'utf8');

// A standalone file that also works by double-clicking it locally.
await writeFile(resolve(out, 'standalone.html'),
  `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n` +
  `<meta name="viewport" content="width=device-width, initial-scale=1">\n${page}</head>\n<body>\n</body>\n</html>\n`,
  'utf8');

const kb = n => (n / 1024).toFixed(1) + ' KB';
console.log(`dist/index.html      ${kb(page.length)}  (artifact body)`);
console.log(`dist/standalone.html ${kb(page.length + 180)}  (opens from the filesystem)`);
