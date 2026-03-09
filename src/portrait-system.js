const THEME_BACKGROUNDS = {
  clean: { from: "#14343b", to: "#061217", accent: "#74f2df", shadow: "#041015" },
  cyber: { from: "#24204f", to: "#090d1e", accent: "#90dcff", shadow: "#090c17" },
  distopic: { from: "#391f2c", to: "#130d16", accent: "#ffab83", shadow: "#0d0810" },
  glitch: { from: "#122238", to: "#070912", accent: "#93f7ff", shadow: "#05080f" }
};

const PROFILE_HAIR = {
  black: { base: "#20242b", glow: "#7ba8ff" },
  brown: { base: "#4a332b", glow: "#ffbf8f" },
  copper: { base: "#8b4e32", glow: "#ffd0ae" },
  blonde: { base: "#b89558", glow: "#fff0b8" }
};

const PROFILE_SKIN = {
  light: { base: "#f0d2bf", light: "#f9e4d5", shadow: "#c89c84" },
  tan: { base: "#d9ab87", light: "#edc29f", shadow: "#a47253" },
  brown: { base: "#9c6d4f", light: "#b88767", shadow: "#6d4732" },
  deep: { base: "#6d4736", light: "#8a5f4a", shadow: "#42271d" }
};

const POWER_ACCENT = {
  calc: "#76d7ff",
  empathy: "#86f0d3",
  animal: "#86f3a8",
  trees: "#c8ff7d"
};

const PROFESSION_ACCENT = {
  smart_architect: "#ffcc7a",
  ai_engineer: "#90e5ff",
  robo_coach: "#ff9c8a",
  food_3d: "#ffb77f",
  space_driver: "#ffe36f",
  game_designer: "#ff9bdb",
  holo_actor: "#d7a5ff",
  green_manager: "#a5ff86"
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

function encodeSvg(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
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

function getProfileLabel(profile) {
  const parts = [];
  if (profile.gender === "masc") parts.push("Avatar masculino");
  if (profile.gender === "fem") parts.push("Avatar feminino");
  if (profile.age === "child") parts.push("Crianca");
  if (profile.age === "teen") parts.push("Adolescente");
  if (profile.skinTone === "light") parts.push("Pele clara");
  if (profile.skinTone === "tan") parts.push("Pele dourada");
  if (profile.skinTone === "brown") parts.push("Pele morena");
  if (profile.skinTone === "deep") parts.push("Pele escura");
  if (profile.hairLength === "short") parts.push("Cabelo curto");
  if (profile.hairLength === "medium") parts.push("Cabelo medio");
  if (profile.hairLength === "long") parts.push("Cabelo comprido");
  if (profile.hair === "black") parts.push("Preto");
  if (profile.hair === "brown") parts.push("Castanho");
  if (profile.hair === "copper") parts.push("Ruivo");
  if (profile.hair === "blonde") parts.push("Loiro");
  return parts.length ? parts.join(" | ") : "Avatar em formacao";
}

function getProfileAccent(profile, theme) {
  return (
    PROFESSION_ACCENT[profile.profession] ||
    POWER_ACCENT[profile.power] ||
    getThemePalette(theme).accent
  );
}

function getHumanHairStyle(profile) {
  const length = profile.hairLength || "medium";
  const gender = profile.gender || "masc";

  if (length === "long") {
    return gender === "fem" ? "long-wave" : "long-back";
  }
  if (length === "short") {
    return gender === "fem" ? "short-soft" : "short-swept";
  }
  return gender === "fem" ? "medium-bob" : "medium-crest";
}

function getHairPaths(style, colors, accent) {
  const soft = mixHex(colors.base, "#ffffff", 0.14);
  const deep = mixHex(colors.base, "#000000", 0.18);

  switch (style) {
    case "long-wave":
      return `
        <path d="M61 126c8-52 46-87 101-87 60 0 98 29 113 83-18-20-39-30-62-30-21 0-42 7-61 20-20-14-42-18-65-11-11 3-20 8-26 25z" fill="${colors.base}" />
        <path d="M65 130c-5 47 0 92 20 131 12 24 33 43 54 55-15-40-22-89-18-150l-56-36z" fill="${deep}" opacity="0.72" />
        <path d="M255 130c6 49 0 97-19 135-12 24-34 43-56 51 15-40 22-90 18-149l57-37z" fill="${deep}" opacity="0.72" />
        <path d="M105 64c26-20 72-23 108 6" stroke="${accent}" stroke-width="6" stroke-linecap="round" opacity="0.42" />
        <path d="M93 96c31-16 76-15 113 5" stroke="${soft}" stroke-width="11" stroke-linecap="round" opacity="0.24" />
      `;
    case "long-back":
      return `
        <path d="M66 126c9-55 46-88 99-88 62 0 102 29 112 86-16-17-35-26-58-28-23-2-46 4-66 18-18-11-35-15-52-11-15 4-26 11-35 23z" fill="${colors.base}" />
        <path d="M81 126c-6 44 1 92 17 127 11 25 28 42 45 53-10-41-9-92 4-153l-66-27z" fill="${deep}" opacity="0.64" />
        <path d="M246 124c6 44-1 92-17 127-11 25-29 42-45 53 10-41 9-92-4-153l66-27z" fill="${deep}" opacity="0.64" />
        <path d="M101 69c28-15 66-17 105 8" stroke="${soft}" stroke-width="10" stroke-linecap="round" opacity="0.28" />
      `;
    case "short-soft":
      return `
        <path d="M82 125c12-47 46-74 91-74 53 0 88 28 93 76-15-11-32-17-50-17-17 0-33 5-47 14-14-9-29-13-45-12-15 0-28 5-42 13z" fill="${colors.base}" />
        <path d="M104 65c28-17 66-18 101 4" stroke="${soft}" stroke-width="10" stroke-linecap="round" opacity="0.28" />
      `;
    case "short-swept":
      return `
        <path d="M76 124c12-48 48-76 95-76 55 0 91 28 96 78-17-12-36-18-57-19-20 0-38 5-54 16-16-11-33-15-52-13-11 1-20 5-28 14z" fill="${colors.base}" />
        <path d="M116 57c18-9 39-12 61-8 15 3 28 9 42 22-18-2-34-1-51 5-15-10-31-15-52-19z" fill="${soft}" opacity="0.52" />
      `;
    case "medium-bob":
      return `
        <path d="M76 125c9-51 43-81 94-81 60 0 98 32 103 83-18-14-38-21-59-21-19 0-36 6-51 17-17-11-35-16-54-15-12 0-23 4-33 17z" fill="${colors.base}" />
        <path d="M73 128c-5 38 2 76 18 105 11 20 29 33 45 40-12-34-16-74-10-122l-53-23z" fill="${deep}" opacity="0.58" />
        <path d="M247 128c5 38-2 76-18 105-11 20-29 33-45 40 12-34 16-74 10-122l53-23z" fill="${deep}" opacity="0.58" />
        <path d="M108 67c26-18 65-18 103 4" stroke="${soft}" stroke-width="10" stroke-linecap="round" opacity="0.26" />
      `;
    default:
      return `
        <path d="M77 125c10-49 45-79 95-79 58 0 95 30 100 81-18-13-37-19-57-19-19 0-36 5-52 15-15-10-33-14-52-13-12 1-23 5-34 15z" fill="${colors.base}" />
        <path d="M121 59c19-10 41-13 62-9 14 3 28 10 41 22-17-2-34-1-51 6-16-10-32-15-52-19z" fill="${soft}" opacity="0.48" />
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
        <radialGradient id="core" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stop-color="${mixHex(glow, "#ffffff", 0.32)}" />
          <stop offset="100%" stop-color="${glow}" stop-opacity="0.12" />
        </radialGradient>
      </defs>
      <rect width="320" height="320" rx="28" fill="url(#bg)" />
      <rect x="24" y="24" width="272" height="272" rx="22" fill="${mixHex(palette.shadow, "#0d2430", 0.25)}" opacity="0.9" />
      <circle cx="160" cy="146" r="92" fill="url(#core)" />
      <circle cx="160" cy="146" r="62" fill="none" stroke="${mixHex(glow, "#ffffff", 0.2)}" stroke-width="5" opacity="0.85" />
      <circle cx="160" cy="146" r="30" fill="none" stroke="${glow}" stroke-width="10" opacity="0.7" />
      <circle cx="160" cy="146" r="12" fill="${mixHex(glow, "#ffffff", 0.38)}" />
      <path d="M95 215h130" stroke="${glow}" stroke-width="8" stroke-linecap="round" opacity="0.82" />
      <path d="M112 94h96M105 118h110M112 241h96" stroke="${mixHex(glow, "#ffffff", 0.2)}" stroke-width="3" stroke-linecap="round" opacity="0.62" />
    </svg>
  `;
  return {
    kind: "system",
    src: encodeSvg(svg),
    alt: title || label
  };
}

function getHumanPortrait({
  theme = "clean",
  accent,
  title,
  skin = PROFILE_SKIN.tan,
  hair = PROFILE_HAIR.black,
  hairStyle = "medium-crest",
  suit = "#172638",
  eyeColor = "#20364d",
  age = "teen",
  gender = "masc",
  visor = false
}) {
  const palette = getThemePalette(theme);
  const glow = accent || palette.accent;
  const shoulder = mixHex(suit, glow, 0.14);
  const jawY = age === "child" ? 210 : 204;
  const faceScale = age === "child" ? 0.94 : 1;
  const faceWidth = gender === "fem" ? 59 * faceScale : 62 * faceScale;
  const faceHeight = age === "child" ? 73 : 78;
  const eyeY = age === "child" ? 142 : 146;
  const mouthY = age === "child" ? 187 : 191;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="${escapeText(title || "Retrato")}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.from}" />
          <stop offset="100%" stop-color="${palette.to}" />
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="28%" r="74%">
          <stop offset="0%" stop-color="${mixHex(glow, "#ffffff", 0.2)}" stop-opacity="0.72" />
          <stop offset="100%" stop-color="${glow}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="skin" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="${skin.light}" />
          <stop offset="55%" stop-color="${skin.base}" />
          <stop offset="100%" stop-color="${skin.shadow}" />
        </linearGradient>
        <linearGradient id="suit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${shoulder}" />
          <stop offset="100%" stop-color="${suit}" />
        </linearGradient>
        <linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${mixHex(hair.base, "#ffffff", 0.1)}" />
          <stop offset="100%" stop-color="${hair.base}" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="28" fill="url(#bg)" />
      <circle cx="160" cy="112" r="110" fill="url(#halo)" opacity="0.75" />
      <path d="M44 320c16-58 55-101 116-101 66 0 104 42 116 101z" fill="url(#suit)" />
      <path d="M92 320c17-31 39-48 68-48 32 0 58 15 78 48z" fill="${mixHex(glow, suit, 0.22)}" opacity="0.62" />
      <path d="M133 190h54v42h-54z" fill="url(#skin)" />
      <ellipse cx="160" cy="154" rx="${faceWidth}" ry="${faceHeight}" fill="url(#skin)" />
      <ellipse cx="104" cy="154" rx="9" ry="18" fill="${skin.shadow}" opacity="0.9" />
      <ellipse cx="216" cy="154" rx="9" ry="18" fill="${skin.shadow}" opacity="0.9" />
      ${getHairPaths(hairStyle, hair, glow).replaceAll(`fill="${hair.base}"`, 'fill="url(#hair)"')}
      <path d="M101 ${jawY}c12 16 33 26 59 26 26 0 47-10 59-26" fill="${skin.shadow}" opacity="0.18" />
      <ellipse cx="138" cy="${eyeY}" rx="14" ry="8" fill="#ffffff" opacity="0.96" />
      <ellipse cx="182" cy="${eyeY}" rx="14" ry="8" fill="#ffffff" opacity="0.96" />
      <ellipse cx="138" cy="${eyeY}" rx="7.5" ry="7" fill="${eyeColor}" />
      <ellipse cx="182" cy="${eyeY}" rx="7.5" ry="7" fill="${eyeColor}" />
      <circle cx="140" cy="${eyeY - 1}" r="3" fill="${glow}" opacity="0.82" />
      <circle cx="184" cy="${eyeY - 1}" r="3" fill="${glow}" opacity="0.82" />
      <path d="M121 ${eyeY - 18}c9-7 20-10 33-9" stroke="${mixHex(hair.base, "#000000", 0.16)}" stroke-width="5" stroke-linecap="round" opacity="0.85" />
      <path d="M170 ${eyeY - 18}c11-2 23 1 33 9" stroke="${mixHex(hair.base, "#000000", 0.16)}" stroke-width="5" stroke-linecap="round" opacity="0.85" />
      ${
        visor
          ? `<rect x="98" y="${eyeY - 16}" width="124" height="34" rx="17" fill="${mixHex(glow, "#07121d", 0.18)}" stroke="${mixHex(glow, "#ffffff", 0.22)}" stroke-width="2" opacity="0.84" />
             <path d="M111 ${eyeY + 1}h98" stroke="${mixHex(glow, "#ffffff", 0.28)}" stroke-width="2" stroke-linecap="round" opacity="0.8" />`
          : ""
      }
      <path d="M160 ${eyeY + 1}v26" stroke="${skin.shadow}" stroke-width="3.5" stroke-linecap="round" opacity="0.42" />
      <path d="M147 180c4 3 9 4 13 4 5 0 10-1 14-4" stroke="${mixHex(skin.shadow, "#8a4a56", 0.28)}" stroke-width="3" stroke-linecap="round" opacity="0.55" />
      <path d="M136 ${mouthY}c8 8 16 12 24 12 9 0 17-4 24-12" stroke="${mixHex("#c27b75", glow, 0.12)}" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.92" />
      <ellipse cx="118" cy="171" rx="12" ry="6" fill="${skin.light}" opacity="0.18" />
      <ellipse cx="202" cy="171" rx="12" ry="6" fill="${skin.light}" opacity="0.18" />
      <path d="M95 247c19 12 41 18 65 18 26 0 49-7 68-20" stroke="${glow}" stroke-width="5.5" stroke-linecap="round" opacity="0.56" />
    </svg>
  `;

  return {
    kind: "portrait",
    src: encodeSvg(svg),
    alt: title || "Retrato"
  };
}

function getSpeakerPreset(speaker = "", theme = "clean") {
  const key = speaker.toLowerCase();

  if (key.includes("cadu")) {
    return {
      type: "human",
      title: "Cadu",
      theme,
      accent: "#8fd6ff",
      hair: PROFILE_HAIR.black,
      skin: PROFILE_SKIN.tan,
      hairStyle: "short-swept",
      suit: "#172535",
      visor: true
    };
  }

  if (key.includes("mila")) {
    return {
      type: "human",
      title: "Mila",
      theme,
      accent: "#8ef2d1",
      hair: PROFILE_HAIR.blonde,
      skin: PROFILE_SKIN.light,
      hairStyle: "long-wave",
      suit: "#182738"
    };
  }

  if (key.includes("kael")) {
    return {
      type: "human",
      title: "Kael",
      theme,
      accent: "#ffd695",
      hair: PROFILE_HAIR.black,
      skin: PROFILE_SKIN.deep,
      hairStyle: "medium-crest",
      suit: "#241d2f",
      visor: true
    };
  }

  if (key.includes("mentor")) {
    return {
      type: "human",
      title: "Mentor de Campo",
      theme: "distopic",
      accent: "#ffb689",
      hair: PROFILE_HAIR.brown,
      skin: PROFILE_SKIN.tan,
      hairStyle: "medium-crest",
      suit: "#1c1623",
      visor: true
    };
  }

  if (key.includes("zion")) {
    return { type: "system", label: "ZION", title: "Nucleo Zion", theme: "cyber", accent: "#84e7ff" };
  }
  if (key.includes("scanner bio")) {
    return { type: "system", label: "BIO", title: "Scanner Bio", theme: "clean", accent: "#8fff9f" };
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
  const hair = PROFILE_HAIR[profile.hair] || PROFILE_HAIR.black;
  const skin = PROFILE_SKIN[profile.skinTone] || PROFILE_SKIN.tan;

  const portrait = getHumanPortrait({
    title: "Avatar do protagonista",
    theme,
    accent,
    hair,
    skin,
    hairStyle: getHumanHairStyle(profile),
    suit: mixHex("#1b3146", accent, 0.22),
    eyeColor: mixHex("#20364d", accent, 0.18),
    visor: false,
    gender: profile.gender || "masc",
    age: profile.age || "teen"
  });

  return {
    ...portrait,
    caption: getProfileLabel(profile),
    ready: Boolean(
      profile.gender || profile.age || profile.hair || profile.skinTone || profile.hairLength || profile.profession
    )
  };
}

export function getScenePortrait({ scene, sceneId, profile }) {
  if (!scene || scene.mode === "runner") {
    return null;
  }

  if (
    sceneId === "avatar_gender" ||
    sceneId === "avatar_age" ||
    sceneId === "avatar_skin" ||
    sceneId === "avatar_hair_style" ||
    sceneId === "avatar_hair" ||
    sceneId === "power_pick" ||
    sceneId === "profession_pick" ||
    sceneId === "briefing_2050"
  ) {
    return getProfileAvatar(profile, { theme: scene.theme });
  }

  const preset = getSpeakerPreset(scene.speaker || "", scene.theme);
  if (!preset) {
    return profile && (profile.gender || profile.age || profile.hair || profile.skinTone)
      ? getProfileAvatar(profile, { theme: scene.theme })
      : null;
  }

  return preset.type === "system" ? getSystemPortrait(preset) : getHumanPortrait(preset);
}
