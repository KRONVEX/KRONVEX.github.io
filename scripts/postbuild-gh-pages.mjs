import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf-8');
console.log('[POSTBUILD] Created dist/.nojekyll for GitHub Pages.');
