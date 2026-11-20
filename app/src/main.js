// Leonida Key Art wiring: state, controls, photo upload, drag and zoom,
// shuffle, the thumbnail legibility check and PNG export.
// The cover itself is drawn by ./cover.js; this file only runs the page.
import {
  drawCover, renderCover, SCENES, SKYLINES, PLACEMENTS, TITLE_STYLES,
  SIZES, SAMPLES, SHUFFLE_TITLES, sceneById,
} from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const thumb = document.getElementById('thumb');
const statusEl = document.getElementById('status');
const zoomEl = document.getElementById('zoom');

const state = {
  scene: 'sunset-strip',
  skyline: 'downtown',
  photo: 'boulevard',
  zoom: 1,
  ox: 0,
  oy: 0,
  title: 'VICE CITY',
  subtitle: 'welcome back to leonida',
  tagline: 'SUMMER 2026 • LEONIDA',
  placement: 'bottom',
  titleStyle: 'gradient',
  tracking: 6,
  palms: true,
  sun: true,
  grain: true,
  vignette: true,
  size: '1080x1080',
};

const images = new Map();
let fontsReady = false;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSamples() {
  for (const key of SAMPLES) {
    try {
      images.set(key, await loadImage(`samples/${key}.jpg`));
    } catch {
      // A missing sample just leaves the cover without that photo.
    }
  }
}

function sizeParts() {
  const [w, h] = state.size.split('x').map(Number);
  return { w, h };
}

function sizeThumb() {
  const { w, h } = sizeParts();
  const tw = 168;
  thumb.width = tw;
  thumb.height = Math.round(tw * h / w);
}

/** Redraws the big preview and the small thumbnail legibility check. */
function redrawPreview() {
  const { w, h } = sizeParts();
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    canvas.classList.toggle('wide', w > h);
    canvas.classList.toggle('tall', h > w);
    sizeThumb();
  }
  drawCover(canvas, state, images);
  drawCover(thumb, state, images);
}

/** A row of toggle buttons; `onPick` runs when one is chosen. */
function buildChoices(el, items, get, set) {
  el.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice';
    b.textContent = item.name;
    b.dataset.id = item.id;
    if (get() === item.id) b.classList.add('on');
    b.addEventListener('click', () => {
      set(item.id);
      el.querySelectorAll('.choice').forEach((c) => c.classList.toggle('on', c.dataset.id === item.id));
      redrawPreview();
    });
    el.appendChild(b);
  }
}

function buildThumbs() {
  const el = document.getElementById('thumbs');
  el.innerHTML = '';
  for (const key of SAMPLES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb-pick' + (state.photo === key ? ' on' : '');
    b.title = key;
    const img = document.createElement('img');
    img.src = `samples/${key}.jpg`;
    img.alt = key;
    b.appendChild(img);
    b.addEventListener('click', () => {
      state.photo = key;
      state.zoom = 1;
      state.ox = 0;
      state.oy = 0;
      syncZoomSlider();
      buildThumbs();
      redrawPreview();
    });
    el.appendChild(b);
  }
}

function syncZoomSlider() {
  zoomEl.value = String(state.zoom);
}

function syncControls() {
  document.getElementById('title').value = state.title;
  document.getElementById('subtitle').value = state.subtitle;
  document.getElementById('tagline').value = state.tagline;
  document.getElementById('palms').checked = state.palms;
  document.getElementById('sun').checked = state.sun;
  document.getElementById('grain').checked = state.grain;
  document.getElementById('vignette').checked = state.vignette;
  document.getElementById('tracking').value = String(state.tracking);
  syncZoomSlider();
  buildThumbs();
  buildChoices(document.getElementById('scenes'), SCENES, () => state.scene, (v) => { state.scene = v; });
  buildChoices(document.getElementById('skylines'), SKYLINES, () => state.skyline, (v) => { state.skyline = v; });
  buildChoices(document.getElementById('placements'), PLACEMENTS, () => state.placement, (v) => { state.placement = v; });
  buildChoices(document.getElementById('styles'), TITLE_STYLES, () => state.titleStyle, (v) => { state.titleStyle = v; });
}

function setSize(size) {
  if (SIZES.includes(size)) state.size = size;
  document.querySelectorAll('[data-size]').forEach((b) => {
    b.classList.toggle('on', b.dataset.size === state.size);
  });
  redrawPreview();
}

/** One tap, one whole new poster: scene, skyline, photo, title and placement. */
function shuffle() {
  const scene = SCENES[Math.floor(Math.random() * SCENES.length)];
  const skyline = SKYLINES[Math.floor(Math.random() * SKYLINES.length)];
  const photo = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
  const [title, subtitle] = SHUFFLE_TITLES[Math.floor(Math.random() * SHUFFLE_TITLES.length)];
  const placement = PLACEMENTS[Math.floor(Math.random() * PLACEMENTS.length)];
  const titleStyle = TITLE_STYLES[Math.floor(Math.random() * TITLE_STYLES.length)];
  state.scene = scene.id;
  state.skyline = skyline.id;
  state.photo = photo;
  state.title = title;
  state.subtitle = subtitle;
  state.placement = placement.id;
  state.titleStyle = titleStyle.id;
  state.zoom = 1;
  state.ox = 0;
  state.oy = 0;
  syncControls();
  redrawPreview();
  statusEl.textContent = `Shuffled: ${scene.name} · ${skyline.name} · “${title}”.`;
}

function exportPng(size) {
  setSize(size);
  const [w, h] = size.split('x').map(Number);
  const out = renderCover(w, h, state, images);
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leonida-key-art-${size}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Saved leonida-key-art-${size}.png`;
  }, 'image/png');
}

// Photo upload: the file is read on this machine and never leaves it.
document.getElementById('upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const img = await loadImage(URL.createObjectURL(file));
    images.set('upload', img);
    state.photo = 'upload';
    state.zoom = 1;
    state.ox = 0;
    state.oy = 0;
    syncZoomSlider();
    buildThumbs();
    redrawPreview();
    statusEl.textContent = `Loaded ${file.name} — it never leaves this machine.`;
  } catch {
    statusEl.textContent = 'That file could not be read as a photo.';
  }
});

// Drag the photo to pan it; scroll to zoom. Both apply to the hero photo.
let dragging = null;
canvas.addEventListener('pointerdown', (e) => {
  dragging = { x: e.clientX, y: e.clientY, ox: state.ox, oy: state.oy };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  state.ox = dragging.ox + (e.clientX - dragging.x) / rect.width;
  state.oy = dragging.oy + (e.clientY - dragging.y) / rect.height;
  redrawPreview();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  state.zoom = Math.min(3, Math.max(1, state.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  syncZoomSlider();
  redrawPreview();
}, { passive: false });

zoomEl.addEventListener('input', () => {
  state.zoom = Number(zoomEl.value);
  redrawPreview();
});
document.getElementById('zoomOut').addEventListener('click', () => {
  state.zoom = Math.max(1, state.zoom - 0.2);
  syncZoomSlider();
  redrawPreview();
});
document.getElementById('zoomIn').addEventListener('click', () => {
  state.zoom = Math.min(3, state.zoom + 0.2);
  syncZoomSlider();
  redrawPreview();
});

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redrawPreview(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redrawPreview(); });
document.getElementById('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redrawPreview(); });
document.getElementById('tracking').addEventListener('input', (e) => { state.tracking = Number(e.target.value); redrawPreview(); });
for (const id of ['palms', 'sun', 'grain', 'vignette']) {
  document.getElementById(id).addEventListener('change', (e) => { state[id] = e.target.checked; redrawPreview(); });
}
document.getElementById('shuffle').addEventListener('click', shuffle);
document.querySelectorAll('[data-size]').forEach((b) => {
  b.addEventListener('click', () => exportPng(b.dataset.size));
});

const api = { state, images, redrawPreview, buildThumbs, syncZoomSlider, syncControls, setSize, shuffle };

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  (async () => {
    await loadSamples();
    try {
      await document.fonts.load('100px "Bebas Neue"');
      await document.fonts.load('100px "Pacifico"');
      fontsReady = true;
    } catch { /* The fallback fonts still draw. */ }
    await runShot(shot, new URLSearchParams(location.search), api);
  })();
} else {
  (async () => {
    await loadSamples();
    syncControls();
    redrawPreview();
    try {
      await document.fonts.ready;
      await document.fonts.load('100px "Bebas Neue"');
      await document.fonts.load('100px "Pacifico"');
      fontsReady = true;
      redrawPreview();
    } catch { /* The fallback fonts still draw. */ }
  })();
}

export { fontsReady };
