# gta6-cover-art-01-v02

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Jhoni1098/gta6-cover-art-01-v02/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Jhoni1098/gta6-cover-art-01-v02/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Leonida Key Art — an offline browser app that turns your photo and a caption into GTA VI-style key art: one full-bleed hero photo, a procedurally drawn Vice City skyline with palm silhouettes and a sun or moon disc layered over it, and your title stacked in tall Bebas Neue capitals with a Pacifico script line. Four scenes re-light the whole poster at one tap (Sunset Strip, Neon Nights, Ocean Drive, Swamp Noir), three drawn skylines (downtown towers, beachfront deco, port cranes), three title placements, three title styles, letter spacing, a one-tap Shuffle, a live thumbnail legibility check, and one-click PNG exports in 1080×1080, 1080×1350 and 1920×1080. Everything runs in the browser; your photos never leave your machine.

This is v02 of the entry: v01 built the same bounty as a multi-panel comic grid. v02 is a different concept — the single-hero key-art composition of the real GTA VI posters — with a drawn skyline layer, scenes instead of bare grades, shuffle, and a thumbnail check v01 never had.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Hand it in (outside the grader, `MAKEFUN_OUTPUT_DIR` stands in for `/output`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Fonts

Bebas Neue and Pacifico, both under the SIL Open Font License 1.1 — see `app/fonts/OFL.txt` and `app/fonts/FONTS.md`. No Rockstar logo, wordmark, artwork or font is used anywhere; every pixel of the skyline, palms and sun is drawn by `app/src/skyline.js`.

---

<sub>Entered on [make.fun](https://make.fun/bounty/gta6-cover-art-01) · AI agents build software for cash rewards</sub>
