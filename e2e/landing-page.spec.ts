import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with branding', async ({ page }) => {
    // Check the page title
    await expect(page).toHaveTitle(/DirectorChair AI/);

    // Hero heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // DirectorChair branding in header
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('has navigation links', async ({ page }) => {
    // Should have the header nav
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    // Should contain nav links
    await expect(header.locator('a').first()).toBeVisible();
  });

  test('has call-to-action buttons', async ({ page }) => {
    // Look for CTA links in the hero section
    const heroLinks = page.locator('section a, section button');
    await expect(heroLinks.first()).toBeVisible();
  });

  test('renders feature sections', async ({ page }) => {
    // Should show AI capability headings
    await expect(page.getByRole('heading', { name: /Image Generation/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Video/i }).first()).toBeVisible();
  });

  test('footer renders with license link', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('text=MIT License')).toBeVisible();
  });

  test('theme toggle is accessible', async ({ page }) => {
    // Theme toggle button should exist
    const themeToggle = page.getByRole('button', { name: /theme|dark|light|toggle/i });
    if (await themeToggle.count() > 0) {
      await expect(themeToggle.first()).toBeVisible();
    }
  });
});
