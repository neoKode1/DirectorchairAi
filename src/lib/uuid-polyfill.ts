// UUID Polyfill for crypto.randomUUID compatibility
// This ensures UUID generation works across all environments

/**
 * Generate a UUID v4 using available crypto methods
 * Falls back to a simple random implementation if crypto.randomUUID is not available
 */
export function generateUUID(): string {
  // Try to use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for older environments
  return generateUUIDFallback();
}

/**
 * Fallback UUID generation using crypto.getRandomValues or Math.random
 */
function generateUUIDFallback(): string {
  const hexDigits = '0123456789abcdef';
  let uuid = '';

  // Generate 32 random hex digits
  for (let i = 0; i < 32; i++) {
    let randomValue: number;

    // Try to use crypto.getRandomValues if available
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(1);
      crypto.getRandomValues(array);
      randomValue = array[0];
    } else {
      // Fallback to Math.random (less secure but functional)
      randomValue = Math.floor(Math.random() * 16);
    }

    uuid += hexDigits[randomValue];
  }

  // Insert hyphens to make it a valid UUID v4
  return [
    uuid.slice(0, 8),
    uuid.slice(8, 12),
    uuid.slice(12, 16),
    uuid.slice(16, 20),
    uuid.slice(20, 32)
  ].join('-');
}

/**
 * Check if crypto.randomUUID is available
 */
export function isCryptoUUIDAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';
}

/**
 * Generate a simple ID (shorter than UUID) for cases where full UUID is not needed
 */
export function generateSimpleId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

// Export as default for convenience
export default generateUUID;
