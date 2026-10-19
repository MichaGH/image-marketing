"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

export function CinematicSection() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1000px)",
          mobile: "(max-width: 999px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const desktop = context.conditions?.desktop;
          const reduce = context.conditions?.reduce;
          const frame = root.current!.querySelector<HTMLElement>(
            "[data-cinema-frame]",
          )!;
          const image = frame.querySelector("img");
          const top = root.current!.querySelector("[data-cinema-top]");
          const bottom = root.current!.querySelector("[data-cinema-bottom]");
          const caption = root.current!.querySelector("[data-cinema-caption]");
          const gradient = root.current!.querySelector(
            "[data-cinema-gradient]",
          );
          // Register initial styles with this media context so quickSetter writes revert too.
          gsap.set(frame, {
            width: desktop ? "30vw" : "72vw",
            height: desktop ? "40vh" : "34vh",
            borderRadius: 20,
          });
          gsap.set(image, { scale: 1.25 });
          gsap.set(top, { bottom: `calc(50% + ${desktop ? 20 : 17}vh + 2vh)` });
          gsap.set(bottom, { top: `calc(50% + ${desktop ? 20 : 17}vh + 2vh)` });
          gsap.set(caption, { opacity: 0, y: 30 });
          gsap.set(gradient, { opacity: 0 });
          const setFrame = gsap.quickSetter(frame, "css");
          const setImage = gsap.quickSetter(image, "scale");
          const setTop = gsap.quickSetter(top, "bottom");
          const setBottom = gsap.quickSetter(bottom, "top");
          const setCaption = gsap.quickSetter(caption, "css");
          const setGradient = gsap.quickSetter(gradient, "opacity");
          // The original uses cubic in/out over the first 72% of this sticky section.
          const render = (p: number) => {
            const t = Math.min(1, p / 0.72);
            const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
            const height = (desktop ? 40 : 34) + (desktop ? 60 : 66) * eased;
            const cap = Math.min(1, Math.max(0, (p - 0.7) / 0.22));
            setFrame({
              width: `${(desktop ? 30 : 72) + (desktop ? 70 : 28) * eased}vw`,
              height: `${height}vh`,
              borderRadius: 20 * (1 - eased),
            });
            setImage(1.25 - 0.25 * eased);
            setTop(`calc(50% + ${height / 2}vh + 2vh)`);
            setBottom(`calc(50% + ${height / 2}vh + 2vh)`);
            setCaption({ opacity: cap, y: 30 * (1 - cap) });
            setGradient(cap);
          };
          if (reduce) {
            render(1);
            return;
          }
          render(0);
          ScrollTrigger.create({
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => render(self.progress),
            onRefresh: (self) => render(self.progress),
          });
        },
        root,
      );
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section
      ref={root}
      data-screen-label="Cinematic — Od nápadu"
      className="relative h-[240vh] desktop:h-[300vh] motion-reduce:h-screen"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <span
          data-cinema-top
          className="absolute inset-x-0 bottom-[calc(50%+17vh+2vh)] z-2 text-center text-[clamp(44px,7.6vw,140px)] leading-[0.9] font-extrabold tracking-[-0.05em] [font-stretch:125%] desktop:bottom-[calc(50%+20vh+2vh)]"
        >
          Od nápadu
        </span>
        <div
          data-cinema-frame
          className="absolute top-1/2 left-1/2 z-1 h-[34vh] w-[72vw] -translate-1/2 overflow-hidden rounded-[20px] bg-image-cinema desktop:h-[40vh] desktop:w-[30vw]"
        >
          <Image
            src="/images/gallery_11.jpg"
            alt="Ukážka kreatívnej realizácie IMAGE Marketing"
            fill
            sizes="100vw"
            className="object-cover [transform:scale(1.25)]"
          />
          <div
            data-cinema-gradient
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),rgba(0,0,0,0)_45%)] opacity-0"
          />
          <div
            data-cinema-caption
            className="absolute inset-x-[clamp(16px,2.4vw,40px)] bottom-[clamp(24px,4vw,56px)] flex flex-wrap items-end justify-between gap-6 text-white opacity-0"
          >
            <span className="max-w-[900px] text-[clamp(30px,4.2vw,76px)] leading-[0.95] font-extrabold tracking-[-0.045em] [font-stretch:125%]">
              Každý detail
              <br />
              vyrábame sami.
            </span>
            <span className="flex max-w-[340px] flex-col gap-1.5 text-[15px] leading-normal">
              Grafika, výroba aj montáž pod jednou strechou. Bez prekladania
              medzi dodávateľmi, bez prekvapení na faktúre.
            </span>
          </div>
        </div>
        <span
          data-cinema-bottom
          className="absolute inset-x-0 top-[calc(50%+17vh+2vh)] z-2 text-center text-[clamp(44px,7.6vw,140px)] leading-[0.9] font-extrabold tracking-[-0.05em] [font-stretch:125%] desktop:top-[calc(50%+20vh+2vh)]"
        >
          po realizáciu.
        </span>
      </div>
    </section>
  );
}
