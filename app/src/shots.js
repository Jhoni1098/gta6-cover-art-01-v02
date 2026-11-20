// Fixed scenes for screenshots: ?shot=cover shows the cover alone on a
// black page; ?shot=editor shows the full editor with a photo loaded.
// Query knobs: scene, skyline, photo, title, subtitle, tagline, placement,
// style, tracking, size. window.__shotReady is set once painted.
import { SAMPLES, SCENES, SKYLINES, PLACEMENTS, TITLE_STYLES } from './cover.js';

function paintWhenReady(api) {
  api.redrawPreview();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

export async function runShot(shot, query, api) {
  const { state } = api;
  const scene = query.get('scene');
  if (scene && SCENES.some((s) => s.id === scene)) state.scene = scene;
  const skyline = query.get('skyline');
  if (skyline && SKYLINES.some((s) => s.id === skyline)) state.skyline = skyline;
  const placement = query.get('placement');
  if (placement && PLACEMENTS.some((s) => s.id === placement)) state.placement = placement;
  const style = query.get('style');
  if (style && TITLE_STYLES.some((s) => s.id === style)) state.titleStyle = style;
  const title = query.get('title');
  if (title !== null) state.title = title;
  const subtitle = query.get('subtitle');
  if (subtitle !== null) state.subtitle = subtitle;
  const tagline = query.get('tagline');
  if (tagline !== null) state.tagline = tagline;
  const tracking = query.get('tracking');
  if (tracking !== null) state.tracking = Number(tracking);
  const photo = query.get('photo');
  if (photo && SAMPLES.includes(photo)) {
    state.photo = photo;
    state.zoom = 1;
    state.ox = 0;
    state.oy = 0;
  }
  const size = query.get('size');
  if (size) api.setSize(size);

  api.syncControls();
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    paintWhenReady(api);
    return;
  }
  // 'editor': the whole workbench, with the chosen photo loaded.
  paintWhenReady(api);
}
