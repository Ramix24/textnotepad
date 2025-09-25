"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Shield, Globe, Lock } from "lucide-react"
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
                Write in peace. Keep your notes{" "}
                <span className="text-accent-blue">ultra-secure</span>.
              </h1>
              <p className="text-xl text-text-secondary max-w-lg leading-7">
                Promo 2025: Get the 1-year plan completely free if you sign up by Dec 31, 2025.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button size="lg" asChild className="bg-accent-blue text-white hover:opacity-90 focus:ring-accent-blue/60">
                  <Link href="/app">Open Editor</Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="bg-accent-blue text-white hover:opacity-90 focus:ring-accent-blue/60">
                  <Link href="/auth">Activate Free Year</Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild className="bg-transparent border-accent-blue text-accent-blue hover:bg-[color:var(--bg-active)]/40">
                <Link href="/demo">Free Trial</Link>
              </Button>
            </div>
            
            <div className="text-sm text-text-secondary">
              Free until Dec 31, 2026. Renews Jan 1, 2027 → $29/year.
            </div>

            <div className="flex items-center space-x-6 text-sm text-text-secondary">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Open Source</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>EU Hosted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Zero-Knowledge</span>
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