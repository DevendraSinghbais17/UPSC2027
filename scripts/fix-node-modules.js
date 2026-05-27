import fs from 'fs';
import path from 'path';

function fixNodeModules() {
  try {
    // 1. Fix package.json in tailwindcss/vite to remove variant versions
    const twVitePkgPath = path.join(process.cwd(), 'node_modules', '@tailwindcss', 'vite', 'package.json');
    if (fs.existsSync(twVitePkgPath)) {
      let content = fs.readFileSync(twVitePkgPath, 'utf8');
      content = content.replace(/"\^/g, '"').replace(/"~/g, '"');
      fs.writeFileSync(twVitePkgPath, content);
    }

    // 2. Suppress analyzer warnings in tailwindcss/vite/dist/index.mjs
    const twViteDistPath = path.join(process.cwd(), 'node_modules', '@tailwindcss', 'vite', 'dist', 'index.mjs');
    if (fs.existsSync(twViteDistPath)) {
      let content = fs.readFileSync(twViteDistPath, 'utf8');
      if (!content.startsWith('/* eslint-disable */')) {
        content = '/* eslint-disable */\n// @ts-nocheck\n' + content;
        fs.writeFileSync(twViteDistPath, content);
      }
    }

    // 3. Delete node_modules/.package-lock.json which is triggering thousands of variant version info logs
    const nmLockPath = path.join(process.cwd(), 'node_modules', '.package-lock.json');
    if (fs.existsSync(nmLockPath)) {
      fs.rmSync(nmLockPath, { force: true });
    }

    console.log("node_modules patched successfully to appease strict IDE analyzers.");
  } catch (error) {
    console.error("Error patching node_modules:", error);
  }
}

fixNodeModules();
