import { expect, test } from "@playwright/test";

test("landing page shows hero, value section, signup, and lookup path", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("A smarter way to keep relationships warm and your network moving.")).toBeVisible();
  await expect(page.getByText(/remember context/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /join the waitlist/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /check your status/i })).toBeVisible();
});
