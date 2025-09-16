# TextNotepad.com

A modern web-based text editor and notepad application built with Next.js, TypeScript, Tailwind CSS, and Supabase. Provides a clean, fast, and intuitive interface for creating, editing, and managing text documents in the browser.

## Environment Variables

Before running the application, you need to set up your environment variables:

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure Supabase:**
   - Create a new project at [Supabase](https://supabase.com) (recommend EU region: eu-central-1)
   - Go to Settings → API in your Supabase dashboard
   - Copy the values to your `.env.local` file:

   ```bash
   # Required for client-side operations (safe to expose)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anonymous-key-here
   
   # Required for server-side admin operations (⚠️ keep secret)
   SUPABASE_SERVICE_ROLE=your-service-role-key-here
   ```

**⚠️ Security Notes:** 
- Never commit your `.env.local` file 
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for client-side)
- `SUPABASE_SERVICE_ROLE` key must ONLY be used in server-side code (API routes, server components)
- The service role key bypasses Row Level Security - handle with extreme care

## Google OAuth Setup

To enable Google OAuth authentication, configure the provider in your Supabase project:

1. **Enable Google Provider:**
   - Go to your [Supabase dashboard](https://supabase.com/dashboard)
   - Navigate to Authentication → Providers
   - Find Google and click to enable it

2. **Configure Redirect URIs:**
   Add these authorized redirect URIs in your Google Cloud Console:
   
   **Production:**
   ```
   https://textnotepad.com/auth/callback
   ```
   
   **Local Development:**
   ```
   http://localhost:3000/auth/callback
   ```

3. **How it Works:**
   - Users click "Sign in with Google"
   - Google redirects to `/auth/callback` route
   - Supabase handles the OAuth flow and creates/updates user session
   - User is redirected to the application with authentication

**Note:** The `/auth/callback` route is automatically handled by Supabase Auth for Next.js applications.

## Route Protection

The application uses Next.js middleware to protect authenticated routes:

- **Protected Routes:** `/app/*` - requires user authentication
- **Public Routes:** `/`, `/auth/*`, `/components-demo` - accessible to all users
- **Middleware Behavior:**
  - Unauthenticated users accessing `/app/*` are redirected to `/`
  - The intended destination is preserved as `?next=/app/...` query parameter
  - Authentication errors are handled gracefully with fallback redirects

**Implementation:** See `src/middleware.ts` for the authentication middleware logic.

## Getting Started

```bash
# Install Node.js version specified in .nvmrc
nvm use

# Install dependencies  
pnpm install

# Set up environment variables (see above)
cp .env.example .env.local

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI mode
pnpm test:e2e:ui

# Run E2E tests in headed mode (see browser)
pnpm test:e2e:headed
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## E2E Testing

The project uses Playwright for end-to-end testing to ensure authentication flows work correctly.

### Running E2E Tests Locally

**Prerequisites:**
- Development server must be running (`pnpm dev`)
- Tests will automatically start/stop the dev server if needed

**Test Commands:**
```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run tests with interactive UI (recommended for development)
pnpm test:e2e:ui

# Run tests in headed mode (see browser actions)
pnpm test:e2e:headed

# Install Playwright browsers (first time setup)
npx playwright install
```

**Test Coverage:**
- ✅ Anonymous users are redirected from `/app/*` routes
- ✅ Landing page shows "Sign in with Google" when logged out
- ✅ Auth error handling with toast notifications
- ✅ Middleware preserves intended destination with `?next=` parameter

**Note:** Tests run against the actual application without mocking OAuth flows, focusing on navigation and UI behavior.

## Database Migrations

### Running Migrations

The database schema is managed through SQL migration files in the `migrations/` directory.

**Local Development:**
```bash
# Using Supabase CLI (recommended)
supabase db reset --local
supabase migration up --local

# Or apply manually via Supabase dashboard:
# 1. Go to your project dashboard
# 2. Navigate to SQL Editor
# 3. Copy and paste the migration file content
# 4. Execute the SQL
```

**Production/Cloud:**
```bash
# Using Supabase CLI
supabase db push

# Or apply manually:
# 1. Go to Supabase dashboard → SQL Editor
# 2. Copy migration content from migrations/001_create_user_files_table.sql
# 3. Execute the SQL
```

### Testing Row Level Security (RLS)

After applying the migration, test RLS policies manually:

```sql
-- 1. Insert test data (should only work with your user_id)
INSERT INTO public.user_files (user_id, name, content)
VALUES (auth.uid(), 'test-file.txt', 'Hello World!');

-- 2. Select your files (should only return your files)
SELECT id, name, content, created_at 
FROM public.user_files 
WHERE deleted_at IS NULL
ORDER BY updated_at DESC;

-- 3. Try to access another user's data (should return empty)
SELECT * FROM public.user_files 
WHERE user_id != auth.uid();

-- 4. Update your file (should work)
UPDATE public.user_files 
SET content = 'Updated content', version = version + 1
WHERE id = 'your-file-id' AND user_id = auth.uid();

-- 5. Soft delete (should work)
UPDATE public.user_files 
SET deleted_at = NOW()
WHERE id = 'your-file-id' AND user_id = auth.uid();
```

**Expected Results:**
- ✅ INSERT/SELECT/UPDATE/DELETE work for your own files
- ✅ Cannot access files belonging to other users
- ✅ RLS policies enforce user isolation
- ✅ Soft delete via `deleted_at` timestamp

## Database Types

### Generating Types

Database types are automatically generated from your Supabase schema and stored in `src/types/database.types.ts`.

**Regenerate types after schema changes:**
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Generate types from cloud project
supabase gen types typescript --project-id wokogphtzkarrodolmxd --schema public > src/types/database.types.ts

# Or if using local development
supabase gen types typescript --local --schema public > src/types/database.types.ts
```

**When to regenerate types:**
- ✅ After running any database migration
- ✅ After adding/modifying tables or columns
- ✅ After changing RLS policies that affect column access
- ✅ Before deploying to production

**Type-safe helpers:**
- `UserFile` - Complete user file record
- `InsertUserFile` - Type for creating new files
- `UpdateUserFile` - Type for updating existing files
- `UserFileOperations` - Interface for CRUD operations

**Usage example:**
```typescript
import { Database } from '@/types/database.types'
import { UserFile, InsertUserFile } from '@/types/user-files.types'

// Type-safe Supabase client
const supabase = createClient<Database>(url, key)

// Type-safe operations
const newFile: InsertUserFile = {
  user_id: user.id,
  name: 'document.txt',
  content: 'Hello world!'
}
```

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
