import { PromoBanner } from '@/components/promo-banner'
import { Header } from '@/components/header'
import { FAQ } from '@/components/faq'
import { Footer } from '@/components/footer'

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <PromoBanner />
      <Header />
      <main>
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}