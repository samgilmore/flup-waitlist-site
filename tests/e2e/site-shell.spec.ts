import { expect, test } from "@playwright/test";

test("public shell shows FLUP hero and waitlist form", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByAltText("FLUP wordmark")).toBeVisible();
  await expect(page.getByAltText("FLUP app icon")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Follow up like it matters." })).toBeVisible();
  await expect(page.getByAltText("FLUP hero icon")).toBeVisible();
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

  expect(ambientAnimationName).not.toBe("none");
  expect(resultCardIsSeparate).toBe(true);
});
