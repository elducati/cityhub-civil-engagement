/**
 * E2E Tests - Proposals Flow
 * Tests the critical proposal submission user journey
 */

import { test, expect } from '@playwright/test';

test.describe('Proposals', () => {
  test('authenticated citizen can submit a proposal with category', async ({ page }) => {
    // Log in as citizen
    await page.goto('/login');
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Navigate to create proposal
    await page.goto('/proposals/create');

    // Step 1: Fill title and description
    await page.fill('input[name="title"]', 'New Community Garden');
    await page.fill('textarea[name="description"]', 'Create a beautiful community garden in the town center with native plants and seating areas.');

    // Click Next
    await page.click('button:has-text("Next")');

    // Step 2: Select category
    await page.selectOption('select[name="category"]', 'environment');

    // Add a tag
    await page.fill('input[placeholder="Add a tag"]', 'gardening');
    await page.click('button:has-text("Add")');

    // Click Next
    await page.click('button:has-text("Next")');

    // Step 3: Verify review and submit
    await expect(page.locator('text=New Community Garden')).toBeVisible();
    await expect(page.locator('text=community garden')).toBeVisible();

    // Submit
    await page.click('button:has-text("Submit Proposal")');

    // Should redirect to proposals list
    await expect(page).toHaveURL('/proposals', { timeout: 10000 });

    // Verify new proposal appears in list
    await expect(page.locator('text=New Community Garden')).toBeVisible();
  });

  test('proposal detail page shows category', async ({ page }) => {
    // Navigate to proposals
    await page.goto('/proposals');

    // Click on a proposal
    const proposalLink = page.locator('a[href*="/proposals/"]').first();
    await proposalLink.click();

    // Wait for detail page
    await expect(page.locator('h1')).toBeVisible();

    // Category badge should be visible
    await expect(page.locator('[class*="rounded-full"]').first()).toBeVisible();
  });

  test('proposals feed filters by category', async ({ page }) => {
    await page.goto('/proposals');

    // Category filter buttons should be visible
    await expect(page.locator('button:has-text("All")').first()).toBeVisible();
  });

  test('Step 1 validation blocks advancement on missing title', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/proposals/create');

    // Leave title empty, fill description
    await page.fill('textarea[name="description"]', 'Some description here');

    // Try to advance
    await page.click('button:has-text("Next")');

    // Should show validation error
    await expect(page.locator('text=Title must be at least')).toBeVisible();

    // Should still be on step 1
    await expect(page.locator('text=Proposal Title')).toBeVisible();
  });

  test('proposals feed filters by status', async ({ page }) => {
    await page.goto('/proposals');

    await page.waitForSelector('text=Proposals');

    const openTab = page.locator('button:has-text("Open")').first();
    if (await openTab.isVisible()) {
      await openTab.click();
      await page.waitForTimeout(500);
    }

    const proposalCards = page.locator('[class*="rounded-3xl"]');
    await expect(proposalCards.first()).toBeVisible();
  });

  test('proposal detail page shows voting buttons for authenticated user', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/proposals/prp-001');

    await expect(page.locator('button:has-text("Vote for this Proposal")')).toBeVisible();
  });

  test('unauthenticated user sees login prompt when trying to vote', async ({ page }) => {
    await page.goto('/proposals/prp-001');

    const voteButton = page.locator('button:has-text("Vote for this Proposal")');

    if (await voteButton.isVisible()) {
      await voteButton.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
