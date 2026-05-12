/**
 * E2E Tests - Admin Dashboard
 * Tests the admin panel features: dashboard stats, user management, audit logs
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('admin can view dashboard with stats', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.civic');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/admin');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Total Proposals')).toBeVisible();
    await expect(page.locator('text=Total Votes')).toBeVisible();
    await expect(page.locator('text=Engagement Rate')).toBeVisible();
  });

  test('admin sidebar shows all navigation links', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.civic');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.goto('/admin');
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Proposals')).toBeVisible();
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=Audit Logs')).toBeVisible();
  });

  test('moderator sees limited nav (no Users)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'mod@test.civic');
    await page.fill('input[name="password"]', 'mod123');
    await page.click('button[type="submit"]');

    await page.goto('/admin');
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Proposals')).toBeVisible();
    await expect(page.locator('text=Users')).not.toBeVisible();
  });

  test('admin can view users list', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.civic');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.goto('/admin/users');
    await expect(page.locator('text=User Management')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('admin can view audit logs', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.civic');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.goto('/admin/audit-logs');
    await expect(page.locator('text=Audit Logs')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('unauthenticated user is redirected from admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
  });

  test('regular user is redirected from admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/admin');
    await expect(page).toHaveURL('/dashboard');
  });
});
