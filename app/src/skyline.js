// Leonida Key Art — procedural Vice City layers.
//
// Everything here is drawn, never pasted: a seeded skyline, palm
// silhouettes and a sun or moon disc, so every scene is deterministic
// (same scene + skyline = same pixels on every render and export).

/** mulberry32: a tiny seeded PRNG so the skyline never changes between renders. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a hash of a string, for turning a scene+skyline name into a seed. */
export function hashString(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Draws one row of buildings from `baseY` upward. `kind` picks the shape
 * language; `rand` is seeded; `lights` turns lit windows on (night scenes).
 * Buildings are filled from their tops down to `floorY`.
 */
function buildingRow(ctx, w, h, kind, baseY, floorY, color, rand, lights, lightColor) {
  ctx.fillStyle = color;
  let x = -Math.round(w * 0.02);
  while (x < w * 1.02) {
    const bw = Math.round(w * (kind === 'beachfront'
      ? 0.06 + rand() * 0.09
      : kind === 'port'
        ? 0.05 + rand() * 0.08
        : 0.035 + rand() * 0.065));
    let bh = Math.round(h * (kind === 'downtown'
      ? 0.06 + rand() * rand() * 0.16
      : kind === 'beachfront'
        ? 0.04 + rand() * 0.06 + (rand() < 0.14 ? 0.08 : 0)
        : 0.04 + rand() * 0.07));
    if (rand() < 0.15) bh = Math.round(bh * 0.4); // A low plaza block, so the photo shows between towers.
    const top = baseY - bh;
    if (kind === 'port' && rand() < 0.22) {
      // A silo: a rectangle with a domed cap.
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, top + bw * 0.3);
      ctx.arc(x + bw / 2, top + bw * 0.3, bw / 2, Math.PI, 0);
      ctx.lineTo(x + bw, floorY);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(x, top, bw, floorY - top);
      if (kind === 'downtown' && rand() < 0.3) {
        // Antenna mast on a taller tower.
        const mx = x + bw * (0.3 + rand() * 0.4);
        const mh = Math.round(h * (0.02 + rand() * 0.05));
        ctx.fillRect(mx - 1, top - mh, 2, mh);
        ctx.beginPath();
        ctx.arc(mx, top - mh, Math.max(2, w * 0.002), 0, Math.PI * 2);
        ctx.fill();
      }
      if (kind === 'beachfront' && rand() < 0.3) {
        // Art-deco stepped crown.
        const step = Math.round(bw * 0.18);
        ctx.fillRect(x + step, top - Math.round(bh * 0.16), bw - step * 2, Math.round(bh * 0.16));
      }
    }
    if (lights) {
      const cols = Math.max(1, Math.floor(bw / Math.max(8, w * 0.012)));
      const rows = Math.max(1, Math.floor(bh / Math.max(10, h * 0.02)));
      ctx.fillStyle = lightColor;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (rand() < 0.28) {
            const wx = x + Math.round((c + 0.5) * (bw / cols)) - 1;
            const wy = top + Math.round((r + 0.5) * (bh / rows)) - 1;
            ctx.fillRect(wx, wy, Math.max(2, w * 0.003), Math.max(2, h * 0.003));
          }
        }
      }
      ctx.fillStyle = color;
    }
    x += bw + Math.round(w * (0.018 + rand() * 0.03));
  }
}

/** A dock crane silhouette: mast, jib and a hanging cable. */
function drawCrane(ctx, x, baseY, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 3, baseY - height, 6, height);
  ctx.fillRect(x - 3, baseY - height, Math.round(height * 0.55), 5);
  ctx.beginPath();
  ctx.moveTo(x, baseY - height);
  ctx.lineTo(x + Math.round(height * 0.4), baseY - height * 0.55);
  ctx.lineTo(x + Math.round(height * 0.4), baseY - height * 0.55 + 4);
  ctx.lineTo(x + 2, baseY - height + 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(x + Math.round(height * 0.4) - 1, baseY - height * 0.55, 2, Math.round(height * 0.18));
}

/**
 * Draws the whole skyline: a hazy back row, a solid front row that runs to
 * the bottom of the canvas (the poster's dark base), and port cranes.
 * `pal` carries { back, front, haze, windows } colours.
 */
export function drawSkyline(ctx, w, h, kind, pal, seed, horizonY) {
  const rand = mulberry32(seed);
  // Haze band just above the horizon, for depth between the rows.
  const haze = ctx.createLinearGradient(0, horizonY - h * 0.10, 0, horizonY + h * 0.04);
  haze.addColorStop(0, 'rgba(255,255,255,0)');
  haze.addColorStop(0.5, pal.haze);
  haze.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizonY - h * 0.10, w, h * 0.14);
  // Back row: shorter, lighter, bottoms just below the horizon.
  buildingRow(ctx, w, h, kind, horizonY, horizonY + Math.round(h * 0.03), pal.back, rand, false, pal.windows);
  // Front row: the dark base of the poster, down to the bottom edge.
  buildingRow(ctx, w, h, kind, horizonY + Math.round(h * 0.02), h, pal.front, rand, pal.lit, pal.windows);
  if (kind === 'port') {
    drawCrane(ctx, w * 0.22, horizonY + Math.round(h * 0.02), Math.round(h * 0.20), pal.front);
    drawCrane(ctx, w * 0.74, horizonY + Math.round(h * 0.02), Math.round(h * 0.16), pal.front);
  }
}

/**
 * A palm silhouette: a leaning trunk and a crown of drooping fronds.
 * `x, baseY` is the trunk foot; `height` the trunk length; `lean` the
 * sideways drift of the crown; `color` the silhouette colour.
 */
export function drawPalm(ctx, x, baseY, height, lean, color, seed) {
  const rand = mulberry32(seed);
  const cx = x + lean;
  const cy = baseY - height;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  // Trunk, one smooth curve.
  ctx.lineWidth = Math.max(3, height * 0.04);
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + lean * 0.5, baseY - height * 0.5, cx, cy);
  ctx.stroke();
  // Fronds: filled curved blades, not lines — a line fan reads as a
  // firework, a blade reads as a palm leaf. Each blade is a lens-shaped
  // path from the crown out to a drooping tip, and every tip ends below
  // the crown, the way real palm fronds hang.
  const fronds = 6;
  for (let i = 0; i < fronds; i++) {
    const angle = -Math.PI * (0.10 + (i / (fronds - 1)) * 0.80);
    const len = height * (0.30 + rand() * 0.12);
    const tx = cx + Math.cos(angle) * len;
    const ty = cy + Math.sin(angle) * len * 0.3 + len * 0.5;
    const mx = cx + (tx - cx) * 0.5;
    const my = cy + (ty - cy) * 0.5;
    // Perpendicular offset for the blade's width.
    const dx = tx - cx;
    const dy = ty - cy;
    const dl = Math.hypot(dx, dy) || 1;
    const px = (-dy / dl) * len * 0.055;
    const py = (dx / dl) * len * 0.055;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(mx + px, my + py, tx, ty);
    ctx.quadraticCurveTo(mx - px * 0.5, my - py * 0.5, cx, cy);
    ctx.closePath();
    ctx.fill();
  }
  // Coconuts under the crown.
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(cx - 6 + i * 6 + rand() * 3, cy + 4 + rand() * 4, Math.max(2, height * 0.02), 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A glowing sun disc, or a pale moon disc when `kind` is 'moon'. */
export function drawSun(ctx, x, y, r, kind, inner, outer) {
  const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 3.2);
  glow.addColorStop(0, outer);
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = inner;
  ctx.fill();
  if (kind === 'moon') {
    // Two soft craters, so it reads as a moon, not a plain disc.
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.15, r * 0.18, 0, Math.PI * 2);
    ctx.arc(x + r * 0.25, y + r * 0.3, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }
}
