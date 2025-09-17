'use client'

import React, { useState, useCallback } from 'react'
import { useCountersWorker, type CountResult } from '@/hooks/useCountersWorker'

interface StatsDisplayProps {
  text: string
  onStatsChange?: (stats: CountResult) => void
}

/**
 * Example component demonstrating useCountersWorker usage
 * 
 * This component automatically calculates and displays text statistics
 * using a Web Worker, providing real-time updates without blocking the UI.
 */
export function StatsDisplay({ text, onStatsChange }: StatsDisplayProps) {
  const [stats, setStats] = useState<CountResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { compute, isLoading } = useCountersWorker({ debounceMs: 150 })

  // Calculate stats when text changes
  const updateStats = useCallback(async (newText: string) => {
    try {
      setError(null)
      const result = await compute(newText)
      setStats(result)
      onStatsChange?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate statistics')
      // Stats calculation error
    }
  }, [compute, onStatsChange])

  // Update stats when text prop changes
  React.useEffect(() => {
    updateStats(text)
  }, [text, updateStats])

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Error calculating stats: {error}
      </div>
    )
  }

  return (
    <div className="text-sm text-muted-foreground flex items-center space-x-4">
      {isLoading && (
        <span className="animate-pulse">Calculating...</span>
      )}
      
      {stats && (
        <>
          <span>Words: {stats.word_count.toLocaleString()}</span>
          <span>Characters: {stats.char_count.toLocaleString()}</span>
          <span>Lines: {stats.line_count.toLocaleString()}</span>
          <span>Size: {(stats.size_bytes / 1024).toFixed(1)} KB</span>
        </>
      )}
      
      {!stats && !isLoading && (
        <span>No statistics available</span>
      )}
    </div>
  )
}

// Export for documentation
export default StatsDisplay

/**
 * Usage Example:
 * 
 * ```tsx
 * function Editor() {
 *   const [content, setContent] = useState('')
 * 
 *   const handleStatsChange = (stats: CountResult) => {
 *     console.log('Updated stats:', stats)
 *     // Update database, send to analytics, etc.
 *   }
 * 
 *   return (
 *     <div>
 *       <textarea 
 *         value={content}
 *         onChange={(e) => setContent(e.target.value)}
 *         placeholder="Start typing..."
 *       />
 *       <StatsDisplay 
 *         text={content} 
 *         onStatsChange={handleStatsChange}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */