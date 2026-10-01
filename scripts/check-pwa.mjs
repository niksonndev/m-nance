/**
 * Valida o build PWA (roda no CI depois do `pnpm build`).
 *
 * Existe porque uma mudança que quebra o manifest, um ícone ou o precache
 * passa desapercebida em lint/testes — e o problema só aparece na hora de
 * instalar o app no celular.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const problems = [];

function readJson(file) {
  const path = join(DIST, file);
  if (!existsSync(path)) {
    problems.push(`faltando no build: ${file}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    problems.push(`${file}: JSON inválido (${error.message})`);
    return null;
  }
}

// 1. Arquivos obrigatórios
for (const file of [
  'index.html',
  'sw.js',
  'manifest.webmanifest',
  'precache-manifest.json',
  'favicon.svg',
]) {
  if (!existsSync(join(DIST, file))) problems.push(`faltando no build: ${file}`);
}

// 2. Manifest: campos exigidos para o navegador oferecer a instalação
const manifest = readJson('manifest.webmanifest');
if (manifest) {
  for (const field of ['name', 'short_name', 'start_url', 'display', 'icons']) {
    if (!manifest[field]) problems.push(`manifest sem "${field}"`);
  }
  if (manifest.display !== 'standalone') {
    problems.push(
      `manifest.display é "${manifest.display}" (esperado "standalone")`,
    );
  }

  const icons = manifest.icons ?? [];
  for (const size of ['192x192', '512x512']) {
    const found = icons.some((icon) => (icon.sizes ?? '').includes(size));
    if (!found) problems.push(`manifest sem ícone ${size} (obrigatório)`);
  }
  if (!icons.some((icon) => (icon.purpose ?? '').includes('maskable'))) {
    problems.push('manifest sem ícone maskable (Android corta o ícone)');
  }
  for (const icon of icons) {
    if (!existsSync(join(DIST, icon.src))) {
      problems.push(`ícone listado e ausente: ${icon.src}`);
    }
  }
}

// 3. Precache: precisa cobrir o app shell e só listar o que existe
const precache = readJson('precache-manifest.json');
if (precache) {
  const assets = precache.assets ?? [];
  if (!precache.version) problems.push('precache sem version');
  if (assets.length === 0) problems.push('precache sem assets');
  for (const asset of assets) {
    if (!existsSync(join(DIST, asset))) {
      problems.push(`asset listado e ausente: ${asset}`);
    }
  }
  if (!assets.includes('/index.html')) {
    problems.push('precache sem /index.html (fallback offline quebra)');
  }
  if (assets.includes('/sw.js')) {
    problems.push('/sw.js não pode estar no precache (trava atualizações)');
  }
}

// 4. index.html precisa apontar para o manifest e para o iOS
const htmlPath = join(DIST, 'index.html');
const html = existsSync(htmlPath) ? readFileSync(htmlPath, 'utf8') : '';
for (const marker of [
  'rel="manifest"',
  'apple-touch-icon',
  'theme-color',
  'apple-mobile-web-app-capable',
]) {
  if (!html.includes(marker)) problems.push(`index.html sem ${marker}`);
}

if (problems.length > 0) {
  console.error('Build PWA inválido:');
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}

console.log(
  `Build PWA ok: ${precache.assets.length} assets pré-cacheados, ` +
    `${manifest.icons.length} ícones, versão ${precache.version}.`,
);
