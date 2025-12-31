import type { IntersectionState } from '@/types/game'

/**
 * Global intersection state storage
 * Allows components to access intersection routing state without prop drilling
 * Similar pattern to getRoadNetwork() in data/roads.ts
 */

let globalIntersections = new Map<string, IntersectionState>()

/**
 * Get the current intersection states
 * @returns Map of intersection node IDs to their states
 */
export function getIntersections(): Map<string, IntersectionState> {
  return globalIntersections
}

/**
 * Update the global intersection states
 * Called by useIntersectionManager when state changes
 *
 * @param intersections - Updated intersection state map
 */
export function setIntersections(intersections: Map<string, IntersectionState>): void {
  globalIntersections = intersections
}

/**
 * Get a specific intersection's mode
 * @param nodeId - Intersection node ID
 * @returns Current mode or 'pass_through' if not found
 */
export function getIntersectionMode(nodeId: string): 'pass_through' | 'turn_left' | 'turn_right' {
  return globalIntersections.get(nodeId)?.mode || 'pass_through'
}
