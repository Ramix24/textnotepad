import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          <h1>Privacy Policy</h1>
          
          <p className="lead">
            At TextNotepad, your privacy is not just a policy—it&apos;s our core principle. 
            We&apos;ve built our entire architecture around zero-knowledge encryption, 
            which means we literally cannot read your notes.
          </p>

          <h2>What We Collect</h2>
          <ul>
            <li><strong>Account Information:</strong> Email address for authentication</li>
            <li><strong>Encrypted Data:</strong> Your notes, encrypted on your device before transmission</li>
            <li><strong>Usage Metadata:</strong> Login times, storage usage (but not content)</li>
            <li><strong>Technical Data:</strong> Device type, browser version for compatibility</li>
          </ul>

          <h2>What We Cannot See</h2>
          <ul>
            <li>The content of your notes (encrypted with your keys)</li>
            <li>Your note titles or folder names (also encrypted)</li>
            <li>Your writing patterns or habits</li>
            <li>Any plaintext information about your documents</li>
          </ul>

          <h2>How We Use Your Data</h2>
          <p>
            We use the minimal data we collect to:
          </p>
          <ul>
            <li>Authenticate your account</li>
            <li>Store your encrypted notes securely</li>
            <li>Provide customer support</li>
            <li>Improve our service performance</li>
          </ul>

          <h2>Data Storage and Location</h2>
          <p>
            All data is stored in EU data centers and subject to GDPR protection. 
            Your encrypted notes are distributed across multiple secure facilities 
            for redundancy.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We use minimal third-party services, all GDPR-compliant:
          </p>
          <ul>
            <li>Payment processing (Stripe)</li>
            <li>Email delivery (for account notifications only)</li>
            <li>EU-based cloud infrastructure</li>
          </ul>

          <h2>Your Rights</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul>
            <li>Access your data</li>
            <li>Export your encrypted notes</li>
            <li>Delete your account and all associated data</li>
            <li>Rectify any incorrect information</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            For privacy-related questions: <a href="mailto:privacy@textnotepad.com">privacy@textnotepad.com</a>
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            Last updated: January 2024
          </p>
        </div>
      </Container>
    </div>
  )
}