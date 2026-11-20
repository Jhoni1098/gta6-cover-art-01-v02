// Leonida Key Art entry point (Node 22, standard library only): hands in
// the cover app this repository holds. It copies app/ (the offline web app)
// and screenshots/ (the cover and the editor, as the judge sees them) beside
// this file into /output, then writes /output/dossier.json with the make.fun
// dossier library vendored under vendor/.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

if (!existsSync(join(appDir, 'index.html'))) {
  throw new Error('app/index.html is missing; nothing to hand in');
}
if (!existsSync(shotsDir)) {
  throw new Error('screenshots/ is missing; the judge needs the cover renders');
}

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps for this bounty (reference/gate.json): the dossier
// text holds at most 160 KiB; screenshots at most 4 of at most 256 KiB;
// app/ at most 993 entries and 48 MiB. Passing them here makes this program
// fail exactly where the scorer would refuse the entry.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`handed in app/ + screenshots/ and dossier.json (${dossier.length} bytes) to ${out}`);
