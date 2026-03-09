import { GameEngine } from "./game-engine.js";
import { SCENES } from "./game-data.js";

const app = document.getElementById("app");
if (!app) {
  throw new Error("App root not found");
}

const preloadOverlay = document.getElementById("preloadOverlay");
const preloadFill = document.getElementById("preloadFill");
const preloadPct = document.getElementById("preloadPct");

const ASSET_FALLBACKS = [
  "./assets/bg-orbital-dawn-4k.svg",
  "./assets/bg-flood-grid-4k.svg",
  "./assets/bg-civic-bunker-4k.svg",
  "./assets/bg-tribunal-core-4k.svg",
  "./assets/bg-botanic-lab-4k.svg"
];

function collectSceneAssets() {
  const urls = new Set(ASSET_FALLBACKS);
  Object.values(SCENES).forEach((scene) => {
    if (scene.image) {
      urls.add(scene.image);
    }
  });
  return [...urls];
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ ok: true, url });
    img.onerror = () => resolve({ ok: false, url });
    img.src = url;
  });
}

async function preloadAssets(urls, onProgress) {
  const total = urls.length;
  let done = 0;
  const failed = [];
  await Promise.all(
    urls.map(async (url) => {
      const result = await preloadImage(url);
      done += 1;
      if (!result.ok) {
        failed.push(url);
      }
      onProgress(done, total);
    })
  );

  return { failed };
}

function updatePreloadUI(done, total) {
  if (!preloadFill || !preloadPct) {
    return;
  }

  const pct = Math.round((done / total) * 100);
  preloadFill.style.width = `${pct}%`;
  preloadPct.textContent = `${pct}%`;
}

async function bootstrap() {
  const urls = collectSceneAssets();
  let failed = [];

  const timeout = new Promise((resolve) =>
    setTimeout(() => resolve({ failed: ["preload_timeout"] }), 7000)
  );

  const preload = preloadAssets(urls, updatePreloadUI);
  const result = await Promise.race([preload, timeout]);
  failed = result.failed || [];

  if (failed.length) {
    console.warn("Assets com falha de preload:", failed);
  }

  if (preloadOverlay) {
    preloadOverlay.classList.add("hidden");
  }

  const engine = new GameEngine(app);
  engine.start();
}

bootstrap();
