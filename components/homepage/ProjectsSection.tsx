"use client";

import { ConceptLink } from "@/components/ui/ConceptLink";

import Image from "next/image";
import { useState } from "react";
import { categories, projects } from "@/data/projects";
import { ArrowLink } from "@/components/ui/ArrowLink";

export function ProjectsSection() {
  const [filter, setFilter] = useState("all");
  const matches = (cats: readonly string[]) =>
    filter === "all" || cats.includes(filter);
  const filters = [{ key: "all", label: "Všetko" }, ...categories];
  return (
    <section
      id="realizacie"
      data-screen-label="Realizácie"
      className="page-shell pt-[clamp(48px,6vw,88px)] pb-[clamp(40px,5vw,72px)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 pb-5">
        <h2 className="m-0 text-[clamp(32px,3.6vw,60px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-foreground [font-stretch:125%]">
          Realizácie
        </h2>
        <div
          aria-label="Filtrovať realizácie"
          className="flex flex-wrap gap-0.5 rounded-3xl bg-surface p-1"
        >
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
              className={`flex h-[38px] items-center gap-1.5 rounded-full border-0 px-4 text-sm font-medium transition-colors hover:text-foreground ${filter === item.key ? "bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.12)]" : "bg-transparent text-muted"}`}
            >
              {item.label}
              <span className="self-start pt-[9px] text-[10px] font-semibold tabular-nums opacity-50">
                {item.key === "all"
                  ? projects.length
                  : projects.filter((p) =>
                      (p.cats as readonly string[]).includes(item.key),
                    ).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid auto-rows-[260px] grid-cols-1 gap-2 sm:auto-rows-[240px] sm:grid-cols-2 desktop:auto-rows-[clamp(170px,16.5vw,290px)] desktop:grid-cols-6">
        {projects.map((project, i) => {
          const match = matches(project.cats);
          const large = i === 0 || i === 1 || i === 10;
          const col = project.col.split(" / "),
            row = project.row.split(" / ");
          return (
            <ConceptLink
              key={project.slug}
              href={project.href}
              data-project={project.slug}
              data-matched={match}
              style={
                {
                  "--project-col": `${col[0]} / ${col[1]}`,
                  "--project-row": `${row[0]} / ${row[1]}`,
                } as React.CSSProperties
              }
              className={`group relative overflow-hidden rounded-[14px] bg-image-placeholder text-foreground transition-[opacity,filter] duration-350 desktop:col-[var(--project-col)] desktop:row-[var(--project-row)] ${large ? "sm:col-span-2" : "sm:col-span-1"} ${i === 0 ? "sm:row-span-2" : "sm:row-span-1"} ${match ? "opacity-100" : "opacity-[0.18] grayscale"}`}
            >
              <Image
                src={project.img}
                alt={project.name}
                fill
                sizes={
                  i === 0 || i === 1 || i === 10
                    ? "(min-width: 1000px) 33vw, 100vw"
                    : "(min-width: 1000px) 17vw, (min-width: 640px) 50vw, 100vw"
                }
                className={`object-cover transition-transform duration-800 ease-[cubic-bezier(.2,.8,.1,1)] ${match ? "group-hover:scale-[1.06] group-focus-visible:scale-[1.06]" : ""}`}
              />
              <span className="absolute inset-x-2 bottom-2 flex items-stretch justify-between gap-2">
                <span
                  className={`flex min-w-0 flex-col gap-0.5 rounded-xl bg-white px-3.5 py-2 text-foreground transition-colors duration-250 ${match ? "group-hover:bg-primary group-focus-visible:bg-primary" : ""}`}
                >
                  <span className="text-[15px] font-bold tracking-[-0.015em] [font-stretch:110%]">
                    {project.name}
                  </span>
                  <span className="text-xs leading-[normal] text-text-subtle">
                    {project.cats
                      .map(
                        (key) =>
                          categories.find((cat) => cat.key === key)?.label,
                      )
                      .join(" · ")}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex size-11 -translate-x-2 items-center justify-center self-end rounded-full bg-primary text-base text-foreground opacity-0 transition-[opacity,transform] duration-250 ${match ? "group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" : ""}`}
                >
                  →
                </span>
              </span>
            </ConceptLink>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
        <span aria-live="polite" className="text-sm text-text-tertiary">
          {filter === "all"
            ? `Výber z ${projects.length} kategórií realizácií`
            : `${projects.filter((p) => matches(p.cats)).length} z ${projects.length} — ${categories.find((c) => c.key === filter)?.label}`}
        </span>
        <ArrowLink href="/#realizacie" size="small" light>
          Všetky realizácie
        </ArrowLink>
      </div>
    </section>
  );
}
