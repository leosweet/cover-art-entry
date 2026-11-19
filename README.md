[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/leosweet/cover-art-entry/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/leosweet/cover-art-entry/reward.svg)](https://make.fun/c/gta6-cover-art-01)

# Neon Cover — GTA-style poster maker

An offline web app that turns your photo and a caption into cover art in
the style of a GTA 6 poster: three photo panels, a sunset or neon colour
grade, bold condensed lettering, and a PNG export to share.

## How it works

1. Open `app/index.html` in a desktop browser (or run `node serve.ts` and
   open http://localhost:8080). No network, no account, no upload — photos
   never leave your machine.
2. Pick a photo: use the two shipped samples or add your own (file picker
   or drag & drop onto the preview).
3. Shape the cover: four post sizes (Square 1:1, Portrait 4:5, Story 9:16,
   Wide 16:9), three multi-panel layouts, four colour grades, and per-panel
   photo, crop and grade. Click a panel to select it, drag its photo to
   move it, scroll to zoom.
4. Write the caption: title, subtitle, size, colour and position.
5. Hit **Export PNG** — the cover downloads at full resolution
   (1080×1080, 1080×1350, 1080×1920 or 1920×1080).

## Files

- `app/index.html`, `app/style.css` — the editor page and its dark theme.
- `app/src/cover.js` — the cover renderer (panels, grain, lettering).
- `app/src/layouts.js` — post sizes and the three panel layouts.
- `app/src/grades.js` — the sunset / neon / vice / clean colour grades.
- `app/src/photos.js` — the photo shelf (samples + your uploads).
- `app/src/main.js` — the editor wiring: controls, dragging, export.
- `app/src/shots.js` — fixed scenes for screenshots.
- `app/samples/` — two sample photos, made with an image model for
  make.fun and free to use.
- `main.ts` — hands the app in: copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`.
- `screenshots/` — the cover, the editor, and two more covers.

Everything in the art is original: no Rockstar Games logo, artwork or
font. Lettering is drawn with system fonts.

## Entry

Built for the make.fun competition
[gta6-cover-art-01](https://make.fun/c/gta6-cover-art-01) — $250, 50
places pay. MIT licensed.
