import { expect, test } from "@playwright/test";

test("desktop menu previews products and closes with Escape or pointer leave", async ({
  page,
}) => {
  await page.goto("/");
  const button = page.getByRole("button", { name: "Produkty" });
  await button.hover();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  const menu = page.locator("#product-menu");
  await expect(menu.locator('a[href^="/produkty/"]')).toHaveCount(9);
  const product = menu.getByRole("link", { name: /02 Svetelné reklamy/ });
  await product.hover();
  await expect(product).toHaveCSS("background-color", "rgb(255, 212, 0)");
  await expect(menu.locator('img[src*="foto_svetelna_rekl"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(button).toBeFocused();
  await button.click();
  await expect(menu).toBeVisible();
  await page.mouse.move(10, 700);
  await expect(menu).toBeHidden();
});

test("hero controls, progress, pause and automatic advance", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.locator('[data-screen-label="Hero"]');
  const slide = hero.getByRole("button", {
    name: "Reklamný textil",
    exact: true,
  });
  await slide.click();
  await expect(slide).toHaveAttribute("aria-pressed", "true");
  await expect(
    hero.locator('a[href="/produkty/reklamny-textil"]'),
  ).toBeVisible();
  await page.waitForTimeout(3400);
  await expect(slide).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(5, 85);
  await expect(
    hero.getByRole("button", { name: "Veľkoplošná tlač", exact: true }),
  ).toHaveAttribute("aria-pressed", "true", { timeout: 5000 });
  await expect
    .poll(() =>
      hero
        .locator('[data-hero-fill="3"]')
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
    )
    .toBeGreaterThan(0);
  await expect(hero.locator("h1")).toHaveCSS("color", "rgb(11, 11, 11)");
  await expect(hero.getByRole("link", { name: /Nezáväzný dopyt/ })).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
});

test("portfolio filters dim nonmatches without rearranging the grid", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator("#realizacie");
  await section.getByRole("button", { name: /^Branding/ }).click();
  await expect(
    section.locator('[data-project][data-matched="true"]'),
  ).toHaveCount(3);
  await expect(
    section.locator('[data-project][data-matched="false"]'),
  ).toHaveCount(8);
  const dimmed = section.locator('[data-project="creative"]');
  await expect(dimmed).toHaveCSS("opacity", "0.18");
  await expect(section.getByText("3 z 11 — Branding")).toBeVisible();
  await section.getByRole("button", { name: /^Všetko/ }).click();
  await expect(section.locator('[data-matched="true"]')).toHaveCount(11);
});

test("cinematic frame expands and process cards follow scroll", async ({
  page,
}) => {
  await page.goto("/");
  const scrollSection = async (index: number, progress: number) => {
    await page
      .locator("main > section")
      .nth(index)
      .evaluate(
        (el, p) =>
          window.scrollTo(
            0,
            el.getBoundingClientRect().top +
              window.scrollY +
              (el.clientHeight - innerHeight) * p,
          ),
        progress,
      );
  };
  await scrollSection(1, 0.95);
  await expect
    .poll(() =>
      page
        .locator("[data-cinema-frame]")
        .evaluate((el) => el.getBoundingClientRect().width),
    )
    .toBeCloseTo(1440, 0);
  await expect(page.locator("[data-cinema-caption]")).toHaveCSS("opacity", "1");
  await scrollSection(4, 0.6);
  await expect(
    page
      .getByText("Tlač, rezanie, svetlo, textil, kov.", { exact: false })
      .first(),
  ).toBeVisible();
  const secondCard = page.locator("[data-process-card]").nth(1);
  await expect
    .poll(() => secondCard.evaluate((el) => el.getBoundingClientRect().top))
    .toBeLessThan(200);
  await expect(secondCard).toHaveCSS("translate", "none");
  await scrollSection(4, 0.96);
  await expect(
    page.getByText("Osadíme, zapojíme a odovzdáme.", { exact: false }).first(),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("[data-process-card]")
        .nth(2)
        .evaluate((el) => el.getBoundingClientRect().top),
    )
    .toBeLessThan(110);
});

test("about links preview the correct image and restore the default", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator("#o-nas");
  const link = section.getByRole("link", {
    name: "svetelné reklamy",
    exact: true,
  });
  await link.hover();
  await expect(section.locator("[data-about-image]").nth(1)).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(
    section.getByText("svetelné reklamy", { exact: true }).last(),
  ).toBeVisible();
  await page.mouse.move(0, 85);
  await expect(section.locator("[data-about-image]").first()).toHaveCSS(
    "opacity",
    "1",
  );
});

for (const width of [360, 768, 1000, 1920]) {
  test(`responsive layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
    if (width < 1000) {
      const button = page.getByRole("button", { name: "Otvoriť menu" });
      await button.click();
      const menu = page.locator("#mobile-menu");
      await expect(menu).toBeVisible();
      await expect(menu.locator('a[href^="/produkty/"]')).toHaveCount(9);
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      await menu.getByRole("link", { name: "Kontakt", exact: true }).click();
      await expect(menu).toBeHidden();
      await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
      await expect(page).toHaveURL(/#kontakt$/);
    }
  });
}

test("reduced motion keeps all process content readable and hero controllable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.locator('[data-screen-label="Hero"]');
  await hero.getByRole("button", { name: "LED panely", exact: true }).click();
  await expect(
    hero.getByRole("button", { name: "LED panely", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const card of await page.locator("[data-process-card]").all()) {
    await expect(card.getByRole("heading")).toBeVisible();
  }
});

test("contact chips toggle and demo submission stays local", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const section = page.locator("#kontakt");
  const chip = section.getByRole("button", {
    name: "Svetelné reklamy",
    exact: true,
  });
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await section
    .getByRole("textbox", { name: "Meno", exact: true })
    .fill("Test");
  await section
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("test@example.com");
  await section.getByRole("button", { name: "Odoslať dopyt" }).click();
  await expect(section.getByRole("status")).toContainText(
    "dopyt nebol odoslaný",
  );
  expect(errors).toEqual([]);
});
