"use client";

import { ConceptLink } from "@/components/ui/ConceptLink";

import Link from "next/link";

import Image from "next/image";
import { useRef, useState } from "react";
import { HERO_SPEED } from "@/constants";
import { products } from "@/data/products";
import { gsap, useGSAP, CustomEase } from "@/lib/gsap";
import { ArrowLink } from "@/components/ui/ArrowLink";

export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const current = useRef(0);
  const cycle = useRef<gsap.core.Tween | null>(null);
  const progress = useRef<gsap.core.Tween | null>(null);
  const paused = useRef(false);
  const reduced = useRef(false);
  const product = products[active];
  const go = useRef<(index: number) => void>(() => {});
  useGSAP(
    (_, contextSafe) => {
      go.current = contextSafe!((index: number) => {
        cycle.current?.kill();
        progress.current?.kill();
        const previous = current.current;
        if (index !== previous) {
          const slides =
            root.current!.querySelectorAll<HTMLElement>("[data-hero-slide]");
          slides.forEach((slide, i) => {
            gsap.killTweensOf(slide);
            if (i !== previous && i !== index)
              gsap.set(slide, { zIndex: 0, clipPath: "inset(100% 0 0 0)" });
          });
          gsap.set(slides[previous], {
            zIndex: 1,
            clipPath: "inset(0% 0 0 0)",
          });
          gsap.fromTo(
            slides[index],
            { zIndex: 2, clipPath: "inset(100% 0 0 0)" },
            {
              clipPath: "inset(0% 0 0 0)",
              duration: reduced.current ? 0 : 1,
              ease: CustomEase.create("hero-wipe", ".75,0,.15,1"),
            },
          );
          gsap.fromTo(
            slides[index].querySelector("img"),
            { scale: 1.12 },
            {
              scale: 1,
              duration: reduced.current ? 0 : 1.6,
              ease: CustomEase.create("hero-image", ".2,.8,.1,1"),
              overwrite: true,
            },
          );
        }
        current.current = index;
        setActive(index);
        root
          .current!.querySelectorAll<HTMLElement>("[data-hero-fill]")
          .forEach((fill, i) => gsap.set(fill, { scaleX: i < index ? 1 : 0 }));
        if (!reduced.current) {
          progress.current = gsap.to(`[data-hero-fill="${index}"]`, {
            scaleX: 1,
            duration: HERO_SPEED,
            ease: "none",
            paused: paused.current,
          });
          cycle.current = gsap.delayedCall(HERO_SPEED, () =>
            go.current((current.current + 1) % products.length),
          );
          if (paused.current) cycle.current.pause();
        }
      });
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          reduced.current = !!context.conditions?.reduce;
          const ease = CustomEase.create("hero-entrance", ".2,.8,.1,1");
          if (!reduced.current)
            gsap.from("[data-verb-word]", {
              yPercent: 105,
              duration: 0.9,
              stagger: 0.1,
              ease,
            });
          gsap.set("[data-hero-slide]", {
            clipPath: "inset(100% 0 0 0)",
            zIndex: 0,
          });
          gsap.set(`[data-hero-slide="${current.current}"]`, {
            clipPath: "inset(0% 0 0 0)",
            zIndex: 2,
          });
          if (!reduced.current) {
            progress.current = gsap.fromTo(
              `[data-hero-fill="${current.current}"]`,
              { scaleX: 0 },
              { scaleX: 1, duration: HERO_SPEED, ease: "none" },
            );
            cycle.current = gsap.delayedCall(HERO_SPEED, () =>
              go.current((current.current + 1) % products.length),
            );
          }
          return () => {
            cycle.current?.kill();
            progress.current?.kill();
          };
        },
        root,
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  const pause = () => {
    paused.current = true;
    cycle.current?.pause();
    progress.current?.pause();
  };
  const resume = () => {
    paused.current = false;
    cycle.current?.resume();
    progress.current?.resume();
  };

  return (
    <section ref={root} data-screen-label="Hero" className="page-shell py-4">
      <div className="grid grid-cols-1 gap-4 desktop:min-h-[clamp(560px,calc(100vh-112px),880px)] desktop:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col justify-between gap-10 pt-[clamp(16px,3vh,40px)] pb-1 [container-type:inline-size]">
          <h1 className="mx-0 my-auto flex flex-col items-start gap-[0.04em] text-[clamp(36px,9.4cqw,108px)] leading-[0.94] font-extrabold tracking-[-0.045em] text-foreground [font-stretch:125%]">
            {["Navrhneme.", "Vyrobíme.", "Namontujeme."].map((word, i) => (
              <span
                key={word}
                className={`-ml-[0.1em] block overflow-hidden rounded-[0.14em] px-[0.1em] pt-[0.02em] pb-[0.04em] transition-colors duration-350 ${i === active % 3 ? "bg-primary" : "bg-transparent"}`}
              >
                <span data-verb-word className="block">
                  {word}
                </span>
              </span>
            ))}
          </h1>
          <div className="flex max-w-[440px] flex-col gap-7">
            <p className="m-0 text-[17px] leading-normal text-pretty text-text-secondary">
              Svetelné reklamy, veľkoplošná tlač, textil, výstavné systémy aj
              darčeky s logom. Navrhneme ich, vyrobíme a osadíme — jeden
              partner, jedna zodpovednosť.
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
              <ArrowLink href="/#kontakt" size="large">
                Nezáväzný dopyt
              </ArrowLink>
              <Link
                href="/#realizacie"
                className="flex items-center gap-2.5 text-[15px] font-semibold whitespace-nowrap text-foreground hover:text-text-tertiary"
              >
                Pozrieť realizácie <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>
        </div>
        <div
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) resume();
          }}
          aria-roledescription="karusel"
          aria-label="Naše produkty"
          className="relative min-h-[440px] overflow-hidden rounded-[20px] bg-hero-background sm:min-h-[520px] desktop:min-h-0"
        >
          {products.map((slide, i) => (
            <div
              key={slide.key}
              data-hero-slide={i}
              className={`absolute inset-0 ${i === 0 ? "z-2" : "z-0 [clip-path:inset(100%_0_0_0)]"}`}
            >
              <Image
                src={slide.img}
                alt={slide.name}
                fill
                sizes="(min-width: 1000px) 45vw, 100vw"
                preload={i === 0}
                loading={i === 0 ? undefined : "eager"}
                className="object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-x-4 top-4 z-5 grid grid-cols-9 gap-1">
            {products.map((slide, i) => (
              <button
                key={slide.key}
                onClick={() => go.current(i)}
                aria-label={slide.name}
                aria-pressed={i === active}
                className="block h-4 border-0 bg-transparent px-0 py-1.5"
              >
                <span className="relative block h-[3px] overflow-hidden rounded-sm bg-white/50">
                  <span
                    data-hero-fill={i}
                    className="absolute inset-0 origin-left [transform:scaleX(0)] bg-primary"
                  />
                </span>
              </button>
            ))}
          </div>
          <ConceptLink
            href={product.href}
            className="absolute bottom-4 left-4 z-5 flex max-w-[calc(100%-32px)] items-center gap-4 rounded-full bg-white py-2 pr-2 pl-[22px] text-foreground"
          >
            <span className="flex min-w-0 flex-col gap-px">
              <span className="text-base font-bold tracking-tight [font-stretch:110%]">
                {product.name}
              </span>
              <span className="text-xs text-muted">
                {product.num}/09 — {product.short}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg"
            >
              →
            </span>
          </ConceptLink>
        </div>
      </div>
    </section>
  );
}
