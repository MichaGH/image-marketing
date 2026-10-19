import type { CSSProperties, ReactNode } from "react";

// Every colour here is a color-mix of CSS variables so GSAP only tweens numbers:
//   --day  (scene)   1 = daylight, 0 = night
//   --on   (sign)    0–1 power of the sign
//   --l    (letter)  0–1 power of one letter, for sequential switch-on

type Css = CSSProperties & Record<`--${string}`, string | number>;

type ChannelLettersProps = {
  text: string;
  /** front = opal acrylic faces lit from inside; halo = opaque faces lighting the wall behind. */
  variant?: "front" | "halo";
  /** Colour of the emitted light. */
  lit?: string;
  /** Face colour in daylight, switched off. */
  face?: string;
  /** Colour of the returns (the sides of the letters). */
  returns?: string;
  /** Letter depth in em. */
  depth?: number;
  /** Distance from the wall in em (halo letters sit on pins). */
  standoff?: number;
  /** Slices used to build the returns. */
  layers?: number;
  className?: string;
};

/** Splits text into letter spans; every layer is split the same way so glyphs line up exactly. */
function Letters({ text, style }: { text: string; style?: CSSProperties }) {
  let n = 0;
  const out: ReactNode[] = [];
  Array.from(text).forEach((ch, i) => {
    if (ch === "\n") out.push(<br key={i} />);
    else if (ch === " ") out.push(" ");
    else
      out.push(
        <span key={i} data-letter={n++} style={style}>
          {ch}
        </span>,
      );
  });
  return <>{out}</>;
}

const layer = "pointer-events-none absolute inset-0 select-none";
const ambient = (color: string, keep = 10) =>
  `color-mix(in oklab, ${color} calc(var(--day, 1) * ${100 - keep}% + ${keep}%), #0a0a0b)`;
const glowColor = (strength: number, power = "var(--l, 0)") =>
  `color-mix(in srgb, var(--lit) calc(${power} * (1 - var(--day, 1) * 0.8) * ${strength}%), transparent)`;

export function ChannelLetters({
  text,
  variant = "front",
  lit = "#ffffff",
  face = variant === "front" ? "#f1f0eb" : "#151516",
  returns = "#1d1d1f",
  depth = 0.16,
  standoff = variant === "halo" ? 0.14 : 0.02,
  layers = 22,
  className = "",
}: ChannelLettersProps) {
  const z = (em: number) => ({ transform: `translateZ(${em}em)` });
  const front = standoff + depth;

  const faceStyle: Css =
    variant === "front"
      ? {
          "--amb": ambient("var(--face)", 9),
          "--fc": "color-mix(in oklab, var(--lit) calc(var(--l, 0) * 100%), var(--amb))",
          color: "var(--fc)",
          // Trim cap: the plastic rim around the acrylic face, a touch darker than the face.
          WebkitTextStroke: "0.014em color-mix(in oklab, var(--fc) 80%, #000)",
          paintOrder: "stroke fill",
          textShadow: [
            `0 0 0.015em ${glowColor(90)}`,
            `0 0 0.06em ${glowColor(45)}`,
            `0 0 0.2em ${glowColor(18)}`,
          ].join(","),
        }
      : {
          "--amb": ambient("var(--face)", 25),
          color: "var(--amb)",
          // Halo light grazes the rim of an opaque face.
          WebkitTextStroke: `0.008em color-mix(in oklab, var(--lit) calc(var(--on, 0) * (1 - var(--day, 1)) * 45%), var(--amb))`,
          paintOrder: "stroke fill",
        };

  return (
    <div
      data-sign={variant === "front" ? "sequence" : "fade"}
      role="img"
      aria-label={text.replace(/\n/g, " ")}
      className={`relative text-center leading-[0.95] font-extrabold tracking-[-0.035em] whitespace-pre-line [font-stretch:125%] [transform-style:preserve-3d] ${className}`}
      style={{ "--lit": lit, "--face": face, "--returns": returns } as Css}
    >
      {/* Sizer: keeps the layout box; every visible layer is absolutely stacked on it. */}
      <div aria-hidden className="invisible">
        <Letters text={text} />
      </div>

      {/* Sun shadow on the wall — gone at night. */}
      <div
        aria-hidden
        className={layer}
        style={{
          transform: `translate3d(${0.02 + front * 0.25}em, ${0.03 + front * 0.4}em, 0)`,
          color: "#000",
          filter: `blur(${0.012 + front * 0.12}em)`,
          opacity: `calc(var(--day, 1) * ${variant === "halo" ? 0.2 : 0.26})`,
        }}
      >
        <Letters text={text} />
      </div>

      {variant === "halo" ? (
        <>
          {/* Halo: LEDs on the back of each letter wash the wall. */}
          <div
            aria-hidden
            className={layer}
            style={{
              color: "var(--lit)",
              WebkitTextStroke: "0.07em var(--lit)",
              filter: "blur(0.11em)",
              opacity: "calc(var(--on, 0) * (0.95 - var(--day, 1) * 0.85))",
            }}
          >
            <Letters text={text} />
          </div>
          <div
            aria-hidden
            className={layer}
            style={{
              color: "var(--lit)",
              WebkitTextStroke: "0.025em var(--lit)",
              filter: "blur(0.03em)",
              opacity: "calc(var(--on, 0) * (1 - var(--day, 1) * 0.92))",
            }}
          >
            <Letters text={text} />
          </div>
        </>
      ) : (
        /* Light the faces throw onto the wall around them. */
        <div
          aria-hidden
          className={layer}
          style={{
            color: "var(--lit)",
            WebkitTextStroke: "0.05em var(--lit)",
            filter: "blur(0.3em)",
            opacity: "calc(var(--on, 0) * (1 - var(--day, 1)) * 0.3)",
          }}
        >
          <Letters text={text} />
        </div>
      )}

      {/* Returns: slices from the back to the face, darker towards the wall. */}
      {Array.from({ length: layers }, (_, i) => {
        const k = i / (layers - 1);
        // Light leaking from under the trim cap onto the first millimetres of the return.
        const leak = variant === "front" && k > 0.8 ? ((k - 0.8) / 0.2) * 0.4 : 0;
        return (
          <div
            key={i}
            aria-hidden
            className={layer}
            style={{
              ...z(standoff + k * depth),
              color: `color-mix(in oklab, var(--lit) calc(var(--on, 0) * ${leak * 100}%), color-mix(in oklab, ${ambient("var(--returns)", 22)} ${100 - (1 - k) * 35}%, #000))`,
            }}
          >
            <Letters text={text} />
          </div>
        );
      })}

      {/* Face */}
      <div aria-hidden className={layer} style={z(front)}>
        {/* Styled per span: --l lives on each letter and must resolve there. */}
        <Letters text={text} style={faceStyle} />
      </div>
    </div>
  );
}
