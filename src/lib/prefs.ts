const STORAGE_PREFIX = 'tnp:'

export function getPreference<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') return defaultValue
    
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (stored === null) return defaultValue
    
    return JSON.parse(stored) as T
  } catch (error) {
    console.warn(`Failed to get preference "${key}":`, error)
    return defaultValue
  }
}

export function setPreference<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to set preference "${key}":`, error)
  }
}

export function removePreference(key: string): void {
  try {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
  } catch (error) {
    console.warn(`Failed to remove preference "${key}":`, error)
  }
}

// Debounced setter for performance
export function createDebouncedSetter<T>(
  key: string,
  delay: number = 150
): (value: T) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (value: T) => {
    if (timeoutId) clearTimeout(timeoutId)
    
    timeoutId = setTimeout(() => {
      setPreference(key, value)
    }, delay)
  }
}