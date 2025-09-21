"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Check, Star } from "lucide-react"

const features = [
  "Full End-to-End Encryption (E2EE)",
  "Zero-knowledge storage",
  "Self-destruct notes",
  "Offline mode & auto-sync",
  "Distraction-free writing",
  "Auto-save",
  "Open-source client",
  "GDPR compliant, EU hosting",
  "Email support",
  "30-day money-back guarantee"
]

export function Pricing() {
  return (
    <Section id="pricing">
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold">
            Founders Promo 2025
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get TextNotepad completely free — 1 year or 3 years depending on your plan.
          </p>
        </MotionDiv>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.1 }}
          >
            <PricingCard
              title="Personal — 29 USD / year"
              price="FREE"
              period="until Dec 31, 2025"
              description="Perfect for individual writers"
              buttonText="Activate Free Year"
              badge="Founders Promo"
              renewalInfo="Renews on Jan 1, 2026 → 29 USD / year"
            />
          </MotionDiv>

          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.2 }}
          >
            <PricingCard
              title="Secure Saver — 59 USD / 3 years"
              price="FREE"
              period="until Dec 31, 2028"
              description="Best value for long-term privacy"
              buttonText="Activate Free 3 Years"
              popular
              badge="Founders Promo + Most Popular"
              yearlyEquivalent="≈ $1.6 / month"
              renewalInfo="Renews on Jan 1, 2029 → 59 USD / 3 years"
            />
          </MotionDiv>
        </div>

        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ ...animations.fadeInUp.transition, delay: 0.3 }}
          className="text-center mt-12 space-y-2"
        >
          <p className="text-muted-foreground">
            Valid for accounts created by Dec 31, 2025. No hidden fees. Cancel anytime before renewal. Full data export (GDPR) guaranteed.
          </p>
          
          <div className="mt-8 p-6 bg-muted/20 rounded-2xl">
            <h3 className="font-semibold mb-3">Included in both plans:</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                <span>E2E encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                <span>Zero-knowledge storage</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                <span>Self-destruct notes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                <span>Offline & auto-sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                <span>Distraction-free interface</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                <span>Auto-save</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                <span>Open-source client</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                <span>GDPR/EU hosting</span>
              </div>
            </div>
          </div>
        </MotionDiv>
      </Container>
    </Section>
  )
}

interface PricingCardProps {
  title: string
  price: string
  period: string
  originalPrice?: string
  description: string
  buttonText: string
  popular?: boolean
  badge?: string
  yearlyEquivalent?: string
  renewalInfo?: string
}

export function PricingCard({
  title,
  price,
  period,
  originalPrice,
  description,
  buttonText,
  popular = false,
  badge,
  yearlyEquivalent,
  renewalInfo
}: PricingCardProps) {
  return (
    <Card className={`h-full relative ${popular ? 'border-primary shadow-lg' : ''}`}>
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>{badge}</span>
          </div>
        </div>
      )}
      
      <CardHeader className="text-center space-y-4 pb-6">
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="space-y-2">
          <div className="flex items-baseline justify-center space-x-1">
            {originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                ${originalPrice}
              </span>
            )}
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-muted-foreground">{period}</span>
          </div>
          {yearlyEquivalent && (
            <p className="text-sm text-muted-foreground">{yearlyEquivalent}</p>
          )}
          {renewalInfo && (
            <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/30 rounded">{renewalInfo}</p>
          )}
        </div>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Button 
            className="w-full" 
            size="lg"
            variant={popular ? "default" : "outline"}
            asChild
          >
            <Link href="/auth">{buttonText}</Link>
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Founders Promo automatically applied at checkout.
          </p>
        </div>

        <div className="space-y-3">
          <p className="font-medium text-sm">Everything included:</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}