const THEME_BACKGROUNDS = {
  clean: { from: "#102d34", to: "#061117", accent: "#6af5df" },
  cyber: { from: "#201d47", to: "#090c1d", accent: "#8cdfff" },
  distopic: { from: "#341d2a", to: "#120d16", accent: "#ff9877" },
  glitch: { from: "#101f34", to: "#060913", accent: "#86f7ff" }
};

const PROFILE_HAIR = {
  blue: "#62c7ff",
  yellow: "#ffd557",
  red: "#ff7474"
};

const POWER_ACCENT = {
  calc: "#67d1ff",
  empathy: "#8dffcb",
  animal: "#7ef0a9",
  trees: "#b8ff69"
};

const PROFESSION_ACCENT = {
  smart_architect: "#ffd166",
  ai_engineer: "#7ad7ff",
  robo_coach: "#ff8c76",
  food_3d: "#ffb06f",
  space_driver: "#ffe16c",
  game_designer: "#ff7dc9",
  holo_actor: "#df8fff",
  green_manager: "#9cff7c"
};

function getThemePalette(theme) {
  return THEME_BACKGROUNDS[theme] || THEME_BACKGROUNDS.clean;
}

function escapeText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mixHex(a, b, weight = 0.5) {
  const parse = (hex) => {
    const safe = hex.replace("#", "");
    return [0, 2, 4].map((index) => Number.parseInt(safe.slice(index, index + 2), 16));
  };

  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const blend = (left, right) => Math.round(left + (right - left) * weight);
  return `rgb(${blend(ar, br)}, ${blend(ag, bg)}, ${blend(ab, bb)})`;
}

function encodeSvg(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getProfileLabel(profile) {
  const parts = [];
  if (profile.gender === "masc") parts.push("Avatar A");
  if (profile.gender === "fem") parts.push("Avatar B");
  if (profile.age === "child") parts.push("Infancia");
  if (profile.age === "teen") parts.push("Juventude");
  if (profile.hair === "blue") parts.push("Azul");
  if (profile.hair === "yellow") parts.push("Neon");
  if (profile.hair === "red") parts.push("Vermelho");
  return parts.length ? parts.join(" | ") : "Avatar em formacao";
}

function getProfileAccent(profile, theme) {
  const professionAccent = PROFESSION_ACCENT[profile.profession];
  const powerAccent = POWER_ACCENT[profile.power];
  return professionAccent || powerAccent || getThemePalette(theme).accent;
}

function getHairStyle(profile) {
  if (profile.gender === "fem" && profile.age === "teen") {
    return "wave";
  }
  if (profile.gender === "fem") {
    return "bob";
  }
  if (profile.age === "child") {
    return "soft";
  }
  return "crest";
}

function getHairSvg(style, hair, accent) {
  switch (style) {
    case "wave":
      return `
        <path d="M72 118c7-38 39-62 86-62 58 0 95 31 98 79-10-16-25-25-44-27-18-2-36 4-53 17-12-10-26-15-42-14-18 1-31 8-45 23z" fill="${hair}" />
        <path d="M83 114c8-20 25-41 52-44 27-3 53 10 69 32-19-7-39-6-57 4-18-8-36-5-64 8z" fill="${mixHex(hair, "#ffffff", 0.18)}" opacity="0.54" />
      `;
    case "bob":
      return `
        <path d="M78 119c5-39 35-63 81-63 55 0 90 30 94 75-13-11-30-17-50-16-17 0-31 7-43 17-12-9-28-13-46-12-15 1-27 6-36 15z" fill="${hair}" />
        <path d="M78 121c-2 30 6 56 22 77 11 15 28 22 50 22-18-24-26-56-26-96l-46-3z" fill="${mixHex(hair, "#000000", 0.14)}" opacity="0.58" />
        <path d="M242 118c2 30-6 56-22 77-11 15-28 22-50 22 18-24 26-56 26-96l46-3z" fill="${mixHex(hair, "#000000", 0.14)}" opacity="0.58" />
      `;
    case "soft":
      return `
        <path d="M92 117c10-35 37-56 72-56 44 0 72 23 82 64-12-12-28-17-48-16-16 1-28 7-40 18-11-9-25-13-41-12-12 0-21 2-25 2z" fill="${hair}" />
        <path d="M116 73c22-18 57-22 86 5" stroke="${accent}" stroke-width="7" stroke-linecap="round" opacity="0.45" />
      `;
    default:
      return `
        <path d="M86 120c7-39 36-63 77-63 51 0 86 29 91 75-11-12-26-18-45-18-18 0-33 6-47 17-12-10-27-14-46-13-10 0-20 1-30 2z" fill="${hair}" />
        <path d="M135 65c14-9 33-12 53-7 12 3 21 8 31 19-18-2-35-1-49 6-11-9-24-13-35-18z" fill="${mixHex(hair, "#ffffff", 0.16)}" opacity="0.58" />
      `;
  }
}

function getSystemPortrait({ label, theme = "clean", accent, title }) {
  const palette = getThemePalette(theme);
  const glow = accent || palette.accent;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="${escapeText(title || label)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.from}" />
          <stop offset="100%" stop-color="${palette.to}" />
        </linearGradient>
        <radialGradient id="core" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stop-color="${mixHex(glow, "#ffffff", 0.28)}" />
          <stop offset="100%" stop-color="${glow}" stop-opacity="0.12" />
        </radialGradient>
      </defs>
      <rect width="320" height="320" rx="34" fill="url(#bg)" />
      <circle cx="160" cy="140" r="118" fill="url(#core)" />
      <circle cx="160" cy="140" r="88" fill="none" stroke="${mixHex(glow, "#ffffff", 0.24)}" stroke-width="2.5" opacity="0.9" />
      <circle cx="160" cy="140" r="58" fill="none" stroke="${glow}" stroke-width="6" opacity="0.72" />
      <circle cx="160" cy="140" r="20" fill="${mixHex(glow, "#ffffff", 0.36)}" />
      <path d="M95 198h130" stroke="${glow}" stroke-width="8" stroke-linecap="round" opacity="0.84" />
      <path d="M118 220h84" stroke="${mixHex(glow, "#ffffff", 0.36)}" stroke-width="3" stroke-linecap="round" opacity="0.74" />
      <path d="M88 112h144M112 88h96M112 258h96" stroke="${mixHex(glow, "#ffffff", 0.18)}" stroke-width="2" stroke-linecap="round" opacity="0.64" />
      <text x="160" y="274" text-anchor="middle" font-family="Share Tech Mono, monospace" font-size="26" fill="${mixHex(glow, "#ffffff", 0.3)}" letter-spacing="5">${escapeText(label)}</text>
    </svg>
  `;
  return {
    kind: "system",
    src: encodeSvg(svg),
    alt: title || label
  };
}

function getHumanPortrait({
  label,
  title,
  theme = "clean",
  accent,
  skin = "#c89b7b",
  hair = "#253045",
  suit = "#18263c",
  visor = false,
  hairStyle = "crest",
  faceScale = 1,
  eyeLift = 0,
  cheekSoftness = 0
}) {
  const palette = getThemePalette(theme);
  const glow = accent || palette.accent;
  const rx = clamp(56 + cheekSoftness, 50, 64);
  const ry = clamp(70 + faceScale * 2, 64, 76);
  const faceY = clamp(132 - faceScale * 4, 126, 136);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="${escapeText(title || label)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.from}" />
          <stop offset="100%" stop-color="${palette.to}" />
        </linearGradient>
        <linearGradient id="visor" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${mixHex(glow, "#06111b", 0.2)}" />
          <stop offset="100%" stop-color="${mixHex(glow, "#ffffff", 0.22)}" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="34" fill="url(#bg)" />
      <circle cx="160" cy="120" r="96" fill="${mixHex(glow, "#ffffff", 0.08)}" opacity="0.28" />
      <path d="M48 320c14-68 60-106 114-106 64 0 108 38 110 106z" fill="${suit}" />
      <path d="M84 320c18-37 48-58 80-58 35 0 68 18 100 58z" fill="${mixHex(glow, suit, 0.24)}" opacity="0.58" />
      <rect x="132" y="184" width="56" height="48" rx="20" fill="${skin}" />
      <ellipse cx="160" cy="${faceY}" rx="${rx}" ry="${ry}" fill="${skin}" />
      ${getHairSvg(hairStyle, hair, glow)}
      <path d="M108 118c11-9 24-14 38-14 15 0 26 3 36 12 10-8 21-12 36-12 13 0 25 4 35 13" stroke="${mixHex(hair, "#000000", 0.18)}" stroke-width="5" stroke-linecap="round" opacity="0.55" />
      ${
        visor
          ? `<rect x="96" y="118" width="128" height="30" rx="15" fill="url(#visor)" stroke="${mixHex(glow, "#ffffff", 0.18)}" stroke-width="2" opacity="0.96" />
             <path d="M108 132h104" stroke="${mixHex(glow, "#ffffff", 0.32)}" stroke-width="2" stroke-linecap="round" opacity="0.9" />`
          : ""
      }
      <path d="M116 ${133 + eyeLift}c8-5 16-8 25-8 9 0 17 2 25 8" stroke="${mixHex(hair, "#000000", 0.16)}" stroke-width="5" stroke-linecap="round" opacity="0.82" />
      <path d="M179 ${133 + eyeLift}c8-5 16-8 25-8 9 0 17 2 25 8" stroke="${mixHex(hair, "#000000", 0.16)}" stroke-width="5" stroke-linecap="round" opacity="0.82" />
      <ellipse cx="136" cy="${144 + eyeLift}" rx="9" ry="6" fill="#152034" />
      <ellipse cx="184" cy="${144 + eyeLift}" rx="9" ry="6" fill="#152034" />
      <circle cx="139" cy="${143 + eyeLift}" r="2.6" fill="${glow}" />
      <circle cx="187" cy="${143 + eyeLift}" r="2.6" fill="${glow}" />
      <path d="M160 146v22" stroke="${mixHex(skin, "#3b2417", 0.42)}" stroke-width="3" stroke-linecap="round" opacity="0.48" />
      <path d="M135 183c8 9 17 13 25 13 8 0 16-4 24-13" stroke="${mixHex(glow, "#f3d8cf", 0.18)}" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.82" />
      <path d="M114 246c13 8 29 12 46 12 19 0 35-5 50-14" stroke="${glow}" stroke-width="5" stroke-linecap="round" opacity="0.6" />
      <text x="160" y="284" text-anchor="middle" font-family="Share Tech Mono, monospace" font-size="22" fill="${mixHex(glow, "#ffffff", 0.32)}" letter-spacing="4">${escapeText(label)}</text>
    </svg>
  `;
  return {
    kind: "portrait",
    src: encodeSvg(svg),
    alt: title || label
  };
}

function getSpeakerPreset(speaker = "", theme = "clean") {
  const key = speaker.toLowerCase();

  if (key.includes("cadu")) {
    return { type: "human", label: "CADU", title: "Cadu", theme, accent: "#9cd0ff", hair: "#1e2533", suit: "#152033", visor: true };
  }
  if (key.includes("mila")) {
    return { type: "human", label: "MILA", title: "Mila", theme, accent: "#7effc7", hair: "#d3d9ef", suit: "#19263b", hairStyle: "wave" };
  }
  if (key.includes("kael")) {
    return { type: "human", label: "KAEL", title: "Kael", theme, accent: "#f6d78d", hair: "#e4e7ef", suit: "#2b2235", visor: true, cheekSoftness: -3 };
  }
  if (key.includes("zion")) {
    return { type: "system", label: "ZION", title: "Nucleo Zion", theme: "cyber", accent: "#84e7ff" };
  }
  if (key.includes("scanner bio")) {
    return { type: "system", label: "BIO", title: "Scanner Bio", theme: "clean", accent: "#8fff9f" };
  }
  if (key.includes("mentor")) {
    return { type: "human", label: "MENT", title: "Mentor de Campo", theme: "distopic", accent: "#ffb380", hair: "#23293b", suit: "#1c1624", visor: true };
  }
  if (key.includes("alerta")) {
    return { type: "system", label: "ALRT", title: "Alerta de Pane", theme: "glitch", accent: "#ff7ea8" };
  }
  if (key.includes("console de corrida")) {
    return { type: "system", label: "RUN", title: "Console de Corrida", theme: "cyber", accent: "#ffd36d" };
  }
  if (key.includes("console de avatar")) {
    return { type: "system", label: "AVA", title: "Console de Avatar", theme: "cyber", accent: "#8ce3ff" };
  }
  if (key.includes("sistema") || key.includes("g.e.t.") || key.includes("diretoria")) {
    return { type: "system", label: "NEXO", title: speaker, theme, accent: getThemePalette(theme).accent };
  }

  return null;
}

export function getProfileAvatar(profile = {}, options = {}) {
  const theme = options.theme || "clean";
  const accent = getProfileAccent(profile, theme);
  const hair = PROFILE_HAIR[profile.hair] || "#8ab6ff";
  const portrait = getHumanPortrait({
    label: "YOU",
    title: "Avatar do protagonista",
    theme,
    accent,
    hair,
    suit: mixHex("#132235", accent, 0.16),
    visor: Boolean(profile.profession || profile.power),
    hairStyle: getHairStyle(profile),
    faceScale: profile.age === "child" ? 0.76 : 1,
    cheekSoftness: profile.age === "child" ? 4 : 0,
    eyeLift: profile.age === "child" ? -2 : 0
  });

  return {
    ...portrait,
    caption: getProfileLabel(profile),
    ready: Boolean(profile.gender || profile.age || profile.hair || profile.profession || profile.power)
  };
}

export function getScenePortrait({ scene, sceneId, profile }) {
  if (!scene || scene.mode === "runner") {
    return null;
  }

  if (
    sceneId === "avatar_gender" ||
    sceneId === "avatar_age" ||
    sceneId === "avatar_hair" ||
    sceneId === "power_pick" ||
    sceneId === "profession_pick" ||
    sceneId === "briefing_2050"
  ) {
    return getProfileAvatar(profile, { theme: scene.theme });
  }

  const preset = getSpeakerPreset(scene.speaker || "", scene.theme);
  if (!preset) {
    return profile && (profile.gender || profile.age || profile.hair)
      ? getProfileAvatar(profile, { theme: scene.theme })
      : null;
  }

  return preset.type === "system" ? getSystemPortrait(preset) : getHumanPortrait(preset);
}
