"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Logo } from "@/components/ui/logo"
import { useAuthSession } from "@/hooks/useAuthSession"
import { formatVersion } from "@/lib/version"

export function Header() {
  const { user } = useAuthSession()
  
  return (
    <MotionDiv
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/60">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Logo size={32} />
              <div className="flex items-center space-x-2">
                <span className="text-xl font-semibold text-text-primary">TextNotepad.com</span>
                <span className="text-sm text-text-secondary bg-bg-secondary px-2 py-0.5 rounded-md font-mono">
                  {formatVersion()}
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#security"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Security
              </Link>
              <Link
                href="#faq"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                FAQ
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <Button size="sm" asChild className="bg-tn-accent text-white hover:bg-gray-800">
                  <Link href="/app">Open Editor</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="text-text-secondary hover:text-text-primary hover:bg-[color:var(--bg-active)]/40">
                    <Link href="/auth">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-tn-accent text-white hover:bg-gray-800">
                    <Link href="/auth">Join Beta</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </header>
    </MotionDiv>
  )
}