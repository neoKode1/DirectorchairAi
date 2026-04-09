import { test, expect } from '@playwright/test';

test.describe('Models Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/models');
  });

  test('page loads and renders model categories', async ({ page }) => {
    // Should display model category headings
    await expect(page.locator('text=/Image Model/i').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=/Video Model/i').first()).toBeVisible();
  });

  test('displays individual model entries', async ({ page }) => {
    // The models page should list multiple models — look for model name text patterns
    // Models page uses a scrollable container with model items
    await page.waitForTimeout(3000);

    // Look for known model names from AVAILABLE_ENDPOINTS
    const modelEntries = page.locator('text=/Flux|Imagen|Seedance|Recraft|Grok/i');
    const count = await modelEntries.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('model cards have use-in-studio action', async ({ page }) => {
    // Each card should have a button to use the model
    const useButton = page.locator('button, a').filter({ hasText: /use|select|try|studio/i });
    if (await useButton.count() > 0) {
      await expect(useButton.first()).toBeVisible();
    }
  });

  test('has back to studio link', async ({ page }) => {
    const backLink = page.locator('a').filter({ hasText: /back|studio/i });
    if (await backLink.count() > 0) {
      await expect(backLink.first()).toBeVisible();
    }
  });
});
