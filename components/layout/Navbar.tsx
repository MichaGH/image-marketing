"use client";

import { ConceptLink } from "@/components/ui/ConceptLink";

import Link from "next/link";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LOGO, PHONE } from "@/constants";
import { products } from "@/data/products";
import { navigation } from "@/data/navigation";
import { ArrowLink } from "@/components/ui/ArrowLink";

export function Navbar() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const productButton = useRef<HTMLButtonElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (megaOpen) productButton.current?.focus();
        if (mobileOpen) mobileButton.current?.focus();
        setMegaOpen(false);
        setMobileOpen(false);
      }
      if (event.key === "Tab" && mobileOpen && header.current) {
        const focusable = [
          ...header.current.querySelectorAll<HTMLElement>(
            "a[href],button:not([disabled])",
          ),
        ].filter((el) => el.getClientRects().length);
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMegaOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [megaOpen, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1000px)");
    const onChange = () => {
      setMobileOpen(false);
      setMegaOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const close = () => {
    setMegaOpen(false);
    setMobileOpen(false);
  };
  return (
    <header
      ref={header}
      onMouseLeave={() => setMegaOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setMegaOpen(false);
      }}
      className="sticky top-0 z-50 bg-white/92 backdrop-blur-[14px] backdrop-saturate-[1.4]"
    >
      <div className="page-shell grid h-20 grid-cols-[auto_minmax(0,1fr)] items-center gap-6 desktop:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link
          href="/"
          onMouseEnter={() => setMegaOpen(false)}
          onClick={close}
          aria-label="IMAGE Marketing — domov"
          className="flex items-center justify-self-start"
        >
          <Image
            src={LOGO}
            alt="IMAGE Marketing"
            width={2000}
            height={774}
            preload
            className="h-[34px] w-auto mix-blend-multiply max-[340px]:h-7"
          />
        </Link>
        <nav
          aria-label="Hlavná navigácia"
          className="hidden items-center gap-0.5 justify-self-center rounded-full bg-surface p-1 text-sm font-medium desktop:flex"
        >
          <button
            ref={productButton}
            onMouseEnter={() => setMegaOpen(true)}
            onClick={() => setMegaOpen(!megaOpen)}
            aria-expanded={megaOpen}
            aria-controls="product-menu"
            className={`flex h-10 items-center gap-2 rounded-full px-[18px] text-foreground transition-colors ${megaOpen ? "bg-white" : "bg-transparent"}`}
          >
            Produkty{" "}
            <span className="text-[10px] font-semibold tabular-nums opacity-55">
              09
            </span>
          </button>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setMegaOpen(false)}
              onClick={close}
              className="flex h-10 items-center rounded-full px-[18px] text-foreground transition-colors hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-[18px] justify-self-end">
          <Link
            href="tel:+421907417744"
            className="hidden text-sm font-medium text-text-subtle hover:text-foreground wide:block"
          >
            {PHONE}
          </Link>
          <ArrowLink href="/#kontakt" size="small">
            Dopyt
          </ArrowLink>
          <button
            ref={mobileButton}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Zavrieť menu" : "Otvoriť menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="flex size-12 flex-col items-center justify-center gap-[5px] rounded-full bg-surface p-0 desktop:hidden"
          >
            <span
              className={`h-0.5 w-4 bg-foreground transition-transform ${mobileOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-4 bg-foreground transition-transform ${mobileOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>
      <div
        id="product-menu"
        hidden={!megaOpen}
        className="absolute inset-x-[clamp(16px,2.4vw,40px)] top-20 mx-auto max-w-[1600px] overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.22)] max-desktop:hidden"
      >
        <div className="grid min-h-[380px] grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-2 p-2">
          <div className="grid grid-cols-3 gap-1">
            {products.map((product, index) => (
              <ConceptLink
                key={product.key}
                href={product.href}
                onClick={close}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={`flex flex-col justify-between gap-[18px] rounded-[14px] px-[22px] py-5 text-foreground transition-colors duration-150 ${active === index ? "bg-primary" : "bg-surface-soft"}`}
              >
                <span className="text-xs font-semibold tabular-nums">
                  {product.num}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-[19px] font-bold tracking-tight [font-stretch:112%]">
                    {product.name}
                  </span>
                  <span className="text-[13px] text-text-tertiary">
                    {product.short}
                  </span>
                </span>
              </ConceptLink>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-[14px] bg-menu-image">
            {products.map((product, index) => (
              <Image
                key={product.key}
                src={product.img}
                alt=""
                fill
                sizes="33vw"
                className={`object-cover transition-opacity duration-250 ${index === active ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <Link
              href="/#realizacie"
              onClick={close}
              className="absolute inset-x-2.5 bottom-2.5 flex h-12 items-center justify-between rounded-full bg-foreground py-0 pr-2 pl-5 text-sm font-semibold text-white"
            >
              Všetky produkty{" "}
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-primary text-foreground"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
      <nav
        id="mobile-menu"
        aria-label="Mobilná navigácia"
        hidden={!mobileOpen}
        className="fixed inset-x-0 top-20 z-49 h-[calc(100dvh-80px)] overflow-auto bg-white px-4 pt-2 pb-8 desktop:hidden"
      >
        <div className="mb-7 flex flex-col">
          {products.map((product) => (
            <ConceptLink
              key={product.key}
              href={product.href}
              onClick={close}
              className="flex items-center justify-between border-b border-border py-3.5 text-xl font-semibold tracking-tight text-foreground [font-stretch:112%]"
            >
              {product.name}
              <span className="text-xs text-muted">{product.num}</span>
            </ConceptLink>
          ))}
        </div>
        <div className="mb-7 flex flex-col gap-1 text-[34px] font-extrabold tracking-[-0.04em] text-foreground [font-stretch:125%]">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={close}>
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="tel:+421907417744"
          className="text-lg font-semibold text-foreground"
        >
          {PHONE}
        </Link>
      </nav>
    </header>
  );
}
