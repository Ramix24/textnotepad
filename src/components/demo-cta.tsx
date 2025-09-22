"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Play, ArrowRight } from "lucide-react"

export function DemoCTA() {
  return (
    <Section className="bg-gradient-to-br from-primary/5 to-primary/10">
      <Container>
        <MotionDiv
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={animations.fadeInUp.transition}
          className="text-center space-y-8 max-w-3xl mx-auto"
        >
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">
              See TextNotepad in action
            </h2>
            <p className="text-xl text-muted-foreground">
              Try it now — no signup required.
            </p>
            <p className="text-muted-foreground">
              Experience the clean, distraction-free interface and see how easy it is to 
              create, edit, and organize your notes. The demo includes all core features 
              except encryption and sync.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="group bg-tn-accent text-white hover:bg-gray-800">
              <Link href="/demo">
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Open Live Demo
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth">Create Free Account Instead</Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            The demo runs entirely in your browser — nothing is saved or sent to our servers.
          </div>
        </MotionDiv>
      </Container>
    </Section>
  )
}