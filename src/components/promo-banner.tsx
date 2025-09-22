"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    // Check if banner was previously dismissed
    const isDismissed = localStorage.getItem('promo-banner-dismissed')
    if (isDismissed) {
      setIsVisible(false)
      return
    }

    const updateCountdown = () => {
      const now = new Date().getTime()
      const promoEnd = new Date('2025-12-31T23:59:59').getTime()
      const difference = promoEnd - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        
        if (days > 0) {
          setTimeLeft(`${days} days, ${hours}h left`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m left`)
        } else {
          setTimeLeft(`${minutes}m left`)
        }
      } else {
        setTimeLeft("Promo ended")
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('promo-banner-dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="bg-tn-accent text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <span>🎉</span>
          <span>
            Promo 2025: 1-year plan is FREE for accounts created by Dec 31, 2025. Free period lasts until Dec 31, 2026.
          </span>
          {timeLeft && (
            <span className="hidden sm:inline bg-white/20 px-2 py-1 rounded text-xs">
              {timeLeft}
            </span>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute right-2 h-6 w-6 p-0 hover:bg-white/20"
          aria-label="Dismiss banner"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}