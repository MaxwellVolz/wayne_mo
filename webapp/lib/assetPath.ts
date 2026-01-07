// Base path for static export
// Must match the basePath in next.config.ts for production builds
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/crazytaxi' : ''

/**
 * Get the correct asset path based on environment
 * In production builds (static export), prepends the basePath (/crazytaxi)
 * In development, returns the path as-is
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // Add base path if in production
  return BASE_PATH ? `${BASE_PATH}/${cleanPath}` : `/${cleanPath}`
}
