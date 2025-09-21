"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { MotionDiv, animations } from "@/components/ui/motion"

export function Header() {
  return (
    <MotionDiv
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-tn-bg/95 backdrop-blur supports-[backdrop-filter]:bg-tn-bg/60">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-tn-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-semibold text-white">TextNotepad</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#security"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Security
              </Link>
              <Link
                href="#faq"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="https://github.com/yourusername/textnotepad"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Source
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-gray-200 hover:text-white hover:bg-tn-accent/20">
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="bg-tn-accent text-white hover:brightness-110">
                <Link href="/auth">Activate Free Year</Link>
              </Button>
            </div>
          </div>
        </Container>
      </header>
    </MotionDiv>
  )
}