import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PricingCard } from '../pricing'

describe('PricingCard', () => {
  const defaultProps = {
    title: 'Personal Plan',
    price: '$29',
    period: '/ year',
    description: 'Perfect for individual writers',
    buttonText: 'Create Free Account'
  }

  it('renders basic pricing card correctly', () => {
    render(<PricingCard {...defaultProps} />)
    
    expect(screen.getByText('Personal Plan')).toBeInTheDocument()
    expect(screen.getByText('$29')).toBeInTheDocument()
    expect(screen.getByText('/ year')).toBeInTheDocument()
    expect(screen.getByText('Perfect for individual writers')).toBeInTheDocument()
    expect(screen.getByText('Create Free Account')).toBeInTheDocument()
  })

  it('renders popular badge when popular prop is true', () => {
    render(
      <PricingCard 
        {...defaultProps} 
        popular={true} 
        badge="Most Popular" 
      />
    )
    
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('renders original price when provided', () => {
    render(
      <PricingCard 
        {...defaultProps} 
        price="$59"
        originalPrice="$87"
      />
    )
    
    expect(screen.getByText('$59')).toBeInTheDocument()
    // Check for original price element with line-through styling
    const originalPriceElement = document.querySelector('.line-through')
    expect(originalPriceElement).toBeInTheDocument()
    expect(originalPriceElement).toHaveTextContent('$$87')
  })

  it('renders yearly equivalent when provided', () => {
    render(
      <PricingCard 
        {...defaultProps} 
        yearlyEquivalent="≈ $1.6 / month"
      />
    )
    
    expect(screen.getByText('≈ $1.6 / month')).toBeInTheDocument()
  })

  it('applies correct styling for popular card', () => {
    const { container } = render(
      <PricingCard {...defaultProps} popular={true} />
    )
    
    const card = container.querySelector('[class*="border-primary"]')
    expect(card).toBeInTheDocument()
  })

  it('renders all features in the included list', () => {
    render(<PricingCard {...defaultProps} />)
    
    // Check for some key features that should always be included
    expect(screen.getByText('Full End-to-End Encryption (E2EE)')).toBeInTheDocument()
    expect(screen.getByText('Zero-knowledge storage')).toBeInTheDocument()
    expect(screen.getByText('Auto-save')).toBeInTheDocument()
    expect(screen.getByText('GDPR compliant, EU hosting')).toBeInTheDocument()
  })

  it('renders default button variant for non-popular cards', () => {
    render(<PricingCard {...defaultProps} />)
    
    const button = screen.getByRole('link', { name: 'Create Free Account' })
    expect(button).toBeInTheDocument()
  })

  it('renders link to authentication page', () => {
    render(<PricingCard {...defaultProps} />)
    
    const link = screen.getByRole('link', { name: 'Create Free Account' })
    expect(link).toHaveAttribute('href', '/auth')
  })
})