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
  "/game-assets/bg-orbital-dawn-4k.svg",
  "/game-assets/bg-flood-grid-4k.svg",
  "/game-assets/bg-civic-bunker-4k.svg",
  "/game-assets/bg-tribunal-core-4k.svg",
  "/game-assets/bg-botanic-lab-4k.svg"
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

function applyDebugParams(engine) {
  try {
    const search = new URLSearchParams(window.location.search);
    const scene = search.get("scene");
    if (!scene) {
      return;
    }

    const profileKeys = ["gender", "age", "skinTone", "hairLength", "hair", "power", "profession"];
    const profile = {};
    profileKeys.forEach((key) => {
      const value = search.get(key);
      if (value) {
        profile[key] = value;
      }
    });

    Object.assign(engine.state.profile, profile);

    const battery = Number.parseInt(search.get("battery") || "", 10);
    if (!Number.isNaN(battery)) {
      engine.state.battery = Math.max(0, Math.min(100, battery));
    }

    const impact = Number.parseInt(search.get("impact") || "", 10);
    if (!Number.isNaN(impact)) {
      engine.state.impactScore = Math.max(0, impact);
    }

    const team = search.get("team");
    if (team) {
      engine.state.teamName = team.trim().slice(0, 28) || engine.state.teamName;
      engine.ranking.setTeamName(engine.state.teamName);
    }

    const flags = (search.get("flags") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    flags.forEach((flag) => engine.state.flags.add(flag));

    engine.state.sceneId = scene;
  } catch {
    // Ignore malformed debug params and continue with the normal flow.
  }
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
  applyDebugParams(engine);
  engine.start();
}

bootstrap();
