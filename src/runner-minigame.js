function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hueToRgb(hue, saturation = 82, lightness = 58) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hue >= 0 && hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toByte = (v) => Math.round((v + m) * 255);
  return [toByte(r), toByte(g), toByte(b)];
}

function rgba(rgb, alpha = 1) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

const THEME_PALETTES = {
  clean: {
    skyTop: "#1f4f5a",
    skyBottom: "#07131a",
    road: "#0d1720",
    lane: "#8ef0df",
    laneSoft: "#c1fbf1",
    obstacle: "#ffbb73",
    drone: "#ffe28b",
    building: "#2f5a65",
    accent: "#78f2e0"
  },
  cyber: {
    skyTop: "#23295a",
    skyBottom: "#080d18",
    road: "#0a1221",
    lane: "#73dfff",
    laneSoft: "#adc4ff",
    obstacle: "#ff759a",
    drone: "#ffcc7d",
    building: "#313a6f",
    accent: "#8fdfff"
  },
  distopic: {
    skyTop: "#442834",
    skyBottom: "#120c15",
    road: "#170f17",
    lane: "#ffb18a",
    laneSoft: "#ffd0bd",
    obstacle: "#ff7d7d",
    drone: "#ffd38a",
    building: "#523946",
    accent: "#ffb690"
  },
  glitch: {
    skyTop: "#19263d",
    skyBottom: "#070912",
    road: "#0c1020",
    lane: "#95ff73",
    laneSoft: "#8ee8ff",
    obstacle: "#ff69c2",
    drone: "#ffe07f",
    building: "#334163",
    accent: "#8ff7ff"
  }
};

const RUNNER_SKIN = {
  light: "#f0d2bf",
  tan: "#d9ab87",
  brown: "#9c6d4f",
  deep: "#6d4736"
};

const RUNNER_HAIR = {
  black: "#20242b",
  brown: "#51372f",
  copper: "#985639",
  blonde: "#c1a16a"
};

function rgb(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function buildAvatarStyle(profile = {}, hue = 205) {
  const accentRgb = hueToRgb(hue, 84, 62);
  const suitRgb = hueToRgb(hue, 62, 38);
  const suitDeepRgb = hueToRgb(hue, 54, 23);

  return {
    skin: RUNNER_SKIN[profile.skinTone] || RUNNER_SKIN.tan,
    hair: RUNNER_HAIR[profile.hair] || RUNNER_HAIR.black,
    hairLength: profile.hairLength || "medium",
    accent: rgb(accentRgb),
    accentSoft: rgba(accentRgb, 0.24),
    suit: rgb(suitRgb),
    suitDeep: rgb(suitDeepRgb),
    visor: false
  };
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawHair(ctx, style, x, y, radius) {
  ctx.fillStyle = style.hair;
  ctx.beginPath();

  if (style.hairLength === "long") {
    ctx.moveTo(x - radius - 5, y + 5);
    ctx.quadraticCurveTo(x, y - radius - 10, x + radius + 5, y + 5);
    ctx.quadraticCurveTo(x + radius + 12, y + radius + 16, x + 10, y + radius + 28);
    ctx.lineTo(x - 10, y + radius + 28);
    ctx.quadraticCurveTo(x - radius - 12, y + radius + 14, x - radius - 5, y + 5);
  } else if (style.hairLength === "short") {
    ctx.moveTo(x - radius - 2, y + 2);
    ctx.quadraticCurveTo(x - 6, y - radius - 10, x + radius - 2, y);
    ctx.quadraticCurveTo(x + radius + 5, y + 4, x + radius - 4, y + 14);
    ctx.lineTo(x - radius + 4, y + 14);
    ctx.quadraticCurveTo(x - radius - 4, y + 9, x - radius - 2, y + 2);
  } else {
    ctx.moveTo(x - radius - 4, y + 4);
    ctx.quadraticCurveTo(x, y - radius - 11, x + radius + 4, y + 4);
    ctx.quadraticCurveTo(x + radius + 9, y + radius + 10, x + 8, y + radius + 18);
    ctx.lineTo(x - 8, y + radius + 18);
    ctx.quadraticCurveTo(x - radius - 9, y + radius + 10, x - radius - 4, y + 4);
  }

  ctx.closePath();
  ctx.fill();
}

export class RunnerMiniGame {
  constructor(options) {
    this.options = {
      durationSec: 24,
      avatarHue: 205,
      theme: "cyber",
      onFinish: null,
      ...options
    };

    this.palette = THEME_PALETTES[this.options.theme] || THEME_PALETTES.cyber;
    this.avatarStyle = buildAvatarStyle(this.options.avatarProfile, this.options.avatarHue);
    this.canvas = null;
    this.ctx = null;
    this.host = null;
    this.running = false;
    this.completed = false;
    this.frameId = null;
    this.lastFrame = 0;
    this.cleanupFns = [];

    this.world = {
      width: 1000,
      height: 450,
      groundY: 350
    };

    this.state = {
      score: 0,
      energy: 0,
      hits: 0,
      remainingSec: this.options.durationSec,
      startedAt: 0,
      invulnUntil: 0,
      flash: 0
    };

    this.control = {
      left: false,
      right: false,
      jumpQueued: false
    };

    this.player = {
      x: 170,
      y: 0,
      width: 60,
      height: 96,
      vy: 0,
      angle: 0
    };

    this.obstacles = [];
    this.collectibles = [];
    this.skyline = [];
    this.bands = [];
    this.lanes = [];
    this.particles = [];
    this.spawnObstacleAt = 0;
    this.spawnCollectibleAt = 0;
  }

  start() {
    if (this.running) {
      return;
    }

    this.host = this.options.canvas;
    if (!this.host) {
      this.complete({ score: 0, energy: 0, hits: 0, batteryDelta: -8 });
      return;
    }

    this.host.innerHTML = "";
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.world.width;
    this.canvas.height = this.world.height;
    this.canvas.setAttribute("aria-hidden", "true");
    this.host.append(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    if (!this.ctx) {
      this.startFallback();
      return;
    }

    this.setupScene();
    this.setupControls();

    this.running = true;
    this.lastFrame = performance.now();
    this.state.startedAt = this.lastFrame;
    this.state.remainingSec = this.options.durationSec;
    this.updateHud();
    this.frameId = window.requestAnimationFrame((ts) => this.loop(ts));
  }

  emitEvent(name, payload) {
    if (typeof this.options.onEvent === "function") {
      this.options.onEvent(name, payload);
    }
  }

  stop() {
    this.teardown({ notify: false });
  }

  startFallback() {
    const host = this.options.canvas;
    host.innerHTML = "";

    const fallback = document.createElement("div");
    fallback.style.width = "100%";
    fallback.style.height = "100%";
    fallback.style.display = "grid";
    fallback.style.placeItems = "center";
    fallback.style.fontFamily = "Share Tech Mono, monospace";
    fallback.style.fontSize = "0.92rem";
    fallback.style.color = "#d7f4ff";
    fallback.textContent = "Mini game em modo simples.";
    host.append(fallback);

    this.running = true;
    this.setupControls();
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      this.state.remainingSec = Math.max(this.options.durationSec - elapsed, 0);
      this.state.score += 35;
      this.updateHud();
      if (this.state.remainingSec <= 0) {
        window.clearInterval(timer);
        this.complete(this.buildResult());
      }
    }, 1000);

    this.cleanupFns.push(() => window.clearInterval(timer));
  }

  setupScene() {
    this.player.y = this.world.groundY - this.player.height;
    this.obstacles = [];
    this.collectibles = [];
    this.skyline = Array.from({ length: 18 }, (_, index) => ({
      x: index * 64,
      width: 44 + Math.random() * 48,
      height: 90 + Math.random() * 120,
      y: 195 + Math.random() * 55,
      alpha: 0.22 + Math.random() * 0.24
    }));
    this.bands = Array.from({ length: 5 }, (_, index) => ({
      y: 62 + index * 34,
      alpha: 0.04 + index * 0.028
    }));
    this.lanes = Array.from({ length: 18 }, (_, index) => ({
      x: index * 72,
      width: 30
    }));
    this.particles = Array.from({ length: 44 }, () => ({
      x: Math.random() * this.world.width,
      y: Math.random() * this.world.height,
      vy: 160 + Math.random() * 220,
      vx: -50 - Math.random() * 70,
      size: 1 + Math.random() * 2,
      alpha: 0.18 + Math.random() * 0.18
    }));
    this.spawnObstacleAt = 0.8;
    this.spawnCollectibleAt = 0.6;
  }

  setupControls() {
    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        this.control.left = true;
      }
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        this.control.right = true;
      }
      if (
        event.key === "ArrowUp" ||
        event.key === "w" ||
        event.key === "W" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        this.control.jumpQueued = true;
      }
    };

    const onKeyUp = (event) => {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        this.control.left = false;
      }
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        this.control.right = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    this.cleanupFns.push(() => window.removeEventListener("keydown", onKeyDown));
    this.cleanupFns.push(() => window.removeEventListener("keyup", onKeyUp));

    this.bindHold(this.options.touchLeft, "left");
    this.bindHold(this.options.touchRight, "right");

    if (this.options.touchJump) {
      const onJump = (event) => {
        event.preventDefault();
        this.control.jumpQueued = true;
      };
      this.options.touchJump.addEventListener("pointerdown", onJump, { passive: false });
      this.cleanupFns.push(() => this.options.touchJump.removeEventListener("pointerdown", onJump));
    }
  }

  bindHold(button, key) {
    if (!button) {
      return;
    }

    const onDown = (event) => {
      event.preventDefault();
      this.control[key] = true;
    };
    const onUp = (event) => {
      event.preventDefault();
      this.control[key] = false;
    };

    button.addEventListener("pointerdown", onDown, { passive: false });
    button.addEventListener("pointerup", onUp, { passive: false });
    button.addEventListener("pointercancel", onUp, { passive: false });
    button.addEventListener("pointerleave", onUp, { passive: false });

    this.cleanupFns.push(() => {
      button.removeEventListener("pointerdown", onDown);
      button.removeEventListener("pointerup", onUp);
      button.removeEventListener("pointercancel", onUp);
      button.removeEventListener("pointerleave", onUp);
    });
  }

  loop(timestamp) {
    if (!this.running) {
      return;
    }

    const dt = clamp((timestamp - this.lastFrame) / 1000, 0.001, 0.032);
    this.lastFrame = timestamp;

    this.update(dt, timestamp);
    this.draw(timestamp);
    this.frameId = window.requestAnimationFrame((ts) => this.loop(ts));
  }

  update(dt, timestamp) {
    const elapsed = (timestamp - this.state.startedAt) / 1000;
    this.state.remainingSec = Math.max(0, Math.ceil(this.options.durationSec - elapsed));
    this.state.flash = Math.max(0, this.state.flash - dt * 2.6);
    this.updateHud();

    if (this.state.remainingSec <= 0) {
      this.complete(this.buildResult());
      return;
    }

    this.updatePlayer(dt);
    this.updateSkyline(dt, elapsed);
    this.updateLanes(dt);
    this.updateParticles(dt);
    this.spawnObstacleAt -= dt;
    this.spawnCollectibleAt -= dt;

    if (this.spawnObstacleAt <= 0) {
      this.spawnObstacle(elapsed);
      this.spawnObstacleAt = 0.72 + Math.random() * 0.4;
    }

    if (this.spawnCollectibleAt <= 0) {
      this.spawnCollectible(elapsed);
      this.spawnCollectibleAt = 0.55 + Math.random() * 0.65;
    }

    const speedFactor = 1 + Math.min(elapsed / 24, 1.2);
    const travel = (310 + speedFactor * 90) * dt;

    this.obstacles.forEach((obstacle) => {
      obstacle.x -= travel * obstacle.speedFactor;
    });
    this.collectibles.forEach((item) => {
      item.x -= travel * item.speedFactor;
      item.phase += dt * item.floatSpeed;
    });

    this.handleCollisions(timestamp);
    this.obstacles = this.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -80);
    this.collectibles = this.collectibles.filter((item) => item.x + item.size > -50 && !item.collected);

    this.state.score += dt * (38 + speedFactor * 9);
  }

  updatePlayer(dt) {
    const move = this.control.right && !this.control.left ? 1 : this.control.left && !this.control.right ? -1 : 0;
    this.player.x = clamp(this.player.x + move * 280 * dt, 72, this.world.width - 72);
    this.player.angle += (move * 0.18 - this.player.angle) * 0.18;
    this.player.vy += 1800 * dt;
    this.player.y += this.player.vy * dt;

    const groundTop = this.world.groundY - this.player.height;
    const onGround = this.player.y >= groundTop;
    if (onGround) {
      this.player.y = groundTop;
      this.player.vy = 0;
    }

    if (this.control.jumpQueued && onGround) {
      this.player.vy = -620;
      this.emitEvent("jump");
    }

    this.control.jumpQueued = false;
  }

  updateSkyline(dt, elapsed) {
    const speed = 22 + Math.min(elapsed * 1.8, 40);
    this.skyline.forEach((tower) => {
      tower.x -= speed * dt;
      if (tower.x + tower.width < -12) {
        tower.x = this.world.width + Math.random() * 90;
        tower.height = 90 + Math.random() * 120;
        tower.y = 195 + Math.random() * 55;
      }
    });
  }

  updateLanes(dt) {
    this.lanes.forEach((lane) => {
      lane.x -= 420 * dt;
      if (lane.x + lane.width < -20) {
        lane.x = this.world.width + Math.random() * 50;
      }
    });
  }

  updateParticles(dt) {
    this.particles.forEach((particle) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      if (particle.y > this.world.height + 10 || particle.x < -10) {
        particle.x = this.world.width + Math.random() * 40;
        particle.y = -10 - Math.random() * 30;
      }
    });
  }

  spawnObstacle(elapsed) {
    const drone = Math.random() < 0.28;
    const height = drone ? 22 : Math.random() < 0.45 ? 72 : 52;
    const width = drone ? 58 : 50;
    this.obstacles.push({
      kind: drone ? "drone" : "block",
      x: this.world.width + 60,
      y: drone ? this.world.groundY - 130 - Math.random() * 45 : this.world.groundY - height,
      width,
      height,
      speedFactor: 1 + Math.min(elapsed / 22, 1.1) + Math.random() * 0.2
    });
  }

  spawnCollectible(elapsed) {
    this.collectibles.push({
      x: this.world.width + 50,
      y: this.world.groundY - 120 - Math.random() * 130,
      size: 18 + Math.random() * 8,
      phase: Math.random() * Math.PI * 2,
      floatSpeed: 3 + Math.random() * 2,
      speedFactor: 0.9 + Math.min(elapsed / 28, 0.6),
      collected: false
    });
  }

  handleCollisions(timestamp) {
    const playerBox = {
      x: this.player.x - 20,
      y: this.player.y + 6,
      width: 40,
      height: this.player.height - 8
    };

    this.collectibles.forEach((item) => {
      const bobY = item.y + Math.sin(item.phase) * 10;
      if (
        !item.collected &&
        playerBox.x < item.x + item.size &&
        playerBox.x + playerBox.width > item.x - item.size &&
        playerBox.y < bobY + item.size &&
        playerBox.y + playerBox.height > bobY - item.size
      ) {
        item.collected = true;
        this.state.energy += 1;
        this.state.score += 150;
        this.state.flash = 0.45;
        this.emitEvent("collect");
      }
    });

    if (timestamp < this.state.invulnUntil) {
      return;
    }

    for (const obstacle of this.obstacles) {
      if (
        playerBox.x < obstacle.x + obstacle.width &&
        playerBox.x + playerBox.width > obstacle.x &&
        playerBox.y < obstacle.y + obstacle.height &&
        playerBox.y + playerBox.height > obstacle.y
      ) {
        this.state.invulnUntil = timestamp + 900;
        this.state.hits += 1;
        this.state.score = Math.max(0, this.state.score - 190);
        this.player.vy = -380;
        this.state.flash = 0.8;
        obstacle.x = -200;
        this.emitEvent("hit");
        break;
      }
    }
  }

  draw(timestamp) {
    if (!this.ctx) {
      return;
    }

    const { width, height, groundY } = this.world;
    const ctx = this.ctx;
    const auraRgb = hueToRgb(this.options.avatarHue || 205);
    const heroSoft = rgba(auraRgb, 0.28);

    ctx.clearRect(0, 0, width, height);

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, this.palette.skyTop);
    sky.addColorStop(1, this.palette.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const halo = ctx.createRadialGradient(width * 0.5, 60, 20, width * 0.5, 60, 260);
    halo.addColorStop(0, rgba(auraRgb, 0.12));
    halo.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);

    this.bands.forEach((band, index) => {
      ctx.fillStyle = rgba(auraRgb, band.alpha + Math.sin(timestamp * 0.001 + index) * 0.01);
      ctx.fillRect(0, band.y, width, 3);
    });

    this.skyline.forEach((tower) => {
      ctx.fillStyle = this.palette.building;
      ctx.globalAlpha = tower.alpha;
      ctx.fillRect(tower.x, tower.y, tower.width, tower.height);
      ctx.globalAlpha = tower.alpha * 0.6;
      ctx.fillStyle = this.palette.lane;
      ctx.fillRect(tower.x + 8, tower.y + 12, tower.width - 16, 5);
      ctx.fillRect(tower.x + 8, tower.y + 26, tower.width - 16, 3);
      ctx.globalAlpha = 1;
    });

    ctx.fillStyle = this.palette.road;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 8);
    ctx.lineTo(width, groundY + 8);
    ctx.lineTo(width + 40, height);
    ctx.lineTo(-40, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = rgba(auraRgb, 0.15);
    ctx.fillRect(0, groundY + 10, width, 8);

    this.lanes.forEach((lane) => {
      ctx.fillStyle = this.palette.lane;
      ctx.globalAlpha = 0.72;
      ctx.fillRect(lane.x, groundY + 32, lane.width, 7);
      ctx.globalAlpha = 1;
    });

    this.particles.forEach((particle) => {
      ctx.fillStyle = `rgba(220, 245, 255, ${particle.alpha})`;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size * 6);
    });

    this.collectibles.forEach((item) => {
      const bobY = item.y + Math.sin(item.phase) * 10;
      const glow = ctx.createRadialGradient(item.x, bobY, 2, item.x, bobY, item.size * 1.6);
      glow.addColorStop(0, this.palette.laneSoft);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(item.x, bobY, item.size * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = this.palette.lane;
      ctx.beginPath();
      ctx.arc(item.x, bobY, item.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(item.x - item.size * 0.25, bobY - item.size * 0.25, item.size * 0.28, 0, Math.PI * 2);
      ctx.fill();
    });

    this.obstacles.forEach((obstacle) => {
      if (obstacle.kind === "drone") {
        ctx.fillStyle = this.palette.drone;
        ctx.fillRect(obstacle.x, obstacle.y + 6, obstacle.width, obstacle.height - 6);
        ctx.fillStyle = "rgba(20, 30, 50, 0.7)";
        ctx.fillRect(obstacle.x + 8, obstacle.y + 10, obstacle.width - 16, obstacle.height - 12);
      } else {
        ctx.fillStyle = this.palette.obstacle;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = "rgba(35, 20, 32, 0.45)";
        ctx.fillRect(obstacle.x + 7, obstacle.y + 8, obstacle.width - 14, obstacle.height - 14);
      }
    });

    const playerX = this.player.x;
    const playerY = this.player.y;
    const style = this.avatarStyle;
    const grounded = this.player.y >= this.world.groundY - this.player.height - 1;
    const stride = grounded ? Math.sin(timestamp * 0.018) : Math.sin(timestamp * 0.008) * 0.22;
    const armSwing = stride * 16;
    const legSwing = stride * 18;
    const headX = playerX;
    const headY = playerY + 20;
    const hipY = playerY + 72;
    const shoulderY = playerY + 40;

    ctx.save();
    ctx.translate(playerX, playerY + this.player.height * 0.5);
    ctx.rotate(this.player.angle);
    ctx.translate(-playerX, -(playerY + this.player.height * 0.5));

    ctx.fillStyle = heroSoft;
    ctx.beginPath();
    ctx.ellipse(playerX, playerY + this.player.height - 6, 34, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = style.suitDeep;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(playerX - 6, hipY);
    ctx.lineTo(playerX - 12 + legSwing, playerY + 97);
    ctx.moveTo(playerX + 6, hipY);
    ctx.lineTo(playerX + 12 - legSwing, playerY + 97);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(playerX - 14, shoulderY);
    ctx.lineTo(playerX - 24 - armSwing, playerY + 62);
    ctx.moveTo(playerX + 14, shoulderY);
    ctx.lineTo(playerX + 24 + armSwing, playerY + 62);
    ctx.stroke();

    ctx.fillStyle = style.skin;
    ctx.beginPath();
    ctx.arc(playerX - 24 - armSwing, playerY + 62, 4.5, 0, Math.PI * 2);
    ctx.arc(playerX + 24 + armSwing, playerY + 62, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = style.suit;
    roundedRectPath(ctx, playerX - 20, playerY + 30, 40, 46, 14);
    ctx.fill();

    ctx.fillStyle = style.accentSoft;
    roundedRectPath(ctx, playerX - 5, playerY + 33, 10, 34, 5);
    ctx.fill();

    ctx.fillStyle = style.skin;
    ctx.fillRect(playerX - 4, playerY + 24, 8, 10);
    ctx.beginPath();
    ctx.arc(headX, headY, 18, 0, Math.PI * 2);
    ctx.fill();

    drawHair(ctx, style, headX, headY - 1, 19);

    if (style.visor) {
      ctx.strokeStyle = style.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(headX - 11, headY + 1);
      ctx.lineTo(headX + 11, headY + 1);
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(20, 32, 50, 0.8)";
      ctx.beginPath();
      ctx.arc(headX - 6, headY + 1, 1.8, 0, Math.PI * 2);
      ctx.arc(headX + 6, headY + 1, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.arc(playerX - 5, playerY + 12, 6, 0, Math.PI * 2);
    ctx.fill();

    if (timestamp < this.state.invulnUntil) {
      ctx.strokeStyle = "rgba(255, 180, 180, 0.9)";
      ctx.lineWidth = 4;
      ctx.strokeRect(playerX - 26, playerY - 6, 52, 104);
    }
    ctx.restore();

    if (this.state.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.state.flash * 0.22})`;
      ctx.fillRect(0, 0, width, height);
    }
  }

  updateHud() {
    if (this.options.elTime) {
      this.options.elTime.textContent = `Tempo: ${String(this.state.remainingSec).padStart(2, "0")}s`;
    }
    if (this.options.elEnergy) {
      this.options.elEnergy.textContent = `Energia coletada: ${this.state.energy}`;
    }
    if (this.options.elHits) {
      this.options.elHits.textContent = `Colisoes: ${this.state.hits}`;
    }
  }

  buildResult() {
    const finalScore = Math.max(0, Math.round(this.state.score));
    const energy = this.state.energy;
    const hits = this.state.hits;

    const batteryDelta = clamp(
      Math.round(energy * 2.5 - hits * 8 + Math.min(finalScore, 1800) / 160 - 8),
      -22,
      22
    );

    return {
      score: finalScore,
      energy,
      hits,
      batteryDelta
    };
  }

  failSafe(error) {
    console.error("Runner fail-safe:", error);
    this.startFallback();
  }

  complete(result) {
    if (this.completed) {
      return;
    }
    this.completed = true;
    this.emitEvent("finish", result);
    this.teardown({ notify: true, result });
  }

  teardown({ notify, result } = {}) {
    if (!this.running && !notify) {
      return;
    }

    this.running = false;
    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];

    this.control.left = false;
    this.control.right = false;
    this.control.jumpQueued = false;

    if (this.options.canvas) {
      this.options.canvas.innerHTML = "";
    }

    if (notify && typeof this.options.onFinish === "function") {
      const payload = result || this.buildResult();
      window.setTimeout(() => {
        this.options.onFinish(payload);
      }, 0);
    }
  }
}
