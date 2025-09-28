import { PromoBanner } from '@/components/promo-banner'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { PrivacySecurity } from '@/components/privacy-security'
import { Pricing } from '@/components/pricing'
import { Testimonials } from '@/components/testimonials'
import { Footer } from '@/components/footer'

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://textnotepad.com/#website",
      "url": "https://textnotepad.com/",
      "name": "TextNotepad",
      "description": "Privacy-first note taking with end-to-end encryption. Join our beta waitlist for early access.",
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://textnotepad.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      ]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://textnotepad.com/#software",
      "name": "TextNotepad",
      "description": "A modern web-based text editor built for privacy-conscious writers who demand simplicity and focus. Currently in beta.",
      "url": "https://textnotepad.com/",
      "operatingSystem": "Web Browser",
      "applicationCategory": "ProductivityApplication",
      "offers": [
        {
          "@type": "Offer",
          "name": "Beta Access",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/PreOrder",
          "description": "Free beta access via waitlist"
        }
      ],
      "featureList": [
        "Full End-to-End Encryption (E2EE)",
        "Zero-knowledge storage", 
        "Distraction-free writing",
        "GDPR compliant, EU hosting",
        "Priority access to new features",
        "Help influence the roadmap"
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://textnotepad.com/#organization",
      "name": "TextNotepad",
      "url": "https://textnotepad.com/",
      "logo": "https://textnotepad.com/logo.png",
      "sameAs": [
        "https://github.com/yourusername/textnotepad",
        "https://twitter.com/textnotepad"
      ]
    }
  ]
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PromoBanner />
      <Header />
      <main>
        <Hero />
        <Features />
        <PrivacySecurity />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
