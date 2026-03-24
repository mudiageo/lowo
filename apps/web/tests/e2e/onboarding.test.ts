import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test("should complete the onboarding flow correctly", async ({ page }) => {
    await page.goto("/");

    // Check landing page
    await expect(page.locator("h1")).toContainText("Your money, your rules");

    // Start onboarding
    await page.click("text=Get Started Now");
    await expect(page).toHaveURL(/.*onboarding/);

    // Step 1: User Name
    await page.fill("input#name", "Test User");
    await page.click("text=Next");

    // Step 2: Income
    await page.fill("input#income", "500000");
    await page.click("text=Next");

    // Step 3: Budget
    await page.fill("input#budget", "400000");
    await page.click("text=Next");

    // Step 4: Security
    await page.click("text=Next");

    // Step 5: AI
    await page.click("text=Let's Go!");

    // Should be on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("h1")).toContainText("Hello, Test User");
  });
});
