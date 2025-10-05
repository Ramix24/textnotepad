"use client"

import React, { useState } from "react"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card, CardContent } from "@/components/ui/card"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Check } from "lucide-react"

const productionFeatures = [
  "Full production-ready app",
  "Advanced collaboration tools",
  "Enhanced security features",
  "Priority customer support",
  "Export & backup options"
]

export function Testimonials() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [consent, setConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setMessageType("")

    // Validation
    if (!email) {
      setMessage("Please enter a valid email.")
      setMessageType("error")
      return
    }

    if (!email.includes("@")) {
      setMessage("Please enter a valid email.")
      setMessageType("error")
      return
    }

    if (!consent) {
      setMessage("Consent is required to join the waitlist.")
      setMessageType("error")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source: 'waitlist'
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        setMessageType("success")
        setEmail("")
        setName("")
        setConsent(false)
      } else {
        setMessage(result.message || "Something went wrong. Please try again.")
        setMessageType("error")
      }
    } catch {
      setMessage("Something went wrong. Please try again.")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Section id="waitlist" className="bg-bg-secondary/30">
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary">
            Join the waitlist
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Be the first to know when TextNotepad launches. Join our waitlist for exclusive early access and special pricing.
          </p>
        </MotionDiv>

        <div className="max-w-4xl mx-auto">
          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.1 }}
          >
            <Card className="bg-bg-primary border-border-dark">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Production Features */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      What&apos;s coming in production:
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {productionFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Check className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                          <span className="text-text-secondary text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Production Waitlist Form */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-text-primary">
                      Get notified when we launch
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="prod-name" className="block text-sm font-medium text-text-primary mb-2">
                          Name (optional)
                        </label>
                        <Input
                          id="prod-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="prod-email" className="block text-sm font-medium text-text-primary mb-2">
                          Email
                        </label>
                        <Input
                          id="prod-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. you@example.com"
                          className="w-full"
                          required
                        />
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="prod-consent"
                          checked={consent}
                          onCheckedChange={(checked) => setConsent(checked as boolean)}
                          required
                        />
                        <label htmlFor="prod-consent" className="text-sm text-text-secondary leading-5">
                          I agree to the processing of my email address for launch notifications and updates. (GDPR)
                        </label>
                      </div>

                      {message && (
                        <div className={`text-sm p-3 rounded-md ${
                          messageType === "success" 
                            ? "bg-green-50 text-green-800 border border-green-200" 
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}>
                          {message}
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full bg-text-primary text-bg-primary hover:opacity-90"
                        disabled={isSubmitting}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Joining..." : "Join waitlist"}
                      </Button>
                    </form>

                    <p className="text-xs text-text-secondary text-center">
                      We don&apos;t share your data with third parties.{" "}
                      <a href="/privacy" className="text-accent-blue hover:underline">
                        See our Privacy Policy
                      </a>{" "}
                      (short and readable).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>
      </Container>
    </Section>
  )
}