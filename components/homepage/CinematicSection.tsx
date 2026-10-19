"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** One continuous scene: an outlined letterform gains depth and its final yellow face. */
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
          const title = select("[data-cinema-title]");
          const titleLines = select("[data-cinema-title-line]");
          const newLabel = select("[data-cinema-new-label]");
          const introCopy = select("[data-cinema-intro-copy]");
          const drawing = select("[data-cinema-drawing]");
          const planes = select("[data-sign-plane]");
          const face = select("[data-sign-face]");
          const edges = select("[data-sign-edge]");
          const glow = select("[data-sign-glow]");
          const guides = select("[data-sign-guides]");
          const details = select("[data-cinema-details]");
          const progress = select("[data-cinema-progress]");

          if (conditions?.reduce) {
            gsap.set(drawing, { rotationX: 0, rotationY: 0, rotationZ: 0 });
            gsap.set(planes[0], {
              x: desktop ? 14 : 7,
              y: desktop ? 16 : 8,
              opacity: 0.55,
            });
            gsap.set(planes[1], {
              x: desktop ? 7 : 3.5,
              y: desktop ? 8 : 4,
              opacity: 0.8,
            });
            gsap.set(planes[2], { x: 0, y: 0, opacity: 1 });
            gsap.set(face, {
              fillOpacity: 1,
              fill: "var(--primary)",
              stroke: "var(--primary)",
            });
            gsap.set(edges, { fillOpacity: 1 });
            gsap.set(glow, { opacity: 0.28 });
            gsap.set([...title, ...titleLines, ...newLabel], {
              autoAlpha: 1,
              y: 0,
            });
            gsap.set([...introCopy, ...guides], { autoAlpha: 0 });
            gsap.set(details, { autoAlpha: 1, y: 0 });
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
          gsap.set(newLabel, { y: 10, autoAlpha: 0 });
          gsap.set(details, { y: 14, autoAlpha: 0 });
          gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

          // The lines enter gently; the wrapper handles their later scroll-driven exit.
          gsap.from(titleLines, {
            y: 10,
            autoAlpha: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: root.current,
              start: "top 80%",
              once: true,
            },
          });

          const sequence = gsap.timeline({
            defaults: { ease: "power3.inOut" },
            scrollTrigger: {
              trigger: root.current,
              start: "top 80px",
              end: "bottom bottom",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          sequence
            .addLabel("drawing", 0)
            .to(guides, { opacity: 0, duration: 1.8 }, "drawing+=0.4")
            .addLabel("dimension", 0.9)
            .to(
              title,
              { y: -16, autoAlpha: 0, duration: 0.75 },
              "dimension+=0.15",
            )
            .to(
              drawing,
              { rotationX: 0, rotationY: 0, rotationZ: 0, duration: 2.9 },
              "dimension",
            )
            .to(
              planes[0],
              {
                x: desktop ? 14 : 7,
                y: desktop ? 16 : 8,
                opacity: 0.55,
                duration: 2.5,
              },
              "dimension",
            )
            .to(
              planes[1],
              {
                x: desktop ? 7 : 3.5,
                y: desktop ? 8 : 4,
                opacity: 0.8,
                duration: 2.5,
              },
              "dimension+=0.15",
            )
            .to(planes[2], { x: 0, y: 0, duration: 2.5 }, "dimension+=0.3")
            .to(face, { fillOpacity: 1, duration: 1.6 }, "dimension+=0.8")
            .to(edges, { fillOpacity: 1, duration: 1.1 }, "dimension+=1.1")
            .to(
              face,
              {
                fill: "var(--primary)",
                stroke: "var(--primary)",
                duration: 1.1,
              },
              "dimension+=2.4",
            )
            .to(glow, { opacity: 0.28, duration: 1.1 }, "dimension+=2.5")
            .to(
              newLabel,
              { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" },
              "dimension+=2.5",
            )
            .to(
              introCopy,
              { y: -12, autoAlpha: 0, duration: 0.65 },
              "dimension+=2.6",
            )
            .addLabel("settled", 4.65)
            .to(
              details,
              { y: 0, autoAlpha: 1, duration: 0.9, ease: "power2.out" },
              "settled",
            )
            // The finished sign stays in this same composition as the section scrolls away.
            .to(progress, { scaleX: 1, duration: 6.4, ease: "none" }, 0);
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
      aria-label="Dáme vašej značke nový rozmer"
      data-screen-label="Cinematic — Od nápadu"
      className="relative h-[220svh] desktop:h-[240svh] motion-reduce:h-auto"
    >
      <div className="sticky top-20 h-[calc(100svh-80px)] min-h-[540px] motion-reduce:relative motion-reduce:top-0">
        <div
          data-cinema-stage
          className="absolute inset-x-[clamp(16px,2.4vw,40px)] top-4 bottom-4 overflow-hidden rounded-[20px] bg-surface-soft"
        >
          <div className="absolute inset-x-[clamp(20px,3.2vw,56px)] top-[clamp(24px,3.2vw,48px)] z-10 flex items-center justify-between gap-5 text-foreground">
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
            data-cinema-title
            className="absolute inset-x-[clamp(20px,3.2vw,56px)] top-[19%] z-10 [container-type:inline-size]"
          >
            <h2 className="text-[clamp(22px,8.2cqw,80px)] leading-[0.98] font-extrabold tracking-[-0.055em] text-foreground [font-stretch:125%]">
              <span data-cinema-title-line className="block whitespace-nowrap">
                Dáme vašej značke
              </span>
              <span data-cinema-title-line className="block">
                nový rozmer<span className="text-primary">.</span>
              </span>
            </h2>
          </div>

          <p
            data-cinema-new-label
            aria-label="Nový IMAGE"
            className="pointer-events-none invisible absolute inset-x-5 top-[46%] z-10 text-center text-[clamp(32px,4.4vw,64px)] leading-none font-extrabold tracking-[-0.045em] text-foreground opacity-0 [font-stretch:125%] sm:top-[39%] desktop:top-[38%]"
          >
            Nový
          </p>

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
            data-cinema-intro-copy
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

          <div
            data-cinema-details
            className="invisible absolute inset-x-[clamp(20px,3.2vw,56px)] bottom-[clamp(28px,4vw,56px)] z-10 flex flex-col items-start justify-between gap-4 text-foreground opacity-0 sm:flex-row sm:items-end"
          >
            <p className="text-sm leading-relaxed text-text-tertiary sm:text-base">
              Od prvého ťahu po posledný detail.
              <br />
              Dizajn, ktorý nezostane na papieri.
            </p>
            <Link
              href="/#realizacie"
              className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold text-foreground"
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
    </section>
  );
}
