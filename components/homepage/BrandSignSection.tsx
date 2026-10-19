"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import {
  LedMatrix,
  LedScene,
  boot,
  renderPixelText,
  typeOn,
  type LedMatrixEngine,
} from "@/components/led-matrix";

// A tight module: "svieti" at 2× (60 × 14 LEDs) with a 2-LED border.
const WORD = renderPixelText("svieti", { scale: 2, color: "yellow" });
const BORDER = 2;
const COLS = WORD.w + BORDER * 2 + 2;
const ROWS = 14 + BORDER * 2;
const WORD_X = Math.floor((COLS - WORD.w) / 2);
const WORD_Y = BORDER - 6; // glyph tops sit 6 rows into the bitmap (accent space)
/** LED area height in em of the headline: lit letters come out a touch smaller than the type. */
const AREA_EM = 0.74;

export function BrandSignSection() {
  const root = useRef<HTMLElement>(null);
  const scene = useRef<LedScene | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const entered = useRef(false);

  const play = () => {
    const s = scene.current;
    const el = root.current;
    if (!s || !el) return;
    tl.current?.kill();
    s.clear();
    gsap.set(el, { "--day": 1 });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      s.add(WORD, { x: WORD_X, y: WORD_Y });
      gsap.set(el, { "--day": 0 });
      return;
    }
    const word = s.add(WORD, { x: WORD_X, y: WORD_Y, chars: 0 });
    tl.current = gsap
      .timeline()
      .add(boot(s, "yellow"))
      .add(typeOn(word, 9), "+=0.15")
      // Night falls once the sign is lit; the white line was there all along.
      .to(el, { "--day": 0, duration: 1.6, ease: "power2.inOut" }, "+=0.6");
  };

  const reset = () => {
    tl.current?.kill();
    scene.current?.clear();
    if (root.current) gsap.set(root.current, { "--day": 1 });
  };

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: "[data-svieti-block]",
        start: "center 68%",
        onEnter: () => {
          entered.current = true;
          play();
        },
        // Scrolled back above the section: get ready to play again.
        onLeaveBack: () => {
          entered.current = false;
          reset();
        },
      });
      return () => tl.current?.kill();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="svieti"
      data-screen-label="Svieti aj keď spíte"
      className="relative flex min-h-[clamp(560px,100vh,1080px)] items-center justify-center overflow-hidden"
      style={{
        background:
          "color-mix(in oklab, var(--background) calc(var(--day, 1) * 100%), var(--foreground))",
      }}
    >
      <div
        data-svieti-block
        className="page-shell flex flex-col items-center gap-[clamp(20px,2.6vw,40px)] text-center"
      >
        <h2 className="m-0 flex flex-col items-center gap-[0.16em] text-[clamp(40px,7.4vw,128px)] leading-[0.94] font-extrabold tracking-[-0.045em] [font-stretch:125%]">
          <span className="rounded-[0.14em] bg-primary px-[0.1em] pt-[0.02em] pb-[0.06em] text-foreground">
            Vaša značka
          </span>

          <span
            className="relative block py-[0.06em]"
            // LED area plus the 8px frame and 1px bevel on each side.
            style={{ width: `calc(${(AREA_EM * COLS) / ROWS}em + 18px)` }}
          >
            {/* Light the panel throws on the wall once it is dark */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 size-[260%] -translate-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,200,40,0.16), rgba(255,180,20,0.06) 30%, rgba(255,170,0,0.015) 60%, transparent)",
                opacity: "calc(1 - var(--day, 1))",
              }}
            />
            <LedMatrix
              cols={COLS}
              rows={ROWS}
              lens="yellow"
              glow={1}
              ledSize={0.64}
              label="svieti"
              onReady={(engine: LedMatrixEngine) => {
                scene.current = new LedScene(engine.cols, engine.rows);
                engine.onCompose = scene.current.compose;
                if (entered.current) play();
              }}
            />
          </span>

          {/* White all along — only readable once the page goes dark. */}
          <span className="block text-white">aj keď spíte.</span>
        </h2>
        <p className="m-0 text-[clamp(17px,1.6vw,26px)] leading-snug font-semibold tracking-[-0.02em] text-white/60 [font-stretch:108%]">
          Kvalitná svetelná reklama na mieru.
        </p>
      </div>
    </section>
  );
}
