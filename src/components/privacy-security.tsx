"use client"

import Link from "next/link"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Shield, Lock, Globe, Check } from "lucide-react"

const securityFeatures = [
  "AES-256 encryption with client-side key generation",
  "Zero-knowledge architecture - we never see your plaintext",
  "Regular third-party security audits",
  "GDPR compliant with EU data centers",
  "No tracking, no analytics, no data mining",
  "No auto-charge during 2025 — renewals start only after your free period ends"
]

export function PrivacySecurity() {
  return (
    <Section id="security">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <MotionDiv
            initial={animations.slideInLeft.initial}
            animate={animations.slideInLeft.animate}
            transition={animations.slideInLeft.transition}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary">
                Bank-level security meets privacy by design
              </h2>
              <p className="text-xl text-text-secondary">
                Not even we can read your notes.
              </p>
              <p className="text-lg text-text-secondary">
                TextNotepad.com uses end-to-end encryption with a zero-knowledge architecture. 
                Your notes are encrypted on your device before they ever leave it, and we 
                never have access to your encryption keys.
              </p>
            </div>

            <ul className="space-y-3">
              {securityFeatures.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-tn-accent mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button asChild className="bg-text-primary text-bg-primary hover:bg-text-primary/90">
                <Link href="/security">
                  Read Security Whitepaper
                </Link>
              </Button>
              
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-green-700">GDPR Compliant</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  <Lock className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Zero-Knowledge</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                  <Shield className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">E2E Encrypted</span>
                </div>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={animations.slideInRight.initial}
            animate={animations.slideInRight.animate}
            transition={animations.slideInRight.transition}
            className="relative"
          >
            <SecurityDiagram />
          </MotionDiv>
        </div>
      </Container>
    </Section>
  )
}

function SecurityDiagram() {
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-text-primary">Zero-Knowledge Architecture</h3>
          <p className="text-sm text-text-secondary">Your data journey</p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-tn-accent/20 flex items-center justify-center">
                <Lock className="h-5 w-5 text-tn-accent" />
              </div>
              <div>
                <div className="font-medium text-sm text-text-primary">Your Device</div>
                <div className="text-xs text-text-secondary">Encryption happens here</div>
              </div>
            </div>
            <div className="text-green-600 text-xs font-medium">Encrypted</div>
          </div>
          
          <div className="border-l-2 border-dashed border-gray-300 ml-5 h-8" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-tn-accent/20 flex items-center justify-center">
                <Globe className="h-5 w-5 text-tn-accent" />
              </div>
              <div>
                <div className="font-medium text-sm text-text-primary">EU Servers</div>
                <div className="text-xs text-text-secondary">Still encrypted</div>
              </div>
            </div>
            <div className="text-green-600 text-xs font-medium">Encrypted</div>
          </div>
          
          <div className="border-l-2 border-dashed border-gray-300 ml-5 h-8" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="font-medium text-sm text-text-primary">TextNotepad.com Team</div>
                <div className="text-xs text-text-secondary">Cannot decrypt</div>
              </div>
            </div>
            <div className="text-red-600 text-xs font-medium">No Access</div>
          </div>
        </div>
      </div>
    </div>
  )
}