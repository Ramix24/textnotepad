import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Logo } from '@/components/ui/logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border-dark bg-bg-secondary">
        <Container>
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo size={32} />
              <span className="text-xl font-semibold text-text-primary">TextNotepad.com</span>
            </Link>
          </div>
        </Container>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <Container>
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="space-y-3">
              <h1 className="text-6xl font-bold text-text-primary">404</h1>
              <h2 className="text-2xl font-semibold text-text-primary">Page Not Found</h2>
              <p className="text-text-secondary">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/app">Open Editor</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}