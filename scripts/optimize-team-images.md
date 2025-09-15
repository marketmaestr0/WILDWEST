# Team Image Optimization Plan

Goal: Reduce file size (PNG -> optimized WebP + resized variants) to speed up team page load without noticeable quality loss.

Steps (manual, cross-platform):

1. Install sharp CLI globally or use npx:
   npx sharp --version

2. Convert and resize each PNG (assuming originals are square and large):
   mkdir -p team-optimized
   for %i in (team png\*.png) do npx sharp "team png\%i" --resize 512 512 --withoutEnlargement --to-format webp --quality 82 -o team-optimized/%~ni-512.webp
   for %i in (team png\*.png) do npx sharp "team png\%i" --resize 256 256 --withoutEnlargement --to-format webp --quality 80 -o team-optimized/%~ni-256.webp

3. Update the-team.html to use <picture> with WebP first, fallback PNG, and explicit width/height (256 served, upscale via CSS if needed).

4. Add lazy loading to all but first 2 images (already partly done) and remove high fetchpriority beyond first row.

5. Optionally preconnect to CDN if hosting images elsewhere.

6. After deployment, verify network waterfall: each image ideally <30KB for 256 variant, <60KB for 512.

Notes: Keeping original PNGs for archival; could delete later if not needed.

## Command Summary

```
# Fresh generation (cover crop to fill square)
npm run optimize:team -- --clean --force

# Preserve full image (no crop - letterboxed if not square)
npm run optimize:team -- --clean --force --preserve

# Incremental (skip unchanged)
npm run optimize:team
```
