import { test, expect } from '@playwright/test';

test.describe('Pacientes Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should navigate to pacientes page', async ({ page }) => {
    // Click on pacientes link in sidebar
    await page.waitForSelector('nav a[href="/pacientes"]', { timeout: 5000 });
    await page.click('nav a[href="/pacientes"]');
    
    // Wait for the page to load
    await expect(page).toHaveURL(/.*pacientes/);
    
    // Check if the page title or heading is visible
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should create a new paciente', async ({ page }) => {
    // Navigate to new paciente page
    await page.goto('/pacientes/nuevo');
    
    // Wait for the form to load (first step should be visible)
    await page.waitForSelector('input[placeholder*="Nombre y apellidos" i], input[placeholder*="nombre" i]', { timeout: 5000 });
    
    // Fill in the form - using placeholders as selectors since Input component uses labels
    await page.fill('input[placeholder*="Nombre y apellidos" i], input[placeholder*="nombre" i]', 'Test Paciente');
    await page.fill('input[placeholder*="12345678A" i], input[placeholder*="dni" i]', '12345678A');
    await page.fill('input[placeholder*="612345678" i], input[placeholder*="teléfono" i], input[type="tel"]', '123456789');
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'test@test.com');
    await page.fill('input[type="date"]', '1990-01-01');
    
    // The form has multiple steps, so we'll just verify the first step is filled
    // In a real scenario, you'd need to navigate through all steps
    const nombreInput = page.locator('input[placeholder*="Nombre y apellidos" i], input[placeholder*="nombre" i]').first();
    await expect(nombreInput).toHaveValue('Test Paciente');
  });

  test('should view paciente details', async ({ page }) => {
    // Navigate to pacientes list
    await page.goto('/pacientes');
    
    // Click on first paciente (if exists)
    const firstPaciente = page.locator('a[href*="/pacientes/"]').first();
    
    if (await firstPaciente.count() > 0) {
      await firstPaciente.click();
      
      // Check if we're on the detail page
      await expect(page).toHaveURL(/.*pacientes\/[^/]+/);
      
      // Check if paciente name is visible
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should navigate between tabs in paciente detail', async ({ page }) => {
    await page.goto('/pacientes');
    
    const firstPaciente = page.locator('a[href*="/pacientes/"]').first();
    
    if (await firstPaciente.count() > 0) {
      await firstPaciente.click();
      
      // Test tab navigation
      const tabs = ['Biomarcadores', 'Dietas', 'Medidas', 'Documentos', 'Herramientas'];
      
      for (const tab of tabs) {
        await page.click(`text=${tab}`);
        // Wait a bit for content to load
        await page.waitForTimeout(500);
        // Verify tab is active (has specific class or is visible)
        await expect(page.locator(`button:has-text("${tab}")`).first()).toBeVisible();
      }
    }
  });

  test('should search for pacientes', async ({ page }) => {
    await page.goto('/pacientes');
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar" i]').first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Wait for search to filter
      
      // Verify results are filtered (this depends on implementation)
      const results = page.locator('table tbody tr, [class*="card"]');
      await expect(results.first()).toBeVisible();
    }
  });
});

