/**
 * Version utilities  
 * Provides access to the current app version
 * Version is auto-updated by the version script on each commit
 * CRITICAL FIX v0.5.49: Test swapped action order to fix selection bug
 */

// This version is automatically updated by scripts/auto-version.js
export const APP_VERSION = '0.5.52'
export const APP_NAME = 'textnotepad'

/**
 * Get the current application version
 */
export function getVersion(): string {
  return APP_VERSION
}

/**
 * Get version parts as numbers
 */
export function getVersionParts(): { major: number; minor: number; patch: number } {
  const [major, minor, patch] = APP_VERSION.split('.').map(Number)
  return { major, minor, patch }
}

/**
 * Format version for display
 */
export function formatVersion(prefix = 'v'): string {
  return `${prefix}${APP_VERSION}`
}