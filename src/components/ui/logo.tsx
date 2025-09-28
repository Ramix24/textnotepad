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
        fill="rgba(255, 255, 255, 0.4)"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="0.5"
      />
      
      {/* Lock shackle (top part) */}
      <path 
        d="M13 15 V12 C13 10.3 14.3 9 16 9 C17.7 9 19 10.3 19 12 V15" 
        stroke="rgba(255, 255, 255, 0.6)" 
        strokeWidth="1.5" 
        fill="none"
      />
      
      {/* Small keyhole in center of lock */}
      <circle 
        cx="16" 
        cy="18.5" 
        r="1.5" 
        fill="rgba(30, 58, 138, 0.8)"
      />
      <rect 
        x="15.5" 
        y="18.5" 
        width="1" 
        height="2" 
        fill="rgba(30, 58, 138, 0.8)"
      />
    </svg>
  )
}