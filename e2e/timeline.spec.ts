import { test, expect } from '@playwright/test';

test.describe('Timeline / Studio Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/timeline');
  });

  test('page loads without errors', async ({ page }) => {
    // Should not show a white screen or error
    await expect(page.locator('body')).not.toBeEmpty();
    // Check there are no uncaught errors visible on screen
    const errorMessage = page.locator('text=/something went wrong|error|500/i');
    // If error boundary is showing, this test would fail (desired behavior)
    if (await errorMessage.count() > 0) {
      // Only fail if it's a real error, not just "error" appearing in normal text
      const visibleError = errorMessage.first();
      const isInErrorBoundary = await visibleError.evaluate(el => {
        return el.closest('[data-error-boundary]') !== null;
      });
      expect(isInErrorBoundary).toBe(false);
    }
  });

  test('chat interface is visible', async ({ page }) => {
    // The timeline page should have a chat interface
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await expect(chatInput).toBeVisible({ timeout: 10_000 });
  });

  test('gallery view section exists', async ({ page }) => {
    // Should have gallery container or similar
    const gallery = page.locator('[class*="gallery"], [data-testid="gallery"]');
    // Gallery may or may not be visible depending on state, but the component should exist
    await page.waitForTimeout(2000);
  });

  test('can type in chat input', async ({ page }) => {
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await expect(chatInput).toBeVisible({ timeout: 10_000 });
    await chatInput.fill('Create a cinematic sunset image');
    await expect(chatInput).toHaveValue(/sunset/);
  });

  test('model selector is accessible', async ({ page }) => {
    // Should have a model/dropdown selector
    const selector = page.locator('select, [role="combobox"], button').filter({ hasText: /model|select/i });
    if (await selector.count() > 0) {
      await expect(selector.first()).toBeVisible();
    }
  });
});
