"use client";

import Link from "next/link";

import { useState, type ReactNode } from "react";
import { products } from "@/data/products";
import { EMAIL } from "@/constants";

export function ContactSection({ children }: { children: ReactNode }) {
  const [picks, setPicks] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  return (
    <section
      id="kontakt"
      data-screen-label="Kontakt"
      className="border-t border-footer-border bg-foreground text-white"
    >
      <div className="page-shell pt-[clamp(48px,6vw,96px)] pb-8">
        <div className="grid grid-cols-1 items-start gap-[clamp(32px,5vw,96px)] desktop:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-7">
            <h2 className="m-0 text-[clamp(40px,5.7vw,108px)] leading-[0.94] font-extrabold tracking-[-0.045em] text-white [font-stretch:125%]">
              Máte projekt?
              <br />
              <span className="text-primary">Ozvite sa.</span>
            </h2>
            <Link
              href={`mailto:${EMAIL}`}
              className="self-start border-b-[3px] border-primary pb-1.5 text-[clamp(20px,2vw,30px)] font-semibold tracking-tight text-white"
            >
              {EMAIL}
            </Link>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
            className="flex flex-col border-t border-dark-border"
          >
            {sent ? (
              <div
                role="status"
                className="border-b border-dark-border py-7 text-xl font-semibold"
              >
                Ukážkový formulár — dopyt nebol odoslaný. Kontaktujte nás
                e-mailom alebo telefonicky.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-x-6">
                  <input
                    name="name"
                    aria-label="Meno"
                    autoComplete="name"
                    placeholder="Meno"
                    required
                    className="border-0 border-b border-dark-border bg-transparent py-[18px] text-[17px] text-white outline-none placeholder:text-placeholder focus:border-primary"
                  />
                  <input
                    name="email"
                    aria-label="E-mail"
                    autoComplete="email"
                    placeholder="E-mail"
                    type="email"
                    required
                    className="border-0 border-b border-dark-border bg-transparent py-[18px] text-[17px] text-white outline-none placeholder:text-placeholder focus:border-primary"
                  />
                </div>
                <div
                  aria-label="Mám záujem o"
                  className="flex flex-wrap gap-1.5 border-b border-dark-border py-4"
                >
                  {products.map((product) => (
                    <button
                      key={product.key}
                      type="button"
                      aria-pressed={picks.includes(product.key)}
                      onClick={() =>
                        setPicks((previous) =>
                          previous.includes(product.key)
                            ? previous.filter((pick) => pick !== product.key)
                            : [...previous, product.key],
                        )
                      }
                      className={`h-[34px] rounded-full border px-3 text-[13px] font-semibold transition-colors duration-150 ${picks.includes(product.key) ? "border-primary bg-primary text-foreground" : "border-text-tertiary bg-transparent text-white"}`}
                    >
                      {product.name}
                    </button>
                  ))}
                </div>
                <textarea
                  name="message"
                  aria-label="Čo potrebujete vyrobiť?"
                  placeholder="Čo potrebujete vyrobiť?"
                  rows={3}
                  className="resize-y border-0 border-b border-dark-border bg-transparent py-[18px] text-[17px] text-white outline-none placeholder:text-placeholder focus:border-primary"
                />
                <button
                  type="submit"
                  className="mt-5 flex h-[52px] items-center gap-3.5 self-start rounded-full border-0 bg-primary px-6 text-[15px] font-bold text-foreground hover:bg-white"
                >
                  Odoslať dopyt <span aria-hidden="true">→</span>
                </button>
              </>
            )}
          </form>
        </div>
        {children}
      </div>
    </section>
  );
}
