"use client"

import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Shield, Lock, Check } from "lucide-react"

const securityFeatures = [
  "AES-256 encryption with client-side key generation",
  "Zero-knowledge architecture - we never see your plaintext",
  "Regular third-party security audits",
  "GDPR compliant with EU data centers",
  "No tracking, no analytics, no data mining"
]

export function PrivacySecurity() {
  return (
    <Section id="security">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
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
              <p className="text-lg text-text-secondary max-w-3xl mx-auto">
                TextNotepad.com uses end-to-end encryption with a zero-knowledge architecture. 
                Your notes are encrypted on your device before they ever leave it, and we 
                never have access to your encryption keys.
              </p>
            </div>

            <ul className="space-y-3 max-w-2xl mx-auto text-left">
              {securityFeatures.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <div className="flex flex-wrap gap-3 items-center justify-center">
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
        </div>
      </Container>
    </Section>
  )
}

