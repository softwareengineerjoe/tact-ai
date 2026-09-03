import { expect, test } from '@playwright/test';

test('redirects to the dashboard and shows the overview heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Management Overview' })).toBeVisible();
});
