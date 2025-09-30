/**
 * Version utilities  
 * Provides access to the current app version
 * Version is auto-updated by the version script on each commit
 * FINAL PUSH v0.5.43: Fix command palette action execution bug NOW
 */

// This version is automatically updated by scripts/auto-version.js
export const APP_VERSION = '0.5.43'
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