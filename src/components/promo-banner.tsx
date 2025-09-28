"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Simple check - if dismissed, hide it
    try {
      const isDismissed = localStorage.getItem('promo-banner-dismissed')
      if (isDismissed === 'true') {
        setIsVisible(false)
        return
      }
    } catch {
      // If localStorage fails, show banner anyway
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('promo-banner-dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="bg-blue-900 text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <span>🚀</span>
          <span>
            Beta tester — free for anyone, just join the waiting list.
          </span>
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