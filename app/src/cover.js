// The cover renderer: hero photo + grade + drawn skyline + sunset lettering,
// painted onto any canvas at any export size. Pure canvas 2D, no dependencies.
import { paintSkyline } from "./skyline.js";

export const EXPORT_SIZES = {
  square: { w: 1080, h: 1080, label: "1080 × 1080 · Square" },
  portrait: { w: 1080, h: 1350, label: "1080 × 1350 · Portrait" },
  wide: { w: 1920, h: 1080, label: "1920 × 1080 · Wide" },
};

export const GRADE_PRESETS = [
  { id: "sunset", label: "Sunset", tint: "rgba(255,94,58,0.20)", sky: ["#2b0a3d", "#ff5e3a", "#ffc93c"] },
  { id: "neon", label: "Neon", tint: "rgba(255,46,136,0.22)", sky: ["#12061a", "#ff2e88", "#19e3c2"] },
  { id: "golden", label: "Golden Hour", tint: "rgba(255,180,60,0.22)", sky: ["#3d1a0a", "#ff8c1a", "#ffe9a8"] },
  { id: "tealnoir", label: "Teal Noir", tint: "rgba(16,120,140,0.25)", sky: ["#04141c", "#0f5f6e", "#19e3c2"] },
  { id: "bubblegum", label: "Bubblegum", tint: "rgba(255,120,200,0.20)", sky: ["#2d0a33", "#ff7ad9", "#ffb3d1"] },
];

function coverFitDraw(ctx, img, w, h, zoom, pan) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (w - dw) / 2 + (pan / 100) * w * 0.25;
  const dy = (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function paintGradeSky(ctx, w, h, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.8);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.8);
}

function paintLettering(ctx, w, h, title, subtitle, badge) {
  const unit = w / 1080;
  const titleSize = Math.min(w * 0.16, (w * 0.92) / Math.max(4, title.length * 0.52));
  const titleY = h * 0.30;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Sunset-gradient title with a thick white outline, Bebas display face.
  const grad = ctx.createLinearGradient(0, titleY - titleSize * 0.55, 0, titleY + titleSize * 0.55);
  grad.addColorStop(0, "#fff6ec");
  grad.addColorStop(0.5, "#ffb347");
  grad.addColorStop(1, "#ff2e88");
  ctx.font = `${titleSize}px "BebasNeue", sans-serif`;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = titleSize * 0.09;
  ctx.strokeText(title.toUpperCase(), w / 2, titleY);
  ctx.fillStyle = grad;
  ctx.fillText(title.toUpperCase(), w / 2, titleY);
  // Script subtitle in Pacifico, soft white with a dark halo.
  const subSize = titleSize * 0.32;
  ctx.font = `${subSize}px "Pacifico", cursive`;
  ctx.fillStyle = "rgba(20,4,31,0.65)";
  ctx.fillText(subtitle, w / 2 + 3, h * 0.40 + 3);
  ctx.fillStyle = "#ffe9f4";
  ctx.fillText(subtitle, w / 2, h * 0.40);
  // Ribbon badge: a gold band with dark lettering, top centre.
  const badgeText = badge.replace(/&bull;/g, "•").toUpperCase();
  ctx.font = `bold ${Math.round(22 * unit)}px system-ui, sans-serif`;
  const badgeW = ctx.measureText(badgeText).width + 44 * unit;
  const badgeH = 44 * unit;
  const bx = (w - badgeW) / 2;
  const by = h * 0.045;
  ctx.fillStyle = "#ffc93c";
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + badgeW, by);
  ctx.lineTo(bx + badgeW - 14 * unit, by + badgeH);
  ctx.lineTo(bx + 14 * unit, by + badgeH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#14041f";
  ctx.fillText(badgeText, w / 2, by + badgeH / 2 + 1);
  ctx.restore();
}

function paintGrainAndVignette(ctx, w, h, seed) {
  ctx.save();
  let s = seed;
  const next = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < 900; i++) {
    ctx.fillRect(next() * w, next() * h, 2, 2);
  }
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(10,2,16,0.42)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// Renders one full cover. `photo` is a loaded HTMLImageElement (or null for a
// sky-only fallback). Returns nothing; the canvas is painted in place.
export function renderCover(canvas, state) {
  const size = EXPORT_SIZES[state.size] ?? EXPORT_SIZES.square;
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext("2d");
  const grade = GRADE_PRESETS.find((g) => g.id === state.grade) ?? GRADE_PRESETS[0];
  const w = size.w;
  const h = size.h;
  paintGradeSky(ctx, w, h, grade);
  if (state.photo) {
    // Photo fills the lower two-thirds, fading into the graded sky at the top.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, h * 0.34, w, h * 0.66);
    ctx.clip();
    coverFitDraw(ctx, state.photo, w, h * 0.66, state.zoom, state.pan);
    ctx.restore();
    const fade = ctx.createLinearGradient(0, h * 0.34, 0, h * 0.52);
    fade.addColorStop(0, grade.sky[1]);
    fade.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, h * 0.34, w, h * 0.18);
    ctx.fillStyle = grade.tint;
    ctx.fillRect(0, h * 0.34, w, h * 0.66);
  }
  paintSkyline(ctx, state.skyline, w, h);
  paintLettering(ctx, w, h, state.title, state.subtitle, state.badge);
  paintGrainAndVignette(ctx, w, h, 1234 + state.title.length);
  return size;
}

// Measures whether the title stays readable at thumbnail size: renders the
// cover at 120 px and compares the title's pixel width against the frame.
export function thumbnailLegibility(canvas120, state) {
  const off = document.createElement("canvas");
  renderCover(off, { ...state, size: "square" });
  const ctx = canvas120.getContext("2d");
  canvas120.width = 120;
  canvas120.height = 120;
  ctx.drawImage(off, 0, 0, 120, 120);
  // Re-measure the title at thumbnail scale with the same display font.
  const titleSize = Math.min(120 * 0.16, (120 * 0.92) / Math.max(4, state.title.length * 0.52));
  ctx.font = `${titleSize}px "BebasNeue", sans-serif`;
  const textW = ctx.measureText(state.title.toUpperCase()).width;
  const readable = textW <= 112 && state.title.length <= 18;
  return { readable, textWidth: Math.round(textW), titleSize: Math.round(titleSize) };
}
