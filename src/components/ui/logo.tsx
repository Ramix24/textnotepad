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
      viewBox="0 0 32 32" 
      className={className}
      aria-label="TextNotepad Logo"
    >
      {/* Navy blue circle background */}
      <circle 
        cx="16" 
        cy="16" 
        r="16" 
        fill="#1e3a8a"
      />
      
      {/* Lock body */}
      <rect 
        x="11" 
        y="15" 
        width="10" 
        height="8" 
        rx="1" 
        fill="rgba(255, 255, 255, 0.3)"
      />
      
      {/* Lock shackle (top part) */}
      <path 
        d="M13 15 V12 C13 10.3 14.3 9 16 9 C17.7 9 19 10.3 19 12 V15" 
        stroke="rgba(255, 255, 255, 0.3)" 
        strokeWidth="1.5" 
        fill="none"
      />
      
      {/* Letter T in white - centered in the lock */}
      <text 
        x="16" 
        y="20.5" 
        textAnchor="middle" 
        dominantBaseline="middle" 
        fill="white" 
        fontSize="8" 
        fontWeight="bold" 
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        T
      </text>
    </svg>
  )
}