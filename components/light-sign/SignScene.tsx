"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

export type SceneMode = "auto" | "day" | "night";

/** Switches every sign inside `root` on or off, each the way its hardware would. */
export function powerSigns(root: HTMLElement, on: boolean) {
  const tl = gsap.timeline();
  root.querySelectorAll<HTMLElement>("[data-sign]").forEach((sign) => {
    const letters = [...sign.querySelectorAll<HTMLElement>("[data-letter]")];
    gsap.killTweensOf([sign, ...letters]);
    if (!on) {
      // LEDs cut out instantly; the short tail is the driver capacitors draining.
      tl.to([sign, ...letters], { "--on": 0, "--l": 0, duration: 0.09, ease: "power2.in" }, 0);
      return;
    }
    const kind = sign.dataset.sign;
    if (kind === "sequence") {
      // Channel letters are often wired letter by letter: each driver soft-starts in turn.
      const groups = new Map<string, HTMLElement[]>();
      letters.forEach((el) => {
        const k = el.dataset.letter!;
        groups.set(k, [...(groups.get(k) ?? []), el]);
      });
      [...groups.values()].forEach((els, i) => {
        tl.fromTo(
          els,
          { "--l": 0 },
          { "--l": 1, duration: 0.16, ease: "power2.out" },
          0.12 + i * 0.075,
        );
      });
      tl.fromTo(
        sign,
        { "--on": 0 },
        { "--on": 1, duration: 0.12 + groups.size * 0.075, ease: "none" },
        0.12,
      );
    } else if (kind === "flick") {
      // One power supply for the whole cabinet: a brief catch, then full.
      tl.fromTo(sign, { "--on": 0 }, { "--on": 0.55, duration: 0.04 }, 0.1)
        .to(sign, { "--on": 0.08, duration: 0.07 })
        .to(sign, { "--on": 1, duration: 0.22, ease: "power2.out" });
    } else {
      // Dimmable halo drivers ramp up.
      tl.fromTo(sign, { "--on": 0 }, { "--on": 1, duration: 1.1, ease: "power2.inOut" }, 0.1);
    }
  });
  return tl;
}

type SignSceneProps = {
  mode: SceneMode;
  children: ReactNode;
  /** Base camera yaw in degrees, swept a little while scrolling. */
  yaw?: number;
  pitch?: number;
  className?: string;
  /** Stage padding etc. */
  stageClassName?: string;
};

/**
 * A wall the signs hang on. Owns --day (scroll: day → night in auto mode),
 * the camera (scroll sweep + pointer tilt) and the power switch.
 */
export function SignScene({
  mode,
  children,
  yaw = -12,
  pitch = 4,
  className = "",
  stageClassName = "",
}: SignSceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const sweep = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(false);
  const litRef = useRef(false);

  const setPower = (on: boolean, force = false) => {
    if ((!force && litRef.current === on) || !root.current) return;
    litRef.current = on;
    setLit(on);
    powerSigns(root.current, on);
  };

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const power = contextSafe!((on: boolean) => setPower(on));
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // A mode switch starts from a dark sign so the switch-on plays again.
      el.querySelectorAll("[data-sign], [data-letter]").forEach((n) =>
        gsap.set(n, { "--on": 0, "--l": 0 }),
      );
      litRef.current = false;
      setLit(false);

      if (mode === "auto") {
        gsap.set(el, { "--day": 1 });
        // Dusk falls as the scene scrolls to the middle of the screen; lights come on halfway.
        gsap.to(el, {
          "--day": 0,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "center 55%",
            scrub: 0.6,
            onUpdate: (self) => {
              if (self.progress > 0.55) power(true);
              else if (self.progress < 0.4) power(false);
            },
          },
        });
      } else {
        gsap.to(el, { "--day": mode === "day" ? 1 : 0, duration: 0.8, ease: "power2.inOut" });
        ScrollTrigger.create({
          trigger: el,
          start: "top 70%",
          once: true,
          onEnter: () => power(true),
        });
      }

      if (!reduce) {
        gsap.fromTo(
          sweep.current,
          { rotateY: yaw - 9, rotateX: pitch + 3 },
          {
            rotateY: yaw + 9,
            rotateX: pitch - 3,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        const rx = gsap.quickTo(tilt.current, "rotateX", { duration: 0.9, ease: "power3.out" });
        const ry = gsap.quickTo(tilt.current, "rotateY", { duration: 0.9, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 16);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 9);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      } else {
        gsap.set(sweep.current, { rotateY: yaw, rotateX: pitch });
      }
    },
    { scope: root, dependencies: [mode], revertOnUpdate: true },
  );

  return (
    <div
      ref={root}
      className={`relative overflow-hidden rounded-[20px] ${className}`}
      style={{
        background: "color-mix(in oklab, #f3f2ef calc(var(--day, 1) * 100%), #09090a)",
      }}
    >
      {/* Plaster grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          opacity: "calc(0.18 + var(--day, 1) * 0.22)",
        }}
      />
      {/* Night falloff towards the corners */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_35%,rgba(0,0,0,0.55)_100%)]"
        style={{ opacity: "calc(1 - var(--day, 1))" }}
      />
      <div
        className={`relative flex items-center justify-center [container-type:inline-size] [perspective:2200px] ${stageClassName}`}
      >
        <div ref={sweep} className="[transform-style:preserve-3d]">
          <div ref={tilt} className="[transform-style:preserve-3d]">
            {children}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPower(!lit)}
        className="absolute right-4 bottom-4 z-10 inline-flex h-10 items-center gap-2.5 rounded-full bg-white/90 pr-1.5 pl-4 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-white"
      >
        {lit ? "Vypnúť" : "Zapnúť"}
        <span
          aria-hidden
          className={`size-7 rounded-full transition-colors ${lit ? "bg-primary shadow-[0_0_14px_#ffd400]" : "bg-foreground/15"}`}
        />
      </button>
    </div>
  );
}
