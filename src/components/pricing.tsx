"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Check } from "lucide-react"
import { useAuthSession } from "@/hooks/useAuthSession"

const trialFeatures = [
  "Full feature access",
  "End-to-end encryption",
  "Unlimited notes",
  "Access on any device",
  "Zero tracking & zero ads",
  "14 days free"
]

const yearlyFeatures = [
  "Everything in trial",
  "Secure note sharing",
  "Custom encryption keys", 
  "Offline-first mode",
  "Priority support",
  "1 full year access"
]

const lifetimeFeatures = [
  "Everything in yearly",
  "Lifetime access",
  "Future feature updates",
  "Premium support",
  "No recurring payments",
  "Best value"
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

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* 14-Day Trial */}
          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.1 }}
          >
            <Card className="h-full bg-bg-primary border-border-dark">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-text-primary text-center">
                  14-Day Trial
                </CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-primary">Free</div>
                  <p className="text-text-secondary">Try everything risk-free</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {trialFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-accent-blue mt-0.5 flex-shrink-0" />
                      <span className="text-text-primary">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button size="lg" asChild className="w-full bg-accent-blue text-white hover:opacity-90">
                    <Link href={user ? "/app" : "/auth"}>
                      {user ? "Open Editor" : "Start Trial"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>

          {/* 1-Year Plan */}
          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.2 }}
          >
            <Card className="h-full bg-bg-primary border-border-dark relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-accent-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-text-primary text-center">
                  1-Year Plan
                </CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-primary">$19</div>
                  <p className="text-text-secondary">One-time payment</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {yearlyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-accent-blue mt-0.5 flex-shrink-0" />
                      <span className="text-text-primary">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button size="lg" asChild className="w-full bg-accent-blue text-white hover:opacity-90">
                    <Link href={user ? "/app" : "/auth"}>
                      {user ? "Upgrade" : "Get 1-Year Access"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>

          {/* Lifetime Plan */}
          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.3 }}
          >
            <Card className="h-full bg-bg-secondary border-border-dark">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-text-primary text-center">
                  Lifetime Plan
                </CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-primary">$38</div>
                  <p className="text-text-secondary">Pay once, own forever</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {lifetimeFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-accent-blue mt-0.5 flex-shrink-0" />
                      <span className="text-text-primary">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button size="lg" asChild className="w-full bg-text-primary text-bg-primary hover:opacity-90">
                    <Link href={user ? "/app" : "/auth"}>
                      {user ? "Get Lifetime" : "Buy Lifetime Access"}
                    </Link>
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
          <p className="text-2xl font-bold text-text-primary">
            Simple. Transparent. Yours.
          </p>
        </MotionDiv>
      </Container>
    </Section>
  )
}
