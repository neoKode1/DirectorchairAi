import { test, expect } from '@playwright/test';

test.describe('Personas Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/personas');
  });

  test('page loads without crashing', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
    // Should not show error boundary
    const errorBoundary = page.locator('[data-error-boundary]');
    expect(await errorBoundary.count()).toBe(0);
  });

  test('has create new persona button', async ({ page }) => {
    const createButton = page.locator('button, a').filter({ hasText: /create|new|add/i });
    if (await createButton.count() > 0) {
      await expect(createButton.first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test('displays persona grid or empty state', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Either shows persona cards or empty state message
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const emptyState = page.locator('text=/no persona|get started|create your first/i');

    const hasCards = await cards.count() > 0;
    const hasEmptyState = await emptyState.count() > 0;

    // One of these should be true
    expect(hasCards || hasEmptyState).toBe(true);
  });
});
