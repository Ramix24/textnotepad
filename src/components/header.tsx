"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Logo } from "@/components/ui/logo"
import { useAuthSession } from "@/hooks/useAuthSession"

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
              <span className="text-xl font-semibold text-text-primary">TextNotepad.com</span>
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
                <Button size="lg" asChild className="bg-tn-accent text-white hover:bg-gray-800 font-semibold px-6">
                  <Link href="/app">Open Editor</Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="bg-accent-blue text-white hover:opacity-90 focus:ring-accent-blue/60 font-semibold px-6">
                  <Link href="/auth">Sign in as Beta tester</Link>
                </Button>
              )}
            </div>
          </div>
        </Container>
      </header>
    </MotionDiv>
  )
}