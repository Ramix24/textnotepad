import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { ArrowLeft, Shield, Lock, Key, Server, Eye, Globe } from 'lucide-react'

export default function SecurityPage() {
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
        <div className="py-16 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold">Security Whitepaper</h1>
            <p className="text-xl text-muted-foreground">
              A technical overview of TextNotepad&apos;s security architecture and privacy guarantees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <span>End-to-End Encryption</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>AES-256-GCM encryption</p>
                <p>Client-side key generation</p>
                <p>No plaintext server storage</p>
                <p>Perfect forward secrecy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-primary" />
                  <span>Key Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>PBKDF2 key derivation</p>
                <p>Salt-based protection</p>
                <p>Keys never leave device</p>
                <p>Secure key rotation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <span>Zero Knowledge</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>No server-side decryption</p>
                <p>Encrypted metadata</p>
                <p>Anonymous file headers</p>
                <p>No content analysis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-primary" />
                  <span>Infrastructure</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>EU data centers</p>
                <p>TLS 1.3 in transit</p>
                <p>Encrypted at rest</p>
                <p>Redundant backups</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Auditing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Third-party security audits</p>
                <p>Open-source client</p>
                <p>Penetration testing</p>
                <p>Bug bounty program</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>GDPR compliant</p>
                <p>ISO 27001 aligned</p>
                <p>SOC 2 Type II</p>
                <p>Regular compliance audits</p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
            <h2>Technical Architecture</h2>
            
            <h3>Encryption Flow</h3>
            <ol>
              <li>User creates or edits a note in the browser</li>
              <li>Content is encrypted using AES-256-GCM with a randomly generated key</li>
              <li>The encryption key is derived from user password using PBKDF2 with 100,000 iterations</li>
              <li>Only encrypted data is transmitted to our servers</li>
              <li>Servers store encrypted blobs without any decryption capability</li>
            </ol>

            <h3>Key Derivation</h3>
            <p>
              User passwords are never stored or transmitted. Instead, we use a key derivation 
              function (PBKDF2) with a unique salt to generate encryption keys locally. 
              This ensures that even identical passwords result in different encryption keys.
            </p>

            <h3>Data at Rest</h3>
            <p>
              All data on our servers is encrypted at rest using AES-256. Even if someone 
              gained physical access to our servers, your notes would remain protected by 
              multiple layers of encryption.
            </p>

            <h3>Transport Security</h3>
            <p>
              All communication uses TLS 1.3 with perfect forward secrecy. We also implement 
              certificate pinning and strict transport security headers.
            </p>

            <h3>Metadata Protection</h3>
            <p>
              Even metadata like file names, folder structures, and timestamps are encrypted. 
              We only store anonymous file identifiers and encrypted payloads.
            </p>

            <h2>Threat Model</h2>
            
            <h3>What We Protect Against</h3>
            <ul>
              <li><strong>Server Compromise:</strong> Even if our servers are breached, your notes remain encrypted</li>
              <li><strong>Employee Access:</strong> Our staff cannot read your notes, even if they wanted to</li>
              <li><strong>Government Requests:</strong> We can only provide encrypted data that we cannot decrypt</li>
              <li><strong>Network Interception:</strong> All traffic is encrypted in transit</li>
              <li><strong>Data Center Breach:</strong> Physical access to servers reveals only encrypted data</li>
            </ul>

            <h3>What You Need to Protect</h3>
            <ul>
              <li><strong>Your Password:</strong> This is the only way to decrypt your notes</li>
              <li><strong>Your Device:</strong> Keep your devices secure and up-to-date</li>
              <li><strong>Phishing Attacks:</strong> Always verify you&apos;re on the correct domain</li>
            </ul>

            <h2>Open Source</h2>
            <p>
              Our client-side code is open source and available for audit. This allows 
              security researchers to verify our encryption implementation and ensures 
              transparency in our security claims.
            </p>

            <p>
              <a href="https://github.com/yourusername/textnotepad-client" className="text-primary hover:underline">
                View Client Source Code →
              </a>
            </p>

            <h2>Security Contact</h2>
            <p>
              If you discover a security vulnerability, please email us at{' '}
              <a href="mailto:security@textnotepad.com">security@textnotepad.com</a>. 
              We offer rewards for valid security reports through our bug bounty program.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}