# Leonida Key Art — GTA VI Key-Art Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Jhoni1098/gta6-cover-art-01-v02/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Jhoni1098/gta6-cover-art-01-v02/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Competition:** [gta6-cover-art-01 — Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) · **Owner:** Jhoni1098 · **Reward pool:** $250

## What it is

Leonida Key Art is a single-hero GTA VI key-art studio that runs entirely
offline in the browser. Pick one hero photo, and the app layers a **canvas-drawn
skyline** — palm trees, towers and a big low sun, all drawn with vector paths,
never pasted in — over it, letters a sunset-gradient title across it, and
exports a share-ready PNG.

This is a deliberate break from the usual multi-panel collage: one hero, one
skyline, one sunset. The official GTA VI cover (revealed 18 June 2026) is a
multi-panel collage with Lucia Caminos and Jason Duval at its centre, in a
pink, purple and orange palette — this studio answers it with a single,
poster-clean hero frame instead.

## How it works

1. **Hero scene** — four built-in scenes (beach couple at dusk, speedboat at
   sunset, Ocean Drive boulevard, neon night rider), or upload your own photo.
   Zoom and pan to crop and position it. Photos are read on your machine and
   never uploaded.
2. **Drawn skyline** — three styles, all drawn live on canvas: *Vice City
   Downtown* (towers with lit windows), *Beachfront Palms* (palm silhouettes
   against a slatted sun), *Neon Strip* (neon sign bars, teal-and-pink sun).
3. **Lettering** — big Bebas Neue title with a sunset-gradient fill and white
   outline, a Pacifico script subtitle, and a gold "LEONIDA • VICE CITY"
   ribbon badge. All editable.
4. **Grade** — five colour grades: Sunset, Neon, Golden Hour, Teal Noir,
   Bubblegum.
5. **Export** — one click saves a PNG in 1080×1080, 1080×1350 or 1920×1080.

**Thumbnail legibility check.** The cover is re-rendered at 120 px — feed
thumbnail size — and the app flags whether the title stays readable there.
Short titles in big display lettering pass; long ones fail, and the app says so.

**Shuffle.** One button randomises scene + skyline + grade for a fresh look.

## Facts

- Official GTA VI cover art revealed **18 June 2026**: multi-panel collage,
  Lucia Caminos + Jason Duval centre, pink/purple/orange palette, Leonida /
  Vice City.
- GTA VI launched **19 November 2026** on PlayStation 5 and Xbox Series X|S.
- No Rockstar Games logo, artwork or fonts are used anywhere in this app.
  Lettering uses Bebas Neue and Pacifico, both under the SIL Open Font
  License (see `app/fonts/`).
- All four sample photos are original AI-made images — nothing copied from
  Rockstar or anyone else.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8903
```

Open the page, pick a scene, edit the title, export a PNG. No build step,
no network request — every script, font and image is a file under `app/`.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library (`vendor/makefun-app.ts`).

## Files

- `app/index.html`, `app/style.css` — page and styling
- `app/src/main.js` — studio wiring: state, controls, export, shuffle
- `app/src/cover.js` — the cover renderer (photo + grade + lettering + grain)
- `app/src/skyline.js` — the drawn skylines: towers, palms, low sun
- `app/src/shots.js` — screenshot presets (`?shot=…` query contract)
- `shots.json` — the four screenshot definitions
- `screenshots/` — the four screenshots (cover first, then editor, portrait
  cover, square cover)

## License

MIT — see `LICENSE`.
