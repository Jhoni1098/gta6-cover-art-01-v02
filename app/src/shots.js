// Screenshot presets: what ?shot=… does to the app so Playwright can capture
// each screenshot deterministically. Query params: shot, scene, skyline, grade,
// title, subtitle, size. `shot=cover` hides the editor chrome and fills the
// viewport with the cover; `shot=editor` keeps the full studio visible.
import { GRADE_PRESETS } from "./cover.js";
import { SKYLINE_STYLES } from "./skyline.js";

export const SHOT_SCENES = [
  { id: "beach", label: "Beach Dusk", file: "samples/beach.jpg", caption: "Beach couple at dusk" },
  { id: "boat", label: "Speedboat Sunset", file: "samples/boat.jpg", caption: "Speedboat at sunset" },
  { id: "boulevard", label: "Ocean Drive", file: "samples/boulevard.jpg", caption: "Ocean Drive boulevard" },
  { id: "neon", label: "Neon Night Rider", file: "samples/neon.jpg", caption: "Neon night rider" },
];

export const SHOT_TITLES = {
  beach: "VICE CITY NIGHTS",
  boat: "SUNSET HEIST",
  boulevard: "OCEAN DRIVE",
  neon: "NEON RUNNER",
};

export function parseShotQuery(search) {
  const q = new URLSearchParams(search);
  const scene = SHOT_SCENES.find((s) => s.id === q.get("scene")) ?? SHOT_SCENES[0];
  const skyline = SKYLINE_STYLES.find((s) => s.id === q.get("skyline")) ?? SKYLINE_STYLES[0];
  const grade = GRADE_PRESETS.find((g) => g.id === q.get("grade")) ?? GRADE_PRESETS[0];
  return {
    shot: q.get("shot") === "cover" ? "cover" : "editor",
    scene: scene.id,
    skyline: skyline.id,
    grade: grade.id,
    title: q.get("title") ?? SHOT_TITLES[scene.id],
    subtitle: q.get("subtitle") ?? "welcome to Leonida",
    badge: q.get("badge") ?? "LEONIDA • VICE CITY",
    size: ["square", "portrait", "wide"].includes(q.get("size")) ? q.get("size") : "square",
  };
}

export function applyShotMode(shot) {
  if (shot === "cover") document.body.classList.add("shot-cover");
  return shot;
}
