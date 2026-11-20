// Leonida Key Art — the cover renderer.
//
// Concept: one full-bleed hero photo, the way the real GTA VI key art is
// built — a single striking image, not a comic grid — with a drawn Vice
// City skyline and palm silhouettes layered over it, and the title stacked
// over the skyline in tall Bebas Neue capitals with a Pacifico script line.
// A "scene" is a whole look at once: sun, skyline palette, photo grade and
// title treatment, so one tap re-lights the poster.

import { drawSkyline, drawPalm, drawSun, mulberry32, hashString } from './skyline.js';

export const SIZES = ['1080x1080', '1080x1350', '1920x1080'];
export const SAMPLES = ['boulevard', 'beach', 'neon', 'boat'];

export const SKYLINES = [
  { id: 'downtown', name: 'Downtown towers' },
  { id: 'beachfront', name: 'Beachfront deco' },
  { id: 'port', name: 'Port & cranes' },
];

/**
 * A scene: sun/moon, skyline colours, photo grade (a canvas filter), the
 * colour wash over the whole poster, and how the title is painted.
 * `horizon` is where the skyline sits, as a fraction of the cover height.
 */
export const SCENES = [
  {
    id: 'sunset-strip', name: 'Sunset Strip',
    sun: { kind: 'sun', x: 0.5, y: 0.34, r: 0.085, inner: '#ffe9a8', glow: 'rgba(255,170,80,0.55)' },
    horizon: 0.60,
    pal: { back: '#7a3a6e', front: '#1c0a26', palm: '#451a38', haze: 'rgba(255,150,90,0.28)', windows: '#ffd27a', lit: true },
    grade: 'saturate(1.25) contrast(1.06)',
    wash: ['rgba(255,120,80,0)', 'rgba(200,40,120,0.16)'],
    title: { style: 'gradient', from: '#ffe45e', mid: '#ff9a3d', to: '#ff5ea8', shadow: 'rgba(0,0,0,0.55)' },
    sub: '#ffd7ef', subGlow: '#ff5ea8',
  },
  {
    id: 'neon-nights', name: 'Neon Nights',
    sun: { kind: 'moon', x: 0.78, y: 0.20, r: 0.055, inner: '#e8f4ff', glow: 'rgba(140,200,255,0.35)' },
    horizon: 0.62,
    pal: { back: '#241a4d', front: '#070418', palm: '#1a1145', haze: 'rgba(120,90,255,0.22)', windows: '#7df9ff', lit: true },
    grade: 'saturate(1.45) contrast(1.12) brightness(0.96)',
    wash: ['rgba(45,226,197,0.10)', 'rgba(255,94,168,0.16)'],
    title: { style: 'gradient', from: '#8ef6ff', mid: '#ff5ea8', to: '#c65bff', shadow: 'rgba(0,0,0,0.6)' },
    sub: '#b8fff2', subGlow: '#2de2c5',
  },
  {
    id: 'ocean-drive', name: 'Ocean Drive',
    sun: { kind: 'sun', x: 0.24, y: 0.22, r: 0.07, inner: '#fff6c8', glow: 'rgba(255,230,140,0.5)' },
    horizon: 0.58,
    pal: { back: '#4d8a96', front: '#0d2b33', palm: '#1d4a55', haze: 'rgba(255,240,180,0.25)', windows: '#ffe9a8', lit: false },
    grade: 'saturate(1.2) contrast(1.03)',
    wash: ['rgba(127,212,230,0.10)', 'rgba(255,220,120,0.10)'],
    title: { style: 'gradient', from: '#ffffff', mid: '#aef3ff', to: '#2bb3c9', shadow: 'rgba(0,40,60,0.5)' },
    sub: '#ffffff', subGlow: '#2bb3c9',
  },
  {
    id: 'swamp-noir', name: 'Swamp Noir',
    sun: { kind: 'sun', x: 0.68, y: 0.30, r: 0.06, inner: '#f2e6b8', glow: 'rgba(220,190,110,0.4)' },
    horizon: 0.64,
    pal: { back: '#3d4a33', front: '#101a10', palm: '#2a3a24', haze: 'rgba(200,180,110,0.20)', windows: '#ffd27a', lit: true },
    grade: 'sepia(0.25) saturate(0.9) contrast(1.05)',
    wash: ['rgba(60,80,40,0.08)', 'rgba(20,30,10,0.22)'],
    title: { style: 'solid', solid: '#ece2c2', shadow: 'rgba(0,0,0,0.6)' },
    sub: '#d8e6b8', subGlow: '#8aa86a',
  },
];

export const PLACEMENTS = [
  { id: 'top', name: 'Title on top' },
  { id: 'center', name: 'Title in the middle' },
  { id: 'bottom', name: 'Title at the bottom' },
];

export const TITLE_STYLES = [
  { id: 'gradient', name: 'Sunset gradient' },
  { id: 'solid', name: 'Solid white' },
  { id: 'outline', name: 'Outline' },
];

/** Titles the Shuffle button can deal out, each with a matching script line. */
export const SHUFFLE_TITLES = [
  ['VICE CITY', 'welcome back to leonida'],
  ['LEONIDA', 'two outlaws, one state'],
  ['OCEAN DRIVE', 'neon nights'],
  ['NEON NIGHTS', 'the city never sleeps'],
  ['GATOR COUNTRY', 'mind the swamp'],
  ['SUNSET HEIST', 'one last score'],
  ['BAYFRONT', 'salt air & sirens'],
  ['VICE & VIRTUE', 'every saint has a past'],
];

export function sceneById(id) {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}

/** Seeded random so the grain is identical on every render. */
function grainTile() {
  const tile = 192;
  const off = document.createElement('canvas');
  off.width = tile;
  off.height = tile;
  const octx = off.getContext('2d');
  const img = octx.createImageData(tile, tile);
  const rand = mulberry32(20261120);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rand() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 26;
  }
  octx.putImageData(img, 0, 0);
  return off;
}
let cachedGrain = null;

/** Shrinks the font until the text fits maxWidth; returns the size used. */
function fitFont(ctx, text, family, weight, startSize, maxWidth, tracking) {
  let size = startSize;
  const widthAt = (s) => {
    ctx.font = `${weight} ${s}px ${family}`;
    let tw = 0;
    for (const ch of text) tw += ctx.measureText(ch).width;
    return tw + tracking * Math.max(0, text.length - 1);
  };
  while (size > 12 && widthAt(size) > maxWidth) {
    size = Math.max(12, size - Math.round(size * 0.06));
  }
  ctx.font = `${weight} ${size}px ${family}`;
  return size;
}

/**
 * Draws text centred on `cx` with manual letter-spacing (canvas has no
 * reliable cross-version letterSpacing, so each glyph is placed by hand).
 * `paint` is called once per glyph with the glyph's left edge.
 */
function drawSpaced(ctx, text, cx, baseline, tracking, paint) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, text.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < text.length; i++) {
    paint(text[i], x);
    x += widths[i] + tracking;
  }
}

/** The title block: script subtitle, big spaced title, tagline with rules. */
function drawTitleBlock(ctx, w, h, state, scene) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  const tagline = (state.tagline || '').trim().toUpperCase();
  const tracking = Math.round(w * 0.004 * (state.tracking ?? 6) / 6) + Math.round((state.tracking ?? 6) * w * 0.001);
  const place = state.placement || 'bottom';

  // Baselines for the three placements, as fractions of the cover height.
  const spots = {
    top: { sub: 0.085, title: 0.215, tag: 0.965 },
    center: { sub: 0.435, title: 0.565, tag: 0.965 },
    bottom: { sub: 0.715, title: 0.855, tag: 0.955 },
  }[place];
  const subY = Math.round(h * spots.sub);
  const titleY = Math.round(h * spots.title);
  const tagY = Math.round(h * spots.tag);

  // A soft dark scrim behind the title so it reads over any photo.
  const scrim = ctx.createLinearGradient(0, titleY - h * 0.16, 0, titleY + h * 0.05);
  scrim.addColorStop(0, 'rgba(12,4,22,0)');
  scrim.addColorStop(0.5, 'rgba(12,4,22,0.42)');
  scrim.addColorStop(1, 'rgba(12,4,22,0)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, titleY - h * 0.16, w, h * 0.21);

  if (subtitle) {
    const subSize = fitFont(ctx, subtitle, "'Pacifico', cursive", 400, Math.round(h * 0.055), w * 0.8, 0);
    ctx.textAlign = 'center';
    ctx.fillStyle = scene.sub;
    ctx.shadowColor = scene.subGlow;
    ctx.shadowBlur = Math.round(subSize * 0.5);
    ctx.fillText(subtitle, w / 2, subY);
    ctx.shadowBlur = 0;
  }

  if (title) {
    const style = state.titleStyle || 'gradient';
    const size = fitFont(ctx, title, "'Bebas Neue', 'Arial Narrow', sans-serif", 400, Math.round(h * 0.14), w * 0.92, tracking);
    const grad = ctx.createLinearGradient(0, titleY - size, 0, titleY);
    grad.addColorStop(0, scene.title.from ?? '#ffffff');
    grad.addColorStop(0.5, scene.title.mid ?? scene.title.from ?? '#ffffff');
    grad.addColorStop(1, scene.title.to ?? scene.title.mid ?? '#ffffff');
    ctx.lineJoin = 'round';
    ctx.shadowColor = scene.title.shadow;
    ctx.shadowBlur = Math.round(size * 0.10);
    ctx.shadowOffsetY = Math.round(size * 0.03);
    if (style === 'outline') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, Math.round(size * 0.035));
      ctx.fillStyle = 'rgba(10,4,20,0.45)';
      drawSpaced(ctx, title, w / 2, titleY, tracking, (ch, x) => {
        ctx.fillText(ch, x, titleY);
        ctx.strokeText(ch, x, titleY);
      });
    } else if (style === 'solid') {
      ctx.fillStyle = scene.title.solid ?? '#ffffff';
      drawSpaced(ctx, title, w / 2, titleY, tracking, (ch, x) => ctx.fillText(ch, x, titleY));
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      ctx.lineWidth = Math.max(2, Math.round(size * 0.028));
      ctx.fillStyle = grad;
      drawSpaced(ctx, title, w / 2, titleY, tracking, (ch, x) => {
        ctx.strokeText(ch, x, titleY);
        ctx.fillText(ch, x, titleY);
      });
    }
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  if (tagline) {
    const tagSize = Math.max(12, Math.round(h * 0.024));
    ctx.font = `400 ${tagSize}px 'Bebas Neue', 'Arial Narrow', sans-serif`;
    const tw = ctx.measureText(tagline).width + tagSize * 0.6 * Math.max(0, tagline.length - 1);
    const rule = Math.round(w * 0.08);
    const cy = tagY - tagSize * 0.35;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = Math.max(1, Math.round(h * 0.0015));
    ctx.beginPath();
    ctx.moveTo(w / 2 - tw / 2 - rule - 14, cy);
    ctx.lineTo(w / 2 - tw / 2 - 14, cy);
    ctx.moveTo(w / 2 + tw / 2 + 14, cy);
    ctx.lineTo(w / 2 + tw / 2 + rule + 14, cy);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    drawSpaced(ctx, tagline, w / 2, tagY, Math.round(tagSize * 0.6), (ch, x) => ctx.fillText(ch, x, tagY));
  }
}

/** The hero photo, cover-fit with zoom and pan, under the scene's grade. */
function drawPhoto(ctx, img, w, h, place, grade) {
  if (!img) return;
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * (place.zoom || 1);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (w - dw) / 2 + (place.ox || 0) * w;
  const dy = (h - dh) / 2 + (place.oy || 0) * h;
  ctx.save();
  ctx.filter = grade;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
  ctx.filter = 'none';
}

function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(10,2,18,0.38)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Draws the cover for `state` onto `canvas` (already sized).
 * `images` maps a photo key ('boulevard', 'beach', 'neon', 'boat', 'upload')
 * to a loaded HTMLImageElement.
 */
export function drawCover(canvas, state, images) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const scene = sceneById(state.scene);
  const seed = hashString(`${state.scene}|${state.skyline}`);
  const horizonY = Math.round(h * scene.horizon);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#160a20';
  ctx.fillRect(0, 0, w, h);

  // 1. The hero photo, full-bleed, graded.
  drawPhoto(ctx, images.get(state.photo) || null, w, h, state, scene.grade);

  // 2. Sun or moon, glowing over the photo.
  if (state.sun) {
    const s = scene.sun;
    drawSun(ctx, Math.round(w * s.x), Math.round(h * s.y), Math.round(Math.min(w, h) * s.r), s.kind, s.inner, s.glow);
  }

  // 3. The drawn Vice City skyline, back row then dark front base.
  drawSkyline(ctx, w, h, state.skyline, scene.pal, seed, horizonY);

  // 4. Palm silhouettes framing the edges, in front of the skyline.
  if (state.palms) {
    const rand = mulberry32(seed ^ 0x9e3779b9);
    // Short palms when the title sits in the middle, so the crowns stay
    // below the lettering; tall palms otherwise, framing from the edges.
    const base = state.placement === 'center' ? 0.30 : 0.48;
    const leftH = Math.round(h * (base + rand() * 0.08));
    const rightH = Math.round(h * (base - 0.02 + rand() * 0.08));
    drawPalm(ctx, Math.round(w * 0.035), h, leftH, Math.round(w * 0.05), scene.pal.palm, seed ^ 0x1111);
    drawPalm(ctx, Math.round(w * 0.965), h, rightH, -Math.round(w * 0.06), scene.pal.palm, seed ^ 0x2222);
  }

  // 5. The scene's colour wash over the whole poster.
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, scene.wash[0]);
  wash.addColorStop(1, scene.wash[1]);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);

  // 6. Lettering on top of everything.
  drawTitleBlock(ctx, w, h, state, scene);

  if (state.vignette) drawVignette(ctx, w, h);
  if (state.grain) {
    if (!cachedGrain) cachedGrain = grainTile();
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = ctx.createPattern(cachedGrain, 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

/** Renders the cover at an exact size on a fresh canvas and returns it. */
export function renderCover(width, height, state, images) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, state, images);
  return canvas;
}
