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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                Write in peace. Keep your notes{" "}
                <span className="text-tn-accent">ultra-secure</span>.
              </h1>
              <p className="text-xl text-gray-600 max-w-lg leading-7">
                Founders Promo 2025: Get the 1-year plan completely free if you sign up by Dec 31, 2025.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button size="lg" asChild className="bg-tn-accent text-white hover:bg-blue-800 focus:ring-tn-accent/60">
                  <Link href="/app">Open Editor</Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="bg-tn-accent text-white hover:bg-blue-800 focus:ring-tn-accent/60">
                  <Link href="/auth">Activate Free Year</Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild className="bg-transparent border-tn-accent text-tn-accent hover:bg-tn-accent/10">
                <Link href="/demo">Open Live Demo</Link>
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              Free until Dec 31, 2026. Renews Jan 1, 2027 → $29/year.
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="text-sm text-gray-600 ml-4">TextNotepad</div>
        </div>
        
        <div className="p-6 space-y-4 min-h-[400px] bg-gradient-to-br from-white to-gray-50">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="h-4 bg-gray-50 rounded w-full" />
            <div className="h-4 bg-gray-50 rounded w-2/3" />
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-gray-50 rounded w-3/4" />
            <div className="h-4 bg-gray-50 rounded w-5/6" />
          </div>
          
          <div className="absolute bottom-6 right-6 flex items-center space-x-2 text-xs text-gray-500">
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