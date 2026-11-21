// VELVET HOUR — hand-in program (Node 22, standard library only).
// Copies game/ and screenshots/ into the output directory and writes dossier.json with the
// vendored make.fun library. The output directory itself is NEVER removed (the grader mounts
// it; removing it fails with EBUSY) — only the entries this program owns inside it are cleared.
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
for (const owned of ['game', 'screenshots', 'dossier.json']) {
  rmSync(join(out, owned), { recursive: true, force: true });
}
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
console.log('VELVET HOUR handed in: game/ + screenshots/ + dossier.json ->', out);
console.log('dossier.json bytes:', statSync(join(out, 'dossier.json')).size);
