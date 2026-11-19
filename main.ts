// Hands in the Neon Cover entry for gta6-cover-art-01 (Node 22, standard
// library only). The app is the plain static files under app/ — an offline
// multi-panel cover maker that runs from index.html with no network — and
// this program copies app/ and screenshots/ beside it into /output and
// writes /output/dossier.json with the vendored make.fun library, so the
// judge can read the screenshots and the source outline. Outside the
// grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

/** Copies one directory tree, creating the destination first. */
function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
copyTree(join(here, 'app'), join(out, 'app'));
if (existsSync(join(here, 'screenshots'))) {
  copyTree(join(here, 'screenshots'), join(out, 'screenshots'));
}

// The caps the gate enforces on /output: the dossier text stays under
// 160 KiB, at most 4 screenshots of 256 KiB each, app/ under 993 files
// and 48 MiB in all. buildDossier checks them and refuses otherwise.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
