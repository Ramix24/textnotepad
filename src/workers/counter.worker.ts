/**
 * Web Worker for text statistics calculation
 * 
 * This worker runs in a separate thread to avoid blocking the UI
 * when calculating statistics for large text documents.
 * 
 * Message format:
 * - Input: { type: 'CALCULATE_STATS', text: string, id?: string }
 * - Output: { type: 'STATS_RESULT', result: { word_count, char_count, line_count, size_bytes }, id?: string }
 * - Error: { type: 'STATS_ERROR', error: string, id?: string }
 */

// Import text counting functions
import { countWords, countChars, countLines, countBytes } from '../lib/counters'

export interface WorkerMessage {
  type: 'CALCULATE_STATS'
  text: string
  id?: string // Optional ID to match requests with responses
}

export interface WorkerResult {
  type: 'STATS_RESULT'
  result: {
    word_count: number
    char_count: number
    line_count: number
    size_bytes: number
  }
  id?: string
}

export interface WorkerError {
  type: 'STATS_ERROR'
  error: string
  id?: string
}

// Handle messages from main thread
self.onmessage = function(event: MessageEvent<WorkerMessage>) {
  const { type, text, id } = event.data

  try {
    if (type !== 'CALCULATE_STATS') {
      throw new Error(`Unknown message type: ${type}`)
    }

    // Calculate all statistics
    const result = {
      word_count: countWords(text),
      char_count: countChars(text),
      line_count: countLines(text),
      size_bytes: countBytes(text),
    }

    // Send result back to main thread
    const response: WorkerResult = {
      type: 'STATS_RESULT',
      result,
      id,
    }

    self.postMessage(response)
  } catch (error) {
    // Send error back to main thread
    const errorResponse: WorkerError = {
      type: 'STATS_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      id,
    }

    self.postMessage(errorResponse)
  }
}

// Handle worker startup
self.addEventListener('message', function(_event) {
  // This is handled by onmessage above, but we include this
  // for completeness and potential future extensions
})

// Types are already exported above with the interface declarations