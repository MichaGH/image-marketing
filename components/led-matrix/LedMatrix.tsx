"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { LedMatrixEngine, type LedLook } from "./engine";
import type { LedColorName } from "./font";

type LedMatrixProps = {
  cols: number;
  rows: number;
  /** LED diameter / pitch. */
  ledSize?: number;
  glow?: number;
  /** Tint of the unlit lenses. */
  lens?: LedColorName;
  /** Light thrown onto the wall around the sign. */
  spill?: boolean;
  className?: string;
  label?: string;
  onReady?: (engine: LedMatrixEngine) => void;
};

/**
 * A canvas-rendered LED dot-matrix sign inside an aluminium frame.
 * Drive it through the engine passed to onReady (engine.onCompose + clear/blit).
 */
export function LedMatrix({
  cols,
  rows,
  ledSize = 0.6,
  glow = 1,
  lens = "red",
  spill = true,
  className = "",
  label,
  onReady,
}: LedMatrixProps) {
  const root = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLCanvasElement>(null);
  const leds = useRef<HTMLCanvasElement>(null);
  const bloom = useRef<HTMLCanvasElement>(null);
  const wide = useRef<HTMLCanvasElement>(null);
  const spillCanvas = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LedMatrixEngine | null>(null);
  const onReadyRef = useRef(onReady);
  const lookRef = useRef<LedLook>({ ledSize, glow, lens });

  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const engine = new LedMatrixEngine(cols, rows, lookRef.current, {
      root: root.current!,
      base: base.current!,
      leds: leds.current!,
      bloom: bloom.current!,
      wide: wide.current!,
      spill: spillCanvas.current!,
    });
    engineRef.current = engine;
    const el = area.current!;
    const ro = new ResizeObserver(() => engine.resize(el.clientWidth));
    ro.observe(el);
    engine.resize(el.clientWidth);
    // Only spend frames while the sign is on screen.
    let running = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) gsap.ticker.add(engine.tick);
        if (!entry.isIntersecting && running) gsap.ticker.remove(engine.tick);
        running = entry.isIntersecting;
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(root.current!);
    onReadyRef.current?.(engine);
    return () => {
      ro.disconnect();
      io.disconnect();
      gsap.ticker.remove(engine.tick);
      engine.destroy();
      engineRef.current = null;
    };
  }, [cols, rows]);

  useEffect(() => {
    lookRef.current = { ledSize, glow, lens };
    engineRef.current?.setLook(lookRef.current);
  }, [ledSize, glow, lens]);

  // Tiny cols×rows canvases scaled up by the pitch: CSS blur in their local space is measured in LEDs,
  // so the bloom costs the same on any screen size.
  const tiny =
    "pointer-events-none absolute top-0 left-0 origin-top-left [transform:scale(var(--led-scale,1))] will-change-transform";

  return (
    <div
      ref={root}
      role="img"
      aria-label={label}
      className={`relative isolate ${className}`}
    >
      {/* Aluminium profile, ≈ 1.5 LEDs thick, as a % of the outer width so it never feeds back into the measured pitch. */}
      <div
        className="relative rounded-[6px] bg-[linear-gradient(180deg,#3a3a3c_0%,#1b1b1d_14%,#111113_60%,#0b0b0c_100%)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),0_2px_0_rgba(255,255,255,0.06)_inset,0_-1px_0_rgba(0,0,0,0.6)_inset]"
        style={{ padding: `max(8px, ${150 / cols}%)` }}
      >
        {/* Inner bevel where the modules sit in the frame */}
        <div className="relative rounded-[2px] bg-black p-px shadow-[0_0_0_1px_rgba(0,0,0,0.9),0_1px_0_1px_rgba(255,255,255,0.05)]">
          {spill && (
            // Behind the frame (root is the stacking context), aligned with the LED area.
            <div className="pointer-events-none absolute inset-px -z-10">
              <canvas
                ref={spillCanvas}
                style={{ width: cols, height: rows }}
                className={`${tiny} opacity-[calc(0.55*var(--led-glow,1))] [filter:blur(7px)]`}
              />
            </div>
          )}
          <div
            ref={area}
            className="relative overflow-hidden"
            style={{ aspectRatio: `${cols} / ${rows}` }}
          >
            <canvas ref={base} className="absolute inset-0 size-full" />
            <canvas
              ref={leds}
              className="absolute inset-0 size-full mix-blend-screen"
            />
            <canvas
              ref={bloom}
              style={{ width: cols, height: rows }}
              className={`${tiny} opacity-[calc(0.85*var(--led-glow,1))] mix-blend-screen [filter:blur(0.9px)]`}
            />
            <canvas
              ref={wide}
              style={{ width: cols, height: rows }}
              className={`${tiny} opacity-[calc(0.55*var(--led-glow,1))] mix-blend-screen [filter:blur(3px)]`}
            />
            {/* Faint sheen of the front cover */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(112deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0)_38%,rgba(255,255,255,0)_70%,rgba(255,255,255,0.02)_100%)]" />
          </div>
        </div>
      </div>
      {!spill && <canvas ref={spillCanvas} hidden />}
    </div>
  );
}
