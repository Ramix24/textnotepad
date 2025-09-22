"use client"

import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card, CardContent } from "@/components/ui/card"
import { MotionDiv, animations } from "@/components/ui/motion"

const testimonials = [
  {
    quote: "Finally, a note-taking app that respects my privacy. The encryption gives me peace of mind, and the interface is beautifully minimal.",
    name: "Sarah Chen",
    title: "Journalist"
  },
  {
    quote: "I write sensitive research notes daily. TextNotepad.com's zero-knowledge approach means I can focus on my work without worrying about data breaches.",
    name: "Dr. Marcus Webb", 
    title: "Research Scientist"
  },
  {
    quote: "The clean, distraction-free interface helps me focus entirely on my writing. Perfect for long writing sessions.",
    name: "Emma Rodriguez",
    title: "Travel Writer"
  }
]

export function Testimonials() {
  return (
    <Section>
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold">
            Trusted by privacy-conscious writers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of writers who choose security without sacrificing simplicity.
          </p>
        </MotionDiv>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <MotionDiv
              key={testimonial.name}
              initial={animations.fadeInUp.initial}
              animate={animations.fadeInUp.animate}
              transition={{
                ...animations.fadeInUp.transition,
                delay: 0.1 * index
              }}
            >
              <Card className="h-full">
                <CardContent className="p-6 space-y-4">
                  <blockquote className="text-muted-foreground italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="space-y-1">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.title}</div>
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