import { test, expect } from '@playwright/test';

test.describe('New Features', () => {
  test('homepage shows live stats', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Active Proposals')).toBeVisible();
    await expect(page.locator('text=Total Votes')).toBeVisible();
    await expect(page.locator('text=Active Citizens')).toBeVisible();
    await expect(page.locator('text=Decisions Made')).toBeVisible();
  });

  test('roadmap page shows timeline with proposals', async ({ page }) => {
    await page.goto('/roadmap');
    await expect(page.locator('text=Public Roadmap')).toBeVisible();
    await expect(page.locator('text=Planned')).toBeVisible();
    await expect(page.locator('text=Implemented')).toBeVisible();
    await expect(page.locator('a[href*="/proposals/"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('proposal detail page shows share button', async ({ page }) => {
    await page.goto('/proposals/prp-001');
    await expect(page.locator('text=Share this proposal')).toBeVisible();
    await expect(page.locator('button:has-text("Share")')).toBeVisible();
  });

  test('proposal detail page shows discussion section', async ({ page }) => {
    await page.goto('/proposals/prp-001');
    await expect(page.locator('text=Discussion')).toBeVisible();
  });

  test('authenticated user can post a comment', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/proposals/prp-001');
    await expect(page.locator('textarea[placeholder="Share your thoughts..."]')).toBeVisible();
    await page.fill('textarea[placeholder="Share your thoughts..."]', 'Great proposal!');
    await page.click('button:has-text("Post Comment")');

    await expect(page.locator('text=Great proposal!')).toBeVisible({ timeout: 5000 });
  });

  test('admin dashboard shows analytics charts', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.civic');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/admin');
    await expect(page.locator('text=Proposals by Status')).toBeVisible();
    await expect(page.locator('text=Users by Role')).toBeVisible();
    await expect(page.locator('text=Proposal Trends')).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();
  });

  test('admin proposals page has CSV export button', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.civic');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/admin/proposals');
    await expect(page.locator('button:has-text("Export CSV")')).toBeVisible();
  });

  test('unauthenticated user sees roadmap but gets redirected from admin', async ({ page }) => {
    await page.goto('/roadmap');
    await expect(page.locator('text=Public Roadmap')).toBeVisible();

    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
  });
});
