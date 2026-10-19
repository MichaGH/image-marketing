import type { CSSProperties } from "react";

type Css = CSSProperties & Record<`--${string}`, string | number>;

type LightBoxProps = {
  /** cutout = black face, letters routed out and backed with opal acrylic; full = whole face lit, print on top. */
  variant?: "cutout" | "full";
  frame?: "silver" | "black";
  lit?: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  /** Width of the box as a percentage of the stage (cqw). */
  width?: number;
  /** Width / height. */
  ratio?: number;
  /** Cabinet depth, in % of the box width. */
  depth?: number;
  className?: string;
};

const FRAME = {
  silver: {
    profile:
      "linear-gradient(180deg,#fbfbfc 0%,#d3d5d8 9%,#e9eaec 45%,#c2c4c7 80%,#9a9c9f 100%)",
    top: "linear-gradient(180deg,#a9abae,#e4e5e7)",
    bottom: "linear-gradient(0deg,#4c4e51,#7d7f82)",
    side: "linear-gradient(90deg,#8e9093,#c4c6c9)",
  },
  black: {
    profile:
      "linear-gradient(180deg,#56565a 0%,#26262a 8%,#18181b 50%,#0f0f11 90%,#050506 100%)",
    top: "linear-gradient(180deg,#151517,#3a3a3e)",
    bottom: "linear-gradient(0deg,#050506,#111113)",
    side: "linear-gradient(90deg,#0d0d0f,#232326)",
  },
};

const ambient = (color: string, keep = 12) =>
  `color-mix(in oklab, ${color} calc(var(--day, 1) * ${100 - keep}% + ${keep}%), #0a0a0b)`;
const night = "calc((1 - var(--day, 1)) * 0.86)";
const abs = "pointer-events-none absolute";

/**
 * A wall-mounted light box built from real 3D planes (face + four sides of the cabinet).
 * Uses --day from the scene and --on on its own root (data-sign="flick").
 */
export function LightBox({
  variant = "cutout",
  frame = "silver",
  lit = "#ffffff",
  title,
  subtitle,
  tagline,
  width = 78,
  ratio = 3.2,
  depth = 6,
  className = "",
}: LightBoxProps) {
  const f = FRAME[frame];
  const h = 100 / ratio;
  const D = `${depth}em`;

  const text = (style: CSSProperties, accent?: CSSProperties) => (
    <div
      className="flex flex-col items-center justify-center gap-[0.6em] leading-[0.86] font-extrabold tracking-[-0.04em] [font-stretch:125%]"
      style={style}
    >
      <span className="text-[19em]">{title}</span>
      {subtitle && (
        <span className="text-[6.4em] tracking-[-0.03em]" style={accent}>
          {subtitle}
        </span>
      )}
      {tagline && (
        <span className="mt-[0.5em] text-[2.6em] font-semibold tracking-[0.12em] uppercase [font-stretch:100%]">
          {tagline}
        </span>
      )}
    </div>
  );

  const plane = (style: CSSProperties, bg: string) => (
    <div aria-hidden className={abs} style={{ background: bg, ...style }}>
      <div className="absolute inset-0 bg-black" style={{ opacity: night }} />
    </div>
  );

  return (
    <div
      data-sign="flick"
      role="img"
      aria-label={[title, subtitle, tagline].filter(Boolean).join(" ")}
      className={`relative [transform-style:preserve-3d] ${className}`}
      style={
        {
          "--lit": lit,
          fontSize: `${width / 100}cqw`,
          width: "100em",
          height: `${h}em`,
        } as Css
      }
    >
      {/* Sun shadow and contact shadow on the wall. */}
      <div
        aria-hidden
        className={`${abs} inset-0 rounded-[1.4em] bg-black`}
        style={{
          transform: `translate3d(${depth * 0.35}em, ${depth * 0.6}em, 0)`,
          filter: `blur(${depth * 0.5}em)`,
          opacity: "calc(var(--day, 1) * 0.32)",
        }}
      />
      <div
        aria-hidden
        className={`${abs} inset-0 rounded-[1.4em] bg-black`}
        style={{ filter: "blur(0.6em)", opacity: "calc(0.25 + var(--day, 1) * 0.2)" }}
      />
      {/* Light the face throws onto the wall. */}
      <div
        aria-hidden
        className={abs}
        style={{
          inset: variant === "full" ? "-40% -14%" : "-25% -8%",
          background:
            "radial-gradient(closest-side, var(--lit), color-mix(in srgb, var(--lit) 30%, transparent) 45%, transparent)",
          opacity: `calc(var(--on, 0) * (1 - var(--day, 1)) * ${variant === "full" ? 0.34 : 0.14})`,
        }}
      />

      {/* Cabinet sides */}
      {plane({ left: 0, top: 0, width: "100%", height: D, transformOrigin: "top", transform: "rotateX(90deg)" }, f.top)}
      {plane({ left: 0, top: "100%", width: "100%", height: D, transformOrigin: "top", transform: "rotateX(90deg)" }, f.bottom)}
      {plane({ left: 0, top: 0, width: D, height: "100%", transformOrigin: "left", transform: "rotateY(-90deg)" }, f.side)}
      {plane({ left: "100%", top: 0, width: D, height: "100%", transformOrigin: "left", transform: "rotateY(-90deg)" }, f.side)}

      {/* Face: aluminium profile around the panel */}
      <div
        className="absolute inset-0 rounded-[1.4em] p-[1.5em]"
        style={{
          transform: `translateZ(${depth}em)`,
          background: f.profile,
          boxShadow:
            "inset 0 0.12em 0 rgba(255,255,255,0.5), inset 0 -0.12em 0 rgba(0,0,0,0.35)",
        }}
      >
        <div className="absolute inset-0 rounded-[1.4em] bg-black" style={{ opacity: night }} />
        <div
          className="relative size-full overflow-hidden rounded-[0.5em]"
          style={{
            background:
              variant === "full" ? ambient("#f2f1ec", 8) : ambient("#0f0f10", 60),
            boxShadow: `inset 0 0.25em 0.5em rgba(0,0,0,0.45), 0 0 4em 0.6em color-mix(in srgb, var(--lit) calc(var(--on, 0) * (1 - var(--day, 1)) * ${variant === "full" ? 40 : 6}%), transparent)`,
          }}
        >
          {variant === "full" ? (
            <>
              {/* Lit opal acrylic: brighter over the LED rows, a little dimmer at the ends. */}
              <div
                className="absolute inset-0"
                style={{
                  background: [
                    "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 3.2em, rgba(120,130,150,0.05) 4.6em, rgba(0,0,0,0) 6em)",
                    "radial-gradient(ellipse 75% 95% at 50% 50%, #ffffff 0%, #fbfcff 55%, #e5e9f0 100%)",
                  ].join(","),
                  opacity: "var(--on, 0)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {text(
                  { color: "#121213" },
                  {
                    color: `color-mix(in oklab, #ffd400 calc(max(var(--on, 0), var(--day, 1) * 0.88 + 0.12) * 100%), #0a0a0b)`,
                  },
                )}
              </div>
            </>
          ) : (
            <>
              {/* Bloom of the lit letters */}
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  color: "var(--lit)",
                  filter: "blur(1.6em)",
                  opacity: "calc(var(--on, 0) * (0.8 - var(--day, 1) * 0.55))",
                }}
              >
                {text({})}
              </div>
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  color: "var(--lit)",
                  filter: "blur(0.3em)",
                  opacity: "calc(var(--on, 0) * (0.9 - var(--day, 1) * 0.6))",
                }}
              >
                {text({})}
              </div>
              {/* Opal acrylic behind the routed letters, unlit */}
              <div className="absolute inset-0 flex items-center justify-center">
                {text({ color: ambient("#e2e1dc", 6) })}
              </div>
              {/* …and lit, with a hot centre where the LED modules are densest */}
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: "var(--on, 0)" }}
              >
                {text({
                  color: "transparent",
                  backgroundImage:
                    "radial-gradient(ellipse 60% 120% at 50% 50%, #ffffff 0%, color-mix(in oklab, var(--lit) 85%, #ffffff) 55%, color-mix(in oklab, var(--lit) 80%, #c9d2de) 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                })}
              </div>
            </>
          )}
          {/* Gloss of the acrylic face, only readable in daylight */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(168deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 32%, rgba(255,255,255,0) 33%, rgba(255,255,255,0) 100%)",
              opacity: "calc(0.25 + var(--day, 1) * 0.75)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
