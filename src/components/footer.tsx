"use client"

import Link from "next/link"
import { Container } from "@/components/ui/container"
import { MotionDiv, animations } from "@/components/ui/motion"
import { Github, Twitter, Mail } from "lucide-react"
import { FAQShort } from "@/components/faq-short"

export function Footer() {
  return (
    <MotionDiv
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <FAQShort />
      <footer className="border-t bg-muted/20">
        <Container>
          <div className="py-16 space-y-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-semibold">TextNotepad.com</span>
                </div>
                <p className="text-muted-foreground text-sm max-w-xs">
                  A modern web-based text editor built for privacy-conscious writers who demand simplicity and focus.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
                      Free Trial
                    </Link>
                  </li>
                  <li>
                    <Link href="/security" className="text-muted-foreground hover:text-foreground transition-colors">
                      Security
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/transparency" className="text-muted-foreground hover:text-foreground transition-colors">
                      Transparency
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/imprint" className="text-muted-foreground hover:text-foreground transition-colors">
                      Imprint
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Open Source</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link 
                      href="https://github.com/yourusername/textnotepad-client" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Client Code
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="https://github.com/yourusername/textnotepad/issues" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Report Issues
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="https://github.com/yourusername/textnotepad/blob/main/CONTRIBUTING.md" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contribute
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-sm text-muted-foreground">
                  © 2024 TextNotepad.com. All rights reserved.
                </div>
                
                <div className="flex items-center space-x-4">
                  <Link
                    href="https://github.com/yourusername/textnotepad"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://twitter.com/textnotepad"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </Link>
                  <a
                    href="mailto:support@textnotepad.com"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </MotionDiv>
  )
}