import { LED_COLOR_NAMES, type Bitmap, type LedColorName } from "./font";

type RGB = [number, number, number];

/** Photographed LED colours: white-hot core, saturated body, halo that spills into the mask. */
const EMISSION: Record<LedColorName, { core: RGB; body: RGB; halo: RGB }> = {
  red: { core: [255, 226, 205], body: [255, 42, 22], halo: [255, 24, 8] },
  amber: { core: [255, 246, 214], body: [255, 158, 18], halo: [255, 110, 0] },
  yellow: { core: [255, 255, 228], body: [255, 214, 20], halo: [255, 176, 0] },
  green: { core: [228, 255, 236], body: [44, 255, 108], halo: [0, 220, 70] },
  white: { core: [255, 255, 255], body: [238, 242, 255], halo: [196, 214, 255] },
  blue: { core: [226, 238, 255], body: [52, 120, 255], halo: [24, 72, 255] },
};

export type LedLook = {
  /** LED lens diameter as a fraction of the pitch (P10 modules sit around 0.5–0.65). */
  ledSize: number;
  /** Multiplier for halo and bloom. */
  glow: number;
  /** Tint of the unlit lenses — red panels have reddish epoxy, white panels milky lenses. */
  lens: LedColorName;
};

export type LedCanvases = {
  root: HTMLElement;
  base: HTMLCanvasElement;
  leds: HTMLCanvasElement;
  bloom: HTMLCanvasElement;
  wide: HTMLCanvasElement;
  spill: HTMLCanvasElement;
};

export type BlitOptions = {
  intensity?: number;
  /** Forces every lit pixel to this colour. */
  color?: LedColorName;
  /** Only bitmap columns [from, to) are drawn — used for typing and wipes. */
  from?: number;
  to?: number;
  /** Only bitmap rows [rowFrom, rowTo) are drawn. */
  rowFrom?: number;
  rowTo?: number;
};

const MODULE_COLS = 32;
const MODULE_ROWS = 16;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rgba = ([r, g, b]: RGB, a: number) =>
  `rgba(${r | 0},${g | 0},${b | 0},${a})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export class LedMatrixEngine {
  readonly cols: number;
  readonly rows: number;
  look: LedLook;
  /** Master dimmer, 0–1. Tween it for power on/off. */
  brightness = 1;
  /** Called every frame before drawing; build the frame with clear()/blit(). */
  onCompose?: (engine: LedMatrixEngine) => void;

  private target: Float32Array;
  private current: Float32Array;
  private color: Uint8Array;
  private variance: Float32Array;
  private c: LedCanvases;
  private ledCtx: CanvasRenderingContext2D;
  private bloomCtx: CanvasRenderingContext2D;
  private bloomData: ImageData;
  private sprites: HTMLCanvasElement[] = [];
  private xs = new Int32Array(0);
  private ys = new Int32Array(0);
  private dirty = true;
  private lastBrightness = -1;
  private width = 0;

  constructor(cols: number, rows: number, look: LedLook, canvases: LedCanvases) {
    this.cols = cols;
    this.rows = rows;
    this.look = look;
    this.c = canvases;
    const n = cols * rows;
    this.target = new Float32Array(n);
    this.current = new Float32Array(n);
    this.color = new Uint8Array(n).fill(1);
    // Binning spread: no two LEDs are exactly equally bright.
    const rand = mulberry32(cols * 7919 + rows);
    this.variance = new Float32Array(n).map(() => 0.86 + rand() * 0.16);
    this.ledCtx = canvases.leds.getContext("2d")!;
    for (const tiny of [canvases.bloom, canvases.wide, canvases.spill]) {
      tiny.width = cols;
      tiny.height = rows;
    }
    this.bloomCtx = canvases.bloom.getContext("2d")!;
    this.bloomData = this.bloomCtx.createImageData(cols, rows);
  }

  // ——— Frame building ———

  clear() {
    this.target.fill(0);
  }

  fill(intensity = 1, color: LedColorName = "red") {
    this.target.fill(intensity);
    this.color.fill(LED_COLOR_NAMES.indexOf(color) + 1);
  }

  blit(bmp: Bitmap, x: number, y: number, opts: BlitOptions = {}) {
    const { intensity = 1, from = 0, to = bmp.w, rowFrom = 0, rowTo = bmp.h } = opts;
    const force = opts.color ? LED_COLOR_NAMES.indexOf(opts.color) + 1 : 0;
    // LEDs are discrete: content always moves in whole columns/rows.
    const ox = Math.round(x);
    const oy = Math.round(y);
    const c0 = Math.max(from, -ox, 0);
    const c1 = Math.min(to, this.cols - ox, bmp.w);
    const r0 = Math.max(rowFrom, -oy, 0);
    const r1 = Math.min(rowTo, this.rows - oy, bmp.h);
    for (let r = r0; r < r1; r++) {
      const row = (r + oy) * this.cols + ox;
      const src = r * bmp.w;
      for (let col = c0; col < c1; col++) {
        const v = bmp.data[src + col];
        if (!v) continue;
        const i = row + col;
        if (intensity >= this.target[i]) {
          this.target[i] = intensity;
          this.color[i] = force || v;
        }
      }
    }
  }

  /** Random lit LEDs — the garbage a controller shows while booting. */
  noise(probability: number, color: LedColorName = "red", intensity = 1) {
    const idx = LED_COLOR_NAMES.indexOf(color) + 1;
    for (let i = 0; i < this.target.length; i++) {
      if (Math.random() < probability) {
        this.target[i] = intensity * (0.4 + Math.random() * 0.6);
        this.color[i] = idx;
      }
    }
  }

  // ——— Rendering ———

  setLook(look: Partial<LedLook>) {
    this.look = { ...this.look, ...look };
    if (this.width) this.resize(this.width, true);
  }

  resize(width: number, force = false) {
    if (!width || (width === this.width && !force)) return;
    this.width = width;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pitchCss = width / this.cols;
    const p = pitchCss * dpr;
    const W = Math.round(width * dpr);
    const H = Math.round(pitchCss * this.rows * dpr);
    const { base, leds, root } = this.c;
    base.width = leds.width = W;
    base.height = leds.height = H;
    root.style.setProperty("--led-scale", String(pitchCss));
    root.style.setProperty("--led-glow", String(this.look.glow));

    const R = Math.ceil(p * 1.8);
    this.xs = Int32Array.from({ length: this.cols }, (_, c) =>
      Math.round((c + 0.5) * p - R - 0.5),
    );
    this.ys = Int32Array.from({ length: this.rows }, (_, r) =>
      Math.round((r + 0.5) * p - R - 0.5),
    );
    this.sprites = LED_COLOR_NAMES.map((name) =>
      this.makeLitSprite(p, R, EMISSION[name]),
    );
    this.drawBase(p, R);
    this.dirty = true;
  }

  private makeLitSprite(p: number, R: number, e: (typeof EMISSION)[LedColorName]) {
    const S = R * 2 + 1;
    const cv = document.createElement("canvas");
    cv.width = cv.height = S;
    const ctx = cv.getContext("2d")!;
    const cx = R + 0.5;
    const rl = (p * this.look.ledSize) / 2;
    const glow = this.look.glow;

    // Halo: exponential falloff into the black mask and the neighbouring lenses.
    const halo = ctx.createRadialGradient(cx, cx, rl * 0.6, cx, cx, R);
    const steps = 14;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const a = Math.min(1, 0.62 * glow) * Math.exp(-3.4 * t) * (1 - t);
      halo.addColorStop(t, rgba(e.halo, a));
    }
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, S, S);

    // Lens: overexposed core, saturated body, slightly darker rim.
    ctx.globalCompositeOperation = "lighter";
    const lens = ctx.createRadialGradient(cx - rl * 0.12, cx - rl * 0.16, 0, cx, cx, rl);
    lens.addColorStop(0, rgba(e.core, 1));
    lens.addColorStop(0.22, rgba(e.core, 1));
    lens.addColorStop(0.5, rgba(mix(e.core, e.body, 0.6), 1));
    lens.addColorStop(0.78, rgba(e.body, 1));
    lens.addColorStop(1, rgba(mix(e.body, [0, 0, 0], 0.15), 0.85));
    ctx.fillStyle = lens;
    ctx.beginPath();
    ctx.arc(cx, cx, rl, 0, Math.PI * 2);
    ctx.fill();
    return cv;
  }

  private drawBase(p: number, R: number) {
    const { base } = this.c;
    const ctx = base.getContext("2d")!;
    const W = base.width;
    const H = base.height;
    const rl = (p * this.look.ledSize) / 2;
    const tint = EMISSION[this.look.lens].body;

    // Black ABS mask with a faint top-down ambient falloff.
    ctx.fillStyle = "#070707";
    ctx.fillRect(0, 0, W, H);
    const amb = ctx.createLinearGradient(0, 0, 0, H);
    amb.addColorStop(0, "rgba(255,255,255,0.035)");
    amb.addColorStop(0.5, "rgba(255,255,255,0.012)");
    amb.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.fillStyle = amb;
    ctx.fillRect(0, 0, W, H);

    // Plastic grain from a small tile.
    const tile = document.createElement("canvas");
    tile.width = tile.height = 96;
    const tctx = tile.getContext("2d")!;
    const img = tctx.createImageData(96, 96);
    const rand = mulberry32(42);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rand() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 7;
    }
    tctx.putImageData(img, 0, 0);
    ctx.fillStyle = ctx.createPattern(tile, "repeat")!;
    ctx.fillRect(0, 0, W, H);

    // Module seams every 32×16 LEDs, like a wall of P10 tiles.
    const seam = Math.max(1, Math.round(p * 0.06));
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    for (let c = MODULE_COLS; c < this.cols; c += MODULE_COLS)
      ctx.fillRect(Math.round(c * p) - seam, 0, seam, H);
    for (let r = MODULE_ROWS; r < this.rows; r += MODULE_ROWS)
      ctx.fillRect(0, Math.round(r * p) - seam, W, seam);
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    for (let c = MODULE_COLS; c < this.cols; c += MODULE_COLS)
      ctx.fillRect(Math.round(c * p), 0, seam, H);
    for (let r = MODULE_ROWS; r < this.rows; r += MODULE_ROWS)
      ctx.fillRect(0, Math.round(r * p), W, seam);

    // One unlit LED, stamped across the grid.
    const S = R * 2 + 1;
    const cx = R + 0.5;
    const off = document.createElement("canvas");
    off.width = off.height = S;
    const o = off.getContext("2d")!;
    // Recessed hole.
    const hole = o.createRadialGradient(cx, cx + rl * 0.08, rl * 0.9, cx, cx, rl * 1.28);
    hole.addColorStop(0, "rgba(0,0,0,0.95)");
    hole.addColorStop(1, "rgba(0,0,0,0)");
    o.fillStyle = hole;
    o.beginPath();
    o.arc(cx, cx, rl * 1.28, 0, Math.PI * 2);
    o.fill();
    // Epoxy lens catching room light from above.
    const lensDark = mix([16, 16, 17], tint, 0.07);
    const lensLit = mix([58, 58, 60], tint, 0.12);
    const lens = o.createRadialGradient(cx - rl * 0.25, cx - rl * 0.35, 0, cx, cx, rl);
    lens.addColorStop(0, rgba(lensLit, 1));
    lens.addColorStop(0.55, rgba(mix(lensLit, lensDark, 0.6), 1));
    lens.addColorStop(1, rgba(mix(lensDark, [0, 0, 0], 0.4), 1));
    o.fillStyle = lens;
    o.beginPath();
    o.arc(cx, cx, rl, 0, Math.PI * 2);
    o.fill();
    // Specular glint.
    if (rl > 2) {
      const spec = o.createRadialGradient(cx - rl * 0.32, cx - rl * 0.4, 0, cx - rl * 0.32, cx - rl * 0.4, rl * 0.38);
      spec.addColorStop(0, "rgba(255,255,255,0.22)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      o.fillStyle = spec;
      o.fillRect(0, 0, S, S);
    }
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++) ctx.drawImage(off, this.xs[c], this.ys[r]);
  }

  /** Advances fades and redraws. Bound so it can be handed straight to gsap.ticker. */
  tick = (_time: number, deltaMs: number) => {
    this.onCompose?.(this);
    this.present(Math.min(deltaMs, 100) / 1000);
  };

  private present(dt: number) {
    // LEDs switch in microseconds, but eyes and cameras smear them a little; fade off slower than on.
    const kOn = 1 - Math.exp(-dt / 0.012);
    const kOff = 1 - Math.exp(-dt / 0.055);
    const { target, current } = this;
    let changed = this.dirty || this.brightness !== this.lastBrightness;
    for (let i = 0; i < current.length; i++) {
      const t = target[i];
      const v = current[i];
      if (v === t) continue;
      const next = v + (t - v) * (t > v ? kOn : kOff);
      current[i] = Math.abs(t - next) < 0.003 ? t : next;
      changed = true;
    }
    if (!changed || !this.width) return;
    this.dirty = false;
    this.lastBrightness = this.brightness;

    const ctx = this.ledCtx;
    const { cols, rows, xs, ys, sprites, color, variance } = this;
    const master = this.brightness;
    const bloom = this.bloomData.data;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, this.c.leds.width, this.c.leds.height);
    ctx.globalCompositeOperation = "lighter";
    for (let r = 0; r < rows; r++) {
      const y = ys[r];
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const v = current[i] * master;
        const o = i * 4;
        if (v < 0.004) {
          bloom[o + 3] = 0;
          continue;
        }
        const ci = color[i] - 1;
        ctx.globalAlpha = Math.min(1, v * variance[i]);
        ctx.drawImage(sprites[ci], xs[c], y);
        const h = EMISSION[LED_COLOR_NAMES[ci]].halo;
        bloom[o] = h[0];
        bloom[o + 1] = h[1];
        bloom[o + 2] = h[2];
        bloom[o + 3] = Math.min(255, v * 255);
      }
    }
    this.bloomCtx.putImageData(this.bloomData, 0, 0);
    for (const tiny of [this.c.wide, this.c.spill]) {
      const t = tiny.getContext("2d")!;
      t.clearRect(0, 0, cols, rows);
      t.drawImage(this.c.bloom, 0, 0);
    }
  }

  destroy() {
    this.onCompose = undefined;
  }
}
