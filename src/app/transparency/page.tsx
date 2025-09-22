import { PromoBanner } from '@/components/promo-banner'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Shield, Lock, Eye, Globe } from 'lucide-react'

export default function TransparencyPage() {
  return (
    <div className="min-h-screen">
      <PromoBanner />
      <Header />
      <main>
        <Section className="py-16">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Transparency & Trust
                </h1>
                <p className="text-xl text-gray-600">
                  How we protect your privacy and earn your trust through transparency.
                </p>
              </div>

              <div className="space-y-12">
                <section>
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="h-6 w-6 text-tn-accent" />
                    <h2 className="text-2xl font-semibold text-gray-900">Security First</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      TextNotepad uses military-grade AES-256 encryption with client-side key generation. 
                      Your notes are encrypted on your device before they ever leave it, ensuring that 
                      even if our servers were compromised, your data would remain completely unreadable.
                    </p>
                    <ul>
                      <li>All encryption happens on your device</li>
                      <li>We never have access to your encryption keys</li>
                      <li>Zero-knowledge architecture by design</li>
                      <li>Regular third-party security audits</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <div className="flex items-center space-x-3 mb-6">
                    <Eye className="h-6 w-6 text-tn-accent" />
                    <h2 className="text-2xl font-semibold text-gray-900">What We Can&apos;t See</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      Our zero-knowledge architecture means we fundamentally cannot access your content:
                    </p>
                    <ul>
                      <li><strong>Note content:</strong> All text is encrypted before reaching our servers</li>
                      <li><strong>Note titles:</strong> Even metadata is encrypted client-side</li>
                      <li><strong>Usage patterns:</strong> We don&apos;t track what you write or when</li>
                      <li><strong>Personal data:</strong> Only your email for account management</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <div className="flex items-center space-x-3 mb-6">
                    <Globe className="h-6 w-6 text-tn-accent" />
                    <h2 className="text-2xl font-semibold text-gray-900">GDPR & EU Privacy</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      We&apos;re committed to the highest privacy standards with EU hosting and GDPR compliance:
                    </p>
                    <ul>
                      <li>All servers located in EU data centers</li>
                      <li>Full compliance with GDPR regulations</li>
                      <li>Right to data portability - export anytime</li>
                      <li>Right to deletion - delete your account and all data</li>
                      <li>Clear data rights and transparent processing</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <div className="flex items-center space-x-3 mb-6">
                    <Lock className="h-6 w-6 text-tn-accent" />
                    <h2 className="text-2xl font-semibold text-gray-900">Our Business Model</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      Our business model is simple and aligned with your privacy:
                    </p>
                    <ul>
                      <li><strong>Subscription fees:</strong> We make money when you pay for the service</li>
                      <li><strong>No data selling:</strong> We can&apos;t sell your data because we can&apos;t read it</li>
                      <li><strong>No ads:</strong> No tracking, no analytics, no third-party scripts</li>
                      <li><strong>No hidden revenue:</strong> 100% transparent pricing</li>
                    </ul>
                    <p>
                      This alignment means our success depends on providing you with excellent, 
                      private note-taking - not on exploiting your data.
                    </p>
                  </div>
                </section>

                <section className="bg-gray-50 p-8 rounded-2xl">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions?</h2>
                  <p className="text-gray-600 mb-4">
                    We believe in complete transparency. If you have questions about our privacy 
                    practices, security implementation, or data handling, we&apos;re here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href="/security" 
                      className="text-tn-accent hover:text-gray-700 font-medium underline"
                    >
                      Read Security Whitepaper →
                    </a>
                    <a 
                      href="/privacy" 
                      className="text-tn-accent hover:text-gray-700 font-medium underline"
                    >
                      View Privacy Policy →
                    </a>
                    <a 
                      href="mailto:privacy@textnotepad.com" 
                      className="text-tn-accent hover:text-gray-700 font-medium underline"
                    >
                      Contact Privacy Team →
                    </a>
                  </div>
                </section>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}