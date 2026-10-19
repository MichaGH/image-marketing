"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { processSteps } from "@/data/about";
import { gsap, useGSAP, ScrollTrigger, CustomEase } from "@/lib/gsap";

export function ProcessSection() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const cards = [
            ...root.current!.querySelectorAll<HTMLElement>(
              "[data-process-card]",
            ),
          ];
          const fills = [
            ...root.current!.querySelectorAll<HTMLElement>(
              "[data-process-fill]",
            ),
          ];
          const labels = [
            ...root.current!.querySelectorAll<HTMLElement>(
              "[data-process-label]",
            ),
          ];
          const titles = root.current!.querySelector<HTMLElement>(
            "[data-process-titles]",
          );
          const ease = (t: number) =>
            t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
          const clamp = gsap.utils.clamp(0, 1);
          if (context.conditions?.reduce) return;
          gsap.set(cards, {
            y: 0,
            yPercent: (i) => (i === 0 ? 0 : 108),
            scale: 1,
            filter: "brightness(1)",
          });
          gsap.set(fills, { scaleX: (i) => (i === 0 ? 1 : 0) });
          gsap.set(labels, {
            color: (i) => (i === 0 ? "#fff" : "var(--process-muted)"),
          });
          gsap.set(titles, { yPercent: 0 });
          // Setters update the source's exact scroll formulas without a React render per frame.
          const setCards = cards.map((card) => gsap.quickSetter(card, "css"));
          const setFills = fills.map((fill) =>
            gsap.quickSetter(fill, "scaleX"),
          );
          const setLabels = labels.map((label) =>
            gsap.quickSetter(label, "color"),
          );
          const shiftTitle = contextSafe!((index: number) => {
            gsap.to(titles, {
              yPercent: (-index * 100) / processSteps.length,
              duration: 0.6,
              ease: CustomEase.create("process-title", ".7,0,.2,1"),
              overwrite: true,
            });
            setActive(index);
          });
          const render = (p: number) => {
            const q = clamp((p - 0.04) / 0.86) * 2;
            const index = Math.min(2, Math.round(q));
            if (index !== activeRef.current) {
              activeRef.current = index;
              shiftTitle(index);
            }
            cards.forEach((_, k) => {
              const tIn = k === 0 ? 1 : ease(clamp(q - (k - 1)));
              const above = Math.max(0, Math.min(2, q) - k);
              setCards[k]({
                yPercent: 108 * (1 - tIn),
                scale: 1 - Math.min(above, 2) * 0.06,
                filter: `brightness(${1 - Math.min(above, 1) * 0.55})`,
              });
              setFills[k](clamp(q - k + 1));
              setLabels[k](k === index ? "#fff" : "var(--process-muted)");
            });
          };
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
      data-screen-label="Cinematic — Proces"
      className="relative h-[280vh] bg-foreground text-white desktop:h-[320vh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-screen overflow-hidden motion-reduce:relative motion-reduce:h-auto">
        <div className="page-shell grid h-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-[clamp(20px,3vw,56px)] pt-[104px] pb-[clamp(24px,4vh,48px)] desktop:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] desktop:grid-rows-[minmax(0,1fr)] motion-reduce:grid-rows-none">
          <div className="flex min-h-0 min-w-0 flex-col justify-between gap-6 [container-type:inline-size]">
            <span className="self-start rounded-full bg-dark-surface px-3.5 py-2 text-[13px] font-semibold text-dark-muted">
              Ako pracujeme
            </span>
            <div className="flex flex-col gap-[clamp(12px,2vh,24px)] motion-reduce:hidden">
              <div className="relative h-[clamp(36px,13.6cqw,136px)] overflow-hidden">
                <div data-process-titles>
                  {processSteps.map((step) => (
                    <div
                      key={step.num}
                      className="flex h-[clamp(36px,13.6cqw,136px)] items-end gap-[0.25em] text-[clamp(40px,15cqw,150px)] leading-[0.86] font-extrabold tracking-[-0.055em] [font-stretch:125%]"
                    >
                      <span className="text-primary">{step.num}</span>
                      <span>{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <span className="min-h-[4.5em] max-w-[440px] text-[clamp(15px,1.15vw,18px)] leading-normal text-dark-muted">
                {processSteps[active].text}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 motion-reduce:hidden">
              {processSteps.map((step, i) => (
                <span key={step.num} className="flex flex-col gap-2.5">
                  <span className="relative block h-[3px] overflow-hidden rounded-sm bg-progress-track">
                    <span
                      data-process-fill
                      className={`absolute inset-0 origin-left bg-primary ${i > 0 ? "[transform:scaleX(0)]" : ""}`}
                    />
                  </span>
                  <span
                    data-process-label
                    className={`text-[13px] font-semibold transition-colors duration-300 ${i === 0 ? "text-white" : "text-process-muted"}`}
                  >
                    {step.title}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="relative min-h-0 motion-reduce:grid motion-reduce:gap-6">
            {processSteps.map((step, i) => (
              <div
                key={step.num}
                data-process-card
                className={`absolute inset-0 origin-top overflow-hidden rounded-[20px] bg-dark-surface shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)] motion-reduce:relative motion-reduce:min-h-[380px] ${i > 0 ? "[transform:translateY(108%)] motion-reduce:[transform:none]" : ""}`}
              >
                <Image
                  src={step.img}
                  alt={step.title}
                  fill
                  sizes="(min-width: 1000px) 58vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute top-4 left-4 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-foreground">
                  {step.tag}
                </span>
                <div className="absolute inset-x-0 bottom-0 hidden bg-black/80 p-5 motion-reduce:block">
                  <h3 className="mb-2 text-2xl font-bold">
                    <span className="text-primary">{step.num}</span>{" "}
                    {step.title}
                  </h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
