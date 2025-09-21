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
  "Open-source client for full transparency",
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
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Bank-level security meets privacy by design
              </h2>
              <p className="text-xl text-gray-600">
                Not even we can read your notes.
              </p>
              <p className="text-lg text-gray-600">
                TextNotepad uses end-to-end encryption with a zero-knowledge architecture. 
                Your notes are encrypted on your device before they ever leave it, and we 
                never have access to your encryption keys.
              </p>
            </div>

            <ul className="space-y-3">
              {securityFeatures.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-tn-accent mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Button variant="outline" asChild className="border-tn-accent text-tn-accent hover:bg-tn-accent/10">
              <Link href="/security">
                Read Security Whitepaper
              </Link>
            </Button>
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
          <h3 className="text-lg font-semibold text-gray-900">Zero-Knowledge Architecture</h3>
          <p className="text-sm text-gray-600">Your data journey</p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-tn-accent/20 flex items-center justify-center">
                <Lock className="h-5 w-5 text-tn-accent" />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">Your Device</div>
                <div className="text-xs text-gray-600">Encryption happens here</div>
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
                <div className="font-medium text-sm text-gray-900">EU Servers</div>
                <div className="text-xs text-gray-600">Still encrypted</div>
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
                <div className="font-medium text-sm text-gray-900">TextNotepad Team</div>
                <div className="text-xs text-gray-600">Cannot decrypt</div>
              </div>
            </div>
            <div className="text-red-600 text-xs font-medium">No Access</div>
          </div>
        </div>
      </div>
    </div>
  )
}