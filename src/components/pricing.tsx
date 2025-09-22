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

const features = [
  "Full End-to-End Encryption (E2EE)",
  "Zero-knowledge storage",
  "Distraction-free writing",
  "GDPR compliant, EU hosting",
  "Email support",
  "30-day money-back guarantee"
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
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Promo 2025
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-7">
            Get the 1-year plan completely free if you sign up by Dec 31, 2025.
          </p>
        </MotionDiv>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.1 }}
          >
            <PricingCard
              title="14-Day Trial"
              price="FREE"
              period="for 14 days"
              description="Try all premium features"
              buttonText={user ? "Open Editor" : "Start Free Trial"}
              buttonHref={user ? "/app" : "/auth"}
              badge="Try It Free"
            />
          </MotionDiv>

          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.2 }}
          >
            <PricingCard
              title="Personal — 29 USD / year"
              price="FREE"
              period="until Dec 31, 2026"
              description="Perfect for individual writers"
              buttonText={user ? "Open Editor" : "Activate Free Year"}
              buttonHref={user ? "/app" : "/auth"}
              badge="Limited Time - Free Until 2026"
              popular={true}
              promoFreeUntil={new Date('2026-12-31')}
              renewsOn={new Date('2027-01-01')}
              renewPriceLabel="29 USD / year"
              promoBadge={true}
            />
          </MotionDiv>

          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.3 }}
          >
            <PricingCard
              title="Secure Saver — 54 USD / 3 years"
              price="54"
              period="USD / 3 years"
              description="Best value for long-term privacy"
              buttonText={user ? "Open Editor" : "Choose 3-Year Plan"}
              buttonHref={user ? "/app" : "/auth"}
              yearlyEquivalent="≈ $1.5 / month"
              renewalInfo="Billed 54 USD every 3 years"
              noPromo={true}
            />
          </MotionDiv>
        </div>

        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ ...animations.fadeInUp.transition, delay: 0.4 }}
          className="text-center mt-12 space-y-2"
        >
          <p className="text-gray-500">
            Promo valid only for new accounts created by Dec 31, 2025. No hidden fees. Cancel anytime before renewal. Full data export (GDPR) guaranteed.
          </p>
          
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="font-semibold mb-3 text-gray-900">Included in both plans:</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-tn-accent flex-shrink-0" />
                <span>E2E encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-tn-accent flex-shrink-0" />
                <span>Zero-knowledge storage</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-tn-accent flex-shrink-0" />
                <span>Distraction-free interface</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-tn-accent flex-shrink-0" />
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
  buttonHref?: string
  popular?: boolean
  badge?: string
  yearlyEquivalent?: string
  renewalInfo?: string
  promoFreeUntil?: Date
  renewsOn?: Date
  renewPriceLabel?: string
  promoBadge?: boolean
  noPromo?: boolean
}

export function PricingCard({
  title,
  price,
  period,
  originalPrice,
  description,
  buttonText,
  buttonHref = "/auth",
  popular = false,
  badge,
  yearlyEquivalent,
  renewalInfo,
  promoFreeUntil,
  renewsOn,
  renewPriceLabel,
  promoBadge,
  noPromo
}: PricingCardProps) {
  return (
    <Card className={`h-full relative bg-white border border-gray-200 shadow-lg ${popular ? 'border-tn-accent shadow-blue-100' : ''}`}>
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-900 text-white text-xs px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg border border-blue-800">
            <Star className="h-3 w-3" />
            <span className="font-medium">{badge}</span>
          </div>
        </div>
      )}
      {noPromo && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-600 text-white text-xs px-3 py-1 rounded-full">
            No Promo
          </div>
        </div>
      )}
      
      <CardHeader className="text-center space-y-4 pb-6">
        <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
        <div className="space-y-2">
          <div className="flex items-baseline justify-center space-x-1">
            {originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                ${originalPrice}
              </span>
            )}
            <span className="text-4xl font-bold text-gray-900">{price}</span>
            <span className="text-gray-500">{period}</span>
          </div>
          {promoFreeUntil && (
            <p className="text-sm text-tn-accent font-medium">FREE until {promoFreeUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
          {renewsOn && renewPriceLabel && (
            <p className="text-sm text-gray-500">Renews on {renewsOn.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} → {renewPriceLabel}</p>
          )}
          {yearlyEquivalent && (
            <p className="text-sm text-gray-500">{yearlyEquivalent}</p>
          )}
          {renewalInfo && (
            <p className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded">{renewalInfo}</p>
          )}
        </div>
        <p className="text-gray-600">{description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Button 
            className={`w-full ${popular ? 'bg-tn-accent text-white hover:bg-gray-800 focus:ring-tn-accent/60' : 'bg-transparent border-tn-accent text-tn-accent hover:bg-tn-accent/10'}`}
            size="lg"
            asChild
          >
            <Link href={buttonHref}>{buttonText}</Link>
          </Button>
          {promoBadge && (
            <p className="text-xs text-gray-500 text-center">
              Promo automatically applied at checkout.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <p className="font-medium text-sm text-gray-900">Everything included:</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3 text-sm">
                <Check className="h-4 w-4 text-tn-accent mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}