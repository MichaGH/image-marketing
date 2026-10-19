import { ConceptLink } from "@/components/ui/ConceptLink";
import Link from "next/link";
import Image from "next/image";
import { LOGO } from "@/constants";
import { navigation } from "@/data/navigation";

export function Footer() {
  return (
    <footer>
      <div className="mt-[clamp(56px,6vw,96px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-7 border-t border-dark-border pt-7 text-[15px] leading-[1.6] text-footer-text">
        <div className="flex flex-col">
          <span className="pb-2 font-bold text-white">Telefón</span>
          <Link
            href="tel:+421907417744"
            className="text-footer-text hover:text-primary"
          >
            +421 907 41 77 44
          </Link>
          <Link
            href="tel:+421910417744"
            className="text-footer-text hover:text-primary"
          >
            +421 910 41 77 44
          </Link>
          <Link
            href="tel:+421905241000"
            className="text-footer-text hover:text-primary"
          >
            +421 905 24 10 00
          </Link>
        </div>
        <div className="flex flex-col">
          <span className="pb-2 font-bold text-white">Adresa</span>
          <span>IMAGE Marketing s.r.o.</span>
          <span>Medvedzie 123/10-95</span>
          <span>027 44 Tvrdošín</span>
        </div>
        <div className="flex flex-col">
          <span className="pb-2 font-bold text-white">Firma</span>
          <span>IČO 36 748 137</span>
          <span>IČ DPH SK2022333159</span>
        </div>
        <div className="flex flex-col">
          <span className="pb-2 font-bold text-white">Stránky</span>
          <Link
            href="/#realizacie"
            className="text-footer-text hover:text-primary"
          >
            Produkty
          </Link>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-footer-text hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-[13px] text-footer-muted">
        <span className="flex rounded-[10px] bg-white px-3.5 py-2">
          <Image
            src={LOGO}
            alt="IMAGE Marketing"
            width={2000}
            height={774}
            className="h-7 w-auto"
          />
        </span>
        <span>© 2026 IMAGE Marketing s.r.o.</span>
        <span className="flex gap-5">
          <ConceptLink
            href="/ochrana-osobnych-udajov"
            className="text-footer-muted hover:text-white"
          >
            Ochrana osobných údajov
          </ConceptLink>
          <ConceptLink
            href="/cookies"
            className="text-footer-muted hover:text-white"
          >
            Cookies
          </ConceptLink>
        </span>
      </div>
    </footer>
  );
}
