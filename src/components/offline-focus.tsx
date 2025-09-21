"use client"

import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { MotionDiv, animations } from "@/components/ui/motion"
import { WifiOff, Focus, Save, RotateCcw } from "lucide-react"

export function OfflineFocus() {
  return (
    <Section className="bg-muted/20">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <MotionDiv
            initial={animations.slideInLeft.initial}
            animate={animations.slideInLeft.animate}
            transition={animations.slideInLeft.transition}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Write anywhere, sync everywhere
              </h2>
              <p className="text-xl text-muted-foreground">
                Offline-first design means you never lose momentum.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mt-1">
                  <WifiOff className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Work Offline</h3>
                  <p className="text-muted-foreground">
                    No internet? No problem. Keep writing and your notes will sync when you&apos;re back online.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mt-1">
                  <Save className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Auto-Save Everything</h3>
                  <p className="text-muted-foreground">
                    Every keystroke is automatically saved locally and encrypted, so you never lose your work.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mt-1">
                  <RotateCcw className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Seamless Sync</h3>
                  <p className="text-muted-foreground">
                    Intelligent conflict resolution ensures your notes are always up-to-date across all devices.
                  </p>
                </div>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={animations.slideInRight.initial}
            animate={animations.slideInRight.animate}
            transition={animations.slideInRight.transition}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Distraction-free by design
              </h2>
              <p className="text-xl text-muted-foreground">
                Clean interface that gets out of your way.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mt-1">
                  <Focus className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Focus Mode</h3>
                  <p className="text-muted-foreground">
                    Hide everything except your text. Perfect for deep writing sessions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mt-1">
                  <div className="h-5 w-5 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Minimal UI</h3>
                  <p className="text-muted-foreground">
                    No cluttered toolbars or distracting buttons. Just you and your words.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mt-1">
                  <div className="h-5 w-5 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Dark Mode</h3>
                  <p className="text-muted-foreground">
                    Easy on the eyes for those late-night writing sessions.
                  </p>
                </div>
              </div>
            </div>
          </MotionDiv>
        </div>
      </Container>
    </Section>
  )
}