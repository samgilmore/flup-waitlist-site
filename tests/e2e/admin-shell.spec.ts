import { expect, test } from "@playwright/test";

test("admin shell shows protected login state", async ({ page }) => {
  await page.goto("/admin/");

  await expect(page.getByRole("heading", { name: /admin sign in/i })).toBeVisible();
  await expect(page.getByLabel("Admin email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});
