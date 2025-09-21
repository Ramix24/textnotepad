import { PromoBanner } from '@/components/promo-banner'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { PrivacySecurity } from '@/components/privacy-security'
import { OfflineFocus } from '@/components/offline-focus'
import { Pricing } from '@/components/pricing'
import { DemoCTA } from '@/components/demo-cta'
import { Testimonials } from '@/components/testimonials'
import { FAQ } from '@/components/faq'
import { Footer } from '@/components/footer'

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://textnotepad.com/#website",
      "url": "https://textnotepad.com/",
      "name": "TextNotepad",
      "description": "Privacy-first note taking with end-to-end encryption",
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
      "description": "A modern web-based text editor built for privacy-conscious writers who demand simplicity and focus.",
      "url": "https://textnotepad.com/",
      "operatingSystem": "Web Browser",
      "applicationCategory": "ProductivityApplication",
      "offers": [
        {
          "@type": "Offer",
          "name": "Personal Plan",
          "price": "29",
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock",
          "validFrom": "2024-01-01"
        },
        {
          "@type": "Offer",
          "name": "Secure Saver",
          "price": "59",
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock",
          "validFrom": "2024-01-01"
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127"
      },
      "featureList": [
        "Full End-to-End Encryption (E2EE)",
        "Zero-knowledge storage",
        "Self-destruct notes",
        "Offline mode & auto-sync",
        "Distraction-free writing",
        "Auto-save",
        "Open-source client",
        "GDPR compliant, EU hosting"
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
        <OfflineFocus />
        <Pricing />
        <DemoCTA />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
