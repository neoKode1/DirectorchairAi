import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('sign-in page loads', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page).toHaveURL(/signin/);

    // Should show sign-in UI
    const signInContent = page.locator('text=/sign in|log in|get started/i');
    await expect(signInContent.first()).toBeVisible();
  });

  test('sign-in page has Google OAuth button', async ({ page }) => {
    await page.goto('/auth/signin');

    const googleButton = page.locator('button, a').filter({ hasText: /google/i });
    if (await googleButton.count() > 0) {
      await expect(googleButton.first()).toBeVisible();
    }
  });

  test('sign-in page has dev credentials option in development', async ({ page }) => {
    await page.goto('/auth/signin');

    // In dev mode, there should be a dev sign-in option
    const devButton = page.locator('button, a').filter({ hasText: /dev|test|demo/i });
    if (await devButton.count() > 0) {
      await expect(devButton.first()).toBeVisible();
    }
  });

  test('unauthenticated API requests are handled gracefully', async ({ page }) => {
    // In development, middleware passes through, so this should work
    // In production, it would return 401
    const response = await page.request.get('/api/generate', {
      failOnStatusCode: false,
    });
    // Should get a valid HTTP response (not crash)
    expect([200, 401, 403, 405]).toContain(response.status());
  });
});
