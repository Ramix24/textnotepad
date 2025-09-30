import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">TextNotepad.com</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="space-y-3">
              <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-100">404</h1>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Page Not Found</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go Home
              </Link>
              <Link 
                href="/app"
                className="inline-flex items-center justify-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Open Editor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}