import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to pacientes page', async ({ page }) => {
    await page.goto('/');
    // Wait for sidebar to load
    await page.waitForSelector('nav a[href="/pacientes"]', { timeout: 5000 });
    await page.click('nav a[href="/pacientes"]');
    await expect(page).toHaveURL(/.*pacientes/);
  });

  test('should navigate to herramientas page', async ({ page }) => {
    await page.goto('/');
    // Wait for sidebar to load
    await page.waitForSelector('nav a[href="/herramientas"]', { timeout: 5000 });
    await page.click('nav a[href="/herramientas"]');
    await expect(page).toHaveURL(/.*herramientas/);
  });

  test('should have responsive navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check if navigation is still accessible (might be a hamburger menu)
    const nav = page.locator('nav, [class*="nav"], [class*="sidebar"]').first();
    await expect(nav).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(nav).toBeVisible();
  });
});

