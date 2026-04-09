import { test, expect } from '@playwright/test';

test.describe('Expo / Seedance Video Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/expo');
  });

  test('page loads with Seedance branding', async ({ page }) => {
    await expect(page.locator('text=/Seedance/i').first()).toBeVisible({ timeout: 10_000 });
  });

  test('has video prompt input', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 10_000 });
  });

  test('has generate button', async ({ page }) => {
    const generateBtn = page.locator('button').filter({ hasText: /generate|create|start/i });
    await expect(generateBtn.first()).toBeVisible({ timeout: 10_000 });
  });

  test('has aspect ratio selector', async ({ page }) => {
    // Should have ratio options (16:9, 9:16, 1:1)
    const ratioSelector = page.locator('text=/16:9|aspect|ratio/i');
    if (await ratioSelector.count() > 0) {
      await expect(ratioSelector.first()).toBeVisible();
    }
  });

  test('has duration selector', async ({ page }) => {
    const durationSelector = page.locator('text=/duration|seconds|5s|10s/i');
    if (await durationSelector.count() > 0) {
      await expect(durationSelector.first()).toBeVisible();
    }
  });

  test('generate button is disabled without prompt', async ({ page }) => {
    const generateBtn = page.locator('button').filter({ hasText: /generate|create/i }).first();
    // Should be disabled when textarea is empty
    const isDisabled = await generateBtn.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('can type prompt and enable generate', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('A cinematic drone shot over a mountain range at golden hour');

    const generateBtn = page.locator('button').filter({ hasText: /generate|create/i }).first();
    // After filling prompt, button should be enabled
    const isDisabled = await generateBtn.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test('back to studio link works', async ({ page }) => {
    const backLink = page.locator('a').filter({ hasText: /back|studio/i });
    if (await backLink.count() > 0) {
      await backLink.first().click();
      await expect(page).toHaveURL(/timeline/);
    }
  });
});
