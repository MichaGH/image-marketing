# IMAGE Marketing design conversion

Next.js App Router, TypeScript and Tailwind CSS conversion of `.ai/design_input/design.html`.

## Run

- `npm install`
- `npm run dev`
- Open http://localhost:3000

## Checks

- `npm run lint`
- `npm run build`
- `npm run test:e2e` builds the production app and runs the browser checks on port 3100.
- Install Chromium with `npx playwright install chromium` if it is not already available.

## Structure

- `components/homepage/*Section.tsx`: the six homepage sections.
- `components/layout/`: navbar and footer.
- `components/ui/`: shared buttons and prototype links.
- `data/`: products, projects, categories, process steps and navigation.
- `constants/index.ts`: the 3.2-second hero interval and contact constants.
- `app/globals.css`: the default yellow accent (`#FFD400`), palette, font and responsive tokens. Component styles use inline Tailwind utilities.
- `public/images/`: all twelve original source images, downloaded from imagemarketing.sk.
- `tests/homepage.spec.ts`: browser checks for menus, carousel, filters, scroll sequences, image previews, responsive layouts and reduced motion.

Archivo is self-hosted through `next/font`, including its variable width axis. Animation setup uses scoped `useGSAP` hooks with automatic context cleanup, context-safe callbacks and ScrollTrigger. The original scroll formulas, cubic curves, section heights and the 1000px desktop breakpoint are preserved. Reduced-motion preferences have a readable static presentation.

The design editor/support runtime is not shipped. Homepage navigation scrolls to its sections. Product, project and legal links retain the source prototype's inactive behavior and original destination URLs; their page designs were not supplied. The contact form is a local visual demo and does not send requests.
