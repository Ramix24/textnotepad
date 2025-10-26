import React from 'react'

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      className={className}
      aria-label="TextNotepad Logo"
    >
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5C7CFA" />
          <stop offset="100%" stopColor="#3F51B5" />
        </linearGradient>
      </defs>
      
      {/* Rounded square background */}
      <rect 
        x="0" 
        y="0" 
        width="512" 
        height="512" 
        rx="115" 
        fill="url(#bg-gradient)"
      />
      
      {/* Text lines */}
      <rect x="90" y="154" width="270" height="18" rx="9" fill="white" />
      <rect x="90" y="195" width="240" height="18" rx="9" fill="white" />
      <rect x="90" y="236" width="195" height="18" rx="9" fill="white" />
      <rect x="90" y="277" width="320" height="18" rx="9" fill="white" />
      <rect x="90" y="318" width="285" height="18" rx="9" fill="white" />
      <rect x="90" y="359" width="220" height="18" rx="9" fill="white" />
    </svg>
  )
}