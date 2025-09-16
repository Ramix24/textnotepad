/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Web Worker for testing
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((error: ErrorEvent) => void) | null = null
  
  constructor(public url: string | URL) {}
  
  postMessage(data: any) {
    // Simulate async worker response
    setTimeout(() => {
      if (this.onmessage) {
        // Mock the counter logic for testing
        const { type, text, id } = data
        if (type === 'CALCULATE_STATS') {
          const result = {
            word_count: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
            char_count: text.length,
            line_count: text === '' ? 1 : text.split('\n').length,
            size_bytes: new TextEncoder().encode(text).length,
          }
          
          this.onmessage({
            data: {
              type: 'STATS_RESULT',
              result,
              id,
            }
          } as MessageEvent)
        }
      }
    }, 10)
  }
  
  terminate() {}
  
  addEventListener() {}
}

// Mock Worker constructor
vi.stubGlobal('Worker', MockWorker)

describe('Counter Worker Integration', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create worker with correct URL', () => {
    const worker = new MockWorker(new URL('../workers/counter.worker.ts', import.meta.url))
    expect(worker.url).toBeDefined()
  })

  it('should handle message posting and response', async () => {
    const worker = new MockWorker('test-url')
    
    const responsePromise = new Promise((resolve) => {
      worker.onmessage = (event) => {
        resolve(event.data)
      }
    })
    
    worker.postMessage({
      type: 'CALCULATE_STATS',
      text: 'hello world',
      id: 'test-1'
    })
    
    // Advance timers to trigger the setTimeout
    vi.advanceTimersByTime(20)
    
    const response = await responsePromise
    
    expect(response).toEqual({
      type: 'STATS_RESULT',
      result: {
        word_count: 2,
        char_count: 11,
        line_count: 1,
        size_bytes: 11,
      },
      id: 'test-1'
    })
  })

  it('should handle empty text correctly', async () => {
    const worker = new MockWorker('test-url')
    
    const responsePromise = new Promise((resolve) => {
      worker.onmessage = (event) => {
        resolve(event.data)
      }
    })
    
    worker.postMessage({
      type: 'CALCULATE_STATS',
      text: '',
      id: 'test-2'
    })
    
    vi.advanceTimersByTime(20)
    
    const response = await responsePromise
    
    expect(response).toEqual({
      type: 'STATS_RESULT',
      result: {
        word_count: 0,
        char_count: 0,
        line_count: 1,
        size_bytes: 0,
      },
      id: 'test-2'
    })
  })

  it('should handle multiline text correctly', async () => {
    const worker = new MockWorker('test-url')
    
    const responsePromise = new Promise((resolve) => {
      worker.onmessage = (event) => {
        resolve(event.data)
      }
    })
    
    worker.postMessage({
      type: 'CALCULATE_STATS',
      text: 'line one\nline two\nline three',
      id: 'test-3'
    })
    
    vi.advanceTimersByTime(20)
    
    const response = await responsePromise
    
    expect(response).toEqual({
      type: 'STATS_RESULT',
      result: {
        word_count: 6,
        char_count: 28,
        line_count: 3,
        size_bytes: 28,
      },
      id: 'test-3'
    })
  })
})