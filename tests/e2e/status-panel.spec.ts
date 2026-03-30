import { expect, test } from "@playwright/test";

test("lookup button reveals the status lookup panel", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Check your status" }).click();

  await expect(page.locator(".signup-panel .lookup-panel")).toBeVisible();
  await expect(page.getByLabel("Lookup email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Find my invite" })).toBeVisible();
});
