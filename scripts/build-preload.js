/**
 * Сборка preload в один бандл (esbuild).
 * Вход: electron/preload.ts и все импорты из electron/preload/* и electron/types/*.
 * Выход: dist-app/electron/preload.js.
 * Используется в цепочке build:electron для устранения "module not found" в упакованном приложении.
 */

const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');
const entryPoint = path.join(rootDir, 'electron', 'preload.ts');
const outfile = path.join(rootDir, 'dist-app', 'electron', 'preload.js');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function build() {
  const esbuild = require('esbuild');

  ensureDir(path.dirname(outfile));

  try {
    await esbuild.build({
      entryPoints: [entryPoint],
      outfile,
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      external: ['electron'],
      sourcemap: true,
      minify: false,
    });
    console.log('[build-preload] Preload bundle written to', outfile);
  } catch (err) {
    console.error('[build-preload] Build failed:', err);
    process.exit(1);
  }
}

build();
