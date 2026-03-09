import Phaser from "phaser";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hueToColor(hue, saturation = 82, lightness = 58) {
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
  return (toByte(r) << 16) | (toByte(g) << 8) | toByte(b);
}

const THEME_PALETTES = {
  clean: {
    bgTop: 0x173552,
    bgBottom: 0x08131e,
    neon: 0x8cf2e0,
    neonSoft: 0x9fddff,
    tower: 0x294861,
    road: 0x0d1828,
    obstacle: 0xffad6f
  },
  cyber: {
    bgTop: 0x1a2446,
    bgBottom: 0x060a18,
    neon: 0x68f0ff,
    neonSoft: 0x8d9fff,
    tower: 0x283158,
    road: 0x091226,
    obstacle: 0xf56e8b
  },
  distopic: {
    bgTop: 0x302032,
    bgBottom: 0x120d18,
    neon: 0xff997a,
    neonSoft: 0xffb2ce,
    tower: 0x423049,
    road: 0x17121e,
    obstacle: 0xff6868
  },
  glitch: {
    bgTop: 0x27203d,
    bgBottom: 0x090514,
    neon: 0x9dff66,
    neonSoft: 0x8df2ff,
    tower: 0x3f3565,
    road: 0x0c1023,
    obstacle: 0xff5ec7
  }
};

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

    this.game = null;
    this.scene = null;
    this.running = false;
    this.completed = false;

    this.state = {
      score: 0,
      energy: 0,
      hits: 0,
      remainingSec: this.options.durationSec,
      startedAt: 0,
      lastSecond: null,
      invulnUntil: 0
    };

    this.touch = {
      left: false,
      right: false,
      jumpQueued: false
    };

    this.cleanupFns = [];
  }

  start() {
    if (this.running) {
      return;
    }

    const host = this.options.canvas;
    if (!host) {
      this.complete({
        score: 0,
        energy: 0,
        hits: 0,
        batteryDelta: -8
      });
      return;
    }

    host.innerHTML = "";
    this.setupTouchControls();
    this.running = true;
    const runner = this;
    const sceneConfig = {
      key: "runnerScene",
      preload() {
        try {
          runner.preloadScene(this);
        } catch (error) {
          runner.failSafe(error);
        }
      },
      create() {
        try {
          runner.createScene(this);
        } catch (error) {
          runner.failSafe(error);
        }
      },
      update(time, delta) {
        try {
          runner.updateScene(this, time, delta);
        } catch (error) {
          runner.failSafe(error);
        }
      }
    };

    const rendererType = Phaser.Device.Features.webGL ? Phaser.WEBGL : Phaser.CANVAS;
    const renderResolution = Math.min(window.devicePixelRatio || 1, 2);

    try {
      this.game = new Phaser.Game({
        type: rendererType,
        parent: host,
        width: 1000,
        height: 450,
        backgroundColor: "#081523",
        resolution: renderResolution,
        fps: { target: 60, forceSetTimeOut: false },
        render: {
          antialias: true,
          antialiasGL: true,
          clearBeforeRender: true,
          powerPreference: "high-performance"
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 1600 },
            fps: 144,
            debug: false
          }
        },
        scene: sceneConfig
      });
    } catch (error) {
      this.failSafe(error);
      return;
    }

    this.updateHud();
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
    fallback.textContent = "Modo de contingencia ativo: Phaser indisponivel.";
    host.append(fallback);

    this.running = true;
    this.setupTouchControls();

    const started = Date.now();
    this.state.remainingSec = this.options.durationSec;
    this.updateHud();

    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      this.state.remainingSec = Math.max(this.options.durationSec - elapsed, 0);
      this.state.score += 28;
      this.updateHud();
      if (this.state.remainingSec <= 0) {
        window.clearInterval(timer);
        this.complete(this.buildResult());
      }
    }, 1000);

    this.cleanupFns.push(() => window.clearInterval(timer));
  }

  preloadScene(scene) {
    this.scene = scene;
    const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
    const p = this.palette;
    const heroColor = hueToColor(this.options.avatarHue || 205);

    gfx.fillStyle(heroColor, 1);
    gfx.fillRoundedRect(0, 0, 56, 74, 14);
    gfx.fillStyle(0xffffff, 0.2);
    gfx.fillRoundedRect(6, 6, 44, 15, 6);
    gfx.fillStyle(0xffffff, 0.5);
    gfx.fillRoundedRect(20, 22, 16, 16, 4);
    gfx.generateTexture("runner_hero", 56, 74);
    gfx.clear();

    gfx.fillStyle(p.obstacle, 1);
    gfx.fillRoundedRect(0, 0, 62, 44, 8);
    gfx.fillStyle(0x2a1a2d, 0.45);
    gfx.fillRoundedRect(7, 7, 48, 30, 5);
    gfx.generateTexture("runner_block", 62, 44);
    gfx.clear();

    gfx.fillStyle(0xf5e57d, 1);
    gfx.fillRoundedRect(0, 0, 52, 20, 8);
    gfx.fillStyle(0xffffff, 0.35);
    gfx.fillRoundedRect(8, 4, 36, 8, 4);
    gfx.generateTexture("runner_drone", 52, 20);
    gfx.clear();

    gfx.fillStyle(0x79ffc8, 1);
    gfx.fillCircle(20, 20, 20);
    gfx.fillStyle(0xffffff, 0.55);
    gfx.fillCircle(14, 14, 7);
    gfx.generateTexture("runner_energy", 40, 40);
    gfx.clear();

    gfx.fillStyle(p.neon, 1);
    gfx.fillRect(0, 0, 22, 8);
    gfx.generateTexture("runner_line", 22, 8);
    gfx.clear();

    gfx.fillStyle(p.tower, 1);
    gfx.fillRoundedRect(0, 0, 130, 80, 10);
    gfx.fillStyle(p.neonSoft, 0.14);
    gfx.fillRect(8, 10, 116, 8);
    gfx.fillRect(8, 26, 116, 5);
    gfx.fillRect(8, 38, 116, 5);
    gfx.generateTexture("runner_building", 130, 80);
    gfx.clear();

    gfx.fillGradientStyle(p.bgTop, p.bgTop, p.bgBottom, p.bgBottom, 1);
    gfx.fillRect(0, 0, 1000, 450);
    gfx.generateTexture("runner_bg", 1000, 450);
    gfx.clear();

    gfx.fillStyle(p.neon, 1);
    gfx.fillCircle(6, 6, 6);
    gfx.generateTexture("runner_dot", 12, 12);

    gfx.destroy();
  }

  createScene(scene) {
    const { width, height } = scene.scale;
    scene.add.image(width * 0.5, height * 0.5, "runner_bg");

    this.decorateCity(scene, width, height);
    this.decorateRoad(scene, width, height);
    this.decorateWeather(scene, width, height);

    this.groundY = Math.round(height * 0.78);
    this.ground = scene.add.rectangle(width * 0.5, this.groundY + 30, width + 90, 110, this.palette.road);
    scene.physics.add.existing(this.ground, true);

    this.player = scene.physics.add.sprite(170, this.groundY - 10, "runner_hero");
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.02);
    this.player.setDamping(true);
    this.player.setDragX(0.0007);
    this.player.body.setSize(44, 70).setOffset(6, 2);
    scene.physics.add.collider(this.player, this.ground);

    this.obstacles = scene.physics.add.group({ allowGravity: false, immovable: true });
    this.collectibles = scene.physics.add.group({ allowGravity: false, immovable: true });

    scene.physics.add.overlap(this.player, this.obstacles, (_, obstacle) => {
      this.onHitObstacle(scene, obstacle);
    });
    scene.physics.add.overlap(this.player, this.collectibles, (_, item) => {
      this.onCollect(scene, item);
    });

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys("A,D,W,SPACE");

    this.obstacleEvent = scene.time.addEvent({
      delay: 840,
      loop: true,
      callback: () => this.spawnObstacle(scene)
    });

    this.collectEvent = scene.time.addEvent({
      delay: 520,
      loop: true,
      callback: () => {
        if (Math.random() < 0.5) {
          this.spawnCollectible(scene);
        }
      }
    });

    this.state.startedAt = scene.time.now;
    this.state.lastSecond = this.options.durationSec;
    this.state.remainingSec = this.options.durationSec;
    this.updateHud();
  }

  decorateCity(scene, width, height) {
    this.bgBuildings = [];
    const count = 16;
    for (let i = 0; i < count; i += 1) {
      const x = (i / count) * width;
      const y = height * 0.5 + Math.random() * 36;
      const tower = scene.add.image(x, y, "runner_building").setOrigin(0.2, 1);
      tower.setAlpha(0.26 + Math.random() * 0.24);
      tower.setScale(0.75 + Math.random() * 0.86, 0.82 + Math.random() * 1.08);
      this.bgBuildings.push(tower);
    }

    this.bgBands = [];
    for (let i = 0; i < 5; i += 1) {
      const band = scene.add.rectangle(
        width * 0.5,
        height * (0.16 + i * 0.09),
        width + 60,
        3,
        this.palette.neon,
        0.05 + i * 0.025
      );
      this.bgBands.push(band);
    }
  }

  decorateRoad(scene, width, height) {
    this.roadLines = [];
    const y = height * 0.82;
    for (let i = 0; i < 24; i += 1) {
      const x = (i / 24) * (width + 40);
      const line = scene.add.image(x, y, "runner_line").setOrigin(0, 0.5);
      line.setTint(this.palette.neon);
      line.setAlpha(0.64);
      this.roadLines.push(line);
    }

    this.roadGlow = scene.add.rectangle(width * 0.5, y + 12, width + 100, 10, this.palette.neonSoft, 0.2);
  }

  decorateWeather(scene, width, height) {
    const density = window.devicePixelRatio && window.devicePixelRatio >= 1.5 ? 3 : 2;
    const config = {
      x: { min: 0, max: width },
      y: { min: -8, max: -2 },
      speedY: { min: 220, max: 480 },
      speedX: { min: -120, max: -40 },
      scale: { start: 0.7, end: 0 },
      lifespan: { min: 720, max: 1200 },
      frequency: 20,
      quantity: density,
      alpha: { start: 0.25, end: 0 },
      blendMode: "ADD"
    };

    try {
      const particles = scene.add.particles("runner_dot");
      if (particles && typeof particles.createEmitter === "function") {
        this.weatherEmitter = particles.createEmitter(config);
        return;
      }
    } catch {
      // Ignore and try modern API below.
    }

    // Phaser >= 3.60 can return an emitter directly.
    this.weatherEmitter = scene.add.particles(0, 0, "runner_dot", config);
  }

  spawnObstacle(scene) {
    if (!scene || !this.running) {
      return;
    }

    const w = scene.scale.width;
    const obstacleType = Math.random() < 0.28 ? "drone" : "block";
    const key = obstacleType === "drone" ? "runner_drone" : "runner_block";
    const y = obstacleType === "drone" ? this.groundY - (96 + Math.random() * 48) : this.groundY - 24;

    const obstacle = this.obstacles.create(w + 90, y, key);
    const elapsed = (scene.time.now - this.state.startedAt) / 1000;
    const speed = 340 + elapsed * 8 + Math.random() * 75;

    if (obstacleType === "drone") {
      obstacle.setScale(0.92 + Math.random() * 0.22);
      obstacle.setTint(0xffce8b);
      obstacle.body.setSize(48, 16).setOffset(2, 2);
    } else {
      const scaleY = Math.random() < 0.4 ? 1.36 : 0.96;
      obstacle.setScale(1, scaleY);
      obstacle.body.setSize(52, Math.floor(38 * scaleY)).setOffset(5, Math.floor(4 * scaleY));
    }

    obstacle.setVelocityX(-speed);
    obstacle.setImmovable(true);
  }

  spawnCollectible(scene) {
    if (!scene || !this.running) {
      return;
    }

    const w = scene.scale.width;
    const h = scene.scale.height;
    const altitude = this.groundY - (100 + Math.random() * 160);
    const item = this.collectibles.create(
      w + 55,
      clamp(altitude, h * 0.2, this.groundY - 38),
      "runner_energy"
    );
    item.setTint(this.palette.neonSoft);
    item.setScale(0.88 + Math.random() * 0.25);
    item.body.setCircle(18, 2, 2);
    item.setVelocityX(-(290 + Math.random() * 95));
    scene.tweens.add({
      targets: item,
      y: item.y - (6 + Math.random() * 10),
      duration: 360 + Math.random() * 260,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  onCollect(scene, item) {
    if (!item || !this.running) {
      return;
    }

    if (this.weatherEmitter) {
      if (typeof this.weatherEmitter.explode === "function") {
        this.weatherEmitter.explode(8, item.x, item.y);
      } else if (typeof this.weatherEmitter.emitParticleAt === "function") {
        this.weatherEmitter.emitParticleAt(item.x, item.y, 8);
      }
    }
    item.destroy();
    this.state.energy += 1;
    this.state.score += 150;
    scene.cameras.main.flash(50, 80, 250, 190, false);
    this.updateHud();
  }

  onHitObstacle(scene, obstacle) {
    if (!this.running || !scene) {
      return;
    }

    const now = scene.time.now;
    if (now < this.state.invulnUntil) {
      return;
    }

    this.state.invulnUntil = now + 850;
    this.state.hits += 1;
    this.state.score = Math.max(0, this.state.score - 180);
    this.player.setVelocityY(-350);
    this.player.setTint(0xffa7a7);
    scene.time.delayedCall(170, () => {
      if (this.player) {
        this.player.clearTint();
      }
    });

    if (obstacle) {
      obstacle.destroy();
    }
    scene.cameras.main.shake(120, 0.004);
    this.updateHud();
  }

  updateScene(scene, time, delta) {
    if (!this.running || !scene || !this.player) {
      return;
    }

    const elapsed = (time - this.state.startedAt) / 1000;
    const remaining = Math.max(0, Math.ceil(this.options.durationSec - elapsed));
    if (remaining !== this.state.lastSecond) {
      this.state.lastSecond = remaining;
      this.state.remainingSec = remaining;
      this.updateHud();
    }

    if (remaining <= 0) {
      this.complete(this.buildResult());
      return;
    }

    const speedFactor = 1 + Math.min(elapsed / 28, 1.15);
    this.updateParallax(scene, delta, speedFactor);
    this.handleMovement();
    this.state.score += delta * (0.034 + speedFactor * 0.004);
    this.recycleGroups(this.obstacles, -130);
    this.recycleGroups(this.collectibles, -90);
  }

  handleMovement() {
    if (!this.player || !this.player.body) {
      return;
    }

    const leftPressed =
      this.touch.left ||
      this.cursors.left.isDown ||
      (this.keys.A && this.keys.A.isDown);
    const rightPressed =
      this.touch.right ||
      this.cursors.right.isDown ||
      (this.keys.D && this.keys.D.isDown);

    const velocityX = rightPressed && !leftPressed ? 240 : leftPressed && !rightPressed ? -240 : 0;
    this.player.setVelocityX(velocityX);
    this.player.setAngle(velocityX * 0.022);

    const jumpPressed =
      this.touch.jumpQueued ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      (this.keys.W && Phaser.Input.Keyboard.JustDown(this.keys.W)) ||
      (this.keys.SPACE && Phaser.Input.Keyboard.JustDown(this.keys.SPACE));

    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    if (jumpPressed && onGround) {
      this.player.setVelocityY(-610);
    }

    if (this.touch.jumpQueued) {
      this.touch.jumpQueued = false;
    }
  }

  updateParallax(scene, delta, speedFactor) {
    const speed = delta * 0.001 * speedFactor;

    if (this.bgBuildings) {
      this.bgBuildings.forEach((tower) => {
        tower.x -= 34 * speed;
        if (tower.x < -140) {
          tower.x = scene.scale.width + Math.random() * 90;
          tower.y = scene.scale.height * 0.48 + Math.random() * 40;
        }
      });
    }

    if (this.bgBands) {
      this.bgBands.forEach((band, i) => {
        band.alpha = 0.04 + i * 0.02 + Math.sin(scene.time.now * 0.0014 + i * 1.2) * 0.02;
      });
    }

    if (this.roadLines) {
      this.roadLines.forEach((line) => {
        line.x -= 380 * speed;
        if (line.x < -26) {
          line.x = scene.scale.width + Math.random() * 40;
        }
      });
    }

    if (this.roadGlow) {
      this.roadGlow.alpha = 0.15 + Math.sin(scene.time.now * 0.0036) * 0.05;
    }
  }

  recycleGroups(group, minX) {
    if (!group) {
      return;
    }
    group.children.iterate((entry) => {
      if (entry && entry.active && entry.x < minX) {
        entry.destroy();
      }
    });
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

  setupTouchControls() {
    const bindHold = (button, key) => {
      if (!button) {
        return;
      }
      const onDown = (event) => {
        event.preventDefault();
        this.touch[key] = true;
      };
      const onUp = (event) => {
        event.preventDefault();
        this.touch[key] = false;
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
    };

    bindHold(this.options.touchLeft, "left");
    bindHold(this.options.touchRight, "right");

    if (this.options.touchJump) {
      const onJump = (event) => {
        event.preventDefault();
        this.touch.jumpQueued = true;
      };
      this.options.touchJump.addEventListener("pointerdown", onJump, { passive: false });
      this.cleanupFns.push(() => this.options.touchJump.removeEventListener("pointerdown", onJump));
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

  failSafe(error) {
    console.error("Runner fail-safe:", error);
    const result = {
      score: Math.max(0, Math.round(this.state.score || 0)),
      energy: Number(this.state.energy) || 0,
      hits: Math.max(1, Number(this.state.hits) || 1),
      batteryDelta: -12
    };
    this.complete(result);
  }

  complete(result) {
    if (this.completed) {
      return;
    }
    this.completed = true;
    this.teardown({ notify: true, result });
  }

  teardown({ notify, result } = {}) {
    if (!this.running && !notify) {
      return;
    }

    this.running = false;

    if (this.obstacleEvent) {
      this.obstacleEvent.remove(false);
      this.obstacleEvent = null;
    }
    if (this.collectEvent) {
      this.collectEvent.remove(false);
      this.collectEvent = null;
    }

    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];

    this.touch.left = false;
    this.touch.right = false;
    this.touch.jumpQueued = false;

    if (this.weatherEmitter) {
      if (typeof this.weatherEmitter.stop === "function") {
        this.weatherEmitter.stop();
      }
      if (typeof this.weatherEmitter.destroy === "function") {
        this.weatherEmitter.destroy();
      }
      this.weatherEmitter = null;
    }

    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
    if (this.options.canvas) {
      this.options.canvas.innerHTML = "";
    }
    this.scene = null;

    if (notify && typeof this.options.onFinish === "function") {
      const payload = result || this.buildResult();
      window.setTimeout(() => {
        this.options.onFinish(payload);
      }, 0);
    }
  }
}
