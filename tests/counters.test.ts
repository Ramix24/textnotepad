import { describe, it, expect } from 'vitest'
import {
  countChars,
  countLines,
  countWords,
  countBytes,
  calculateTextStats,
  validateTextLimits,
} from '@/lib/counters'

describe('countChars', () => {
  it('should return 0 for empty string', () => {
    expect(countChars('')).toBe(0)
  })

  it('should count simple text correctly', () => {
    expect(countChars('hello')).toBe(5)
    expect(countChars('Hello World!')).toBe(12)
  })

  it('should count Unicode characters correctly', () => {
    expect(countChars('café')).toBe(4)
    expect(countChars('Ľudia môžu písať')).toBe(16)
    expect(countChars('日本語')).toBe(3)
    expect(countChars('🎉🎊✨')).toBe(5) // Some emojis are single UTF-16 units
  })

  it('should count whitespace and special characters', () => {
    expect(countChars('   ')).toBe(3)
    expect(countChars('\n\t\r')).toBe(3)
    expect(countChars('hello\nworld')).toBe(11)
  })
})

describe('countLines', () => {
  it('should return 1 for empty string', () => {
    expect(countLines('')).toBe(1)
  })

  it('should count single line without newline', () => {
    expect(countLines('hello world')).toBe(1)
  })

  it('should count multiple lines correctly', () => {
    expect(countLines('line1\nline2')).toBe(2)
    expect(countLines('line1\nline2\nline3')).toBe(3)
  })

  it('should handle trailing newlines correctly', () => {
    expect(countLines('line1\n')).toBe(1)
    expect(countLines('line1\nline2\n')).toBe(2)
  })

  it('should handle multiple consecutive newlines', () => {
    expect(countLines('line1\n\nline3')).toBe(3)
    expect(countLines('\n\n\n')).toBe(3)
  })

  it('should handle mixed line endings', () => {
    expect(countLines('line1\nline2\nline3')).toBe(3)
  })
})

describe('countWords', () => {
  it('should return 0 for empty string', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   ')).toBe(0)
    expect(countWords('\n\t\r')).toBe(0)
  })

  it('should count simple words correctly', () => {
    expect(countWords('hello')).toBe(1)
    expect(countWords('hello world')).toBe(2)
    expect(countWords('The quick brown fox')).toBe(4)
  })

  it('should handle contractions correctly', () => {
    expect(countWords("don't")).toBe(2) // "don" + "t"
    expect(countWords("it's a beautiful day")).toBe(5) // "it" + "s" + "a" + "beautiful" + "day"
    expect(countWords("can't won't shouldn't")).toBe(6) // Each contraction splits into 2 words
  })

  it('should handle hyphenated words correctly', () => {
    expect(countWords('state-of-the-art')).toBe(4) // Split by hyphens
    expect(countWords('twenty-one forty-two')).toBe(4) // "twenty" + "one" + "forty" + "two"
    expect(countWords('self-contained auto-save')).toBe(4) // Each hyphenated word splits
  })

  it('should handle punctuation correctly', () => {
    expect(countWords('Hello, world!')).toBe(2)
    expect(countWords('Yes. No? Maybe...')).toBe(3)
    expect(countWords('(parentheses) [brackets] {braces}')).toBe(3)
  })

  it('should handle Unicode text correctly', () => {
    expect(countWords('Ľudia môžu písať')).toBe(3)
    expect(countWords('café résumé naïve')).toBe(3)
    expect(countWords('日本語 テスト')).toBe(2)
  })

  it('should handle numbers and mixed content', () => {
    expect(countWords('123 456')).toBe(2)
    expect(countWords('version 1.0.0')).toBe(4) // "version" + "1" + "0" + "0"
    expect(countWords('user@example.com')).toBe(3) // "user" + "example" + "com"
    expect(countWords('file_name.txt')).toBe(3) // "file" + "name" + "txt"
  })

  it('should handle large text blocks', () => {
    const longText = 'word '.repeat(1000).trim()
    expect(countWords(longText)).toBe(1000)
  })

  it('should handle extremely large text (performance test)', () => {
    const hugeParagraph = 'This is a sentence with multiple words that will be repeated many times. '.repeat(10000)
    const wordCount = countWords(hugeParagraph)
    expect(wordCount).toBe(130000) // 13 words * 10000 repetitions
  })

  it('should handle text with massive number of newlines', () => {
    const textWithManyNewlines = 'word\n'.repeat(50000)
    expect(countWords(textWithManyNewlines)).toBe(50000)
    expect(countLines(textWithManyNewlines)).toBe(50000)
  })
})

describe('countBytes', () => {
  it('should return 0 for empty string', () => {
    expect(countBytes('')).toBe(0)
  })

  it('should count ASCII text correctly', () => {
    expect(countBytes('hello')).toBe(5)
    expect(countBytes('Hello World!')).toBe(12)
  })

  it('should count Unicode characters correctly', () => {
    expect(countBytes('café')).toBe(5) // 'é' is 2 bytes in UTF-8
    expect(countBytes('日本語')).toBe(9) // Each character is 3 bytes in UTF-8
    expect(countBytes('🎉')).toBe(4) // Emoji is 4 bytes in UTF-8
  })

  it('should count Slovak diacritics correctly', () => {
    expect(countBytes('čťžýáíéúô')).toBe(18) // Each accented char is 2 bytes
    expect(countBytes('ČŤŽÝÁÍÉÚÔ')).toBe(18)
  })

  it('should handle extremely large text efficiently', () => {
    // Test with 1MB+ of text
    const largeText = 'a'.repeat(1024 * 1024) // 1MB of 'a' characters
    expect(countBytes(largeText)).toBe(1024 * 1024)
    expect(countChars(largeText)).toBe(1024 * 1024)
  })

  it('should handle large Unicode text', () => {
    // Test with large Unicode content
    const unicodeText = '🎉💯✨'.repeat(10000) // 30,000 emoji characters
    const byteCount = countBytes(unicodeText)
    const charCount = countChars(unicodeText)
    
    expect(charCount).toBe(50000) // Some emojis are 2 UTF-16 code units
    expect(byteCount).toBeGreaterThan(charCount * 2) // UTF-8 emojis are 4 bytes each
  })
})

describe('calculateTextStats', () => {
  it('should calculate all stats for empty text', () => {
    const stats = calculateTextStats('')
    expect(stats).toEqual({
      chars: 0,
      lines: 1,
      words: 0,
      bytes: 0,
    })
  })

  it('should calculate all stats for simple text', () => {
    const stats = calculateTextStats('Hello world!')
    expect(stats).toEqual({
      chars: 12,
      lines: 1,
      words: 2,
      bytes: 12,
    })
  })

  it('should calculate all stats for multiline text', () => {
    const text = 'First line\nSecond line\nThird line'
    const stats = calculateTextStats(text)
    expect(stats).toEqual({
      chars: 33,
      lines: 3,
      words: 6,
      bytes: 33,
    })
  })

  it('should calculate stats for Unicode text', () => {
    const text = 'Môžete písať\nv slovenčine! 🎉'
    const stats = calculateTextStats(text)
    expect(stats.chars).toBe(29) // Including emoji
    expect(stats.lines).toBe(2)
    expect(stats.words).toBe(4) // "Môžete" + "písať" + "v" + "slovenčine"
    expect(stats.bytes).toBeGreaterThan(stats.chars) // UTF-8 uses more bytes for accented chars
  })

  it('should handle large document stats calculation efficiently', () => {
    // Simulate a large document (book-length)
    const chapter = 'This is a sample paragraph with multiple sentences and words. '.repeat(1000)
    const book = (chapter + '\n\n').repeat(100) // 100 chapters
    
    const stats = calculateTextStats(book)
    
    expect(stats.words).toBe(1000000) // 10 words * 1000 * 100
    expect(stats.lines).toBe(200) // 100 double-spaced chapters
    expect(stats.chars).toBeGreaterThan(5000000) // Large character count
    expect(stats.bytes).toBe(stats.chars) // ASCII text, so bytes = chars
  })

  it('should handle edge case: single massive line', () => {
    // Test a document that's one giant line
    const massiveLine = 'word '.repeat(100000).trim() // 100k words on one line
    const stats = calculateTextStats(massiveLine)
    
    expect(stats.words).toBe(100000)
    expect(stats.lines).toBe(1)
    expect(stats.chars).toBe(499999) // 100k words * 5 chars - 1 trailing space
  })
})

describe('validateTextLimits', () => {
  it('should validate text within limits', () => {
    const result = validateTextLimits('hello world', {
      maxChars: 100,
      maxBytes: 100,
      maxLines: 10,
    })
    
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.stats.chars).toBe(11)
  })

  it('should detect character limit violations', () => {
    const result = validateTextLimits('hello world', {
      maxChars: 5,
    })
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Text exceeds character limit: 11/5')
  })

  it('should detect byte limit violations', () => {
    const result = validateTextLimits('café 🎉', {
      maxBytes: 5,
    })
    
    expect(result.valid).toBe(false)
    expect(result.errors.some(err => err.includes('byte limit'))).toBe(true)
  })

  it('should detect line limit violations', () => {
    const result = validateTextLimits('line1\nline2\nline3', {
      maxLines: 2,
    })
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Text exceeds line limit: 3/2')
  })

  it('should detect multiple limit violations', () => {
    const result = validateTextLimits('line1\nline2\nline3', {
      maxChars: 5,
      maxLines: 1,
    })
    
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(2)
  })

  it('should work without limits specified', () => {
    const result = validateTextLimits('any text here')
    
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})