"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Check, Star } from "lucide-react"
import { useAuthSession } from "@/hooks/useAuthSession"

const freeFeatures = [
  "Unlimited notes",
  "End-to-end encryption",
  "Access on any device",
  "Zero tracking & zero ads",
  "Distraction-free writing"
]

const comingSoonFeatures = [
  "Secure note sharing",
  "Custom encryption keys",
  "Offline-first mode",
  "Priority support"
]

export function Pricing() {
  const { user } = useAuthSession()
  
  return (
    <Section id="pricing">
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary">
            What You Get
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-7">
            No hidden costs. No ads. No tracking. Just secure notes.
          </p>
        </MotionDiv>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.1 }}
          >
            <Card className="h-full bg-bg-primary border-border-dark">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-text-primary text-center">
                  Free Plan (Forever)
                </CardTitle>
                <p className="text-text-secondary text-center">Everything you need to write privately</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {freeFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-accent-blue mt-0.5 flex-shrink-0" />
                      <span className="text-text-primary">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button size="lg" asChild className="w-full bg-accent-blue text-white hover:opacity-90">
                    <Link href={user ? "/app" : "/auth"}>
                      {user ? "Open Editor" : "Start writing securely"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>

          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.2 }}
          >
            <Card className="h-full bg-bg-secondary border-border-dark opacity-75">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-text-primary text-center">
                  Coming Soon (Pro Features)
                </CardTitle>
                <p className="text-text-secondary text-center">Advanced features for power users</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {comingSoonFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-accent-blue mt-0.5 flex-shrink-0" />
                      <span className="text-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button size="lg" disabled className="w-full bg-text-secondary/20 text-text-secondary cursor-not-allowed">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>

        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ ...animations.fadeInUp.transition, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-2xl font-bold text-text-primary mb-4">
            Simple. Transparent. Yours.
          </p>
          <Button size="lg" asChild className="bg-accent-blue text-white hover:opacity-90">
            <Link href={user ? "/app" : "/auth"}>
              {user ? "Open Editor" : "Start writing securely"}
            </Link>
          </Button>
        </MotionDiv>
      </Container>
    </Section>
  )
}
