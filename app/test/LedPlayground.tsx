"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import {
  LedMatrix,
  LedScene,
  LED_COLOR_NAMES,
  blink,
  boot,
  centerCapsY,
  marquee,
  renderFontText,
  renderPixelText,
  shift,
  typeOn,
  wipeIn,
  wipeOut,
  type LedColorName,
  type LedMatrixEngine,
  type TextSegment,
} from "@/components/led-matrix";

const PRESETS = [
  { label: "160 × 32", note: "5 × 2 moduly P10", cols: 160, rows: 32 },
  { label: "128 × 32", note: "4 × 2 moduly", cols: 128, rows: 32 },
  { label: "96 × 24", note: "mobil", cols: 96, rows: 24 },
  { label: "96 × 16", note: "1 riadok", cols: 96, rows: 16 },
  { label: "192 × 48", note: "6 × 3 moduly", cols: 192, rows: 48 },
] as const;

const SWATCH: Record<LedColorName, string> = {
  red: "#ff2a16",
  amber: "#ff9e12",
  yellow: "#ffd614",
  green: "#2cff6c",
  white: "#eef2ff",
  blue: "#3478ff",
};

const textScale = (rows: number) => (rows >= 48 ? 3 : rows >= 24 ? 2 : 1);

type Settings = {
  cols: number;
  rows: number;
  color: LedColorName;
  accent: LedColorName;
};

function buildDemo(scene: LedScene, s: Settings, onDone: () => void) {
  const { cols, rows, color, accent } = s;
  const k = textScale(rows);
  const capY = centerCapsY(rows, k);
  const T = (input: string | TextSegment[], c = color) =>
    renderPixelText(input, { scale: k, color: c });
  scene.clear();
  const tl = gsap.timeline({ onComplete: onDone });
  tl.add(boot(scene, color));

  const a = scene.add(T("VAŠA ZNAČKA"), { y: capY, chars: 0 });
  tl.add(typeOn(a, 15)).to({}, { duration: 0.9 });

  const b = scene.add(T("SVIETI", accent), { y: rows });
  tl.add(shift(a, { y: capY - rows }, 0.45));
  tl.add(shift(b, { y: capY }, 0.45), "<");
  tl.add(blink(b, 3), "+=0.5").to({}, { duration: 0.9 });

  const c = scene.add(
    T([
      { text: "AJ VTEDY, KEĎ MY UŽ " },
      { text: "SPÍME", color: accent },
      { text: "  •  IMAGE MARKETING  •  " },
      { text: "NONSTOP", color: accent },
    ]),
    { x: cols, y: capY },
  );
  tl.add(wipeOut(b, 220));
  tl.add(marquee(c, cols, 26 * k + 12), "+=0.15");

  const twoLines = rows >= 24;
  const d = scene.add(
    renderPixelText(
      twoLines
        ? [
            { text: "IMAGE ", color: accent },
            { text: "MARKETING\nsvetelná reklama" },
          ]
        : [{ text: "IMAGE ", color: accent }, { text: "MARKETING" }],
      { scale: Math.max(1, k - 1), color },
    ),
    {
      y: centerCapsY(rows, Math.max(1, k - 1), twoLines ? 2 : 1),
      wipe: 0,
    },
  );
  tl.add(wipeIn(d, 140), "+=0.2").to({}, { duration: 2.2 });
  tl.add(wipeOut(d, 180)).to({}, { duration: 0.6 });
  return tl;
}

function buildCustom(
  scene: LedScene,
  s: Settings,
  text: string,
  mode: "marquee" | "static" | "type",
) {
  const k = textScale(s.rows);
  // "*slovo*" marks a word in the accent colour.
  const segments: TextSegment[] = text
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("*") && part.endsWith("*")
        ? { text: part.slice(1, -1), color: s.accent }
        : { text: part },
    );
  const lines = text.split("\n").length;
  const bmp = renderPixelText(segments, { scale: k, color: s.color });
  const y = centerCapsY(s.rows, k, lines);
  scene.clear();
  const tl = gsap.timeline();
  tl.add(boot(scene, s.color));
  if (mode === "marquee" || bmp.w > s.cols) {
    const layer = scene.add(bmp, { x: s.cols, y });
    tl.add(marquee(layer, s.cols, 26 * k + 12).repeat(-1));
  } else if (mode === "type") {
    const layer = scene.add(bmp, { y, chars: 0 });
    tl.add(typeOn(layer, 12)).to({}, { duration: 2 });
    tl.add(blink(layer, 2)).to({}, { duration: 1 });
    tl.repeat(-1);
  } else {
    scene.add(bmp, { y });
  }
  return tl;
}

function MainSign() {
  const section = useRef<HTMLElement>(null);
  const [preset, setPreset] = useState(0);
  const [color, setColor] = useState<LedColorName>("red");
  const [accent, setAccent] = useState<LedColorName>("amber");
  const [ledSize, setLedSize] = useState(0.6);
  const [glow, setGlow] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [on, setOn] = useState(true);
  const [text, setText] = useState("Vaša značka *svieti* aj vtedy, keď my už spíme");
  const { cols, rows } = PRESETS[preset];

  const colors = useRef({ color, accent });
  const engine = useRef<LedMatrixEngine | null>(null);
  const scene = useRef<LedScene | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const entered = useRef(false);
  const program = useRef<() => void>(() => {});

  // The scene knows the live panel size; colours come from the latest render.
  const settings = (sc: LedScene): Settings => ({
    cols: sc.cols,
    rows: sc.rows,
    ...colors.current,
  });
  const play = (make: (sc: LedScene) => gsap.core.Timeline) => {
    tl.current?.kill();
    if (scene.current) tl.current = make(scene.current);
  };
  const runDemo = () => {
    program.current = runDemo;
    play((sc) => buildDemo(sc, settings(sc), runDemo));
  };
  const runCustom = (mode: "marquee" | "static" | "type") => {
    program.current = () => runCustom(mode);
    play((sc) => buildCustom(sc, settings(sc), text, mode));
  };

  const onReady = (e: LedMatrixEngine) => {
    engine.current = e;
    scene.current = new LedScene(e.cols, e.rows);
    e.onCompose = scene.current.compose;
    e.brightness = brightness;
    if (entered.current && on) program.current();
  };

  useGSAP(
    () => {
      program.current = runDemo;
      ScrollTrigger.create({
        trigger: section.current,
        start: "top 65%",
        once: true,
        onEnter: () => {
          entered.current = true;
          if (scene.current) program.current();
        },
      });
      return () => tl.current?.kill();
    },
    { scope: section },
  );

  // Colour changes restart whatever is running so the new bitmaps are built.
  useEffect(() => {
    colors.current = { color, accent };
    if (entered.current && on) program.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, accent]);

  useEffect(() => {
    if (engine.current) engine.current.brightness = brightness;
  }, [brightness]);

  const power = () => {
    if (on) {
      tl.current?.kill();
      scene.current?.clear();
    } else {
      program.current();
    }
    setOn(!on);
  };

  return (
    <section ref={section} className="px-4 py-24 desktop:px-10">
      <div className="mx-auto max-w-[1240px]">
        <LedMatrix
          cols={cols}
          rows={rows}
          ledSize={ledSize}
          glow={glow}
          lens={color}
          label="LED panel s textom: Vaša značka svieti aj vtedy, keď my už spíme"
          onReady={onReady}
        />

        <div className="mt-16 grid gap-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/80 desktop:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Field label="Panel">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p, i) => (
                  <Chip key={p.label} active={i === preset} onClick={() => setPreset(i)}>
                    {p.label} <span className="opacity-45">· {p.note}</span>
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Farba LED">
              <Swatches value={color} onChange={setColor} />
            </Field>
            <Field label="Akcentová farba (viacfarebný panel)">
              <Swatches value={accent} onChange={setAccent} />
            </Field>
            <Slider label="Veľkosť LED" value={ledSize} min={0.35} max={0.85} step={0.01} onChange={setLedSize} />
            <Slider label="Žiara" value={glow} min={0} max={2} step={0.05} onChange={setGlow} />
            <Slider label="Jas" value={brightness} min={0.1} max={1} step={0.01} onChange={setBrightness} />
          </div>
          <div className="flex flex-col gap-5">
            <Field label="Vlastný text (*slovo* = akcentová farba, Enter = nový riadok)">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-white/15 bg-black/40 p-3 font-mono text-white outline-none focus:border-white/40"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Chip onClick={() => runCustom("marquee")}>Bežiaci text</Chip>
              <Chip onClick={() => runCustom("type")}>Písanie</Chip>
              <Chip onClick={() => runCustom("static")}>Statický</Chip>
              <Chip onClick={runDemo}>▶ Demo sekvencia</Chip>
              <Chip active={on} onClick={power}>
                {on ? "Vypnúť" : "Zapnúť"}
              </Chip>
            </div>
            <p className="leading-relaxed text-white/45">
              Panel sa zapne, keď k nemu doscrolluješ. Pohyb je vždy po celých
              diódach — tak ako na skutočnom paneli. Vykresľuje sa do canvasu,
              žiara je CSS blur na mini-canvase (1 px = 1 dióda), takže výkon
              nezávisí od veľkosti obrazovky.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A smaller sign that boots once it scrolls into view. */
function StaticSign({
  cols,
  rows,
  lens = "red",
  ledSize,
  content,
  caption,
}: {
  cols: number;
  rows: number;
  lens?: LedColorName;
  ledSize?: number;
  content: (scene: LedScene) => void | Promise<void>;
  caption: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const scene = useRef<LedScene | null>(null);
  const entered = useRef(false);
  const start = () => {
    const s = scene.current!;
    s.clear();
    gsap
      .timeline()
      .add(boot(s, lens))
      .call(() => void content(s));
  };
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: wrap.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          entered.current = true;
          if (scene.current) start();
        },
      });
    },
    { scope: wrap },
  );
  return (
    <figure ref={wrap} className="flex flex-col gap-4">
      <LedMatrix
        cols={cols}
        rows={rows}
        lens={lens}
        ledSize={ledSize}
        label={caption}
        onReady={(e) => {
          scene.current = new LedScene(e.cols, e.rows);
          e.onCompose = scene.current.compose;
          if (entered.current) start();
        }}
      />
      <figcaption className="text-sm text-white/45">{caption}</figcaption>
    </figure>
  );
}

export function LedPlayground() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <header className="flex min-h-[90vh] flex-col justify-end gap-6 px-4 pb-16 desktop:px-10">
        <p className="text-sm tracking-[0.2em] text-white/40 uppercase">
          /test — prototyp
        </p>
        <h1 className="max-w-[900px] text-[clamp(40px,7vw,110px)] leading-[0.9] font-extrabold tracking-[-0.05em] [font-stretch:125%]">
          LED dot matrix panel
        </h1>
        <p className="max-w-[560px] text-white/55">
          Scrolluj dole — panel sa zapne, prebehne štartovacia sekvencia
          riadiacej jednotky a potom text.
        </p>
        <span className="mt-6 animate-bounce text-2xl text-white/40">↓</span>
      </header>

      <MainSign />

      <section className="px-4 pt-12 pb-40 desktop:px-10">
        <div className="mx-auto grid max-w-[1240px] gap-16 desktop:grid-cols-2">
          <StaticSign
            cols={96}
            rows={24}
            caption="Podľa referencie: HOT-DOG, dvojfarebný panel 96 × 24"
            content={(s) => {
              const bmp = renderPixelText(
                [
                  { text: "HOT-", color: "red" },
                  { text: "DOG", color: "amber" },
                ],
                { scale: 2 },
              );
              s.add(bmp, { y: centerCapsY(24, 2) });
            }}
          />
          <StaticSign
            cols={112}
            rows={48}
            caption="Viacriadkový oznam, malé písmo 5 × 7, 112 × 48"
            content={(s) => {
              const bmp = renderPixelText(
                "Objednávky:\n0900 123 456\nBALNÉ a ROZVOZ -\nZDARMA !!!",
                { color: "red" },
              );
              const layer = s.add(bmp, { y: centerCapsY(48, 1, 4), chars: 0 });
              gsap
                .timeline({ repeat: -1, repeatDelay: 1 })
                .add(typeOn(layer, 24))
                .to({}, { duration: 2.5 })
                .add(blink(layer, 2, 0.5));
            }}
          />
          <div className="desktop:col-span-2">
            <StaticSign
              cols={160}
              rows={32}
              lens="yellow"
              caption="Logo písmom webu (Archivo Black) rasterizované do diód, žltá"
              content={async (s) => {
                await document.fonts.ready;
                const family = getComputedStyle(document.body).fontFamily;
                const bmp = renderFontText("IMAGE", {
                  font: `900 28px ${family}`,
                  rows: 28,
                  color: "yellow",
                  spacing: 1,
                });
                const layer = s.add(bmp, {
                  y: Math.round((32 - bmp.h) / 2),
                  wipe: 0,
                });
                gsap
                  .timeline({ repeat: -1, repeatDelay: 1.2 })
                  .add(wipeIn(layer, 90))
                  .to({}, { duration: 2.5 })
                  .add(wipeOut(layer, 120));
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// ——— Small controls ———

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs tracking-[0.12em] text-white/40 uppercase">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 transition-colors ${
        active
          ? "border-white/70 bg-white text-black"
          : "border-white/15 hover:border-white/40"
      }`}
    >
      {children}
    </button>
  );
}

function Swatches({
  value,
  onChange,
}: {
  value: LedColorName;
  onChange: (c: LedColorName) => void;
}) {
  return (
    <div className="flex gap-2">
      {LED_COLOR_NAMES.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          onClick={() => onChange(c)}
          className={`size-8 rounded-full border-2 transition-transform ${
            value === c ? "scale-110 border-white" : "border-transparent"
          }`}
          style={{ background: SWATCH[c], boxShadow: `0 0 14px ${SWATCH[c]}88` }}
        />
      ))}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={`${label} — ${value.toFixed(2)}`}>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-white"
      />
    </Field>
  );
}
