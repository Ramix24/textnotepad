"use client"

import { useState } from "react"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "What is Founders Promo 2025?",
    answer: "If you sign up before Dec 31, 2025, you get the paid plan for free — 1 year (Personal) or 3 years (Secure Saver)."
  },
  {
    question: "Will I be charged automatically later?",
    answer: "Yes, only after your free period ends: Jan 1, 2026 for Personal; Jan 1, 2029 for Secure Saver. You can cancel anytime before renewal."
  },
  {
    question: "What if I don't want to pay later?",
    answer: "Cancel before renewal. Your account switches to a free read-only mode with full export."
  },
  {
    question: "Is my data portable and encrypted?",
    answer: "Yes. E2EE, zero-knowledge storage, GDPR compliant. You can export anytime."
  },
  {
    question: "How secure is the encryption really?",
    answer: "We use AES-256 encryption with client-side key generation. Your encryption keys never leave your device, so even if our servers were compromised, your notes would remain unreadable. Our open-source client allows security experts to verify our claims."
  },
  {
    question: "Can I export my notes if I want to leave?",
    answer: "Absolutely. You can export all your notes as plain text, Markdown, or JSON at any time. We believe in data portability - your notes are yours, not ours."
  },
  {
    question: "Does offline mode really work everywhere?",
    answer: "Yes! TextNotepad works completely offline. You can create, edit, and organize notes without any internet connection. When you're back online, everything syncs automatically with intelligent conflict resolution."
  },
  {
    question: "Why is the client open source?",
    answer: "Transparency builds trust. Security experts can audit our encryption implementation, and you can verify that we're doing exactly what we claim. The client handles all encryption/decryption, so you can see exactly how your data is protected."
  },
  {
    question: "What does 'EU hosting' mean for my privacy?",
    answer: "Our servers are located in EU data centers and comply with GDPR regulations. This means stronger privacy protections, clear data rights, and no access by foreign governments without proper legal process."
  },
  {
    question: "How do you make money if you can't read our notes?",
    answer: "Simple: subscription fees. We can't sell your data because we can't read it. Our business model is aligned with your privacy - we succeed when you trust us with your encrypted notes."
  }
]

export function FAQ() {
  return (
    <Section id="faq" className="bg-muted/20">
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold">
            Frequently asked questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about Founders Promo 2025 and TextNotepad&apos;s privacy.
          </p>
        </MotionDiv>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <MotionDiv
                key={index}
                initial={animations.fadeInUp.initial}
                animate={animations.fadeInUp.animate}
                transition={{
                  ...animations.fadeInUp.transition,
                  delay: 0.05 * index
                }}
              >
                <FAQItem question={faq.question} answer={faq.answer} />
              </MotionDiv>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-card rounded-2xl border shadow-sm">
      <button
        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-ring rounded-2xl"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg pr-4">{question}</h3>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          <div className="pt-2 text-muted-foreground leading-relaxed">
            {answer}
          </div>
        </div>
      )}
    </div>
  )
}