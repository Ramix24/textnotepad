"use client"

import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card, CardContent } from "@/components/ui/card"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Shield, Lock, Zap, Globe, Code } from "lucide-react"

const features = [
  {
    icon: Lock,
    title: "True privacy",
    description: "End-to-end encryption protects every note."
  },
  {
    icon: Shield,
    title: "No surveillance",
    description: "No cookies, no trackers, no profiling."
  },
  {
    icon: Zap,
    title: "Lightweight & fast",
    description: "Distraction-free writing in your browser."
  },
  {
    icon: Globe,
    title: "Access anywhere",
    description: "Your notes stay secure across devices."
  },
  {
    icon: Code,
    title: "Open and transparent",
    description: "Built with privacy in mind, not as an afterthought."
  }
]

export function Features() {
  return (
    <Section id="why-textnotepad" className="bg-bg-secondary">
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary">
            Why TextNotepad?
          </h2>
          <p className="text-lg text-text-secondary max-w-4xl mx-auto mt-4">
            TextNotepad is a private space for your thoughts, ideas, and plans. Unlike other note apps, we don&apos;t track you, sell your data, or show ads. Your notes belong to you — encrypted, secure, and always under your control.
          </p>
        </MotionDiv>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <MotionDiv
              key={feature.title}
              initial={animations.fadeInUp.initial}
              animate={animations.fadeInUp.animate}
              transition={{
                ...animations.fadeInUp.transition,
                delay: 0.1 * index
              }}
            >
              <Card className="h-full bg-bg-primary border-border-dark">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-tn-accent/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-tn-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-text-primary">{feature.title}</h3>
                    <p className="text-text-secondary">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </Container>
    </Section>
  )
}