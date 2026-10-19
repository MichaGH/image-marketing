"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import {
  LedMatrix,
  LedScene,
  boot,
  renderPixelText,
  typeOn,
  type LedMatrixEngine,
} from "@/components/led-matrix";

/**
 * A tight LED module around "svieti". `area` is the LED area height in em of the headline,
 * so the lit letters come out a touch smaller than the type.
 */
function ledModule(scale: 1 | 2, border: number, area: number) {
  const word = renderPixelText("svieti", { scale, color: "yellow" });
  const cols = word.w + border * 2 + 2;
  const rows = 7 * scale + border * 2;
  return {
    word,
    cols,
    rows,
    area,
    x: Math.floor((cols - word.w) / 2),
    y: border - 3 * scale, // glyph tops sit below the accent rows of the bitmap
  };
}
// Desktop: 2× font (60 × 14 LEDs). Phones: 1× font, so each LED stays big enough to read as one.
const LARGE = ledModule(2, 2, 0.74);
const COMPACT = ledModule(1, 1, 0.8);

const STEPS = [
  {
    num: "01",
    title: "Návrh",
    text: "Reklamu navrhneme priamo na fotku vašej fasády — rozmery, farby, typ podsvietenia aj jasnú cenovú ponuku.",
  },
  {
    num: "02",
    title: "Výroba",
    text: "Svetelné písmená, boxy aj LED panely vyrábame z hliníka, plexiskla a kvalitných LED modulov.",
  },
  {
    num: "03",
    title: "Montáž",
    text: "Osadíme, zapojíme a nastavíme časovač. A ostávame k dispozícii pre servis.",
  },
] as const;

/** Colour that follows the section from day (white page) to night. */
const mix = (day: string, night: string) =>
  `color-mix(in oklab, ${day} calc(var(--day, 1) * 100%), ${night})`;

export function BrandSignSection() {
  const root = useRef<HTMLElement>(null);
  const scene = useRef<LedScene | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const entered = useRef(false);
  const [compact, setCompact] = useState(false);
  const mod = compact ? COMPACT : LARGE;
  const modRef = useRef(LARGE);
  useEffect(() => {
    modRef.current = mod;
  }, [mod]);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 699px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  // The steps wait for both: being on screen and the night having fallen.
  const steps = useRef({ reveal: null as gsap.core.Timeline | null, inView: false, dark: false });
  const revealSteps = () => {
    const st = steps.current;
    if (st.inView && st.dark) st.reveal?.play();
  };

  const play = () => {
    const s = scene.current;
    const el = root.current;
    if (!s || !el) return;
    const m = modRef.current;
    tl.current?.kill();
    s.clear();
    gsap.set(el, { "--day": 1 });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      s.add(m.word, { x: m.x, y: m.y });
      gsap.set(el, { "--day": 0 });
      steps.current.dark = true;
      return;
    }
    const word = s.add(m.word, { x: m.x, y: m.y, chars: 0 });
    tl.current = gsap
      .timeline()
      .add(boot(s, "yellow"))
      .add(typeOn(word, 9), "+=0.15")
      // Night falls once the sign is lit; the white line was there all along.
      .to(el, { "--day": 0, duration: 1.6, ease: "power2.inOut" }, "+=0.6")
      .call(() => {
        steps.current.dark = true;
        revealSteps();
      }, [], "-=0.5");
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

      // The steps switch on one after another, each with its own indicator LED.
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const items = gsap.utils.toArray<HTMLElement>("[data-step]");
        const parts = items.map((step) => step.querySelectorAll("[data-step-text]"));
        gsap.set("[data-step-line]", { scaleX: 0 });
        gsap.set("[data-step-led]", { "--lit": 0 });
        gsap.set(parts, { autoAlpha: 0, y: 18 });
        const reveal = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.out" },
        });
        items.forEach((step, i) => {
          const at = i * 0.22;
          reveal
            .to(step.querySelector("[data-step-line]"), { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, at)
            .to(step.querySelector("[data-step-led]"), { "--lit": 1, duration: 0.12, ease: "none" }, at + 0.35)
            .to(parts[i], { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 }, at + 0.3);
        });
        steps.current.reveal = reveal;
        ScrollTrigger.create({
          trigger: "[data-steps]",
          start: "top 88%",
          once: true,
          onEnter: () => {
            steps.current.inView = true;
            revealSteps();
          },
        });
      }
      return () => tl.current?.kill();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="svieti"
      data-screen-label="Svieti aj keď spíte"
      className="relative overflow-hidden"
      style={{ background: mix("var(--background)", "var(--foreground)") }}
    >
      <div className="flex justify-center pt-[clamp(120px,22vh,260px)] pb-[clamp(72px,9vw,140px)]">
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
              style={{ width: `calc(${(mod.area * mod.cols) / mod.rows}em + 18px)` }}
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
                key={mod.cols}
                cols={mod.cols}
                rows={mod.rows}
                lens="yellow"
                glow={1}
                ledSize={0.64}
                label="svieti"
                onReady={(engine: LedMatrixEngine) => {
                  modRef.current = mod;
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
      </div>

      {/* How a sign gets made — readable by day or night, so it never depends on the dusk having played. */}
      <ol
        data-steps
        className="page-shell m-0 grid list-none grid-cols-1 gap-x-[clamp(24px,3vw,56px)] gap-y-12 pb-[clamp(96px,12vw,200px)] desktop:grid-cols-3"
        style={{ color: mix("var(--foreground)", "#ffffff") }}
      >
        {STEPS.map((step) => (
          <li key={step.num} data-step className="flex flex-col gap-5">
            <span
              data-step-line
              aria-hidden
              className="block h-px origin-left"
              style={{ background: mix("var(--border)", "rgba(255,255,255,0.16)") }}
            />
            <span data-step-text className="flex items-center gap-3 text-[15px] font-semibold">
              <span
                data-step-led
                aria-hidden
                className="size-2.5 rounded-full"
                style={{
                  background: "color-mix(in oklab, #ffd84a calc(var(--lit, 1) * 100%), #3a3a3a)",
                  boxShadow:
                    "0 0 calc(var(--lit, 1) * 12px) calc(var(--lit, 1) * 1px) color-mix(in srgb, #ffc21a calc(var(--lit, 1) * 70%), transparent)",
                }}
              />
              <span style={{ color: mix("var(--muted)", "var(--primary)") }}>{step.num}</span>
            </span>
            <h3
              data-step-text
              className="m-0 text-[clamp(32px,3.4vw,56px)] leading-[0.95] font-extrabold tracking-[-0.045em] [font-stretch:125%]"
            >
              {step.title}
            </h3>
            <p
              data-step-text
              className="m-0 max-w-[380px] text-base leading-normal"
              style={{ color: mix("var(--muted)", "rgba(255,255,255,0.6)") }}
            >
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
