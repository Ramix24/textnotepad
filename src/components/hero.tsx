"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Shield, Globe, Lock } from "lucide-react"

export function Hero() {
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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Write in peace. Keep your notes{" "}
                <span className="text-primary">ultra-secure</span>.
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Founders Promo 2025: Get TextNotepad completely free — 1 year or 3 years depending on your plan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/auth">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Open Live Demo</Link>
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Choose 1-year free (renews 2026) or 3-year free (renews 2029).
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
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
      <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden">
        <div className="flex items-center space-x-2 px-4 py-3 bg-muted/50 border-b">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="text-sm text-muted-foreground ml-4">TextNotepad</div>
        </div>
        
        <div className="p-6 space-y-4 min-h-[400px] bg-gradient-to-br from-background to-muted/20">
          <div className="space-y-2">
            <div className="h-4 bg-muted/40 rounded w-3/4" />
            <div className="h-4 bg-muted/30 rounded w-full" />
            <div className="h-4 bg-muted/30 rounded w-5/6" />
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-muted/30 rounded w-4/5" />
            <div className="h-4 bg-muted/25 rounded w-full" />
            <div className="h-4 bg-muted/25 rounded w-2/3" />
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-muted/25 rounded w-3/4" />
            <div className="h-4 bg-muted/20 rounded w-5/6" />
          </div>
          
          <div className="absolute bottom-6 right-6 flex items-center space-x-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
      
      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
        Secure
      </div>
    </div>
  )
}