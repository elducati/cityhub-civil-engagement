/**
 * E2E Tests - Toast Notifications
 * Tests that toast notifications appear after key actions
 */

import { test, expect } from '@playwright/test';

test.describe('Toast Notifications', () => {
  test('shows success toast after creating a proposal', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/proposals/create');
    await page.fill('input[name="title"]', 'Proposal for Toast Test');
    await page.fill('textarea[name="description"]', 'This proposal is created specifically to verify that the toast notification system works correctly end to end.');
    await page.click('button:has-text("Next")');
    await page.selectOption('select[name="category"]', 'community');
    await page.fill('input[placeholder="Add a tag"]', 'test');
    await page.click('button:has-text("Add")');
    await page.click('button:has-text("Submit Proposal")');

    // Should see success toast
    await expect(page.locator('[data-testid="toast"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="toast"]')).toContainText(/proposal/i);
  });

  test('shows error toast on failed login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should see error notification
    await expect(page.locator('[data-testid="toast"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('toasts auto-dismiss after a few seconds', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    const toasts = page.locator('[data-testid="toast"]');
    await expect(toasts.first()).toBeVisible({ timeout: 10000 });

    // Wait for auto-dismiss
    await page.waitForTimeout(5000);
    await expect(toasts).toHaveCount(0);
  });
});
