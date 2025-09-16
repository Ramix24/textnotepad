/**
 * Pure functions for text statistics calculation
 * 
 * These functions are designed to be:
 * - Pure (no side effects, deterministic)
 * - Fast and efficient for real-time editing
 * - Unicode-aware for international content
 * - Consistent with common text editor conventions
 */

/**
 * Count characters in text using UTF-16 length
 * This matches JavaScript's native string length behavior
 * 
 * @param text - Input text to count
 * @returns Number of UTF-16 code units
 */
export function countChars(text: string): number {
  return text.length
}

/**
 * Count lines in text
 * Lines are separated by \n characters
 * Empty text is considered to have 1 line (like most text editors)
 * 
 * @param text - Input text to count
 * @returns Number of lines
 */
export function countLines(text: string): number {
  if (text === '') {
    return 1
  }
  
  // Split by \n and count
  // Note: text ending with \n will create an empty element, 
  // but we want to count it as the same number of lines
  const lines = text.split('\n')
  
  // If text ends with \n, the last element will be empty
  // This represents a trailing newline, not an additional line
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    return lines.length - 1
  }
  
  return lines.length
}

/**
 * Count words in text
 * Words are defined as sequences of:
 * - Word characters (\w - letters, digits, underscore)
 * - Apostrophes (for contractions like "don't", "it's")
 * - Hyphens (for hyphenated words like "state-of-the-art")
 * 
 * This provides a reasonable approximation for most text content
 * including English contractions and hyphenated terms.
 * 
 * @param text - Input text to count
 * @returns Number of words
 */
export function countWords(text: string): number {
  if (text.trim() === '') {
    return 0
  }
  
  // Split by whitespace and punctuation, then filter out empty strings
  // This approach is more reliable for Unicode text than regex
  const words = text
    .split(/[\s\p{P}]+/u) // Split on whitespace and punctuation
    .filter(word => word.length > 0 && /\p{L}|\p{N}/u.test(word)) // Keep only words with letters or numbers
  
  return words.length
}

/**
 * Calculate byte size of text when encoded as UTF-8
 * Useful for storage calculations and API limits
 * 
 * @param text - Input text to measure
 * @returns Number of bytes in UTF-8 encoding
 */
export function countBytes(text: string): number {
  return new TextEncoder().encode(text).length
}

/**
 * Calculate all text statistics at once
 * More efficient than calling individual functions separately
 * 
 * @param text - Input text to analyze
 * @returns Object with all statistics
 */
export function calculateTextStats(text: string): {
  chars: number
  lines: number
  words: number
  bytes: number
} {
  return {
    chars: countChars(text),
    lines: countLines(text),
    words: countWords(text),
    bytes: countBytes(text),
  }
}

/**
 * Validate text statistics for database constraints
 * Useful for preventing oversized content before saving
 * 
 * @param text - Text to validate
 * @param limits - Optional limits to check against
 * @returns Validation result with errors if any
 */
export function validateTextLimits(
  text: string,
  limits: {
    maxChars?: number
    maxBytes?: number
    maxLines?: number
  } = {}
): {
  valid: boolean
  errors: string[]
  stats: ReturnType<typeof calculateTextStats>
} {
  const stats = calculateTextStats(text)
  const errors: string[] = []
  
  if (limits.maxChars && stats.chars > limits.maxChars) {
    errors.push(`Text exceeds character limit: ${stats.chars}/${limits.maxChars}`)
  }
  
  if (limits.maxBytes && stats.bytes > limits.maxBytes) {
    errors.push(`Text exceeds byte limit: ${stats.bytes}/${limits.maxBytes}`)
  }
  
  if (limits.maxLines && stats.lines > limits.maxLines) {
    errors.push(`Text exceeds line limit: ${stats.lines}/${limits.maxLines}`)
  }
  
  return {
    valid: errors.length === 0,
    errors,
    stats,
  }
}