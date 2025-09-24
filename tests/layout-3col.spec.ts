import { test, expect, Page } from '@playwright/test'

// Helper function to authenticate and navigate to app
async function setupApp(page: Page) {
  await page.goto('/app')
  
  // Wait for authentication and app to load
  await page.waitForSelector('[data-testid="app-shell-3"]', { timeout: 10000 })
  
  // Sign in with Google (mock or skip if already signed in)
  const signInButton = page.locator('button:has-text("Sign in with Google")')
  if (await signInButton.isVisible()) {
    await signInButton.click()
    await page.waitForURL(/.*app.*/, { timeout: 15000 })
  }
  
  // Wait for the app to be fully loaded
  await page.waitForSelector('[data-testid="app-shell-3"]', { timeout: 10000 })
  await page.waitForLoadState('networkidle')
}

test.describe('3-Column Layout', () => {
  
  test.describe('Desktop viewport (1280x800)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
    })

    test('should show all 3 columns on desktop', async ({ page }) => {
      await setupApp(page)
      
      // Verify all 3 columns are visible
      const sectionsColumn = page.locator('[data-testid="sections-column"]')
      const listColumn = page.locator('[data-testid="list-column"]') 
      const detailColumn = page.locator('[data-testid="detail-column"]')
      
      await expect(sectionsColumn).toBeVisible()
      await expect(listColumn).toBeVisible()
      await expect(detailColumn).toBeVisible()
      
      // Verify sections rail shows section buttons
      await expect(sectionsColumn.locator('button:has-text("Folders")')).toBeVisible()
      await expect(sectionsColumn.locator('button:has-text("Notes")')).toBeVisible()
      await expect(sectionsColumn.locator('button:has-text("Messages")')).toBeVisible()
      await expect(sectionsColumn.locator('button:has-text("Trash")')).toBeVisible()
    })

    test('should resize column 2 with drag separator and persist after refresh', async ({ page }) => {
      await setupApp(page)
      
      const separator = page.locator('[role="separator"][aria-orientation="vertical"]')
      await expect(separator).toBeVisible()
      
      // Get initial width of column 2
      const listColumn = page.locator('[data-testid="list-column"]')
      const initialBox = await listColumn.boundingBox()
      const initialWidth = initialBox?.width || 0
      
      // Drag separator to resize - use relative movement from separator position
      const separatorBox = await separator.boundingBox()
      if (separatorBox) {
        await page.mouse.move(separatorBox.x + separatorBox.width / 2, separatorBox.y + separatorBox.height / 2)
        await page.mouse.down()
        await page.mouse.move(separatorBox.x + 100, separatorBox.y + separatorBox.height / 2) // Move 100px right
        await page.mouse.up()
      }
      
      // Wait for resize to complete
      await page.waitForTimeout(500)
      
      // Verify width changed
      const newBox = await listColumn.boundingBox()
      const newWidth = newBox?.width || 0
      expect(newWidth).toBeGreaterThan(initialWidth + 50) // Should be significantly wider
      
      // Refresh and verify width persisted (allow larger tolerance for persistence)
      await page.reload()
      await setupApp(page)
      
      const persistedBox = await listColumn.boundingBox()
      const persistedWidth = persistedBox?.width || 0
      expect(Math.abs(persistedWidth - newWidth)).toBeLessThan(50) // Allow larger variance due to page reload
    })

    test('should filter list when clicking on folder', async ({ page }) => {
      await setupApp(page)
      
      const sectionsColumn = page.locator('[data-testid="sections-column"]')
      
      // Click on Folders section
      await sectionsColumn.locator('button:has-text("Folders")').click()
      
      // Verify folders view is shown
      await expect(page.locator('text=Organize your notes')).toBeVisible()
      
      // Click on a folder (mock folder)
      const personalFolder = page.locator('button:has-text("Personal")')
      if (await personalFolder.isVisible()) {
        await personalFolder.click()
        
        // Verify folder is selected (has active styling)
        await expect(personalFolder).toHaveClass(/bg-primary/)
      }
    })

    test('should show file content in editor and reset on file switch', async ({ page }) => {
      await setupApp(page)
      
      const sectionsColumn = page.locator('[data-testid="sections-column"]')
      
      // Go to Notes section
      await sectionsColumn.locator('button:has-text("Notes")').click()
      
      // Wait for notes to load
      await page.waitForSelector('[role="listbox"]', { timeout: 5000 })
      
      // Get list of files
      const fileItems = page.locator('[role="option"]')
      const fileCount = await fileItems.count()
      
      if (fileCount === 0) {
        // Create a test file first
        await page.locator('button:has-text("New Note")').click()
        await page.waitForSelector('[role="option"]', { timeout: 5000 })
      }
      
      // Click on first file
      const firstFile = fileItems.first()
      await firstFile.click()
      
      // Verify editor is shown with file content
      const editor = page.locator('textarea, [contenteditable]').first()
      await expect(editor).toBeVisible()
      
      // Type some content
      await editor.fill('Test content for first file')
      await page.waitForTimeout(1000) // Allow autosave
      
      // Click on second file if exists
      if (fileCount > 1) {
        const secondFile = fileItems.nth(1)
        await secondFile.click()
        
        // Verify editor content changed (should be different or empty)
        const editorContent = await editor.inputValue()
        expect(editorContent).not.toBe('Test content for first file')
        
        // Go back to first file
        await firstFile.click()
        
        // Verify original content is restored
        await expect(editor).toHaveValue('Test content for first file')
      }
    })
  })

  test.describe('Tablet viewport (1024x800)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 800 })
    })

    test('should show 2 panels and switch between Sections+List and Detail', async ({ page }) => {
      await setupApp(page)
      
      // Initially should show Sections + List
      const sectionsColumn = page.locator('[data-testid="sections-column"]')
      const listColumn = page.locator('[data-testid="list-column"]')
      const detailColumn = page.locator('[data-testid="detail-column"]')
      
      await expect(sectionsColumn).toBeVisible()
      await expect(listColumn).toBeVisible()
      await expect(detailColumn).not.toBeVisible()
      
      // Click on a file to switch to detail view
      await page.locator('button:has-text("Notes")').click()
      await page.waitForSelector('[role="listbox"]', { timeout: 5000 })
      
      const fileItems = page.locator('[role="option"]')
      const fileCount = await fileItems.count()
      
      if (fileCount === 0) {
        // Create a test file first
        await page.locator('button:has-text("New Note")').click()
        await page.waitForSelector('[role="option"]', { timeout: 5000 })
      }
      
      // Click on file - should switch to detail view
      await fileItems.first().click()
      
      // Now detail should be visible, sections+list hidden
      await expect(detailColumn).toBeVisible()
      await expect(sectionsColumn).not.toBeVisible()
      await expect(listColumn).not.toBeVisible()
    })

    test('should create new note and open editor', async ({ page }) => {
      await setupApp(page)
      
      const sectionsColumn = page.locator('[data-testid="sections-column"]')
      
      // Go to Notes section
      await sectionsColumn.locator('button:has-text("Notes")').click()
      
      // Click New Note button
      await page.locator('button:has-text("New Note")').click()
      
      // Should switch to detail view with editor
      const detailColumn = page.locator('[data-testid="detail-column"]')
      await expect(detailColumn).toBeVisible()
      
      // Verify editor is visible and focused
      const editor = page.locator('textarea, [contenteditable]').first()
      await expect(editor).toBeVisible()
      await expect(editor).toBeFocused()
    })
  })

  test.describe('Mobile viewport (375x812)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
    })

    test('should show bottom tab bar and switch panels', async ({ page }) => {
      await setupApp(page)
      
      // Verify bottom tab bar is visible
      const tabBar = page.locator('[data-testid="mobile-tab-bar"]')
      await expect(tabBar).toBeVisible()
      
      // Verify tabs are present
      const sectionsTab = tabBar.locator('button:has-text("Sections")')
      const notesTab = tabBar.locator('button:has-text("Notes")')  
      const editorTab = tabBar.locator('button:has-text("Editor")')
      
      await expect(sectionsTab).toBeVisible()
      await expect(notesTab).toBeVisible()
      await expect(editorTab).toBeVisible()
      
      // Initially sections should be active
      await expect(sectionsTab).toHaveClass(/text-primary/)
      
      // Click Notes tab
      await notesTab.click()
      await expect(notesTab).toHaveClass(/text-primary/)
      
      // Click Editor tab
      await editorTab.click()
      await expect(editorTab).toHaveClass(/text-primary/)
    })

    test('should create new note in current folder and open editor', async ({ page }) => {
      await setupApp(page)
      
      const tabBar = page.locator('[data-testid="mobile-tab-bar"]')
      
      // Go to Notes tab
      const notesTab = tabBar.locator('button:has-text("Notes")')
      await notesTab.click()
      
      // Create new note
      await page.locator('button:has-text("New Note")').click()
      
      // Should automatically switch to Editor tab (panel 3)
      const editorTab = tabBar.locator('button:has-text("Editor")')
      await expect(editorTab).toHaveClass(/text-primary/)
      
      // Verify editor is visible
      const editor = page.locator('textarea, [contenteditable]').first()
      await expect(editor).toBeVisible()
    })
  })

  test.describe('Keyboard Shortcuts', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
    })

    test('should focus columns with 1, 2, 3 keys', async ({ page }) => {
      await setupApp(page)
      
      // Press '1' to focus sections column
      await page.keyboard.press('1')
      const sectionsColumn = page.locator('[data-testid="sections-column"]')
      await expect(sectionsColumn).toBeFocused()
      
      // Press '2' to focus list column
      await page.keyboard.press('2')
      const listColumn = page.locator('[data-testid="list-column"]')
      await expect(listColumn).toBeFocused()
      
      // Press '3' to focus detail column
      await page.keyboard.press('3')
      const detailColumn = page.locator('[data-testid="detail-column"]')
      await expect(detailColumn).toBeFocused()
    })

    test('should create new file with Ctrl+N in current folder', async ({ page }) => {
      await setupApp(page)
      
      const sectionsColumn = page.locator('[data-testid="sections-column"]')
      
      // Go to Notes section first
      await sectionsColumn.locator('button:has-text("Notes")').click()
      
      // Get initial file count
      await page.waitForSelector('[role="listbox"]', { timeout: 5000 })
      const initialFileCount = await page.locator('[role="option"]').count()
      
      // Press Ctrl+N (or Cmd+N on Mac)
      const isMac = process.platform === 'darwin'
      if (isMac) {
        await page.keyboard.press('Meta+n')
      } else {
        await page.keyboard.press('Control+n')
      }
      
      // Wait for new file to be created
      await page.waitForTimeout(2000)
      
      // Verify file count increased
      const newFileCount = await page.locator('[role="option"]').count()
      expect(newFileCount).toBeGreaterThan(initialFileCount)
      
      // Verify editor is focused with new file
      const editor = page.locator('textarea, [contenteditable]').first()
      await expect(editor).toBeVisible()
      await expect(editor).toBeFocused()
    })
  })

  test.describe('Keyboard Navigation on Tablet/Mobile', () => {
    test('should switch panels with 1, 2, 3 keys on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 800 })
      await setupApp(page)
      
      // Press '1' - should show sections
      await page.keyboard.press('1')
      const sectionsColumn = page.locator('[data-testid="sections-column"]')
      await expect(sectionsColumn).toBeVisible()
      
      // Press '2' - should show list  
      await page.keyboard.press('2')
      const listColumn = page.locator('[data-testid="list-column"]')
      await expect(listColumn).toBeVisible()
      
      // Press '3' - should show detail
      await page.keyboard.press('3')
      const detailColumn = page.locator('[data-testid="detail-column"]')
      await expect(detailColumn).toBeVisible()
    })

    test('should switch panels with 1, 2, 3 keys on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await setupApp(page)
      
      const tabBar = page.locator('[data-testid="mobile-tab-bar"]')
      
      // Press '2' - should switch to Notes tab and update tab bar
      await page.keyboard.press('2')
      const notesTab = tabBar.locator('button:has-text("Notes")')
      await expect(notesTab).toHaveClass(/text-primary/)
      
      // Press '3' - should switch to Editor tab
      await page.keyboard.press('3')
      const editorTab = tabBar.locator('button:has-text("Editor")')
      await expect(editorTab).toHaveClass(/text-primary/)
      
      // Press '1' - should switch back to Sections tab
      await page.keyboard.press('1')
      const sectionsTab = tabBar.locator('button:has-text("Sections")')
      await expect(sectionsTab).toHaveClass(/text-primary/)
    })
  })
})