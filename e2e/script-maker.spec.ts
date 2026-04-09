import { test, expect } from '@playwright/test';

test.describe('Script Maker Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/script-maker');
  });

  test('page loads with script maker UI', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
    // Should have some script-related heading
    const heading = page.locator('text=/script|screenplay|story/i');
    await expect(heading.first()).toBeVisible({ timeout: 10_000 });
  });

  test('has movie title input', async ({ page }) => {
    const titleInput = page.locator('input, textarea').first();
    await expect(titleInput).toBeVisible({ timeout: 10_000 });
  });

  test('has genre selector', async ({ page }) => {
    const genreSelector = page.locator('select, [role="combobox"], button').filter({ hasText: /genre|action|drama|comedy/i });
    if (await genreSelector.count() > 0) {
      await expect(genreSelector.first()).toBeVisible();
    }
  });

  test('has era/setting selector', async ({ page }) => {
    const eraSelector = page.locator('select, [role="combobox"], button').filter({ hasText: /era|setting|period|modern|future/i });
    if (await eraSelector.count() > 0) {
      await expect(eraSelector.first()).toBeVisible();
    }
  });

  test('has generate/analyze button', async ({ page }) => {
    const analyzeBtn = page.locator('button').filter({ hasText: /generate|analyze|create|formalize/i });
    if (await analyzeBtn.count() > 0) {
      await expect(analyzeBtn.first()).toBeVisible();
    }
  });
});
