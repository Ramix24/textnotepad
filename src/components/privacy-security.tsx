"use client"

import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Shield, Lock, Globe, Check } from "lucide-react"

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
                  <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
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
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
      <div className="space-y-6">
        {/* Header with improved visual hierarchy */}
        <div className="text-center space-y-3 pb-4 border-b border-blue-100 dark:border-blue-800">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Zero-Knowledge Architecture</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">How Your Data Stays Private</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Even we can&apos;t read your notes</p>
        </div>
        
        {/* Enhanced visual flow */}
        <div className="flex flex-col space-y-6">
          {/* Step 1: Your Device */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">1. Your Device</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Notes encrypted before leaving your device</div>
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-green-700 dark:text-green-300">🔒 ENCRYPTED</span>
              </div>
            </div>
          </div>
          
          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
          
          {/* Step 2: Our Servers */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">2. Our EU Servers</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Data stored encrypted, keys never shared</div>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">🔒 STILL ENCRYPTED</span>
              </div>
            </div>
          </div>
          
          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          {/* Step 3: No Access */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">3. TextNotepad Team</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Cannot decrypt or read your content</div>
                </div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-red-700 dark:text-red-300">🚫 NO ACCESS</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom summary */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Only you have the keys to unlock your notes
          </p>
        </div>
      </div>
    </div>
  )
}