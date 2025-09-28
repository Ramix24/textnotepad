"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Check, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const betaFeatures = [
  "Priority access to new features",
  "Help influence the roadmap", 
  "One-click unsubscribe"
]

export function Pricing() {
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
      // Here you would normally submit to your backend
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage("You're on the list! We'll send your beta invite soon.")
      setMessageType("success")
      setEmail("")
      setName("")
      setConsent(false)
    } catch {
      setMessage("Something went wrong. Please try again.")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Section id="waitlist">
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary">
            Beta waitlist
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-7">
            Leave us your email to get early access when we open the beta. Invitations are sent in batches.
          </p>
        </MotionDiv>

        <div className="max-w-2xl mx-auto">
          <MotionDiv
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ ...animations.fadeInUp.transition, delay: 0.1 }}
          >
            <Card className="bg-bg-primary border-border-dark">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Benefits */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {betaFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Check className="h-5 w-5 text-accent-blue mt-0.5 flex-shrink-0" />
                          <span className="text-text-primary">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Waitlist Form */}
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                          Name (optional)
                        </label>
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                          Email
                        </label>
                        <Input
                          id="email"
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
                          id="consent"
                          checked={consent}
                          onCheckedChange={(checked) => setConsent(checked as boolean)}
                          required
                        />
                        <label htmlFor="consent" className="text-sm text-text-secondary leading-5">
                          I agree to the processing of my email address for the purpose of sending a beta invitation. (GDPR)
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
                        className="w-full bg-accent-blue text-white hover:opacity-90"
                        disabled={isSubmitting}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Joining..." : "Join the waitlist"}
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
