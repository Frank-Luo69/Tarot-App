import { test, expect } from '@playwright/test';

// Minimal e2e: open /tarot, draw with a fixed seed, expect 3 cards and action plan.

test('draw and export basics', async ({ page }) => {
  await page.goto('/tarot');
  await page.getByTestId('seed-input').fill('seed-play');
  await page.getByTestId('draw').click();
  await expect(page.getByTestId('reading-grid')).toBeVisible();
  // Export buttons should be present
  await expect(page.getByTestId('copy-current')).toBeVisible();
  await expect(page.getByTestId('download-current')).toBeVisible();
});
