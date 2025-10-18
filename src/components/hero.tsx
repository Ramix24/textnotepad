"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Shield, Lock } from "lucide-react"
import { useAuthSession } from "@/hooks/useAuthSession"

export function Hero() {
  const { user } = useAuthSession()
  
  return (
    <Section className="pt-16 pb-8 lg:pt-24 lg:pb-16">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <MotionDiv
            initial={animations.slideInLeft.initial}
            animate={animations.slideInLeft.animate}
            transition={{ ...animations.slideInLeft.transition, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary">
                Encrypted Notes.
              </h1>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-7">
                No tracking, ever. Privacy is Freedom.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild className="bg-accent-blue text-white hover:opacity-90 focus:ring-accent-blue/60">
                  <Link href="/app">Open Editor</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="bg-accent-blue text-white hover:opacity-90 focus:ring-accent-blue/60">
                    <Link href="#waitlist">Join Waitlist</Link>
                  </Button>
                  <Button size="lg" asChild className="bg-accent-blue text-white hover:opacity-90 focus:ring-accent-blue/60">
                    <Link href="/auth">Sign in as Beta tester</Link>
                  </Button>
                </>
              )}
            </div>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-start space-x-3">
                <Lock className="h-5 w-5 text-accent-blue mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary">End-to-end encryption – only you can read your notes.</span>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-accent-blue mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary">Zero tracking – no ads, no analytics, no hidden data collection.</span>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-accent-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="text-text-secondary">Simple & distraction-free – just you and your writing.</span>
              </div>
            </div>
          </MotionDiv>
        </div>
      </Container>
    </Section>
  )
}

