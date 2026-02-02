/**
 * Get the correct asset path based on environment
 * Supports basePath via Next.js config if needed in the future
 */
export function getAssetPath(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `/${cleanPath}`
}
