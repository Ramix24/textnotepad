import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('blocks /app for anonymous users', async ({ page }) => {
    // Attempt to visit the protected /app route
    await page.goto('/app')
    
    // Should be redirected to home page
    await expect(page).toHaveURL('/')
    
    // Should show the landing page content
    await expect(page.locator('h1')).toContainText('TextNotepad.com')
  })

  test('landing shows Sign in when logged out', async ({ page }) => {
    // Visit the home page
    await page.goto('/')
    
    // Should show the main heading
    await expect(page.locator('h1')).toContainText('TextNotepad.com')
    
    // Should show Sign in with Google button
    await expect(page.locator('button', { hasText: 'Sign in with Google' })).toBeVisible()
    
    // Should NOT show "Go to App" button or signed-in status
    await expect(page.locator('button', { hasText: 'Go to App' })).not.toBeVisible()
    await expect(page.locator('text=You\'re signed in as')).not.toBeVisible()
  })

  test('shows auth error toast when redirected with error', async ({ page }) => {
    // Visit home page with auth error parameter
    await page.goto('/?authError=1')
    
    // Should show error toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible()
    await expect(page.locator('text=Authentication failed')).toBeVisible()
  })

  test('middleware preserves intended destination', async ({ page }) => {
    // Try to access a specific app route
    await page.goto('/app/some-path')
    
    // Should be redirected to home with next parameter
    await expect(page).toHaveURL('/?next=%2Fapp%2Fsome-path')
    
    // Should still show the sign in button
    await expect(page.locator('button', { hasText: 'Sign in with Google' })).toBeVisible()
  })
})