"use client"

import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card, CardContent } from "@/components/ui/card"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Shield, Lock, Focus } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Full End-to-End Encryption",
    description: "Military-grade encryption ensures your notes are secure from creation to storage."
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Storage",
    description: "Not even we can read your notes. Complete privacy by design."
  },
  {
    icon: Focus,
    title: "Distraction-Free Writing",
    description: "Clean, minimalist interface designed to help you focus on what matters most."
  }
]

export function Features() {
  return (
    <Section id="features" className="bg-gray-50">
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Privacy-first features for modern writers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to write securely, privately, and productively.
          </p>
        </MotionDiv>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <Card className="h-full bg-white border-gray-200">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-tn-accent/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-tn-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
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