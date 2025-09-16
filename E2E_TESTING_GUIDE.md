# E2E Testing Guide for TextNotepad

This guide explains how to run end-to-end tests for the TextNotepad editor, particularly handling authentication for protected routes.

## Test Files

- `tests/editor.spec.ts` - Main editor functionality tests
- `tests/auth.spec.ts` - Authentication flow tests (existing)

## Authentication Strategies

### Strategy 1: Mock Session (Recommended for CI/CD)

The E2E tests use a mock session approach that bypasses Google OAuth for faster, more reliable testing:

```typescript
async function setupAuthenticatedSession(page: Page) {
  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
  }
  
  await page.context().addCookies([
    {
      name: 'sb-auth-token',
      value: JSON.stringify(mockSession),
      domain: 'localhost',
      path: '/'
    }
  ])
}
```

### Strategy 2: Test Database with Real Auth

For more comprehensive testing, you can set up a test database with real authentication:

```bash
# Set up test environment
cp .env.local .env.test
# Edit .env.test to point to test Supabase project
```

```typescript
// In your test setup
test.beforeAll(async () => {
  // Create test user in Supabase
  const { user } = await supabase.auth.admin.createUser({
    email: 'test@example.com',
    password: 'test-password',
    email_confirm: true
  })
})
```

## Running the Tests

### Prerequisites

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Install Playwright browsers (if not already installed):**
   ```bash
   pnpm playwright install
   ```

### Basic Test Execution

```bash
# Run all E2E tests
pnpm test:e2e

# Run only editor tests
pnpm playwright test tests/editor.spec.ts

# Run tests in headed mode (see browser)
pnpm playwright test tests/editor.spec.ts --headed

# Run tests with debug mode
pnpm playwright test tests/editor.spec.ts --debug
```

### Test Configuration

The tests are configured in `playwright.config.ts` with these settings:

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add more browsers as needed
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Test Coverage

### Editor Functionality Tests

1. **Basic Editor Loading**
   - ✅ Opens `/app` as authenticated user
   - ✅ Displays editor components
   - ✅ Shows initial "Saved" state

2. **Autosave Flow**
   - ✅ Typing → "Unsaved" → "Saving…" → "Saved"
   - ✅ Debounced saves (1 second delay)
   - ✅ Throttled saves (max 1 per 2 seconds)

3. **Persistence**
   - ✅ Text persists after page refresh
   - ✅ Statistics recalculated correctly after reload

4. **Manual Save**
   - ✅ Ctrl/Cmd+S triggers immediate save
   - ✅ Success toast notification

5. **Real-time Statistics**
   - ✅ Word count updates
   - ✅ Character count updates
   - ✅ Line count updates
   - ✅ File size calculation

6. **Performance**
   - ✅ Large text handling (1000+ words)
   - ✅ Rapid typing scenarios
   - ✅ Statistics calculation efficiency

7. **UI/UX**
   - ✅ Focus management during autosave
   - ✅ Cursor position preservation
   - ✅ Version number display
   - ✅ File metadata display

### Conflict Resolution (Optional)

8. **External Modifications**
   - ✅ Detects conflicts via version mismatch
   - ✅ Shows conflict resolution toast
   - ✅ Replaces content with server version

## Test Environment Setup

### Option 1: Mock Backend (Fast)

For rapid testing without database dependencies:

```typescript
// Mock API responses
await page.route('**/api/user-files/**', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({
      id: 'test-file',
      content: 'Mock content',
      version: 1,
      // ... other properties
    })
  })
})
```

### Option 2: Test Database (Comprehensive)

1. **Create test Supabase project:**
   ```bash
   # Set up separate test project
   # Update .env.test with test credentials
   ```

2. **Seed test data:**
   ```sql
   -- Insert test user and files
   INSERT INTO auth.users (id, email) VALUES 
   ('test-user-id', 'test@example.com');
   
   INSERT INTO user_files (id, user_id, name, content, version) VALUES 
   ('test-file-id', 'test-user-id', 'Test Document', 'Initial content', 1);
   ```

3. **Run tests against test DB:**
   ```bash
   NODE_ENV=test pnpm playwright test
   ```

## Debugging Failed Tests

### Common Issues

1. **Authentication failures:**
   ```bash
   # Check if session cookie is set correctly
   pnpm playwright test --debug
   # Inspect Application tab in DevTools
   ```

2. **Timing issues:**
   ```typescript
   // Increase timeouts for slow operations
   await expect(page.locator('text=Saved')).toBeVisible({ timeout: 10000 })
   ```

3. **Database state:**
   ```bash
   # Reset test database between runs
   pnpm db:reset:test
   ```

### Debug Mode

```bash
# Run specific test with debugger
pnpm playwright test tests/editor.spec.ts:10 --debug

# Generate trace files
pnpm playwright test --trace on

# View trace
pnpm playwright show-trace test-results/trace.zip
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright
        run: pnpm playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          # Use test environment variables
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Performance Considerations

### Large Text Testing

The tests include scenarios with large documents:

```typescript
// Test with 1000+ word documents
const longText = 'sentence '.repeat(1000)
await textarea.fill(longText)

// Verify performance doesn't degrade
await expect(page.locator('text=Saved')).toBeVisible({ timeout: 10000 })
```

### Memory Usage

Monitor memory usage during tests:

```bash
# Run with memory profiling
pnpm playwright test --reporter=json > results.json
# Analyze memory usage patterns
```

## Security Testing

### Authentication Edge Cases

```typescript
test('should handle expired sessions', async ({ page }) => {
  // Set expired session cookie
  await page.context().addCookies([{
    name: 'sb-auth-token',
    value: 'expired-token',
    domain: 'localhost',
    path: '/'
  }])
  
  await page.goto('/app')
  // Should redirect to login
  await expect(page).toHaveURL('/')
})
```

### Input Validation

```typescript
test('should handle malicious input safely', async ({ page }) => {
  const maliciousInput = '<script>alert("xss")</script>'
  await textarea.fill(maliciousInput)
  
  // Should be treated as plain text, not executed
  await expect(textarea).toHaveValue(maliciousInput)
})
```

## Maintenance

### Updating Tests

When adding new editor features:

1. **Add corresponding test cases**
2. **Update authentication mocks if needed**
3. **Verify performance impact**
4. **Update this documentation**

### Test Data Cleanup

```typescript
test.afterAll(async () => {
  // Clean up test data
  await supabase
    .from('user_files')
    .delete()
    .eq('user_id', 'test-user-id')
})
```

## Troubleshooting

### Test Flakiness

1. **Add explicit waits:**
   ```typescript
   await page.waitForLoadState('networkidle')
   ```

2. **Use retry logic:**
   ```typescript
   await test.step('retry save operation', async () => {
     await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 })
   })
   ```

3. **Isolate test environment:**
   ```bash
   # Run tests in series instead of parallel
   pnpm playwright test --workers=1
   ```

### Viewport Issues

```typescript
// Set consistent viewport
test.use({ viewport: { width: 1280, height: 720 } })
```

This comprehensive testing setup ensures the editor functionality works correctly across different scenarios while maintaining good performance and user experience.