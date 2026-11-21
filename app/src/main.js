// Leonida Key Art — studio wiring: state, controls, live preview, thumbnail
// legibility check, shuffle and PNG export. All rendering lives in cover.js;
// all skyline drawing lives in skyline.js; shot presets live in shots.js.
import { renderCover, thumbnailLegibility, EXPORT_SIZES, GRADE_PRESETS } from "./cover.js";
import { SKYLINE_STYLES } from "./skyline.js";
import { SHOT_SCENES, parseShotQuery, applyShotMode } from "./shots.js";

const $ = (id) => document.getElementById(id);

const state = {
  scene: "beach",
  photo: null,          // loaded HTMLImageElement, or null until a scene loads
  customPhoto: null,    // an uploaded photo replaces the scene photo
  skyline: "downtown",
  grade: "sunset",
  title: "VICE CITY NIGHTS",
  subtitle: "welcome to Leonida",
  badge: "LEONIDA • VICE CITY",
  size: "square",
  zoom: 1,
  pan: 0,
};

const canvas = $("coverCanvas");
const thumb = $("thumbCanvas");
const verdict = $("thumbVerdict");
const frameTag = $("frameTag");
const exportNote = $("exportNote");

function currentPhoto() {
  return state.customPhoto ?? state.photo;
}

function renderAll() {
  const size = EXPORT_SIZES[state.size];
  renderCover(canvas, { ...state, photo: currentPhoto() });
  frameTag.textContent = size.label;
  const check = thumbnailLegibility(thumb, { ...state, photo: currentPhoto() });
  verdict.textContent = check.readable
    ? `✓ Readable at 120 px — title ${check.textWidth}px wide`
    : `✗ Too long for a thumbnail — shorten the title (${check.textWidth}px wide)`;
  verdict.className = "thumb-verdict " + (check.readable ? "pass" : "fail");
}

function loadScenePhoto(sceneId) {
  const scene = SHOT_SCENES.find((s) => s.id === sceneId);
  if (!scene) return;
  const img = new Image();
  img.onload = () => { state.photo = img; renderAll(); };
  img.onerror = () => { state.photo = null; renderAll(); };
  img.src = scene.file;
}

function buildSceneButtons() {
  const grid = $("sceneGrid");
  for (const scene of SHOT_SCENES) {
    const btn = document.createElement("button");
    btn.className = "scene-btn";
    btn.dataset.scene = scene.id;
    btn.innerHTML = `<img src="${scene.file}" alt="${scene.caption}"><span>${scene.label}</span>`;
    btn.addEventListener("click", () => {
      state.scene = scene.id;
      state.customPhoto = null;
      state.title = scene.id === "beach" ? "VICE CITY NIGHTS"
        : scene.id === "boat" ? "SUNSET HEIST"
        : scene.id === "boulevard" ? "OCEAN DRIVE" : "NEON RUNNER";
      $("titleInput").value = state.title;
      loadScenePhoto(scene.id);
      syncActiveStates();
    });
    grid.appendChild(btn);
  }
}

function buildChipRow(el, items, activeId, onPick) {
  for (const item of items) {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.id = item.id;
    chip.textContent = item.label;
    chip.addEventListener("click", () => { onPick(item.id); syncActiveStates(); });
    el.appendChild(chip);
  }
}

function syncActiveStates() {
  document.querySelectorAll(".scene-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.scene === state.scene && !state.customPhoto));
  document.querySelectorAll("#skylineChips .chip").forEach((c) =>
    c.classList.toggle("active", c.dataset.id === state.skyline));
  document.querySelectorAll("#gradeChips .chip").forEach((c) =>
    c.classList.toggle("active", c.dataset.id === state.grade));
  document.querySelectorAll(".size-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.size === state.size));
  renderAll();
}

function shuffleLook() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  state.scene = pick(SHOT_SCENES).id;
  state.skyline = pick(SKYLINE_STYLES).id;
  state.grade = pick(GRADE_PRESETS).id;
  state.customPhoto = null;
  loadScenePhoto(state.scene);
  syncActiveStates();
}

function exportPng() {
  const off = document.createElement("canvas");
  renderCover(off, { ...state, photo: currentPhoto() });
  const size = EXPORT_SIZES[state.size];
  const a = document.createElement("a");
  a.href = off.toDataURL("image/png");
  a.download = `leonida-key-art-${state.size}-${size.w}x${size.h}.png`;
  a.click();
  exportNote.textContent = `Saved ${size.w} × ${size.h} PNG — ${state.title}.`;
}

// Uploaded photos stay local: read as a data URL, never sent anywhere.
$("photoUpload").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => { state.customPhoto = img; renderAll(); };
    img.src = String(reader.result);
  };
  reader.readAsDataURL(file);
});

$("zoomRange").addEventListener("input", (e) => { state.zoom = Number(e.target.value) / 100; renderAll(); });
$("panRange").addEventListener("input", (e) => { state.pan = Number(e.target.value); renderAll(); });
$("titleInput").addEventListener("input", (e) => { state.title = e.target.value || "LEONIDA"; renderAll(); });
$("subtitleInput").addEventListener("input", (e) => { state.subtitle = e.target.value; renderAll(); });
$("badgeInput").addEventListener("input", (e) => { state.badge = e.target.value; renderAll(); });
$("exportBtn").addEventListener("click", exportPng);
$("shuffleBtn").addEventListener("click", shuffleLook);
document.querySelectorAll(".size-btn").forEach((b) =>
  b.addEventListener("click", () => { state.size = b.dataset.size; syncActiveStates(); }));

buildSceneButtons();
buildChipRow($("skylineChips"), SKYLINE_STYLES, state.skyline, (id) => { state.skyline = id; });
buildChipRow($("gradeChips"), GRADE_PRESETS, state.grade, (id) => { state.grade = id; });

// Shot presets (?shot=cover&scene=neon&...) drive the screenshots deterministically.
const preset = parseShotQuery(window.location.search);
if (window.location.search) {
  state.scene = preset.scene;
  state.skyline = preset.skyline;
  state.grade = preset.grade;
  state.title = preset.title;
  state.subtitle = preset.subtitle;
  state.badge = preset.badge;
  state.size = preset.size;
  $("titleInput").value = state.title;
  $("subtitleInput").value = state.subtitle;
  $("badgeInput").value = state.badge;
  applyShotMode(preset.shot);
}

document.fonts?.ready.then(() => renderAll());
loadScenePhoto(state.scene);
syncActiveStates();
