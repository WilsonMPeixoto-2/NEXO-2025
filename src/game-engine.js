import {
  SCENES,
  TRAIT_LABELS,
  PROFILE_LABELS,
  DEFAULT_PROFILE,
  INITIAL_BATTERY
} from "./game-data.js";
import { getProfileAvatar, getScenePortrait } from "./portrait-system.js";

function hasReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const BACKDROP_IMAGES = {
  "orbital-dawn": "./assets/bg-orbital-dawn-4k.svg",
  "flood-grid": "./assets/bg-flood-grid-4k.svg",
  "civic-bunker": "./assets/bg-civic-bunker-4k.svg",
  "tribunal-core": "./assets/bg-tribunal-core-4k.svg",
  "botanic-lab": "./assets/bg-botanic-lab-4k.svg"
};

const ARCADE_MODE_KEY = "nexo2050_arcade_mode";
const MAX_HISTORY = 80;

let runnerMiniGameModulePromise = null;

async function loadRunnerMiniGame() {
  if (!runnerMiniGameModulePromise) {
    runnerMiniGameModulePromise = import("./runner-minigame.js");
  }
  return runnerMiniGameModulePromise;
}

class AdaptiveAudioDirector {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.ambient = null;
    this.theme = "clean";
    this.fxTimer = null;
  }

  async toggle() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    this.enabled = !this.enabled;

    if (this.enabled) {
      this.ensureAmbient();
      this.ambient.master.gain.setTargetAtTime(0.06, this.ctx.currentTime, 0.2);
      this.setTheme(this.theme);
    } else if (this.ambient) {
      this.ambient.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
      if (this.fxTimer) {
        clearInterval(this.fxTimer);
        this.fxTimer = null;
      }
    }

    return this.enabled;
  }

  ensureAmbient() {
    if (this.ambient || !this.ctx) {
      return;
    }

    const master = this.ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(this.ctx.destination);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.connect(master);

    const oscA = this.ctx.createOscillator();
    const oscB = this.ctx.createOscillator();
    const gainA = this.ctx.createGain();
    const gainB = this.ctx.createGain();
    const noiseFilter = this.ctx.createBiquadFilter();
    const noiseGain = this.ctx.createGain();
    const noiseSource = this.ctx.createBufferSource();

    oscA.type = "sawtooth";
    oscB.type = "triangle";
    gainA.gain.value = 0.024;
    gainB.gain.value = 0.018;
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 620;
    noiseFilter.Q.value = 0.5;
    noiseGain.gain.value = 0.004;
    noiseSource.buffer = this.createNoiseBuffer(2);
    noiseSource.loop = true;

    oscA.connect(gainA).connect(filter);
    oscB.connect(gainB).connect(filter);
    noiseSource.connect(noiseFilter).connect(noiseGain).connect(master);

    oscA.start();
    oscB.start();
    noiseSource.start();

    this.ambient = { master, filter, oscA, oscB, gainA, gainB, noiseFilter, noiseGain, noiseSource };
  }

  setTheme(theme) {
    this.theme = theme || "clean";
    if (!this.enabled || !this.ctx) {
      return;
    }

    this.ensureAmbient();
    const now = this.ctx.currentTime;

    const map = {
      clean: { a: 138, b: 220, lowpass: 1800, gA: 0.02, gB: 0.016, noise: 0.003 },
      cyber: { a: 162, b: 290, lowpass: 2300, gA: 0.025, gB: 0.018, noise: 0.005 },
      distopic: { a: 92, b: 140, lowpass: 1100, gA: 0.03, gB: 0.015, noise: 0.008 },
      glitch: { a: 118, b: 196, lowpass: 1500, gA: 0.028, gB: 0.02, noise: 0.007 }
    };

    const config = map[this.theme] || map.clean;
    this.ambient.oscA.frequency.setTargetAtTime(config.a, now, 0.3);
    this.ambient.oscB.frequency.setTargetAtTime(config.b, now, 0.3);
    this.ambient.filter.frequency.setTargetAtTime(config.lowpass, now, 0.3);
    this.ambient.gainA.gain.setTargetAtTime(config.gA, now, 0.3);
    this.ambient.gainB.gain.setTargetAtTime(config.gB, now, 0.3);
    this.ambient.noiseGain.gain.setTargetAtTime(config.noise, now, 0.3);
    this.configureAtmosFx();
  }

  createNoiseBuffer(seconds = 2) {
    if (!this.ctx) {
      return null;
    }
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      channel[i] = (Math.random() * 2 - 1) * 0.36;
    }
    return buffer;
  }

  configureAtmosFx() {
    if (this.fxTimer) {
      clearInterval(this.fxTimer);
      this.fxTimer = null;
    }
    if (!this.enabled) {
      return;
    }

    const intervalMap = {
      clean: 0,
      cyber: 9500,
      distopic: 6200,
      glitch: 5200
    };

    const delay = intervalMap[this.theme] ?? 0;
    if (!delay) {
      return;
    }

    this.fxTimer = setInterval(() => this.playAtmosFx(), delay);
  }

  playAtmosFx() {
    if (!this.enabled || !this.ctx) {
      return;
    }

    const now = this.ctx.currentTime;
    const rumble = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    const rumbleFilter = this.ctx.createBiquadFilter();
    rumble.type = "triangle";
    rumble.frequency.setValueAtTime(this.theme === "glitch" ? 62 : 48, now);
    rumble.frequency.exponentialRampToValueAtTime(this.theme === "glitch" ? 96 : 71, now + 0.22);
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.value = 480;
    rumbleGain.gain.setValueAtTime(0.0001, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.04, now + 0.03);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    rumble.connect(rumbleFilter).connect(rumbleGain).connect(this.ctx.destination);
    rumble.start(now);
    rumble.stop(now + 0.62);

    if (this.theme === "distopic" || this.theme === "glitch") {
      const crack = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();
      crack.type = "square";
      crack.frequency.setValueAtTime(880 + Math.random() * 240, now + 0.12);
      crackGain.gain.setValueAtTime(0.0001, now + 0.12);
      crackGain.gain.exponentialRampToValueAtTime(0.02, now + 0.13);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      crack.connect(crackGain).connect(this.ctx.destination);
      crack.start(now + 0.12);
      crack.stop(now + 0.24);
    }
  }

  beep(kind = "confirm") {
    if (!this.enabled || !this.ctx) {
      return;
    }

    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.ctx.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    const osc = this.ctx.createOscillator();
    osc.connect(gain);

    if (kind === "alert") {
      osc.type = "square";
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.09);
    } else if (kind === "warning") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(370, now + 0.1);
    } else if (kind === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.setValueAtTime(440, now + 0.05);
      osc.frequency.setValueAtTime(520, now + 0.1);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.linearRampToValueAtTime(430, now + 0.08);
    }

    osc.start(now);
    osc.stop(now + 0.15);
  }
}

class VoiceDirector {
  constructor() {
    this.enabled = false;
    this.voice = null;
    this.supported = typeof window !== "undefined" && "speechSynthesis" in window;
    this.isNatural = false;
    this.loadVoices = this.loadVoices.bind(this);

    if (this.supported) {
      this.loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", this.loadVoices);
    }
  }

  loadVoices() {
    if (!this.supported) {
      return;
    }
    const voices = window.speechSynthesis.getVoices();

    const ptVoices = voices.filter(
      (v) => v.lang.toLowerCase().startsWith("pt-br") || v.lang.toLowerCase().startsWith("pt")
    );

    const naturalPattern = /(natural|neural|premium|enhanced|human)/i;
    const preferred = ptVoices.find((v) => naturalPattern.test(v.name));
    const fallbackPt = ptVoices[0];
    const fallbackAny = voices[0];

    this.voice = preferred || fallbackPt || fallbackAny || null;
    this.isNatural = Boolean(this.voice && naturalPattern.test(this.voice.name));
  }

  toggle() {
    if (!this.supported) {
      return false;
    }
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }

  speak(speaker, text) {
    if (!this.supported || !this.enabled || !text) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${speaker}. ${text}`);
    utterance.lang = "pt-BR";
    utterance.rate = this.isNatural ? 1.0 : 0.96;
    utterance.pitch = this.isNatural ? 1.0 : 0.92;
    if (this.voice) {
      utterance.voice = this.voice;
    }
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (this.supported) {
      window.speechSynthesis.cancel();
    }
  }

  isQualityGood() {
    return this.supported && this.isNatural;
  }
}

class RankingStore {
  constructor(teamName) {
    this.storageKey = "nexo2050_rankings";
    this.teamKey = "nexo2050_team";
    this.memoryFallback = { team: "Equipe 01", list: [] };
    this.teamName = teamName || this.safeGet(this.teamKey) || "Equipe 01";
  }

  setTeamName(name) {
    this.teamName = name || "Equipe 01";
    this.safeSet(this.teamKey, this.teamName);
    this.memoryFallback.team = this.teamName;
  }

  read() {
    try {
      const raw = this.safeGet(this.storageKey);
      if (!raw) {
        return this.memoryFallback.list;
      }
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return this.memoryFallback.list;
    }
  }

  write(list) {
    const data = list.slice(0, 60);
    this.safeSet(this.storageKey, JSON.stringify(data));
    this.memoryFallback.list = data;
  }

  add(entry) {
    const list = this.read();
    list.push({
      ...entry,
      team: entry.team || this.teamName,
      at: entry.at || Date.now()
    });
    list.sort((a, b) => b.score - a.score);
    this.write(list);
  }

  topByTeam(teamName, limit = 5) {
    return this.read()
      .filter((x) => x.team === teamName)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  topGlobal(limit = 5) {
    return this.read()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Keep running even when storage is blocked.
    }
  }
}

export class GameEngine {
  constructor(root) {
    this.root = root;
    this.elements = {
      sceneCard: document.getElementById("sceneCard"),
      speaker: document.getElementById("speaker"),
      line: document.getElementById("line"),
      choices: document.getElementById("choices"),
      chapterBadge: document.getElementById("chapterBadge"),
      traitBadge: document.getElementById("traitBadge"),
      avatarBadge: document.getElementById("avatarBadge"),
      profileAvatarPanel: document.getElementById("profileAvatarPanel"),
      profileAvatarImage: document.getElementById("profileAvatarImage"),
      profileAvatarCaption: document.getElementById("profileAvatarCaption"),
      teamBadge: document.getElementById("teamBadge"),
      teamButton: document.getElementById("teamButton"),
      batteryBadge: document.getElementById("batteryBadge"),
      impactBadge: document.getElementById("impactBadge"),
      progressBadge: document.getElementById("progressBadge"),
      timerBadge: document.getElementById("timerBadge"),
      sceneMedia: document.getElementById("sceneMedia"),
      sceneVideo: document.getElementById("sceneVideo"),
      sceneImage: document.getElementById("sceneImage"),
      sceneNpcWrap: document.getElementById("sceneNpcWrap"),
      sceneNpc: document.getElementById("sceneNpc"),
      audioButton: document.getElementById("audioButton"),
      voiceButton: document.getElementById("voiceButton"),
      arcadeButton: document.getElementById("arcadeButton"),
      eventButton: document.getElementById("eventButton"),
      backButton: document.getElementById("backButton"),
      homeButton: document.getElementById("homeButton"),
      restartButton: document.getElementById("restartButton"),
      exitButton: document.getElementById("exitButton"),
      runnerShell: document.getElementById("runnerShell"),
      runnerTitle: document.getElementById("runnerTitle"),
      runnerHint: document.getElementById("runnerHint"),
      runnerCanvas: document.getElementById("runnerCanvas"),
      runnerTime: document.getElementById("runnerTime"),
      runnerEnergy: document.getElementById("runnerEnergy"),
      runnerHits: document.getElementById("runnerHits"),
      touchLeft: document.getElementById("touchLeft"),
      touchRight: document.getElementById("touchRight"),
      touchJump: document.getElementById("touchJump"),
      rankingPanel: document.getElementById("rankingPanel"),
      rankingTeamList: document.getElementById("rankingTeamList"),
      rankingGlobalList: document.getElementById("rankingGlobalList"),
      sceneTransition: document.getElementById("sceneTransition")
    };

    this.totalScenes = Object.keys(SCENES).length;
    this.audio = new AdaptiveAudioDirector();
    this.voice = new VoiceDirector();
    this.ranking = new RankingStore();
    this.cursor = document.createElement("span");
    this.cursor.className = "cursor";

    this.state = {
      sceneId: "title",
      flags: new Set(),
      visited: new Set(),
      profile: { ...DEFAULT_PROFILE },
      battery: INITIAL_BATTERY,
      impactScore: 0,
      teamName: this.ranking.teamName,
      runnerResult: null,
      isTyping: false,
      typeTimer: null,
      typeDone: null,
      sceneTimer: null,
      sceneSecondsLeft: 0,
      pendingChoices: [],
      arcadeMode: false,
      history: []
    };

    this.state.arcadeMode = this.getInitialArcadeMode();
    this.applyArcadeMode(this.state.arcadeMode, { persist: false, silent: true });

    if (!this.voice.supported) {
      this.elements.voiceButton.textContent = "Narracao: n/d";
      this.elements.voiceButton.disabled = true;
      this.elements.voiceButton.title = "Narracao por voz indisponivel neste navegador";
    } else if (!this.voice.isQualityGood()) {
      this.elements.voiceButton.textContent = "Narracao: beta";
      this.elements.voiceButton.title = "Voz do navegador pode soar robotica";
    } else {
      this.elements.voiceButton.textContent = "Narracao: off";
    }
    this.setEventButton(false);

    this.activeRunner = null;
    this.runnerWatchdog = null;
    this.audioPrimed = false;
    this.transitionTimer = null;
    this.bindEvents();
  }

  scrollToElement(element, block = "start") {
    const behavior = hasReducedMotion() ? "auto" : "smooth";
    window.requestAnimationFrame(() => {
      try {
        element?.scrollIntoView({ behavior, block });
      } catch {
        window.scrollTo({ top: 0, behavior });
      }
    });
  }

  getInitialArcadeMode() {
    let queryValue = null;
    try {
      const search = new URLSearchParams(window.location.search);
      queryValue = search.get("arcade");
    } catch {
      queryValue = null;
    }

    if (queryValue) {
      const normalized = queryValue.trim().toLowerCase();
      return ["1", "true", "on", "yes"].includes(normalized);
    }

    try {
      const stored = localStorage.getItem(ARCADE_MODE_KEY);
      return stored === "on";
    } catch {
      return false;
    }
  }

  applyArcadeMode(enabled, options = {}) {
    const { persist = true, silent = false } = options;
    this.state.arcadeMode = Boolean(enabled);
    this.root.dataset.arcade = this.state.arcadeMode ? "on" : "off";

    if (this.elements.arcadeButton) {
      this.elements.arcadeButton.textContent = this.state.arcadeMode ? "Arcade: on" : "Arcade: off";
      this.elements.arcadeButton.setAttribute("aria-pressed", String(this.state.arcadeMode));
    }

    if (persist) {
      try {
        localStorage.setItem(ARCADE_MODE_KEY, this.state.arcadeMode ? "on" : "off");
      } catch {
        // Keep runtime even when storage is blocked.
      }
    }

    if (!silent) {
      this.audio.beep(this.state.arcadeMode ? "success" : "confirm");
    }
  }

  syncAudioButton(enabled) {
    this.elements.audioButton.textContent = enabled ? "Audio: on" : "Audio: off";
    this.elements.audioButton.setAttribute("aria-pressed", String(Boolean(enabled)));
  }

  setEventButton(active) {
    if (!this.elements.eventButton) {
      return;
    }
    const enabled = Boolean(active);
    this.elements.eventButton.textContent = enabled ? "Modo Evento: on" : "Modo Evento";
    this.elements.eventButton.setAttribute("aria-pressed", String(enabled));
  }

  toggleArcadeMode() {
    this.applyArcadeMode(!this.state.arcadeMode);
    if (this.state.arcadeMode) {
      this.voice.speak("Sistema", "Modo arcade premium ativado.");
      return;
    }
    this.setEventButton(false);
  }

  async ensureAudioOn() {
    if (!this.audio.enabled) {
      const enabled = await this.audio.toggle();
      this.syncAudioButton(enabled);
    } else {
      this.syncAudioButton(true);
    }
    const scene = this.getScene(this.state.sceneId);
    this.audio.setTheme(scene.theme || "clean");
  }

  async requestFullscreenMode() {
    if (document.fullscreenElement) {
      return true;
    }

    const root = document.documentElement;
    const requestFullscreen =
      root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;

    if (!requestFullscreen) {
      return false;
    }

    try {
      await requestFullscreen.call(root);
      return true;
    } catch {
      return false;
    }
  }

  async activateEventMode() {
    const defaultTeam = "Equipe 01";
    this.applyArcadeMode(true, { persist: true, silent: true });
    await this.ensureAudioOn();

    this.resetRun();
    this.state.teamName = defaultTeam;
    this.ranking.setTeamName(defaultTeam);
    this.state.history = [];

    this.renderScene("title", { pushToHistory: false });
    this.updateHud();
    this.updateNavigationState();

    const fullScreenEnabled = await this.requestFullscreenMode();
    this.setEventButton(true);
    this.audio.beep("success");

    if (!fullScreenEnabled) {
      this.voice.speak(
        "Sistema",
        "Modo evento ativado. Tela cheia nao foi concedida automaticamente pelo navegador."
      );
      return;
    }

    this.voice.speak("Sistema", "Modo evento ativado. Sistema pronto para a proxima equipe.");
  }

  async primeAudioExperience() {
    if (this.audioPrimed) {
      return;
    }
    this.audioPrimed = true;
    try {
      const enabled = await this.audio.toggle();
      this.syncAudioButton(enabled);
      const scene = this.getScene(this.state.sceneId);
      this.audio.setTheme(scene.theme || "clean");
    } catch {
      this.audioPrimed = false;
    }
  }

  pushHistory(sceneId) {
    if (!sceneId) {
      return;
    }
    const list = this.state.history;
    const last = list[list.length - 1];
    if (last === sceneId) {
      return;
    }
    list.push(sceneId);
    if (list.length > MAX_HISTORY) {
      list.splice(0, list.length - MAX_HISTORY);
    }
  }

  popHistory() {
    while (this.state.history.length) {
      const prev = this.state.history.pop();
      if (prev && prev !== this.state.sceneId) {
        return prev;
      }
    }
    return null;
  }

  goBack() {
    const prev = this.popHistory();
    if (!prev) {
      this.audio.beep("alert");
      return;
    }
    this.renderScene(prev, { pushToHistory: false });
  }

  updateNavigationState() {
    const hasHistory = this.state.history.length > 0;
    if (this.elements.backButton) {
      this.elements.backButton.disabled = !hasHistory || Boolean(this.activeRunner);
    }
    if (this.elements.restartButton) {
      this.elements.restartButton.disabled = Boolean(this.activeRunner);
    }
  }

  bindEvents() {
    document.addEventListener(
      "pointerdown",
      () => {
        this.primeAudioExperience();
      },
      { once: true }
    );

    this.elements.audioButton.addEventListener("click", async () => {
      const enabled = await this.audio.toggle();
      this.syncAudioButton(enabled);
      const scene = this.getScene(this.state.sceneId);
      this.audio.setTheme(scene.theme || "clean");
      this.audio.beep("confirm");
      if (!enabled) {
        this.setEventButton(false);
      }
    });

    this.elements.voiceButton.addEventListener("click", () => {
      const enabled = this.voice.toggle();
      this.elements.voiceButton.textContent = enabled ? "Narracao: on" : "Narracao: off";
      this.elements.voiceButton.setAttribute("aria-pressed", String(enabled));
      if (enabled) {
        const scene = this.getScene(this.state.sceneId);
        this.voice.speak(scene.speaker || "Sistema", this.elements.line.textContent);
      }
    });

    this.elements.arcadeButton?.addEventListener("click", () => {
      this.toggleArcadeMode();
    });

    this.elements.eventButton?.addEventListener("click", () => {
      this.activateEventMode();
    });

    this.elements.backButton?.addEventListener("click", () => {
      this.goBack();
    });

    this.elements.homeButton?.addEventListener("click", () => {
      this.renderScene("title", { pushToHistory: true });
    });

    this.elements.restartButton?.addEventListener("click", () => {
      this.resetRun();
      this.renderScene("title", { pushToHistory: false });
    });

    this.elements.exitButton?.addEventListener("click", () => {
      const ok = window.confirm("Encerrar esta rodada e voltar para a tela inicial?");
      if (!ok) {
        return;
      }
      this.resetRun();
      this.state.history = [];
      this.renderScene("title", { pushToHistory: false });
    });

    this.elements.teamButton.addEventListener("click", () => {
      const input = window.prompt("Nome da turma/equipe:", this.state.teamName);
      if (!input) {
        return;
      }
      const cleaned = input.trim().slice(0, 28);
      if (!cleaned) {
        return;
      }
      this.state.teamName = cleaned;
      this.ranking.setTeamName(cleaned);
      this.updateHud();
      this.renderRanking(this.getScene(this.state.sceneId));
      this.setEventButton(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "F9") {
        event.preventDefault();
        this.activateEventMode();
        return;
      }

      if (event.key === "F10") {
        event.preventDefault();
        this.toggleArcadeMode();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        this.goBack();
        return;
      }

      if ((event.key === "Enter" || event.key === " ") && this.state.isTyping) {
        event.preventDefault();
        this.finishTyping();
        return;
      }

      if (!this.state.isTyping && !this.activeRunner) {
        const num = Number.parseInt(event.key, 10);
        if (!Number.isNaN(num) && num > 0) {
          const button = this.elements.choices.querySelector(`[data-index="${num - 1}"]`);
          if (button) {
            button.click();
          }
        }
      }
    });
  }

  start() {
    this.renderScene(this.state.sceneId, { pushToHistory: false });
  }

  resetRun() {
    this.stopRunner();
    this.clearAllTimers();
    this.voice.stop();
    this.state.flags.clear();
    this.state.visited.clear();
    this.state.history = [];
    this.state.profile = { ...DEFAULT_PROFILE };
    this.state.battery = INITIAL_BATTERY;
    this.state.impactScore = 0;
    this.state.runnerResult = null;
  }

  clearAllTimers() {
    if (this.state.typeTimer) {
      clearInterval(this.state.typeTimer);
      this.state.typeTimer = null;
    }
    if (this.state.sceneTimer) {
      clearInterval(this.state.sceneTimer);
      this.state.sceneTimer = null;
    }
    if (this.runnerWatchdog) {
      clearTimeout(this.runnerWatchdog);
      this.runnerWatchdog = null;
    }
  }

  stopRunner() {
    if (this.runnerWatchdog) {
      clearTimeout(this.runnerWatchdog);
      this.runnerWatchdog = null;
    }
    if (this.activeRunner) {
      this.activeRunner.stop();
      this.activeRunner = null;
    }
    this.elements.runnerShell.hidden = true;
    this.updateNavigationState();
  }

  getScene(sceneId) {
    return SCENES[sceneId] || SCENES.title;
  }

  getTraitLabel() {
    const traitKey = Object.keys(TRAIT_LABELS).find((key) => this.state.flags.has(key));
    return traitKey ? TRAIT_LABELS[traitKey] : "Sem especializacao";
  }

  getAvatarLabel() {
    const p = this.state.profile;
    if (!p.gender && !p.age && !p.hair) {
      return "Avatar padrao";
    }

    const tokens = [];
    if (p.gender) tokens.push(PROFILE_LABELS.gender[p.gender]);
    if (p.age) tokens.push(PROFILE_LABELS.age[p.age]);
    if (p.hair) tokens.push(PROFILE_LABELS.hair[p.hair]);
    if (p.profession) tokens.push(PROFILE_LABELS.profession[p.profession]);
    return tokens.join(" | ");
  }

  renderProfileAvatar(scene = this.getScene(this.state.sceneId)) {
    if (!this.elements.profileAvatarImage || !this.elements.profileAvatarCaption) {
      return;
    }

    const avatar = getProfileAvatar(this.state.profile, { theme: scene.theme || "clean" });
    this.elements.profileAvatarImage.src = avatar.src;
    this.elements.profileAvatarImage.alt = avatar.alt;
    this.elements.profileAvatarCaption.textContent = avatar.caption;
    this.elements.profileAvatarPanel?.setAttribute("data-state", avatar.ready ? "ready" : "draft");
  }

  renderScenePortrait(scene) {
    if (!this.elements.sceneNpcWrap || !this.elements.sceneNpc) {
      return;
    }

    const portrait = getScenePortrait({
      scene,
      sceneId: this.state.sceneId,
      profile: this.state.profile
    });

    if (portrait) {
      this.elements.sceneNpc.src = portrait.src;
      this.elements.sceneNpc.alt = portrait.alt || scene.speaker || "Personagem";
      this.elements.sceneNpcWrap.hidden = false;
      return;
    }

    if (scene.npc && scene.mode !== "runner") {
      this.elements.sceneNpc.src = scene.npc;
      this.elements.sceneNpc.alt = scene.speaker || "Personagem";
      this.elements.sceneNpcWrap.hidden = false;
      return;
    }

    this.elements.sceneNpc.removeAttribute("src");
    this.elements.sceneNpc.alt = "";
    this.elements.sceneNpcWrap.hidden = true;
  }

  getAvailableChoices(scene) {
    return (scene.choices || []).filter((choice) => {
      if (!choice.requires || choice.requires.length === 0) {
        return true;
      }
      return choice.requires.every((requiredFlag) => this.state.flags.has(requiredFlag));
    });
  }

  getProgressPercent() {
    return Math.round((this.state.visited.size / this.totalScenes) * 100);
  }

  updateHud() {
    this.elements.traitBadge.textContent = this.getTraitLabel();
    this.elements.avatarBadge.textContent = this.getAvatarLabel();
    this.elements.teamBadge.textContent = `Turma: ${this.state.teamName}`;
    this.elements.impactBadge.textContent = `Impacto: ${this.state.impactScore}`;
    this.elements.progressBadge.textContent = `Progresso: ${this.getProgressPercent()}%`;

    const battery = clamp(this.state.battery, 0, 100);
    this.elements.batteryBadge.textContent = `Bateria: ${battery}%`;

    if (battery <= 30) {
      this.elements.batteryBadge.style.borderColor = "rgba(255, 110, 110, 0.65)";
      this.elements.batteryBadge.style.background = "rgba(130, 25, 25, 0.45)";
      this.elements.batteryBadge.style.color = "#ffd2d2";
      return;
    }

    if (battery <= 55) {
      this.elements.batteryBadge.style.borderColor = "rgba(255, 181, 62, 0.65)";
      this.elements.batteryBadge.style.background = "rgba(98, 62, 11, 0.45)";
      this.elements.batteryBadge.style.color = "#ffe4b6";
      return;
    }

    this.elements.batteryBadge.style.borderColor = "rgba(111, 255, 196, 0.6)";
    this.elements.batteryBadge.style.background = "rgba(18, 86, 62, 0.45)";
    this.elements.batteryBadge.style.color = "#d4ffee";
  }

  withDynamicValues(text) {
    return (text || "")
      .replaceAll("{{battery}}", String(this.state.battery))
      .replaceAll("{{impactScore}}", String(this.state.impactScore))
      .replaceAll("{{team}}", this.state.teamName);
  }

  choiceImpact(choice) {
    let points = 12;
    if (choice.tone === "warning") points += 16;
    if (choice.tone === "confirm") points += 24;
    if (choice.tone === "alert") points -= 10;
    if (choice.setProfile) points += 8;
    if (choice.grants) points += 18;
    if (typeof choice.energyDelta === "number" && choice.energyDelta > 0) points += 6;
    return points;
  }

  renderRanking(scene) {
    if (!scene.showRanking) {
      this.elements.rankingPanel.hidden = true;
      this.elements.rankingTeamList.innerHTML = "";
      this.elements.rankingGlobalList.innerHTML = "";
      return;
    }

    this.elements.rankingPanel.hidden = false;
    const teamTop = this.ranking.topByTeam(this.state.teamName, 5);
    const globalTop = this.ranking.topGlobal(5);

    const renderList = (el, list) => {
      el.innerHTML = "";
      if (!list.length) {
        const li = document.createElement("li");
        li.textContent = "Sem registros ainda";
        el.append(li);
        return;
      }

      list.forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = `${entry.team} — ${entry.score} pts (${entry.battery}%)`;
        el.append(li);
      });
    };

    renderList(this.elements.rankingTeamList, teamTop);
    renderList(this.elements.rankingGlobalList, globalTop);
  }

  renderScene(sceneId, options = {}) {
    const { pushToHistory = true } = options;
    this.playSceneTransition();
    this.clearAllTimers();
    this.stopRunner();
    this.voice.stop();
    this.state.isTyping = false;

    const previousScene = this.state.sceneId;
    if (pushToHistory && previousScene && previousScene !== sceneId) {
      this.pushHistory(previousScene);
    }

    const scene = this.getScene(sceneId);
    this.state.sceneId = sceneId in SCENES ? sceneId : "title";
    this.state.visited.add(this.state.sceneId);

    this.root.dataset.theme = scene.theme || "clean";
    this.root.dataset.backdrop = scene.backdrop || "orbital-dawn";
    this.root.dataset.sceneMode = scene.mode || "narrative";
    this.root.dataset.sceneId = this.state.sceneId;

    this.elements.speaker.textContent = scene.speaker || "G.E.T. MOVEL";
    this.elements.chapterBadge.textContent = scene.chapter || "Ato";
    this.elements.timerBadge.hidden = true;
    this.elements.timerBadge.classList.remove("critical");

    const fallbackImage = BACKDROP_IMAGES[scene.backdrop];
    const effectiveImage = scene.image || fallbackImage;
    const effectiveVideo = scene.video || null;
    const hasVideo = Boolean(effectiveVideo);
    const isRunnerScene = scene.mode === "runner";

    if (!isRunnerScene && (hasVideo || effectiveImage)) {
      this.elements.sceneMedia.classList.add("swap");
      this.elements.sceneMedia.hidden = false;

      if (hasVideo) {
        this.elements.sceneVideo.src = effectiveVideo;
        this.elements.sceneVideo.hidden = false;
        this.elements.sceneVideo.currentTime = 0;
        this.elements.sceneVideo.play().catch(() => {});
        this.elements.sceneImage.hidden = true;
      } else {
        this.elements.sceneVideo.pause();
        this.elements.sceneVideo.removeAttribute("src");
        this.elements.sceneVideo.hidden = true;
        this.elements.sceneImage.src = effectiveImage;
        this.elements.sceneImage.alt = scene.imageAlt || scene.chapter || "Imagem de cena";
        this.elements.sceneImage.hidden = false;
      }

      setTimeout(() => {
        this.elements.sceneMedia.classList.remove("swap");
      }, 220);
    } else {
      this.elements.sceneVideo.pause();
      this.elements.sceneVideo.removeAttribute("src");
      this.elements.sceneVideo.hidden = true;
      this.elements.sceneImage.removeAttribute("src");
      this.elements.sceneImage.alt = "";
      this.elements.sceneImage.hidden = true;
      this.elements.sceneMedia.hidden = true;
    }

    this.updateHud();
    this.renderProfileAvatar(scene);
    this.renderScenePortrait(scene);
    this.updateNavigationState();
    this.renderRanking(scene);
    this.state.pendingChoices = this.getAvailableChoices(scene);
    this.scrollToElement(this.elements.sceneCard);

    this.audio.setTheme(scene.theme || "clean");
    const finalText = this.withDynamicValues(scene.text || "...");
    this.voice.speak(scene.speaker || "Sistema", finalText);

    this.typeSceneText(finalText, () => {
      if (scene.mode === "runner") {
        this.startRunnerScene(scene);
        return;
      }
      this.renderChoices();
    });
  }

  playSceneTransition() {
    const tr = this.elements.sceneTransition;
    if (!tr) {
      return;
    }

    tr.classList.remove("active");
    void tr.offsetWidth;
    tr.classList.add("active");

    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
    }

    this.transitionTimer = setTimeout(() => {
      tr.classList.remove("active");
      this.transitionTimer = null;
    }, 220);
  }

  typeSceneText(fullText, onDone) {
    this.state.typeDone = onDone || null;
    const useTypewriter = !hasReducedMotion();

    if (!useTypewriter) {
      this.elements.line.textContent = fullText;
      this.state.isTyping = false;
      this.state.typeDone?.();
      this.state.typeDone = null;
      return;
    }

    this.state.isTyping = true;
    this.elements.line.textContent = "";
    this.elements.line.append(this.cursor);

    let index = 0;
    this.state.typeTimer = setInterval(() => {
      index += 1;
      this.elements.line.textContent = fullText.slice(0, index);
      this.elements.line.append(this.cursor);
      if (index >= fullText.length) {
        this.finishTyping();
      }
    }, 14);
  }

  finishTyping(onDone) {
    if (!this.state.isTyping) {
      return;
    }

    const scene = this.getScene(this.state.sceneId);
    if (this.state.typeTimer) {
      clearInterval(this.state.typeTimer);
      this.state.typeTimer = null;
    }

    this.state.isTyping = false;
    this.elements.line.textContent = this.withDynamicValues(scene.text || "");
    const done = onDone || this.state.typeDone;
    this.state.typeDone = null;
    done?.();
  }

  async startRunnerScene(scene) {
    this.elements.choices.innerHTML = "";
    this.elements.runnerShell.hidden = false;
    this.elements.runnerCanvas.innerHTML = '<div class="runner-loading">Carregando corrida arcade...</div>';
    this.clearAllTimers();
    this.updateNavigationState();
    this.scrollToElement(this.elements.runnerShell, "center");

    const cfg = scene.runner || {};
    this.elements.runnerTitle.textContent = cfg.title || "Operacao de Corrida";
    this.elements.runnerHint.textContent = cfg.hint || "Setas para mover, espaco para salto";

    const hair = this.state.profile.hair;
    const avatarHue = hair === "yellow" ? 46 : hair === "red" ? 2 : 205;

    let RunnerMiniGame;
    try {
      ({ RunnerMiniGame } = await loadRunnerMiniGame());
    } catch (error) {
      console.error("Falha ao carregar runner:", error);
      this.elements.runnerCanvas.innerHTML = '<div class="runner-loading">Falha ao abrir a corrida.</div>';
      this.handleRunnerFinish(scene, { score: 0, energy: 0, hits: 3, batteryDelta: -15 });
      return;
    }

    if (this.state.sceneId !== "run_arcade") {
      return;
    }

    this.activeRunner = new RunnerMiniGame({
      canvas: this.elements.runnerCanvas,
      elTime: this.elements.runnerTime,
      elEnergy: this.elements.runnerEnergy,
      elHits: this.elements.runnerHits,
      touchLeft: this.elements.touchLeft,
      touchRight: this.elements.touchRight,
      touchJump: this.elements.touchJump,
      durationSec: cfg.durationSec ?? 24,
      avatarHue,
      theme: scene.theme,
      onFinish: (result) => this.handleRunnerFinish(scene, result)
    });

    try {
      this.activeRunner.start();
      this.scrollToElement(this.elements.runnerShell, "center");
    } catch (error) {
      console.error("Falha ao iniciar runner:", error);
      this.elements.runnerCanvas.innerHTML = '<div class="runner-loading">Falha ao iniciar a corrida.</div>';
      this.handleRunnerFinish(scene, { score: 0, energy: 0, hits: 3, batteryDelta: -15 });
      return;
    }

    const timeoutMs = ((cfg.durationSec ?? 24) + 8) * 1000;
    this.runnerWatchdog = setTimeout(() => {
      if (!this.activeRunner) {
        return;
      }
      console.warn("Runner watchdog acionado. Encerrando mini game em modo seguro.");
      this.stopRunner();
      this.handleRunnerFinish(scene, { score: 0, energy: 0, hits: 2, batteryDelta: -12 });
    }, timeoutMs);
    this.audio.beep("warning");
  }

  handleRunnerFinish(scene, result) {
    if (this.runnerWatchdog) {
      clearTimeout(this.runnerWatchdog);
      this.runnerWatchdog = null;
    }
    this.activeRunner = null;
    this.elements.runnerShell.hidden = true;
    this.updateNavigationState();

    const safeResult = {
      score: Number(result?.score) || 0,
      energy: Number(result?.energy) || 0,
      hits: Number(result?.hits) || 0,
      batteryDelta: Number(result?.batteryDelta) || -10
    };

    this.state.runnerResult = safeResult;
    this.state.battery = clamp(this.state.battery + safeResult.batteryDelta, 0, 100);
    this.state.impactScore += safeResult.score;

    const cfg = scene.runner || {};
    const passBattery = cfg.passBattery ?? 60;
    const passScore = cfg.passScore ?? 700;
    const legendScore = cfg.legendScore ?? 1600;

    let nextScene = cfg.nextFail || "ending_fail";
    if (this.state.battery >= passBattery && safeResult.score >= legendScore && cfg.nextLegend) {
      nextScene = cfg.nextLegend;
      this.audio.beep("success");
    } else if (this.state.battery >= passBattery && safeResult.score >= passScore) {
      nextScene = cfg.nextPass || "ending_success";
      this.audio.beep("success");
    } else {
      this.audio.beep("alert");
    }

    this.ranking.add({
      team: this.state.teamName,
      score: this.state.impactScore,
      battery: this.state.battery,
      outcome: nextScene
    });

    this.updateHud();
    this.renderScene(nextScene);
  }

  startSceneTimer(scene) {
    if (!scene.timerSeconds || scene.timerSeconds <= 0) {
      this.elements.timerBadge.hidden = true;
      return;
    }

    this.state.sceneSecondsLeft = scene.timerSeconds;
    this.elements.timerBadge.hidden = false;
    this.elements.timerBadge.classList.toggle("critical", this.state.sceneSecondsLeft <= 3);
    this.elements.timerBadge.textContent = `Tempo: ${String(this.state.sceneSecondsLeft).padStart(2, "0")}s`;

    this.state.sceneTimer = setInterval(() => {
      this.state.sceneSecondsLeft -= 1;
      const seconds = Math.max(this.state.sceneSecondsLeft, 0);
      this.elements.timerBadge.textContent = `Tempo: ${String(seconds).padStart(2, "0")}s`;
      this.elements.timerBadge.classList.toggle("critical", seconds <= 3);
      if (seconds <= 0) {
        clearInterval(this.state.sceneTimer);
        this.state.sceneTimer = null;
        this.handleSceneTimeout(scene);
      }
    }, 1000);
  }

  handleSceneTimeout(scene) {
    if (this.state.isTyping) {
      this.finishTyping();
    }
    if (scene.timeoutTo) {
      this.audio.beep("alert");
      this.renderScene(scene.timeoutTo);
      return;
    }
    const fallback = this.state.pendingChoices[0];
    if (fallback) {
      this.applyChoice(fallback);
    }
  }

  renderChoices() {
    const scene = this.getScene(this.state.sceneId);
    this.elements.choices.innerHTML = "";

    if (!this.state.pendingChoices.length) {
      if (scene.mode === "runner") {
        return;
      }
      const fallback = document.createElement("button");
      fallback.type = "button";
      fallback.className = "choice tone-warning";
      fallback.textContent = "Sem escolhas validas. Reiniciar ciclo.";
      fallback.addEventListener("click", () => {
        this.resetRun();
        this.renderScene("title");
      });
      this.elements.choices.append(fallback);
      return;
    }

    this.state.pendingChoices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      const tone = choice.tone || "confirm";
      button.className = `choice tone-${tone}`;
      button.dataset.index = String(index);
      button.style.setProperty("--i", String(index));

      const label = document.createElement("span");
      label.textContent = `${index + 1}. ${choice.label}`;
      button.append(label);

      if (choice.detail) {
        const detail = document.createElement("small");
        detail.textContent = choice.detail;
        button.append(detail);
      }

      button.addEventListener("click", () => {
        if (this.state.isTyping) {
          this.finishTyping(() => this.renderChoices());
          return;
        }
        this.applyChoice(choice);
      });

      this.elements.choices.append(button);
    });

    this.startSceneTimer(scene);
    const firstButton = this.elements.choices.querySelector("button");
    if (firstButton) {
      firstButton.focus({ preventScroll: true });
    }
  }

  resolveRoute(choice) {
    if (choice.toByBattery) {
      const threshold = choice.toByBattery.gte ?? INITIAL_BATTERY;
      return this.state.battery >= threshold ? choice.toByBattery.pass : choice.toByBattery.fail;
    }
    return choice.to || "title";
  }

  applyChoice(choice) {
    if (!this.audioPrimed) {
      this.primeAudioExperience();
    }

    this.clearAllTimers();
    this.elements.timerBadge.hidden = true;
    this.elements.timerBadge.classList.remove("critical");

    if (choice.reset) {
      this.resetRun();
    }
    if (Array.isArray(choice.grants)) {
      choice.grants.forEach((flag) => this.state.flags.add(flag));
    }
    if (choice.setProfile) {
      Object.assign(this.state.profile, choice.setProfile);
    }
    if (typeof choice.energyDelta === "number") {
      this.state.battery = clamp(this.state.battery + choice.energyDelta, 0, 100);
    }

    if (!choice.reset) {
      this.state.impactScore += this.choiceImpact(choice);
    }
    this.updateHud();
    this.audio.beep(choice.tone || "confirm");
    this.renderScene(this.resolveRoute(choice));
  }
}
