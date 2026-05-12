/**
 * E2E Tests - Authentication Flow
 * Tests the critical auth user journey using Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('citizen can log in and is redirected to the dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in login credentials
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Verify user is logged in
    await expect(page.locator('text=citizen@test.civic')).toBeVisible();
  });

  test('unauthenticated user visiting /dashboard is redirected to /login', async ({ page }) => {
    // Navigate directly to /dashboard without a session
    await page.goto('/dashboard');
    
    // Assert redirect to /login
    await expect(page).toHaveURL('/login');
  });

  test('logging out clears the session and redirects to the landing page', async ({ page }) => {
    // Log in as citizen
    await page.goto('/login');
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Click logout
    await page.click('button:has-text("Sign Out")');
    
    // Assert redirect to home
    await expect(page).toHaveURL('/');
    
    // Verify session is cleared by trying to access protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('shows error message on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'citizen@test.civic');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    
    // Should not redirect
    await expect(page).toHaveURL('/login');
  });

  test('can navigate to register page from login', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('text=Create one');
    
    await expect(page).toHaveURL('/register');
  });
});