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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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
              <p className="text-xl text-text-secondary max-w-lg leading-7">
                No tracking, ever. Privacy is Freedom.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
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
            
            <div className="space-y-4">
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

          <MotionDiv
            initial={animations.slideInRight.initial}
            animate={animations.slideInRight.animate}
            transition={{ ...animations.slideInRight.transition, delay: 0.4 }}
          >
            <EditorMockup />
          </MotionDiv>
        </div>
      </Container>
    </Section>
  )
}

function EditorMockup() {
  return (
    <div className="relative">
      <div className="bg-bg-primary rounded-2xl shadow-lg border border-border-dark overflow-hidden">
        <div className="flex items-center space-x-2 px-4 py-3 bg-bg-secondary border-b border-border-dark">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="text-sm text-text-secondary ml-4">TextNotepad</div>
        </div>
        
        <div className="p-6 space-y-4 min-h-[400px] bg-gradient-to-br from-bg-primary to-bg-secondary">
          <div className="space-y-2">
            <div className="h-4 bg-border-dark rounded w-3/4" />
            <div className="h-4 bg-bg-secondary rounded w-full" />
            <div className="h-4 bg-bg-secondary rounded w-5/6" />
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-bg-secondary rounded w-4/5" />
            <div className="h-4 bg-bg-primary rounded w-full" />
            <div className="h-4 bg-bg-primary rounded w-2/3" />
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-bg-primary rounded w-3/4" />
            <div className="h-4 bg-bg-primary rounded w-5/6" />
          </div>
          
          <div className="absolute bottom-6 right-6 flex items-center space-x-2 text-xs text-text-secondary">
            <Lock className="h-3 w-3" />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
      
      <div className="absolute -top-2 -right-2 bg-tn-accent text-white text-xs px-2 py-1 rounded-full">
        Secure
      </div>
    </div>
  )
}