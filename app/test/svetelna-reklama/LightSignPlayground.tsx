"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ChannelLetters,
  LightBox,
  SignScene,
  type SceneMode,
} from "@/components/light-sign";

const FRONT_COLORS = {
  "Studená biela": { lit: "#ffffff", face: "#f1f0eb" },
  "Teplá biela": { lit: "#fff0d2", face: "#f2efe6" },
  "Žltá IMAGE": { lit: "#ffe03a", face: "#f5cd00" },
} as const;

const RETURNS = { Čierne: "#2a2a2d", Biele: "#e6e6e3", Žlté: "#e9bf00" } as const;

const HALO_COLORS = {
  "Teplá 3000K": "#ffd49a",
  "Studená 6500K": "#dce8ff",
  "Žltá IMAGE": "#ffd400",
} as const;

const HALO_FACES = { "Čierna matná": "#151516", Biela: "#ecebe7" } as const;

export function LightSignPlayground() {
  const [mode, setMode] = useState<SceneMode>("auto");
  const [frontText, setFrontText] = useState("Svetelná\nreklama");
  const [frontColor, setFrontColor] = useState<keyof typeof FRONT_COLORS>("Studená biela");
  const [returns, setReturns] = useState<keyof typeof RETURNS>("Čierne");
  const [boxVariant, setBoxVariant] = useState<"cutout" | "full">("cutout");
  const [boxFrame, setBoxFrame] = useState<"silver" | "black">("black");
  const [haloColor, setHaloColor] = useState<keyof typeof HALO_COLORS>("Teplá 3000K");
  const [haloFace, setHaloFace] = useState<keyof typeof HALO_FACES>("Čierna matná");

  return (
    <div className="min-h-screen bg-background pb-40 text-foreground">
      <header className="page-shell flex flex-col gap-8 pt-[clamp(40px,10vh,120px)] pb-[clamp(40px,8vh,96px)] [container-type:inline-size]">
        <p className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">
          Prototyp · /test/svetelna-reklama
        </p>
        <h1 className="flex flex-col items-start text-[clamp(44px,9cqw,132px)] leading-[0.94] font-extrabold tracking-[-0.045em] [font-stretch:125%]">
          <span className="-ml-[0.1em] rounded-[0.14em] bg-primary px-[0.1em] pb-[0.04em]">
            Svetelná
          </span>
          <span>reklama.</span>
        </h1>
        <p className="max-w-[560px] text-lg leading-normal text-text-tertiary">
          Tri typy svetelnej reklamy postavené v 3D z CSS. Cez deň vidíš
          fyzický objekt s tieňom na stene, pri scrolle sa zotmie a reklama sa
          zapne. Myšou môžeš scénu natáčať.
        </p>
      </header>

      <div className="page-shell flex flex-col gap-[clamp(80px,14vh,180px)]">
        <Demo
          index="01"
          title="3D svetelné písmená"
          text="Hliníkové bočnice, čelo z opálového plexiskla a lemovka. Každé písmeno má vlastný zdroj, preto sa zapínajú postupne."
          controls={
            <>
              <Options label="Svetlo" value={frontColor} options={Object.keys(FRONT_COLORS)} onChange={(v) => setFrontColor(v as keyof typeof FRONT_COLORS)} />
              <Options label="Bočnice" value={returns} options={Object.keys(RETURNS)} onChange={(v) => setReturns(v as keyof typeof RETURNS)} />
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Text</span>
                <textarea
                  value={frontText}
                  onChange={(e) => setFrontText(e.target.value)}
                  rows={2}
                  className="w-[240px] resize-none rounded-[14px] bg-surface px-4 py-3 text-sm font-semibold outline-none focus:bg-surface-hover"
                />
              </label>
            </>
          }
        >
          <SignScene mode={mode} stageClassName="min-h-[clamp(440px,74vh,820px)] px-[5%]">
            <ChannelLetters
              text={frontText}
              lit={FRONT_COLORS[frontColor].lit}
              face={FRONT_COLORS[frontColor].face}
              returns={RETURNS[returns]}
              className="text-[min(15cqw,170px)]"
            />
          </SignScene>
        </Demo>

        <Demo
          index="02"
          title="Svetelný box"
          text="Skrinka z hliníkového profilu s LED moduly vo vnútri. Buď vyfrézované písmená v čiernom čele, alebo celoplošne presvetlené čelo s potlačou."
          controls={
            <>
              <Options label="Čelo" value={boxVariant === "cutout" ? "Vyfrézované písmená" : "Celé presvetlené"} options={["Vyfrézované písmená", "Celé presvetlené"]} onChange={(v) => setBoxVariant(v === "Celé presvetlené" ? "full" : "cutout")} />
              <Options label="Profil" value={boxFrame === "black" ? "Čierny" : "Strieborný"} options={["Čierny", "Strieborný"]} onChange={(v) => setBoxFrame(v === "Čierny" ? "black" : "silver")} />
            </>
          }
        >
          <SignScene mode={mode} yaw={14} stageClassName="min-h-[clamp(400px,66vh,720px)] px-[5%]">
            <LightBox
              variant={boxVariant}
              frame={boxFrame}
              title="IMAGE"
              subtitle="marketing"
              tagline="Svetelné reklamy · Tlač · Textil"
            />
          </SignScene>
        </Demo>

        <Demo
          index="03"
          title="Podsvietené písmená"
          text="Plné písmená na dištančných kolíkoch, LED svieti dozadu na stenu. Okolo písmen vznikne svetelná aura — reklama ostane elegantná aj v noci."
          controls={
            <>
              <Options label="Svetlo" value={haloColor} options={Object.keys(HALO_COLORS)} onChange={(v) => setHaloColor(v as keyof typeof HALO_COLORS)} />
              <Options label="Čelo" value={haloFace} options={Object.keys(HALO_FACES)} onChange={(v) => setHaloFace(v as keyof typeof HALO_FACES)} />
            </>
          }
        >
          <SignScene mode={mode} yaw={-16} stageClassName="min-h-[clamp(400px,66vh,720px)] px-[5%]">
            <ChannelLetters
              text="IMAGE"
              variant="halo"
              lit={HALO_COLORS[haloColor]}
              face={HALO_FACES[haloFace]}
              returns={HALO_FACES[haloFace] === "#151516" ? "#2b2b2e" : "#c9c8c4"}
              className="text-[min(21cqw,240px)]"
            />
          </SignScene>
        </Demo>

        <p className="text-sm text-muted">
          LED panel prototyp:{" "}
          <Link href="/test" className="font-semibold text-foreground underline underline-offset-4">
            /test
          </Link>
        </p>
      </div>

      {/* Lighting mode */}
      <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        <div className="flex items-center gap-1 rounded-full bg-foreground p-1.5 text-sm font-semibold text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45)]">
          {(
            [
              ["auto", "Scroll: deň → noc"],
              ["day", "Deň"],
              ["night", "Noc"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`h-10 rounded-full px-4 transition-colors ${mode === m ? "bg-primary text-foreground" : "hover:bg-white/10"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Demo({
  index,
  title,
  text,
  controls,
  children,
}: {
  index: string;
  title: string;
  text: string;
  controls: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
        <div className="flex max-w-[620px] flex-col gap-4">
          <span className="text-sm font-semibold text-muted">{index}</span>
          <h2 className="text-[clamp(32px,4.4vw,64px)] leading-[0.95] font-extrabold tracking-[-0.045em] [font-stretch:125%]">
            {title}
          </h2>
          <p className="leading-normal text-text-tertiary">{text}</p>
        </div>
        <div className="flex flex-wrap items-end gap-6">{controls}</div>
      </div>
      {children}
    </section>
  );
}

function Options({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">{label}</span>
      <div className="flex flex-wrap gap-1 rounded-full bg-surface p-1">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`h-9 rounded-full px-3.5 text-sm font-semibold transition-colors ${o === value ? "bg-foreground text-white" : "hover:bg-surface-hover"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
