import { test, expect, type Page } from '@playwright/test'

// Authentication helpers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function signInWithGoogle(page: Page) {
  // For development/testing, we'll use a mock login approach
  // This simulates the authentication flow without requiring actual Google OAuth
  
  // Navigate to home page
  await page.goto('/')
  
  // Click the login button
  await page.click('text=Login with Google')
  
  // Wait for redirect to auth callback
  await page.waitForURL('**/auth/callback**')
  
  // Wait for final redirect to /app
  await page.waitForURL('**/app')
  
  // Verify we're logged in by checking for the editor
  await expect(page.locator('textarea')).toBeVisible()
}

async function setupAuthenticatedSession(page: Page) {
  // Alternative approach: Set session cookie directly
  // This bypasses the OAuth flow for faster testing
  
  // Mock session data - in real tests, you'd get this from your test database
  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
  }
  
  // Set the Supabase auth cookie
  await page.context().addCookies([
    {
      name: 'sb-auth-token',
      value: JSON.stringify(mockSession),
      domain: 'localhost',
      path: '/'
    }
  ])
  
  // Navigate directly to /app
  await page.goto('/app')
  
  // Wait for editor to load
  await expect(page.locator('textarea')).toBeVisible()
}

test.describe('Editor E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated session before each test
    await setupAuthenticatedSession(page)
  })

  test('should open /app as authenticated user and display editor', async ({ page }) => {
    // Should already be on /app with editor visible from beforeEach
    
    // Verify editor components are present
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('text=Words:')).toBeVisible()
    await expect(page.locator('text=Characters:')).toBeVisible()
    await expect(page.locator('text=Lines:')).toBeVisible()
    await expect(page.locator('text=Size:')).toBeVisible()
    
    // Verify initial state shows "Saved"
    await expect(page.locator('text=Saved')).toBeVisible()
  })

  test('should show autosave flow: typing → Saving → Saved', async ({ page }) => {
    const textarea = page.locator('textarea')
    
    // Start with a clean state
    await expect(page.locator('text=Saved')).toBeVisible()
    
    // Type some text
    await textarea.fill('This is a test document with multiple sentences.')
    
    // Should immediately show "Unsaved" state
    await expect(page.locator('text=Unsaved')).toBeVisible()
    
    // Within 2 seconds, should show "Saving…"
    await expect(page.locator('text=Saving…')).toBeVisible({ timeout: 2500 })
    
    // Should eventually show "Saved" (allow up to 5 seconds for save to complete)
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 })
    
    // Verify statistics updated
    await expect(page.locator('text=Words: 9')).toBeVisible()
    await expect(page.locator('text=Characters: 49')).toBeVisible()
  })

  test('should persist text after page refresh', async ({ page }) => {
    const testText = 'This text should persist after refresh. It contains multiple sentences with various punctuation!'
    const textarea = page.locator('textarea')
    
    // Type and save text
    await textarea.fill(testText)
    
    // Wait for save to complete
    await expect(page.locator('text=Saving…')).toBeVisible({ timeout: 2500 })
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 })
    
    // Refresh the page
    await page.reload()
    
    // Wait for editor to load again
    await expect(textarea).toBeVisible()
    
    // Verify the text persisted
    await expect(textarea).toHaveValue(testText)
    
    // Verify statistics are correctly calculated after reload
    await expect(page.locator('text=Words: 16')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('text=Characters: 99')).toBeVisible()
  })

  test('should force save with Ctrl+S shortcut', async ({ page }) => {
    const textarea = page.locator('textarea')
    
    // Type some text
    await textarea.fill('Testing manual save with keyboard shortcut.')
    
    // Should show "Unsaved"
    await expect(page.locator('text=Unsaved')).toBeVisible()
    
    // Press Ctrl+S (or Cmd+S on Mac)
    await page.keyboard.press('Control+s')
    
    // Should immediately show "Saving…" then "Saved"
    await expect(page.locator('text=Saving…')).toBeVisible({ timeout: 1000 })
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 })
    
    // Should show success toast
    await expect(page.locator('text=File saved manually')).toBeVisible({ timeout: 2000 })
  })

  test('should handle rapid typing with debounced saves', async ({ page }) => {
    const textarea = page.locator('textarea')
    
    // Type text rapidly in chunks
    await textarea.type('First chunk of text. ')
    await page.waitForTimeout(100)
    await textarea.type('Second chunk of text. ')
    await page.waitForTimeout(100)
    await textarea.type('Third chunk of text.')
    
    // Should show "Unsaved" during typing
    await expect(page.locator('text=Unsaved')).toBeVisible()
    
    // Should eventually debounce and save
    await expect(page.locator('text=Saving…')).toBeVisible({ timeout: 2000 })
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 })
    
    // Verify final content
    const finalText = await textarea.inputValue()
    expect(finalText).toBe('First chunk of text. Second chunk of text. Third chunk of text.')
  })

  test('should update statistics in real-time', async ({ page }) => {
    const textarea = page.locator('textarea')
    
    // Start with short text
    await textarea.fill('Hello')
    
    // Wait for statistics to update (they're debounced)
    await expect(page.locator('text=Words: 1')).toBeVisible({ timeout: 2000 })
    await expect(page.locator('text=Characters: 5')).toBeVisible()
    
    // Add more text
    await textarea.fill('Hello world! This is a longer text with more words.')
    
    // Wait for statistics to update again
    await expect(page.locator('text=Words: 11')).toBeVisible({ timeout: 2000 })
    await expect(page.locator('text=Characters: 51')).toBeVisible()
    
    // Add multiple lines
    await textarea.fill('Line 1\nLine 2\nLine 3\nThis is line 4 with more words.')
    
    // Check line count updated
    await expect(page.locator('text=Lines: 4')).toBeVisible({ timeout: 2000 })
  })

  test('should show version number and file metadata', async ({ page }) => {
    // Should display version number
    await expect(page.locator('text=v1')).toBeVisible()
    
    // Should show file encoding
    await expect(page.locator('text=UTF-8')).toBeVisible()
    
    // Should show file status (new file or last modified date)
    const fileStatus = page.locator('text=/New file|Modified/')
    await expect(fileStatus).toBeVisible()
  })

  test('should handle large text input efficiently', async ({ page }) => {
    const textarea = page.locator('textarea')
    
    // Create a large text (simulating a long document)
    const longText = 'This is a sentence that will be repeated many times to create a large document. '.repeat(1000)
    
    // Fill with large text
    await textarea.fill(longText)
    
    // Should still show autosave flow
    await expect(page.locator('text=Unsaved')).toBeVisible()
    await expect(page.locator('text=Saving…')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 10000 })
    
    // Statistics should be calculated correctly
    await expect(page.locator('text=Words: 15,000')).toBeVisible({ timeout: 5000 })
    
    // Size should be shown in KB
    await expect(page.locator('text=/Size: \d+\.\d+ KB/')).toBeVisible()
  })

  test('should maintain focus and cursor position during autosave', async ({ page }) => {
    const textarea = page.locator('textarea')
    
    // Type some text
    await textarea.fill('Hello world')
    
    // Position cursor in the middle
    await textarea.press('Home') // Go to beginning
    await textarea.press('ArrowRight') // Move right 5 times
    await textarea.press('ArrowRight')
    await textarea.press('ArrowRight')
    await textarea.press('ArrowRight')
    await textarea.press('ArrowRight')
    
    // Type more text at cursor position
    await textarea.type(' beautiful')
    
    // Wait for autosave
    await expect(page.locator('text=Saving…')).toBeVisible({ timeout: 2000 })
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 })
    
    // Verify text was inserted correctly
    await expect(textarea).toHaveValue('Hello beautiful world')
    
    // Verify focus is still on textarea
    await expect(textarea).toBeFocused()
  })
})

test.describe('Editor Conflict Resolution (Optional)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page)
  })

  test('should handle conflict when file is modified externally', async ({ page }) => {
    const textarea = page.locator('textarea')
    
    // Start with some initial content
    await textarea.fill('Initial content before conflict.')
    
    // Wait for save
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 })
    
    // Simulate external modification by directly calling API
    // This would require exposing a test endpoint or using a test database
    await page.evaluate(async () => {
      // Mock a conflict by simulating another user's edit
      // In a real test, you'd modify the database directly
      await fetch('/api/test/simulate-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: 'current-file-id',
          newContent: 'Content modified by another user!'
        })
      })
    })
    
    // Now type in the editor to trigger a conflict
    await textarea.type('\nThis text will cause a conflict.')
    
    // Should show conflict resolution toast
    await expect(page.locator('text=Content updated from server')).toBeVisible({ timeout: 5000 })
    
    // Content should be replaced with server version
    await expect(textarea).toHaveValue('Content modified by another user!')
    
    // Should show "Saved" state after conflict resolution
    await expect(page.locator('text=Saved')).toBeVisible()
  })
})

// Test helper for authentication setup
test.describe('Authentication Setup Tests', () => {
  test('should redirect unauthenticated users to home page', async ({ page }) => {
    // Try to access /app without authentication
    await page.goto('/app')
    
    // Should be redirected to home page
    await page.waitForURL('/')
    
    // Should see login button
    await expect(page.locator('text=Login with Google')).toBeVisible()
  })
  
  test('should complete OAuth flow and redirect to app', async ({ page }) => {
    // This test would require setting up OAuth mocking
    // For now, it serves as documentation of the expected flow
    
    await page.goto('/')
    
    // Mock the OAuth callback response
    await page.route('**/auth/callback**', route => {
      route.fulfill({
        status: 302,
        headers: {
          'Location': '/app'
        }
      })
    })
    
    await page.click('text=Login with Google')
    
    // Should end up at /app
    await page.waitForURL('**/app')
  })
})