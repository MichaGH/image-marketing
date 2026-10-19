"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** A drawn letterform becomes a dimensional sign, then finds its place in the world. */
export function CinematicSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 1000px)",
          mobile: "(max-width: 999px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        ({ conditions }) => {
          const desktop = conditions?.desktop;
          const select = gsap.utils.selector(root);
          const intro = select("[data-cinema-intro]");
          const drawing = select("[data-cinema-drawing]");
          const planes = select("[data-sign-plane]");
          const face = select("[data-sign-face]");
          const edges = select("[data-sign-edge]");
          const glow = select("[data-sign-glow]");
          const guides = select("[data-sign-guides]");
          const curtains = select("[data-cinema-curtain]");
          const outcome = select("[data-cinema-outcome-line]");
          const details = select("[data-cinema-details]");
          const header = select("[data-cinema-header]");
          const progress = select("[data-cinema-progress]");

          if (conditions?.reduce) {
            gsap.set([...intro, ...drawing, ...curtains], { autoAlpha: 0 });
            gsap.set([...outcome, ...details], {
              autoAlpha: 1,
              y: 0,
              yPercent: 0,
            });
            gsap.set(header, { color: "#fff" });
            gsap.set(progress, { scaleX: 1 });
            return;
          }

          gsap.set(drawing, {
            rotationX: 18,
            rotationY: -18,
            rotationZ: -7,
            transformPerspective: 1400,
            transformOrigin: "50% 50%",
          });
          gsap.set(planes[0], {
            x: desktop ? -62 : -25,
            y: desktop ? 42 : 24,
            opacity: 0.16,
          });
          gsap.set(planes[1], { x: 0, y: 0, opacity: 0.35 });
          gsap.set(planes[2], {
            x: desktop ? 62 : 25,
            y: desktop ? -42 : -24,
            opacity: 1,
          });
          gsap.set(face, { fillOpacity: 0 });
          gsap.set(glow, { opacity: 0 });
          gsap.set(outcome, { y: 0, yPercent: 112 });
          gsap.set(details, { y: 20, autoAlpha: 0 });
          gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

          const sequence = gsap.timeline({
            defaults: { ease: "power3.inOut" },
            scrollTrigger: {
              trigger: root.current,
              start: "top 80px",
              end: "bottom bottom",
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          });

          sequence
            .addLabel("drawing", 0)
            .to(guides, { opacity: 0, duration: 1.4 }, "drawing+=0.4")
            .to(intro, { y: -28, opacity: 0, duration: 1.1 }, "drawing+=0.85")
            .addLabel("dimension", 1.1)
            .to(
              drawing,
              { rotationX: 0, rotationY: 0, rotationZ: 0, duration: 2.0 },
              "dimension",
            )
            .to(
              planes[0],
              {
                x: desktop ? 14 : 7,
                y: desktop ? 16 : 8,
                opacity: 0.55,
                duration: 1.7,
              },
              "dimension",
            )
            .to(
              planes[1],
              {
                x: desktop ? 7 : 3.5,
                y: desktop ? 8 : 4,
                opacity: 0.8,
                duration: 1.7,
              },
              "dimension+=0.12",
            )
            .to(planes[2], { x: 0, y: 0, duration: 1.7 }, "dimension+=0.24")
            .to(face, { fillOpacity: 1, duration: 1.2 }, "dimension+=0.6")
            .to(edges, { fillOpacity: 1, duration: 0.8 }, "dimension+=0.8")
            .to(
              face,
              {
                fill: "var(--primary)",
                stroke: "var(--primary)",
                duration: 0.8,
              },
              "dimension+=1.4",
            )
            .to(glow, { opacity: 0.35, duration: 0.8 }, "dimension+=1.6")
            .addLabel("reality", 3.35)
            .to(drawing, { yPercent: -8, opacity: 0, duration: 0.8 }, "reality")
            .to(
              curtains,
              {
                yPercent: -101,
                duration: 1.9,
                stagger: 0.14,
                ease: "expo.inOut",
              },
              "reality+=0.15",
            )
            .to(header, { color: "#fff", duration: 0.6 }, "reality+=1.35")
            .addLabel("outcome", 5.0)
            .to(
              outcome,
              { yPercent: 0, duration: 1.2, stagger: 0.14, ease: "power4.out" },
              "outcome",
            )
            .to(
              details,
              {
                y: 0,
                autoAlpha: 1,
                duration: 1.1,
                stagger: 0.1,
                ease: "power2.out",
              },
              "outcome+=0.45",
            )
            // A short final hold lets the finished scene register before the portfolio arrives.
            .to(progress, { scaleX: 1, duration: 7.6, ease: "none" }, 0);
        },
        root,
      );
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="od-napadu"
      aria-label="Od nápadu po realizáciu"
      data-screen-label="Cinematic — Od nápadu"
      className="relative h-[270svh] desktop:h-[300svh] motion-reduce:h-auto"
    >
      <div className="sticky top-20 h-[calc(100svh-80px)] min-h-[540px] motion-reduce:relative motion-reduce:top-0">
        <div
          data-cinema-stage
          className="absolute inset-x-[clamp(16px,2.4vw,40px)] top-4 bottom-4 overflow-hidden rounded-[20px] bg-foreground"
        >
          <div data-cinema-photo className="absolute inset-0">
            <Image
              src="/images/cinematic/image-sign-dusk.png"
              alt="Priestorové svetelné označenie IMAGE na architektonickej fasáde — vizuálny koncept"
              fill
              sizes="100vw"
              className="object-cover object-[66%_center] desktop:object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,transparent_35%,rgba(0,0,0,0.7)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.35),transparent_60%)]" />
          </div>

          <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3">
            {[0, 1, 2].map((column) => (
              <div
                key={column}
                data-cinema-curtain
                className="relative -left-px h-full w-[calc(100%+2px)] bg-surface-soft will-change-transform"
              />
            ))}
          </div>

          <div
            data-cinema-header
            className="absolute inset-x-[clamp(20px,3.2vw,56px)] top-[clamp(24px,3.2vw,48px)] z-10 flex items-center justify-between gap-5 text-foreground"
          >
            <span className="flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.12em] uppercase sm:text-xs">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-primary"
              />
              Od nápadu po realizáciu
            </span>
            <span
              aria-hidden="true"
              className="relative h-px w-12 overflow-hidden bg-current/20 sm:w-20"
            >
              <span
                data-cinema-progress
                className="absolute inset-0 origin-left bg-current [transform:scaleX(0)]"
              />
            </span>
          </div>

          <div
            data-cinema-intro
            className="absolute top-[19%] left-[clamp(20px,3.2vw,56px)] z-10"
          >
            <h2 className="text-[clamp(34px,5.2vw,84px)] leading-[0.98] font-extrabold tracking-[-0.055em] text-foreground [font-stretch:125%]">
              Dáme nápadu
              <br />
              tretí rozmer<span className="text-primary">.</span>
            </h2>
          </div>

          <div
            aria-hidden="true"
            data-cinema-drawing
            className="absolute top-[48%] left-[6%] z-5 h-[25%] w-[88%] [transform-style:preserve-3d] sm:top-[46%] sm:h-[32%] desktop:top-[43%] desktop:left-[11%] desktop:h-[38%] desktop:w-[78%]"
          >
            <svg
              data-sign-guides
              viewBox="0 0 1200 300"
              className="absolute -inset-x-[5%] -inset-y-[12%] h-[124%] w-[110%] overflow-visible text-foreground/20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                d="M0 28h1200M0 258h1200M36 0v300M1164 0v300"
                strokeDasharray="3 7"
              />
              <path d="M16 28h40M36 8v40M1144 28h40M1164 8v40M16 258h40M36 238v40M1144 258h40M1164 238v40" />
            </svg>
            {[0, 1, 2].map((plane) => (
              <svg
                key={plane}
                data-sign-plane
                viewBox="0 0 1200 300"
                className="absolute inset-0 h-full w-full overflow-visible text-foreground"
                aria-hidden="true"
              >
                <text
                  data-sign-face={plane === 2 ? "" : undefined}
                  data-sign-edge={plane < 2 ? "" : undefined}
                  x="590"
                  y="226"
                  textAnchor="middle"
                  fontFamily="var(--font-archivo), sans-serif"
                  fontSize="250"
                  fontWeight="800"
                  fontStretch="125%"
                  letterSpacing="-18"
                  fill="currentColor"
                  fillOpacity={0}
                  stroke="currentColor"
                  strokeWidth={plane === 2 ? 2.5 : 1}
                  paintOrder="stroke fill"
                >
                  IMAGE.
                </text>
              </svg>
            ))}
            <svg
              data-sign-glow
              viewBox="0 0 1200 300"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-primary opacity-0 blur-xl"
              aria-hidden="true"
            >
              <text
                x="590"
                y="226"
                textAnchor="middle"
                fontFamily="var(--font-archivo), sans-serif"
                fontSize="250"
                fontWeight="800"
                fontStretch="125%"
                letterSpacing="-18"
                fill="currentColor"
              >
                IMAGE.
              </text>
            </svg>
          </div>

          <div
            data-cinema-intro
            className="absolute right-[clamp(20px,3.2vw,56px)] bottom-[clamp(28px,4vw,56px)] left-[clamp(20px,3.2vw,56px)] z-10 flex items-end justify-between gap-6 text-foreground"
          >
            <p className="max-w-[240px] text-sm leading-relaxed text-text-tertiary sm:max-w-[300px] sm:text-base">
              Najskôr čiara. Potom tvar.
              <br />
              Nakoniec vaša značka.
            </p>
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-lg"
            >
              ↓
            </span>
          </div>

          <div className="absolute inset-x-[clamp(20px,3.2vw,56px)] bottom-[clamp(28px,4vw,56px)] z-10 flex flex-col items-start justify-between gap-7 text-white desktop:flex-row desktop:items-end">
            <div
              role="heading"
              aria-level={2}
              aria-label="Z nápadu. Do reality."
              className="text-[clamp(44px,6.3vw,108px)] leading-[0.95] font-extrabold tracking-[-0.055em] [font-stretch:125%]"
            >
              <span className="block overflow-hidden pb-[0.08em]">
                <span
                  data-cinema-outcome-line
                  aria-hidden="true"
                  className="block [transform:translateY(112%)]"
                >
                  Z nápadu.
                </span>
              </span>
              <span className="-mt-[0.06em] block overflow-hidden pb-[0.08em]">
                <span
                  data-cinema-outcome-line
                  aria-hidden="true"
                  className="block text-primary [transform:translateY(112%)]"
                >
                  Do reality.
                </span>
              </span>
            </div>
            <div
              data-cinema-details
              className="flex max-w-[290px] flex-col items-start gap-5 opacity-0"
            >
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                Od prvého ťahu po posledný detail.
                <br />
                Dizajn, ktorý nezostane na papieri.
              </p>
              <Link
                href="/#realizacie"
                className="group inline-flex items-center gap-3 text-sm font-semibold text-white"
              >
                Pozrieť realizácie
                <span
                  aria-hidden="true"
                  className="flex size-8 items-center justify-center rounded-full bg-primary text-foreground transition-transform group-hover:translate-y-0.5"
                >
                  ↓
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
