import { test, expect } from "@playwright/test";

test.describe("Quick Add Expense", () => {
  test("should open and save an expense via FAB on mobile", async ({ page }) => {
    // Navigate to dashboard (assuming onboarding done or using state)
    // For local dev, we might need a setup script to populate DB first.
    // But since it's local storage, we can use onboarding test to reach here.

    await page.goto("/dashboard");

    // Check if on dashboard
    await expect(page.locator("h1")).toContainText("Hello");

    // Click FAB (Plus icon in center of bottom nav)
    await page.click('button[aria-label="Add"]');

    // Check if modal opened
    await expect(page.locator("text=Quick Log Expense")).toBeVisible();

    // Fill amount
    await page.fill('input[placeholder="e.g. 1500"]', "2500");

    // Select category (wait for categories to load from DB)
    await page.selectOption("select", { index: 1 });

    // Save
    await page.click("text=Save Expense");

    // Modal should close
    await expect(page.locator("text=Quick Log Expense")).not.toBeVisible();

    // Check if expense appears in recent expenses
    await expect(page.locator("text=2,500")).toBeVisible();
  });
});
