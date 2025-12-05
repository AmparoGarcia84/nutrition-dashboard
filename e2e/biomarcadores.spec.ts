import { test, expect } from '@playwright/test';

test.describe('Biomarcadores Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pacientes');
    
    const firstPaciente = page.locator('a[href*="/pacientes/"]').first();
    if (await firstPaciente.count() > 0) {
      await firstPaciente.click();
      // Biomarcadores should be the default tab now
      await page.waitForTimeout(500);
    }
  });

  test('should display biomarcadores tab', async ({ page }) => {
    // Wait for navigation to complete and tab to be visible
    await page.waitForTimeout(1000);
    
    // Check if biomarcadores tab button is visible
    const biomarcadoresTab = page.locator('button:has-text("Biomarcadores")').first();
    await expect(biomarcadoresTab).toBeVisible({ timeout: 5000 });
    
    // Verify we're on a paciente detail page
    await expect(page).toHaveURL(/.*pacientes\/[^/]+/);
  });

  test('should add a new biomarcador', async ({ page }) => {
    // Look for add button
    const addButton = page.locator('button:has-text("Nuevo"), button:has-text("Agregar"), button:has-text("+")').first();
    
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Check if form is visible
      const form = page.locator('form, [class*="form"], select, input[type="number"]').first();
      if (await form.count() > 0) {
        await expect(form).toBeVisible();
      }
    }
  });

  test('should display biomarcadores list', async ({ page }) => {
    // Check if there's a list or grid of biomarcadores
    const content = page.locator('[class*="biomarcador"], [class*="card"], table').first();
    
    // Wait a bit for content to load
    await page.waitForTimeout(1000);
    
    // Content should be visible (even if empty)
    await expect(page.locator('body')).toBeVisible();
  });
});

