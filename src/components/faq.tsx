"use client"

import { useState } from "react"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "What is Promo 2025?",
    answer: "If you create an account by Dec 31, 2025, you can activate the 1-year plan for free. Your free period runs until Dec 31, 2026."
  },
  {
    question: "Will I be charged automatically later?",
    answer: "Yes — only after your free period ends. The 1-year plan renews on Jan 1, 2027 for 29 USD / year. You can cancel anytime before renewal."
  },
  {
    question: "Can I choose the 3-year plan with promo?",
    answer: "No. The Promo applies only to the 1-year plan. The 3-year plan is billed at 54 USD / 3 years."
  },
  {
    question: "What if I don't want to pay later?",
    answer: "Cancel before renewal. Your account becomes free read-only with full export."
  },
  {
    question: "Is my data portable and encrypted?",
    answer: "Yes. E2EE, zero-knowledge storage, GDPR compliant. You can export anytime."
  },
  {
    question: "How secure is the encryption really?",
    answer: "We use AES-256 encryption with client-side key generation. Your encryption keys never leave your device, so even if our servers were compromised, your notes would remain unreadable."
  },
  {
    question: "Can I export my notes if I want to leave?",
    answer: "Absolutely. You can export all your notes as plain text, Markdown, or JSON at any time. We believe in data portability - your notes are yours, not ours."
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
    <Section id="faq" className="bg-gray-50 py-20">
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-7">
            Everything you need to know about Promo 2025 and TextNotepad.com&apos;s privacy.
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <button
        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-tn-accent/60 rounded-2xl"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg pr-4 text-gray-900">{question}</h3>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          <div className="pt-2 text-gray-600 leading-7">
            {answer}
          </div>
        </div>
      )}
    </div>
  )
}