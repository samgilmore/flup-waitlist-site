import { expect, test } from "@playwright/test";

test("landing page shows hero, value section, signup, and lookup path", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Join FLUP");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/src/assets/flup-ios-icon.png");
  await expect(page.getByText("A smarter way to keep relationships warm and your network moving.")).toBeVisible();
  await expect(page.getByText(/private beta waitlist/i)).toHaveCount(0);
  await expect(page.getByText(/waitlist now open/i)).toHaveCount(0);
  await expect(page.getByText(/remember context/i)).toHaveCount(0);
  await expect(page.getByText(/built for early-career/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /be first to hear when flup goes live/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /join the waitlist/i })).toBeVisible();
  await expect(page.getByText(/refer 5 friends for early access/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /check your status/i })).toBeVisible();
  await expect(page.locator("#form-message")).toBeHidden();
  await expect(page.getByText(/copyright 2026 flup/i)).toBeVisible();
});
