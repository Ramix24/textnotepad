# Test Runner Guide

Quick reference for running all tests in TextNotepad.

## 🧪 Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test:run

# Run unit tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run specific test file
pnpm vitest tests/counters.test.ts

# Run tests with coverage
pnpm vitest --coverage
```

## 🎭 E2E Tests (Playwright)

```bash
# Run all E2E tests (starts dev server automatically)
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run E2E tests in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test file
pnpm playwright test tests/editor.spec.ts

# Debug specific test
pnpm playwright test tests/editor.spec.ts --debug
```

## 🚀 Quick Test Commands

```bash
# Full test suite
pnpm test:run && pnpm test:e2e

# Unit tests only (fast)
pnpm test:run

# E2E tests only (comprehensive)
pnpm test:e2e

# Check test status without running
pnpm playwright test --list
```

## 📊 Test Coverage

- **Unit Tests**: 42 tests covering counter functions and edge cases
- **E2E Tests**: 16 tests covering editor functionality and auth flow
- **Coverage Areas**:
  - ✅ Text statistics calculation (words, chars, lines, bytes)
  - ✅ Large text performance (1MB+ documents)
  - ✅ Unicode and emoji handling
  - ✅ Editor autosave flow
  - ✅ Persistence after refresh
  - ✅ Manual save shortcuts
  - ✅ Real-time statistics updates
  - ✅ Conflict resolution
  - ✅ Authentication protection

## 🔧 Troubleshooting

### Unit Tests Failing
```bash
# Check syntax errors
pnpm typecheck

# Run specific failing test
pnpm vitest tests/counters.test.ts -t "should handle large text"
```

### E2E Tests Failing
```bash
# Check if dev server is running
curl http://localhost:3000

# Install browser dependencies
pnpm playwright install --with-deps

# Run with debug output
DEBUG=pw:api pnpm test:e2e
```

### Authentication Issues in E2E
- Tests use mock authentication by default
- See `E2E_TESTING_GUIDE.md` for detailed auth setup
- Check `setupAuthenticatedSession()` function in `tests/editor.spec.ts`

## 📈 Performance Benchmarks

Unit tests include performance benchmarks for:
- **1MB text processing**: < 100ms
- **100k words counting**: < 50ms
- **50k lines processing**: < 30ms
- **Unicode emoji handling**: < 10ms per 1000 characters

E2E tests verify:
- **Autosave timing**: 1-2 seconds after typing stops
- **Statistics update**: < 200ms for real-time display
- **Large document handling**: 15MB+ documents supported
- **Page load time**: < 3 seconds for editor initialization