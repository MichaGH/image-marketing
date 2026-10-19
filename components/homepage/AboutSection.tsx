"use client";

import { ConceptLink } from "@/components/ui/ConceptLink";

import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import { products } from "@/data/products";
import { aboutLinks } from "@/data/about";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { gsap, useGSAP, CustomEase } from "@/lib/gsap";

const images = [
  "/images/gallery_09.jpg",
  ...aboutLinks.map((link) => products[link.p].img),
];

export function AboutSection() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);
  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      root
        .current!.querySelectorAll("[data-about-image]")
        .forEach((image, i) => {
          gsap.to(image, {
            opacity: i === active + 1 ? 1 : 0,
            duration: reduce ? 0 : 0.45,
            overwrite: true,
          });
          gsap.to(image, {
            scale: i === active + 1 ? 1 : 1.06,
            duration: reduce ? 0 : 1.2,
            ease: CustomEase.create("about-image", ".2,.8,.1,1"),
            overwrite: "auto",
          });
        });
    },
    { scope: root, dependencies: [active] },
  );
  return (
    <section
      ref={root}
      id="o-nas"
      data-screen-label="O nás"
      className="page-shell pt-[clamp(24px,3vw,48px)] pb-[clamp(56px,7vw,112px)]"
    >
      <div className="grid grid-cols-1 items-stretch gap-[clamp(28px,4vw,72px)] desktop:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="relative min-h-[380px] overflow-hidden rounded-[20px] bg-image-placeholder desktop:min-h-[560px]">
          {images.map((image, i) => (
            <Image
              key={image}
              data-about-image
              src={image}
              alt=""
              fill
              sizes="(min-width: 1000px) 50vw, 100vw"
              className={`object-cover ${i === 0 ? "opacity-100" : "[transform:scale(1.06)] opacity-0"}`}
            />
          ))}
          <span className="absolute top-4 left-4 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-foreground">
            {active < 0 ? "Naše realizácie" : aboutLinks[active].word}
          </span>
        </div>
        <div className="flex flex-col justify-between gap-12 py-[clamp(4px,1vw,16px)]">
          <div className="flex flex-col gap-7">
            <span className="self-start rounded-full bg-surface px-3.5 py-2 text-[13px] font-semibold">
              O nás
            </span>
            <p className="m-0 text-[clamp(26px,2.7vw,46px)] leading-[1.14] font-semibold tracking-[-0.035em] text-pretty text-foreground [font-stretch:108%]">
              Sme IMAGE Marketing z Tvrdošína. S partnermi navrhujeme a vyrábame{" "}
              {aboutLinks.map((link, i) => (
                <Fragment key={link.word}>
                  <ConceptLink
                    href={products[link.p].href}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(-1)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(-1)}
                    className="rounded-[0.18em] px-[0.08em] text-foreground shadow-[inset_0_-0.12em_0_var(--primary)] transition-colors hover:bg-primary focus-visible:bg-primary"
                  >
                    {link.word}
                  </ConceptLink>
                  {link.sep}
                </Fragment>
              ))}{" "}
              — všetko, čím sa značka ukáže svetu.
            </p>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <span className="max-w-[360px] text-[15px] leading-normal text-muted">
              „Sen je vaša kreatívna vízia budúcnosti. Musíte vystúpiť z
              komfortnej zóny.“
            </span>
            <ArrowLink href="/#o-nas">Viac o nás</ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
