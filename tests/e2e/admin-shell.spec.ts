import { expect, test } from "@playwright/test";

test("admin shell shows protected login state", async ({ page }) => {
  await page.goto("/admin/");

  await expect(page.getByRole("heading", { name: /admin sign in/i })).toBeVisible();
  await expect(page.getByLabel("Admin email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  const signInButton = page.getByRole("button", { name: /try sign in/i });
  await expect(signInButton).toBeVisible();
  await expect
    .poll(async () =>
      signInButton.evaluate((element) => getComputedStyle(element).backgroundImage)
    )
    .toContain("gradient");
  await expect(page.locator("#admin-dashboard")).toBeHidden();
  await expect(page.getByRole("button", { name: /sign out/i })).toBeHidden();
});
