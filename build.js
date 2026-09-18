#!/usr/bin/env node
/* Build the single-file version of the app.
 *
 *   node build.js            → dist/musiclearn.html   (standalone, opens anywhere)
 *   node build.js --artifact → dist/artifact.html     (body-only, for claude.ai Artifacts)
 *
 * index.html is the source of truth: this script inlines src/styles.css and
 * every local <script src="src/…"> into one file, and leaves the CDN tags alone.
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const html = read('index.html');
const artifactMode = process.argv.includes('--artifact');

const css = read('src/styles.css');
const localScripts = [...html.matchAll(/<script src="(src\/[^"]+)"><\/script>/g)].map(m => m[1]);
if (!localScripts.length) throw new Error('no local scripts found in index.html');
const js = localScripts.map(f => '/* ── ' + f + ' ── */\n' + read(f)).join('\n\n');

const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>\s*/, '')
  .replace(/<meta name="viewport"[^>]*>\s*/, '')
  .replace(/<link rel="stylesheet" href="src\/styles\.css">/, '<style>\n' + css + '\n</style>')
  .trim();

const body = html.match(/<body>([\s\S]*?)<\/body>/)[1]
  .replace(/<script src="src\/[^"]+"><\/script>\s*/g, '')
  /* the boot block may carry logic of its own (the optional sync step),
     so keep whatever is in it and put the bundle in front */
  .replace(/<script>([\s\S]*?APP\.boot\([\s\S]*?)<\/script>/,
    (m, inner) => '<script>\n' + js + '\n' + inner.trim() + '\n</script>')
  .trim();

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });

if (artifactMode) {
  /* Artifacts supply their own <!doctype>, <html>, <head> and <body>. */
  const out = head + '\n\n' + body + '\n';
  fs.writeFileSync(path.join(root, 'dist/artifact.html'), out);
  report('dist/artifact.html', out);
} else {
  const out = '<!doctype html>\n<html lang="en">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    head + '\n</head>\n<body>\n' + body + '\n</body>\n</html>\n';
  fs.writeFileSync(path.join(root, 'dist/musiclearn.html'), out);
  report('dist/musiclearn.html', out);
}

function report(name, out) {
  console.log('built ' + name + '  ·  ' + Math.round(out.length / 1024) + ' KB  ·  ' +
    localScripts.length + ' scripts inlined');
}
