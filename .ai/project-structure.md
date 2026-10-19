
## Projektová štruktúra

Projekt je postavený na:

* Next.js App Router,
* TypeScript,
* Tailwind CSS,
* `next/font`,
* CSS premenných v `global.css`.

Treba používať aktuálne štandardy Next.js. Ak je potrebné overiť najnovšie odporúčania, treba si ich pozrieť.

Používať Tailwind inline classes priamo v komponentoch.

Homepage bude rozdelená na samostatné sekcie v:

```txt
@/components/homepage/
```

Každý homepage komponent má mať názov zakončený na `Section`.

Príklady názvov:

```txt
HeroSection.tsx
ServicesSection.tsx
ProjectsSection.tsx
```

Tieto názvy sú iba príklady. AI má navrhnúť vlastné sekcie podľa potreby.

Layout komponenty patria do:

```txt
@/components/layout/
```

Napríklad:

```txt
Navbar.tsx
Footer.tsx
```

Konštanty patria do:

```txt
@/constants/index.ts
```

Dummy dáta patria do:

```txt
@/data/
```

Napríklad:

```txt
@/data/services.ts
@/data/projects.ts
@/data/navigation.ts
```

Názvy dátových súborov má AI zvoliť podľa navrhnutej štruktúry.

---

## Technické pravidlá

Používať:

* TypeScript,
* Tailwind inline classes,
* komponentovú štruktúru,
* server components tam, kde je to rozumné,
* `next/font`,
* premenné v `global.css`,
* čisté a udržiavateľné dáta v `@/data`,
* konštanty v `@/constants`.

Kontaktná forma, ak sa objaví v návrhu, nemusí byť funkčná. Stačí statický formulár alebo vizuálny placeholder.

Neimplementovať zbytočne backend funkcionalitu, pokiaľ nie je vyžiadaná.

---

## Komponentový prístup

Komponenty majú byť:

* jasne pomenované,
* rozdelené podľa účelu,
* jednoduché na úpravu,
* bez zbytočne komplikovanej logiky,
* pripravené na budúce rozšírenie.

Dáta ako služby, referencie, položky galérie, výhody alebo navigácia nemajú byť natvrdo rozhádzané po komponentoch, ak sa opakujú alebo môžu meniť. V takom prípade ich treba presunúť do `@/data`.

---

## Responzivita

Web musí byť plne responzívny.

Dizajn musí dobre fungovať:

* na mobile,
* na tablete,
* na desktope,
* na väčších obrazovkách.

Mobile verzia nemá byť len zmenšený desktop. Sekcie majú byť prirodzene usporiadané, čitateľné a ľahko ovládateľné.

---
