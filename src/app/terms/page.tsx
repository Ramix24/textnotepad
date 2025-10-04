import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <Container>
          <div className="flex h-16 items-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-16 max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Terms of Service</h1>
          
          <p className="lead">
            By using TextNotepad, you agree to these terms. We&apos;ve tried to make 
            them as straightforward as possible while protecting both your rights and ours.
          </p>

          <h2>Your Account</h2>
          <ul>
            <li>You must provide a valid email address to create an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must notify us immediately of any unauthorized use</li>
            <li>One person per account (no sharing accounts)</li>
          </ul>

          <h2>Acceptable Use</h2>
          <p>You may use TextNotepad for any lawful purpose. You may not:</p>
          <ul>
            <li>Use the service for illegal activities</li>
            <li>Attempt to breach our security or encryption</li>
            <li>Share your account credentials</li>
            <li>Reverse engineer our software</li>
          </ul>

          <h2>Your Content</h2>
          <ul>
            <li>You retain all rights to your notes and content</li>
            <li>We cannot read your content due to end-to-end encryption</li>
            <li>You can export your data at any time</li>
            <li>You&apos;re responsible for backing up important content</li>
          </ul>

          <h2>Service Availability</h2>
          <ul>
            <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
            <li>Scheduled maintenance will be announced in advance</li>
            <li>We&apos;ll notify you of any significant service disruptions</li>
          </ul>

          <h2>Payment and Billing</h2>
          <ul>
            <li>Founders Promo requires no payment information during free period</li>
            <li>Paid plans are billed in advance</li>
            <li>30-day money-back guarantee on all plans</li>
            <li>Auto-renewal can be disabled in account settings</li>
          </ul>

          <h2>Cancellation and Refunds</h2>
          <ul>
            <li>Cancel anytime from your account settings</li>
            <li>Refunds available within 30 days of payment</li>
            <li>Account data retained for 30 days after cancellation</li>
            <li>Export your data before account deletion</li>
          </ul>

          <h2>Limitation of Liability</h2>
          <p>
            TextNotepad is provided &ldquo;as is&rdquo; without warranties. We&apos;re not liable 
            for data loss, business interruption, or consequential damages beyond 
            the amount you&apos;ve paid us.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these terms occasionally. Material changes will be 
            communicated via email at least 30 days in advance.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms: <a href="mailto:info@textnotepad.com">info@textnotepad.com</a>
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            Last updated: January 2024
          </p>
        </div>
      </Container>
    </div>
  )
}