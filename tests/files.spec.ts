import { test, expect } from '@playwright/test'

test.describe('File Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/app')
    
    // Wait for authentication and app to load
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 })
    
    // Sign in with Google (mock or skip if already signed in)
    const signInButton = page.locator('button:has-text("Sign in with Google")')
    if (await signInButton.isVisible()) {
      // For testing, we'll assume the user is already signed in
      // In a real test environment, you'd mock the auth or use test credentials
      await signInButton.click()
      await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 })
    }
  })

  // Note: These tests require:
  // 1. Development server running (npm run dev)
  // 2. Supabase authentication configured
  // 3. Test database with proper RLS policies
  // Skip all tests for now until test environment is set up
  test.beforeEach(async () => {
    test.skip(true, 'Skipping until test environment is configured')
  })

  test('should create new file via New button', async ({ page }) => {
    // Get initial file count
    const initialFiles = await page.locator('[data-testid="file-item"]').count()
    
    // Click the New button in sidebar
    await page.locator('button:has-text("New")').first().click()
    
    // Wait for new file to be created and selected
    await page.waitForFunction(() => {
      const fileItems = document.querySelectorAll('[data-testid="file-item"]')
      return fileItems.length > 0
    })
    
    // Verify file count increased
    const newFileCount = await page.locator('[data-testid="file-item"]').count()
    expect(newFileCount).toBe(initialFiles + 1)
    
    // Verify new file is selected (has current indicator)
    const currentFile = page.locator('[data-testid="file-item"]').filter({ has: page.locator('[title*="Current file"]') })
    await expect(currentFile).toBeVisible()
    
    // Verify editor is loaded with empty content
    const editor = page.locator('[data-testid="editor-textarea"]')
    await expect(editor).toBeVisible()
    await expect(editor).toHaveValue('')
  })

  test('should create new file via Ctrl+N keyboard shortcut', async ({ page }) => {
    // Get initial file count
    const initialFiles = await page.locator('[data-testid="file-item"]').count()
    
    // Use keyboard shortcut (Ctrl+N on Windows/Linux, Cmd+N on Mac)
    const isMac = await page.evaluate(() => navigator.platform.toUpperCase().indexOf('MAC') >= 0)
    if (isMac) {
      await page.keyboard.press('Meta+n')
    } else {
      await page.keyboard.press('Control+n')
    }
    
    // Wait for new file to be created
    await page.waitForFunction((expected) => {
      const fileItems = document.querySelectorAll('[data-testid="file-item"]')
      return fileItems.length >= expected
    }, initialFiles + 1)
    
    // Verify file count increased
    const newFileCount = await page.locator('[data-testid="file-item"]').count()
    expect(newFileCount).toBe(initialFiles + 1)
    
    // Verify new file is selected and editor is visible
    const editor = page.locator('[data-testid="editor-textarea"]')
    await expect(editor).toBeVisible()
  })

  test('should switch between files and load different content', async ({ page }) => {
    // Create first file and add content
    await page.locator('button:has-text("New")').first().click()
    await page.waitForSelector('[data-testid="editor-textarea"]')
    
    const editor = page.locator('[data-testid="editor-textarea"]')
    const firstFileContent = 'This is the content of the first file'
    await editor.fill(firstFileContent)
    
    // Wait for autosave to complete
    await page.waitForTimeout(3000)
    
    // Create second file and add different content
    await page.locator('button:has-text("New")').first().click()
    await page.waitForSelector('[data-testid="editor-textarea"]')
    
    const secondFileContent = 'This is the content of the second file'
    await editor.fill(secondFileContent)
    
    // Wait for autosave
    await page.waitForTimeout(3000)
    
    // Get file items
    const fileItems = page.locator('[data-testid="file-item"]')
    await expect(fileItems).toHaveCount(2)
    
    // Click on first file
    await fileItems.first().click()
    await page.waitForTimeout(1000)
    
    // Verify editor content switched to first file
    await expect(editor).toHaveValue(firstFileContent)
    
    // Click on second file
    await fileItems.last().click()
    await page.waitForTimeout(1000)
    
    // Verify editor content switched to second file
    await expect(editor).toHaveValue(secondFileContent)
  })

  test('should rename file inline and persist after refresh', async ({ page }) => {
    // Create a new file
    await page.locator('button:has-text("New")').first().click()
    await page.waitForSelector('[data-testid="file-item"]')
    
    // Double-click on file name to start editing
    const fileName = page.locator('[data-testid="file-item"]').first().locator('p').first()
    await fileName.dblclick()
    
    // Wait for input field to appear
    const renameInput = page.locator('[data-testid="file-item"] input')
    await expect(renameInput).toBeVisible()
    
    // Clear and type new name
    const newName = 'My Renamed File'
    await renameInput.fill(newName)
    await renameInput.press('Enter')
    
    // Wait for rename to complete
    await page.waitForTimeout(1000)
    
    // Verify name changed in sidebar
    await expect(fileName).toHaveText(newName)
    
    // Refresh the page
    await page.reload()
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 })
    
    // Verify name persisted after refresh
    const fileNameAfterRefresh = page.locator('[data-testid="file-item"]').first().locator('p').first()
    await expect(fileNameAfterRefresh).toHaveText(newName)
  })

  test('should delete file and fallback to latest existing file', async ({ page }) => {
    // Create two files
    await page.locator('button:has-text("New")').first().click()
    await page.waitForSelector('[data-testid="editor-textarea"]')
    
    const editor = page.locator('[data-testid="editor-textarea"]')
    await editor.fill('Content of first file')
    await page.waitForTimeout(2000) // Wait for autosave
    
    await page.locator('button:has-text("New")').first().click()
    await page.waitForSelector('[data-testid="editor-textarea"]')
    await editor.fill('Content of second file')
    await page.waitForTimeout(2000) // Wait for autosave
    
    // Verify we have 2 files
    const fileItems = page.locator('[data-testid="file-item"]')
    await expect(fileItems).toHaveCount(2)
    
    // Get the current file (second file should be selected)
    const currentFile = fileItems.filter({ has: page.locator('[title*="Current file"]') })
    await expect(currentFile).toHaveCount(1)
    
    // Hover over current file to show delete button
    await currentFile.hover()
    
    // Click delete button
    const deleteButton = currentFile.locator('[title="Delete file"]')
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000)
    
    // Verify file count decreased
    await expect(fileItems).toHaveCount(1)
    
    // Verify editor shows content of remaining file
    await expect(editor).toHaveValue('Content of first file')
    
    // Verify the remaining file is now current
    const newCurrentFile = fileItems.filter({ has: page.locator('[title*="Current file"]') })
    await expect(newCurrentFile).toHaveCount(1)
  })

  test('should preserve content during file switching (autosave)', async ({ page }) => {
    // Create first file
    await page.locator('button:has-text("New")').first().click()
    await page.waitForSelector('[data-testid="editor-textarea"]')
    
    const editor = page.locator('[data-testid="editor-textarea"]')
    const firstContent = 'Initial content of first file'
    await editor.fill(firstContent)
    
    // Wait for autosave
    await page.waitForTimeout(3000)
    
    // Create second file
    await page.locator('button:has-text("New")').first().click()
    await page.waitForSelector('[data-testid="editor-textarea"]')
    
    const secondContent = 'Initial content of second file'
    await editor.fill(secondContent)
    
    // Don't wait for autosave - we want to test immediate switching
    await page.waitForTimeout(500)
    
    // Type additional content in second file
    const additionalContent = '\\nAdditional unsaved content'
    await editor.press('End')
    await editor.type(additionalContent)
    
    // Immediately switch to first file (before autosave completes)
    const fileItems = page.locator('[data-testid="file-item"]')
    await fileItems.first().click()
    
    // Wait a moment for switching
    await page.waitForTimeout(1000)
    
    // Verify first file content is preserved
    await expect(editor).toHaveValue(firstContent)
    
    // Switch back to second file
    await fileItems.last().click()
    await page.waitForTimeout(1000)
    
    // Verify second file content includes the additional content
    // Note: This tests that autosave happened during file switching
    const expectedSecondContent = secondContent + additionalContent
    await expect(editor).toHaveValue(expectedSecondContent)
  })

  test('should show dirty state indicators', async ({ page }) => {
    // Create a new file
    await page.locator('button:has-text("New")').first().click()
    await page.waitForSelector('[data-testid="editor-textarea"]')
    
    const editor = page.locator('[data-testid="editor-textarea"]')
    const fileItem = page.locator('[data-testid="file-item"]').first()
    
    // Initially should show blue bullet (current, clean)
    const currentIndicator = fileItem.locator('[title="Current file"]')
    await expect(currentIndicator).toBeVisible()
    await expect(currentIndicator).toHaveClass(/bg-blue-500/)
    
    // Type content to make it dirty
    await editor.type('Some unsaved content')
    
    // Should show orange bullet (current, dirty)
    const dirtyIndicator = fileItem.locator('[title*="Unsaved changes"]')
    await expect(dirtyIndicator).toBeVisible()
    await expect(dirtyIndicator).toHaveClass(/bg-orange-500/)
    
    // Wait for autosave to complete
    await page.waitForTimeout(4000)
    
    // Should return to blue bullet (current, clean)
    await expect(currentIndicator).toBeVisible()
    await expect(currentIndicator).toHaveClass(/bg-blue-500/)
  })

  test('should open Quick Switch modal with Ctrl+O', async ({ page }) => {
    // Create multiple files first
    await page.locator('button:has-text("New")').first().click()
    await page.waitForSelector('[data-testid="editor-textarea"]')
    
    await page.locator('button:has-text("New")').first().click()
    await page.waitForSelector('[data-testid="editor-textarea"]')
    
    // Open Quick Switch with keyboard shortcut
    const isMac = await page.evaluate(() => navigator.platform.toUpperCase().indexOf('MAC') >= 0)
    if (isMac) {
      await page.keyboard.press('Meta+o')
    } else {
      await page.keyboard.press('Control+o')
    }
    
    // Verify modal opened
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()
    
    // Verify search input is focused
    const searchInput = modal.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeFocused()
    
    // Verify files are listed
    const fileList = modal.locator('button').filter({ hasText: /Untitled/ })
    await expect(fileList).toHaveCount(2)
    
    // Close modal with Escape
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
  })
})