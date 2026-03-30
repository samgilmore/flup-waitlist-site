import { expect, test } from "@playwright/test";

test("public shell shows FLUP hero and waitlist form", async ({ page }) => {
  await page.route("**/functions/v1/waitlist-stats", async (route) => {
    await page.waitForTimeout(400);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ totalSignups: 1011 })
    });
  });

  await page.goto("/");

  await expect(page.getByAltText("FLUP wordmark")).toBeVisible();
  await expect(page.getByAltText("FLUP app icon")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Follow Up. Stay top of mind." })).toBeVisible();
  await expect(page.getByAltText("FLUP hero icon")).toBeVisible();
  await expect(page.locator("#hero-stat .hero-stat-label")).toHaveText("Loading live count...");
  await expect(page.locator("#hero-stat .hero-stat-number")).toHaveAttribute("data-state", "loading");
  await expect(page.locator("#hero-stat .hero-stat-number")).toHaveText(/\d{1,3}(,\d{3})*/);
  await expect(page.locator("#hero-stat .hero-stat-label")).toHaveText("people already joined");
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /join the waitlist/i })).toBeVisible();
  await expect(page.locator("#lookup-panel")).toBeHidden();
  await expect(page.locator("#result-card")).toBeHidden();

  const ambientAnimationName = await page.locator(".ambient-one").evaluate((element) => {
    return window.getComputedStyle(element).animationName;
  });

  const resultCardIsSeparate = await page.locator("#result-card").evaluate((element) => {
    return !element.closest(".signup-panel") && element.parentElement?.classList.contains("hero-panel-stack");
  });

  const heroLineSizes = await page.locator("#hero-title .hero-title-line").evaluateAll((elements) => {
    return elements.map((element) => Number.parseFloat(window.getComputedStyle(element).fontSize));
  });

  const heroLineGap = await page.locator("#hero-title").evaluate((element) => {
    const lines = Array.from(element.querySelectorAll(".hero-title-line"));
    const firstRect = lines[0]?.getBoundingClientRect();
    const secondRect = lines[1]?.getBoundingClientRect();

    if (!firstRect || !secondRect) {
      return 0;
    }

    return secondRect.top - firstRect.bottom;
  });

  expect(ambientAnimationName).not.toBe("none");
  expect(resultCardIsSeparate).toBe(true);
  expect(heroLineSizes[1]).toBeLessThan(heroLineSizes[0]);
  expect(heroLineGap).toBeGreaterThan(12);
});
