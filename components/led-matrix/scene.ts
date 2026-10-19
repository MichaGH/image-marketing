import { gsap } from "@/lib/gsap";
import type { LedMatrixEngine } from "./engine";
import type { Bitmap, LedColorName } from "./font";

export type LedLayer = {
  bitmap: Bitmap;
  x: number;
  y: number;
  intensity: number;
  /** Characters shown, for typing. Infinity shows all. */
  chars: number;
  /** Columns shown from the left, for wipes. Infinity shows all. */
  wipe: number;
  /** Columns hidden from the left, for wipe-outs. */
  cut: number;
  color?: LedColorName;
};

/**
 * Mutable state that GSAP tweens and the engine reads every frame.
 * Positions are rounded at blit time, so any tween moves content in whole LEDs.
 */
export class LedScene {
  layers: LedLayer[] = [];
  noise = 0;
  noiseColor: LedColorName = "red";
  constructor(
    readonly cols: number,
    readonly rows: number,
  ) {}

  add(bitmap: Bitmap, opts: Partial<Omit<LedLayer, "bitmap">> = {}) {
    const layer: LedLayer = {
      bitmap,
      x: Math.floor((this.cols - bitmap.w) / 2),
      y: 0,
      intensity: 1,
      chars: Infinity,
      wipe: Infinity,
      cut: 0,
      ...opts,
    };
    this.layers.push(layer);
    return layer;
  }

  remove(layer: LedLayer) {
    this.layers = this.layers.filter((l) => l !== layer);
  }

  clear() {
    this.layers = [];
    this.noise = 0;
  }

  compose = (engine: LedMatrixEngine) => {
    engine.clear();
    for (const l of this.layers) {
      if (l.intensity <= 0) continue;
      const { stops, w, lineOf, linePitch = 0 } = l.bitmap;
      const n = Math.floor(l.chars);
      const opts = {
        intensity: l.intensity,
        color: l.color,
        from: Math.round(l.cut),
        to: Math.round(Math.min(w, l.wipe)),
      };
      if (n >= stops.length) {
        engine.blit(l.bitmap, l.x, l.y, opts);
      } else if (n > 0) {
        // Typing: earlier lines are complete, the current line is cut at the last typed character.
        const line = lineOf?.[n - 1] ?? 0;
        const top = line * linePitch;
        if (top > 0) engine.blit(l.bitmap, l.x, l.y, { ...opts, rowTo: top });
        engine.blit(l.bitmap, l.x, l.y, {
          ...opts,
          to: Math.min(opts.to, stops[n - 1]),
          rowFrom: top,
          rowTo: line < (lineOf?.[stops.length - 1] ?? 0) ? top + linePitch : undefined,
        });
      }
    }
    if (this.noise > 0) engine.noise(this.noise, this.noiseColor);
  };
}

// ——— Timeline building blocks. Each returns a timeline to nest with tl.add(). ———

/** Controller boot: a few frames of garbage, then black. */
export function boot(scene: LedScene, color: LedColorName = "red") {
  const tl = gsap.timeline();
  tl.set(scene, { noiseColor: color });
  const frames = [0.22, 0, 0.08, 0.02, 0.14, 0];
  frames.forEach((v, i) => tl.set(scene, { noise: v }, i * 0.055));
  return tl.to({}, { duration: 0.25 });
}

/** Characters appear one by one, like a controller writing to the buffer. */
export function typeOn(layer: LedLayer, cps = 14) {
  const n = layer.bitmap.stops.length;
  return gsap.fromTo(
    layer,
    { chars: 0 },
    { chars: n, duration: n / cps, ease: "none" },
  );
}

/** Classic right-to-left ticker at `speed` columns per second. */
export function marquee(layer: LedLayer, cols: number, speed = 60) {
  const distance = cols + layer.bitmap.w;
  return gsap.fromTo(
    layer,
    { x: cols },
    { x: -layer.bitmap.w, duration: distance / speed, ease: "none" },
  );
}

/** Moves a layer row by row (or column by column) to a new position. */
export function shift(layer: LedLayer, to: { x?: number; y?: number }, duration = 0.4) {
  return gsap.to(layer, { ...to, duration, ease: "power1.inOut" });
}

/** Hard on/off blinking — LED signs never fade. */
export function blink(layer: LedLayer, times = 3, period = 0.36) {
  const tl = gsap.timeline();
  for (let i = 0; i < times; i++) {
    tl.set(layer, { intensity: 0 }, i * period);
    tl.set(layer, { intensity: 1 }, i * period + period * 0.45);
  }
  return tl.to({}, { duration: period * 0.55 });
}

/** Column wipe in from the left. */
export function wipeIn(layer: LedLayer, speed = 160) {
  return gsap.fromTo(
    layer,
    { wipe: 0 },
    { wipe: layer.bitmap.w, duration: layer.bitmap.w / speed, ease: "none" },
  );
}

/** Column wipe out towards the right. */
export function wipeOut(layer: LedLayer, speed = 160) {
  return gsap.fromTo(
    layer,
    { cut: 0 },
    { cut: layer.bitmap.w, duration: layer.bitmap.w / speed, ease: "none" },
  );
}
