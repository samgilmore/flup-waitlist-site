import { expect, test } from "@playwright/test";

const savedWaitlistState = {
  email: "sam@example.com",
  referralCode: "ABC123",
  referralCount: 2,
  referralLink: "https://samgilmore.github.io/flup-waitlist-site/?ref=ABC123",
  rewardTarget: 5,
  status: "created",
  totalSignups: 1011,
  waitlistPosition: 1008
};

async function primeWaitlistState(page: Parameters<typeof test>[0]["page"], enableShare = false) {
  await page.route("**/functions/v1/waitlist-stats", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ totalSignups: 1011 })
    });
  });

  await page.addInitScript(
    ({ payload, enableShareAction }) => {
      window.localStorage.setItem("flup.waitlist.state", JSON.stringify(payload));
      window.__copiedText = null;
      window.__sharedPayload = null;

      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            window.__copiedText = text;
          }
        }
      });

      if (enableShareAction) {
        Object.defineProperty(navigator, "share", {
          configurable: true,
          value: async (sharePayload: unknown) => {
            window.__sharedPayload = sharePayload;
          }
        });
      }
    },
    { payload: savedWaitlistState, enableShareAction: enableShare }
  );

  await page.goto("/");
}

test("desktop result card shows copy action only", async ({ page }) => {
  await primeWaitlistState(page);

  await expect(page.locator("#result-card")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Share" })).toHaveCount(0);

  await page.getByRole("button", { name: "Copy link" }).click();

  await expect(page.getByText("Link copied.")).toBeVisible();

  const copiedText = await page.evaluate(() => window.__copiedText);
  expect(copiedText).toBe(savedWaitlistState.referralLink);
});

test.describe("mobile referral actions", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });

  test("mobile result card shows share and copy actions", async ({ page }) => {
    await primeWaitlistState(page, true);

    await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Share" })).toBeVisible();

    await page.getByRole("button", { name: "Share" }).click();

    const sharedPayload = await page.evaluate(() => window.__sharedPayload);
    expect(sharedPayload).toMatchObject({
      url: savedWaitlistState.referralLink
    });
  });
});
