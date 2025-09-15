import { readdir, mkdir, rm, stat } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const SRC_DIR = 'team png';
const OUT_DIR = 'team-optimized';
const SIZES = [
  { size: 256, quality: 68 },
  { size: 512, quality: 78 }
];
const PRESERVE = process.argv.includes('--preserve'); // keep full image (no crop)

async function maybeClean() {
  if (!process.argv.includes('--clean')) return;
  try {
    await rm(OUT_DIR, { recursive: true, force: true });
    console.log('Cleaned', OUT_DIR);
  } catch (e) {
    console.warn('Clean failed (non-fatal):', e.message);
  }
}

async function run() {
  await maybeClean();
  await mkdir(OUT_DIR, { recursive: true });
  const entries = await readdir(SRC_DIR, { withFileTypes: true });
  const pngs = entries.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.png')).map(e => e.name);
  if (!pngs.length) {
    console.error('No PNGs found in', SRC_DIR);
    return;
  }
  for (const file of pngs) {
    const base = path.parse(file).name;
    for (const { size, quality } of SIZES) {
      const outFile = path.join(OUT_DIR, `${base}-${size}.webp`);
      try {
        // Skip regenerate if exists and newer than source (cache)
        let skip = false;
        try {
          const [srcStat, outStat] = await Promise.all([
            stat(path.join(SRC_DIR, file)),
            stat(outFile)
          ]);
          if (outStat.mtimeMs >= srcStat.mtimeMs) skip = true;
        } catch(_) {}
        if (skip && !process.argv.includes('--force')) {
          console.log('Skip (cached)', outFile);
          continue;
        }
        const transformer = sharp(path.join(SRC_DIR, file))
          .resize(size, size, {
            fit: PRESERVE ? 'contain' : 'cover',
            withoutEnlargement: true,
            background: { r:0, g:0, b:0, alpha:0 }
          })
          .webp({ quality, effort: 4 });
        await transformer.toFile(outFile);
        console.log('Wrote', outFile);
      } catch (e) {
        console.error('Failed', file, size, e.message);
      }
    }
  }
  console.log('Done.');
}

run();
