// Drawn skylines for Leonida Key Art. Every silhouette is built here from canvas
// paths — towers, palm trees and a low sun — so no stock image is ever pasted in.
// Three styles, each with its own horizon line, tower rhythm and palm placement.

export const SKYLINE_STYLES = [
  { id: "downtown", label: "Vice City Downtown" },
  { id: "palms", label: "Beachfront Palms" },
  { id: "neonstrip", label: "Neon Strip" },
];

// One palm: a curved trunk and six drooping fronds, drawn as quadratic strokes.
export function drawPalmTree(ctx, x, baseY, size, lean, ink) {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2, size * 0.045);
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + lean * size, baseY - size * 0.55, x + lean * size * 1.15, baseY - size);
  ctx.stroke();
  const topX = x + lean * size * 1.15;
  const topY = baseY - size;
  ctx.lineWidth = Math.max(1.5, size * 0.03);
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * (0.08 + i * 0.16)) + (lean > 0 ? 0.15 : -0.15);
    const reach = size * (0.5 + (i % 2) * 0.14);
    const tipX = topX + Math.cos(angle) * reach * (i < 3 ? 1 : -1) * (lean >= 0 ? 1 : 1);
    const tipY = topY + Math.sin(angle) * reach * 0.55 + size * 0.12;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + (tipX - topX) * 0.5, topY - size * 0.22, tipX, tipY);
    ctx.stroke();
  }
  ctx.restore();
}

// A row of towers with lit windows, seeded so the same style always draws the same.
function drawTowerRow(ctx, w, horizonY, ink, seed, litWindows) {
  ctx.save();
  ctx.fillStyle = ink;
  let x = -w * 0.02;
  let s = seed;
  const next = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  while (x < w * 1.02) {
    const towerW = w * (0.05 + next() * 0.075);
    const towerH = w * (0.10 + next() * 0.22);
    const top = horizonY - towerH;
    ctx.fillRect(x, top, towerW, towerH);
    if (next() > 0.55) { // rooftop antenna
      ctx.fillRect(x + towerW * 0.45, top - w * 0.03, w * 0.008, w * 0.03);
    }
    if (litWindows) {
      ctx.fillStyle = "#ffd76a";
      const cols = Math.max(1, Math.floor(towerW / (w * 0.022)));
      const rows = Math.max(1, Math.floor(towerH / (w * 0.03)));
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (next() > 0.72) {
            ctx.fillRect(x + w * 0.008 + c * w * 0.022, top + w * 0.012 + r * w * 0.03, w * 0.009, w * 0.014);
          }
        }
      }
      ctx.fillStyle = ink;
    }
    x += towerW + w * (0.008 + next() * 0.02);
  }
  ctx.restore();
}

// The big low sun with horizontal slats cut through it, synthwave style.
export function drawLowSun(ctx, cx, cy, radius, topColor, bottomColor) {
  const grad = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
  grad.addColorStop(0, topColor);
  grad.addColorStop(1, bottomColor);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  let gap = radius * 0.08;
  for (let i = 0; i < 4; i++) {
    const y = cy + radius * (0.05 + i * 0.22);
    ctx.fillRect(cx - radius, y, radius * 2, gap);
    gap *= 1.5;
  }
  ctx.restore();
}

export function paintSkyline(ctx, styleId, w, h) {
  const horizonY = h * 0.78;
  const ink = "#14041f";
  ctx.save();
  if (styleId === "palms") {
    drawLowSun(ctx, w * 0.5, h * 0.52, w * 0.26, "#ffd76a", "#ff2e88");
    drawTowerRow(ctx, w, horizonY, ink, 11, false);
    const palms = [[0.08, 1.1, 0.9], [0.2, -0.8, 0.72], [0.82, 0.9, 0.95], [0.93, -1.0, 0.8]];
    for (const [fx, lean, scale] of palms) {
      drawPalmTree(ctx, w * fx, horizonY + h * 0.02, w * 0.16 * scale, lean, ink);
    }
  } else if (styleId === "neonstrip") {
    drawLowSun(ctx, w * 0.68, h * 0.46, w * 0.2, "#19e3c2", "#ff2e88");
    drawTowerRow(ctx, w, horizonY, ink, 29, true);
    drawPalmTree(ctx, w * 0.06, horizonY + h * 0.02, w * 0.13, 0.9, ink);
    drawPalmTree(ctx, w * 0.94, horizonY + h * 0.02, w * 0.13, -0.9, ink);
    // Neon sign bars along the rooftops.
    ctx.fillStyle = "#ff2e88";
    ctx.fillRect(w * 0.3, horizonY - h * 0.02, w * 0.16, h * 0.008);
    ctx.fillStyle = "#19e3c2";
    ctx.fillRect(w * 0.56, horizonY - h * 0.02, w * 0.12, h * 0.008);
  } else {
    drawLowSun(ctx, w * 0.5, h * 0.5, w * 0.24, "#ffc93c", "#ff5e3a");
    drawTowerRow(ctx, w, horizonY, ink, 7, true);
    drawPalmTree(ctx, w * 0.04, horizonY + h * 0.02, w * 0.11, 0.8, ink);
    drawPalmTree(ctx, w * 0.96, horizonY + h * 0.02, w * 0.11, -0.8, ink);
  }
  // Ground band so the skyline sits on something solid.
  ctx.fillStyle = ink;
  ctx.fillRect(0, horizonY, w, h - horizonY);
  ctx.restore();
}
