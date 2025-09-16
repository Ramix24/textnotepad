'use client'

import { useCallback, useRef, useEffect } from 'react'
import type { WorkerMessage, WorkerResult, WorkerError } from '@/workers/counter.worker'

export interface CountResult {
  word_count: number
  char_count: number
  line_count: number
  size_bytes: number
}

export interface UseCountersWorkerOptions {
  debounceMs?: number // Debounce delay in milliseconds (default: 150ms)
}

/**
 * Hook for calculating text statistics using a Web Worker
 * 
 * Features:
 * - Runs calculations in a separate thread (non-blocking)
 * - Debounces rapid successive calls
 * - Cancels obsolete calculations
 * - Lazy initialization of worker
 * - Automatic cleanup on unmount
 * 
 * @example
 * ```tsx
 * function Editor() {
 *   const { compute, isLoading } = useCountersWorker({ debounceMs: 200 })
 *   const [stats, setStats] = useState<CountResult | null>(null)
 * 
 *   const handleTextChange = useCallback(async (text: string) => {
 *     try {
 *       const result = await compute(text)
 *       setStats(result)
 *     } catch (error) {
 *       console.error('Failed to calculate stats:', error)
 *     }
 *   }, [compute])
 * 
 *   return (
 *     <div>
 *       <textarea onChange={(e) => handleTextChange(e.target.value)} />
 *       {isLoading && <span>Calculating...</span>}
 *       {stats && (
 *         <div>
 *           Words: {stats.word_count} | Chars: {stats.char_count} | Lines: {stats.line_count}
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useCountersWorker(options: UseCountersWorkerOptions = {}) {
  const { debounceMs = 150 } = options
  
  const workerRef = useRef<Worker | null>(null)
  const pendingCallsRef = useRef<Map<string, { resolve: (result: CountResult) => void; reject: (error: Error) => void }>>(new Map())
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const requestIdRef = useRef(0)
  const isLoadingRef = useRef(false)

  // Initialize worker on first use
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      // Create worker from the counter.worker.ts file
      workerRef.current = new Worker(
        new URL('../workers/counter.worker.ts', import.meta.url),
        { type: 'module' }
      )

      // Handle messages from worker
      workerRef.current.onmessage = (event: MessageEvent<WorkerResult | WorkerError>) => {
        const { type, id } = event.data
        
        if (!id) return

        const pendingCall = pendingCallsRef.current.get(id)
        if (!pendingCall) return

        pendingCallsRef.current.delete(id)

        if (type === 'STATS_RESULT') {
          const { result } = event.data as WorkerResult
          pendingCall.resolve(result)
        } else if (type === 'STATS_ERROR') {
          const { error } = event.data as WorkerError
          pendingCall.reject(new Error(error))
        }

        // Update loading state
        isLoadingRef.current = pendingCallsRef.current.size > 0
      }

      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error)
        // Reject all pending calls
        pendingCallsRef.current.forEach(({ reject }) => {
          reject(new Error('Worker error occurred'))
        })
        pendingCallsRef.current.clear()
        isLoadingRef.current = false
      }
    }

    return workerRef.current
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Reject all pending calls
      pendingCallsRef.current.forEach(({ reject }) => {
        reject(new Error('Component unmounted'))
      })
      pendingCallsRef.current.clear()

      // Terminate worker
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  // Main compute function with debouncing
  const compute = useCallback((text: string): Promise<CountResult> => {
    return new Promise((resolve, reject) => {
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Cancel all pending calls (they're obsolete)
      pendingCallsRef.current.forEach(({ reject: pendingReject }) => {
        pendingReject(new Error('Cancelled by newer request'))
      })
      pendingCallsRef.current.clear()

      // Set up debounced execution
      debounceTimerRef.current = setTimeout(() => {
        try {
          const worker = getWorker()
          const id = (++requestIdRef.current).toString()

          // Store the promise callbacks
          pendingCallsRef.current.set(id, { resolve, reject })

          // Send message to worker
          const message: WorkerMessage = {
            type: 'CALCULATE_STATS',
            text,
            id,
          }

          worker.postMessage(message)
          isLoadingRef.current = true
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Unknown error'))
        }
      }, debounceMs)
    })
  }, [debounceMs, getWorker])

  // Get current loading state
  const isLoading = isLoadingRef.current

  return {
    compute,
    isLoading,
  }
}

// For backwards compatibility and simpler imports
export default useCountersWorker