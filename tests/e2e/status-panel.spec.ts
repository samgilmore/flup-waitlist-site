import { expect, test } from "@playwright/test";

test("lookup button reveals the status lookup panel", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Check your status" }).click();

  await expect(page.locator(".signup-panel .signup-stage")).toBeHidden();
  await expect(page.locator(".signup-panel .lookup-stage")).toBeVisible();
  await expect(page.getByRole("button", { name: /back/i })).toBeVisible();
  await expect(page.getByLabel("Lookup email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Find my invite" })).toBeVisible();

  await page.getByRole("button", { name: /back/i }).click();

  await expect(page.locator(".signup-panel .lookup-stage")).toBeHidden();
  await expect(page.locator(".signup-panel .signup-stage")).toBeVisible();
});
