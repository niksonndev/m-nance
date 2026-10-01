import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Extensões que entram no precache do service worker. */
const PRECACHE_PATTERN = /\.(?:js|css|html|svg|png|ico|webmanifest|woff2?)$/;

/** Arquivos que nunca entram no precache. */
const PRECACHE_IGNORE = new Set(['/sw.js', '/precache-manifest.json']);

function listFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

const toUrl = (file) => `/${relative('dist', file).split(sep).join('/')}`;

/**
 * Gera dist/precache-manifest.json com os assets do build e uma versão
 * derivada do conteúdo deles. O public/sw.js lê esse arquivo no install para
 * montar o cache offline — evita a dependência de workbox/vite-plugin-pwa,
 * que exigiria reinstalar o node_modules (store do pnpm fora de sincronia).
 */
function pwaPrecacheManifest() {
  return {
    name: 'monkeynanca:precache-manifest',
    apply: 'build',
    closeBundle() {
      const files = listFiles('dist')
        .filter((file) => {
          const url = toUrl(file);
          return !PRECACHE_IGNORE.has(url) && PRECACHE_PATTERN.test(url);
        })
        .sort();

      const hash = createHash('sha256');
      for (const file of files) {
        hash.update(toUrl(file));
        hash.update(readFileSync(file));
      }

      const manifest = {
        version: hash.digest('hex').slice(0, 12),
        generatedAt: new Date().toISOString(),
        assets: files.map(toUrl),
      };

      writeFileSync(
        join('dist', 'precache-manifest.json'),
        `${JSON.stringify(manifest, null, 2)}\n`,
      );

      console.log(
        `\n  PWA  precache: ${manifest.assets.length} arquivos (versão ${manifest.version})\n`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), pwaPrecacheManifest()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
