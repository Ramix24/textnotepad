"use client"

import { useState } from "react"
import Link from "next/link"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { ChevronDown, ChevronUp } from "lucide-react"

const shortFaqs = [
  {
    question: "Will I be charged automatically later?",
    answer: "Yes — only after your free period ends. The 1-year plan renews on Jan 1, 2027 for 29 USD / year. You can cancel anytime before renewal."
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
    question: "How do you make money if you can't read our notes?",
    answer: "Simple: subscription fees. We can't sell your data because we can't read it. Our business model is aligned with your privacy - we succeed when you trust us with your encrypted notes."
  }
]

export function FAQShort() {
  return (
    <Section id="faq" className="bg-gray-50 py-16">
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Quick FAQ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Common questions about TextNotepad.com&apos;s privacy and features.
          </p>
        </MotionDiv>

        <div className="max-w-2xl mx-auto">
          <div className="space-y-3">
            {shortFaqs.map((faq, index) => (
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
          
          <div className="text-center mt-8">
            <Link 
              href="/faq" 
              className="text-tn-accent hover:text-gray-700 font-medium underline"
            >
              View all FAQ →
            </Link>
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <button
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-tn-accent/60 rounded-xl"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-base pr-4 text-gray-900">{question}</h3>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="pt-2 text-gray-600 text-sm leading-6">
            {answer}
          </div>
        </div>
      )}
    </div>
  )
}