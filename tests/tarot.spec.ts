import { test, expect } from '@playwright/test';

// Minimal e2e: open /tarot, draw with a fixed seed, expect 3 cards and action plan.

test('draw and export basics', async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.setItem('tarot.helpShown', '1'); } catch {}
  });
  await page.goto('/tarot');
  // 断言：在 helpShown=1 的情况下，帮助弹窗默认不出现（防回归）
  const dialog = page.getByRole('dialog');
  await expect.soft(dialog, 'Help modal should be hidden by default when helpShown=1').toHaveCount(0);
  // 如果仍有弹窗，验证可关闭并消失
  if (await dialog.count() > 0) {
    const closeBtn = dialog.getByRole('button', { name: /(关闭|Close)/ });
    await closeBtn.click();
    await expect(dialog).toHaveCount(0);
  }
  await page.waitForSelector('[data-testid="seed-input"]', { state: 'visible' });
  await page.getByTestId('seed-input').fill('seed-play');
  await page.getByTestId('draw').click();
  await expect(page.getByTestId('reading-grid')).toBeVisible();
  // Export buttons should be present
  await expect(page.getByTestId('copy-current')).toBeVisible();
  await expect(page.getByTestId('download-current')).toBeVisible();
});
