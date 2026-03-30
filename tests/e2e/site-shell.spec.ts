import { expect, test } from "@playwright/test";

test("public shell shows FLUP hero and waitlist form", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByAltText("FLUP wordmark")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Follow up like it matters." })).toBeVisible();
  await expect(page.getByLabel("Hero artwork")).toBeVisible();
  await expect(page.locator(".hero-actions").getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /join the waitlist/i })).toBeVisible();
});
