import type { Dir, IntersectionMode, RoadNode } from '@/types/game'

/**
 * Intersection Topology System - EXPLICIT PRIORITY TABLES
 *
 * Dead ends (1 connection): U-turn back
 * Corners (2 connections): Take the exit that's not the entrance
 * Intersections (3+ connections): Use hardcoded priority tables based on incoming direction
 *
 * Priority tables define exact fallback order for each incoming direction and mode.
 * The entrance direction is included in tables but skipped during routing.
 */

/**
 * Get priority order for directions to try - EXPLICIT LOOKUP TABLE
 *
 * @param incomingDir - Direction taxi entered from (0=N, 1=E, 2=S, 3=W)
 * @param mode - Intersection routing mode
 * @returns Array of directions to try in priority order
 */
function getPriorityOrder(incomingDir: Dir, mode: IntersectionMode): Dir[] {
  // Hardcoded priority tables based on TRAVEL direction (opposite of entry slot)
  // incomingDir is the slot entered from, travel direction is (incomingDir + 2) % 4
  // Note: These include the entrance direction, but it will be skipped in getNextIntersection

  if (incomingDir === 2) { // Entered from South, traveling North
    switch (mode) {
      case 'pass_through':
        return [0, 1, 2, 3] // north, east, south, west
      case 'turn_right': // clockwise
        return [1, 2, 3, 0] // east, south, west, north
      case 'turn_left': // counter-clockwise
        return [3, 2, 1, 0] // west, south, east, north
    }
  } else if (incomingDir === 0) { // Entered from North, traveling South
    switch (mode) {
      case 'pass_through':
        return [2, 3, 0, 1] // south, west, north, east
      case 'turn_right': // clockwise
        return [3, 0, 1, 2] // west, north, east, south
      case 'turn_left': // counter-clockwise
        return [1, 0, 3, 2] // east, north, west, south
    }
  } else if (incomingDir === 3) { // Entered from West, traveling East
    switch (mode) {
      case 'pass_through':
        return [1, 2, 3, 0] // east, south, west, north
      case 'turn_right': // clockwise
        return [2, 3, 0, 1] // south, west, north, east
      case 'turn_left': // counter-clockwise
        return [0, 3, 2, 1] // north, west, south, east
    }
  } else { // Entered from East (1), traveling West
    switch (mode) {
      case 'pass_through':
        return [3, 0, 1, 2] // west, north, east, south
      case 'turn_right': // clockwise
        return [0, 1, 2, 3] // north, east, south, west
      case 'turn_left': // counter-clockwise
        return [2, 1, 0, 3] // south, east, north, west
    }
  }
}

/**
 * DEPRECATED - Use getNextIntersection instead
 */
export function resolveTurn(incomingDir: Dir, rule: IntersectionMode): Dir {
  const priorities = getPriorityOrder(incomingDir, rule)
  return priorities[0] // Return first choice only (legacy behavior)
}

/**
 * Calculates the incoming direction for the next intersection
 * When traveling from intersection A to B, the incoming direction at B
 * is the opposite of the outgoing direction from A.
 *
 * @param outgoingDir - Direction exiting current intersection
 * @returns Incoming direction at next intersection
 *
 * @example
 * flipDirection(0) // => 2 (Exit North → Enter from South)
 * flipDirection(1) // => 3 (Exit East → Enter from West)
 */
export function flipDirection(outgoingDir: Dir): Dir {
  return ((outgoingDir + 2) % 4) as Dir
}

/**
 * Gets the next intersection ID using priority-based fallback
 *
 * @param intersection - Current intersection node
 * @param incomingDir - Direction taxi entered from (0=N, 1=E, 2=S, 3=W)
 * @param mode - Player's routing decision
 * @returns Object with next intersection ID and outgoing direction
 */
export function getNextIntersection(
  intersection: RoadNode,
  incomingDir: Dir,
  mode: IntersectionMode
): { nextId: string | null; outgoingDir: Dir | null } {
  // Verify this is an intersection with neighbors array
  if (!intersection.neighbors || intersection.neighbors.length !== 4) {
    console.warn(`⚠️ Node ${intersection.id} is not a valid intersection (no neighbors array)`)
    return { nextId: null, outgoingDir: null }
  }

  // Count total connections (including entrance)
  const totalConnections = intersection.neighbors.filter(n => n !== null).length

  // Case 1: DEAD END - Only 1 connection total (just the entrance)
  // Go to it (U-turn back)
  if (totalConnections === 1) {
    const onlyExit = intersection.neighbors[incomingDir]
    if (onlyExit) {
      console.log(`⚠️ ${intersection.id}: Dead end, U-turn back → ${onlyExit}`)
      return { nextId: onlyExit, outgoingDir: incomingDir }
    }
  }

  // Case 2: CORNER - Exactly 2 connections (entrance + 1 exit)
  // Go to the one that's not the entrance
  if (totalConnections === 2) {
    for (let i = 0; i < 4; i++) {
      const dir = i as Dir
      if (dir !== incomingDir && intersection.neighbors[dir] !== null) {
        const exit = intersection.neighbors[dir]!
        console.log(`🔄 ${intersection.id}: Corner, Incoming ${getDirName(incomingDir)} → ${getDirName(dir)} → ${exit}`)
        return { nextId: exit, outgoingDir: dir }
      }
    }
  }

  // Case 3: INTERSECTION - 3+ connections, use priority-based routing
  const priorities = getPriorityOrder(incomingDir, mode)

  // Try each direction in priority order
  for (const dir of priorities) {
    // Skip the incoming direction (can't U-turn back)
    if (dir === incomingDir) {
      continue
    }

    const nextId = intersection.neighbors[dir]
    if (nextId !== null) {
      console.log(`✅ ${intersection.id}: Incoming ${getDirName(incomingDir)}, Mode ${mode}, Chose ${getDirName(dir)} → ${nextId}`)
      return { nextId, outgoingDir: dir }
    }
  }

  // No available path after trying all priorities (shouldn't happen if availableExits > 1)
  console.warn(`⚠️ ${intersection.id}: No available path from ${getDirName(incomingDir)} with mode ${mode}`)
  return { nextId: null, outgoingDir: null }
}

/**
 * Helper to get readable direction name for debugging
 */
export function getDirName(dir: Dir): string {
  return ['North', 'East', 'South', 'West'][dir]
}

/**
 * Validates that an intersection node is properly configured
 *
 * @param node - Node to validate
 * @returns True if valid intersection, false otherwise
 */
export function isValidIntersection(node: RoadNode): boolean {
  if (!node.types.includes('intersection')) {
    return false
  }

  if (!node.neighbors || node.neighbors.length !== 4) {
    console.warn(`⚠️ Intersection ${node.id} missing neighbors array`)
    return false
  }

  // Must have at least 2 connections to be a meaningful intersection
  const connectionCount = node.neighbors.filter(n => n !== null).length
  if (connectionCount < 2) {
    console.warn(`⚠️ Intersection ${node.id} has only ${connectionCount} connections`)
    return false
  }

  return true
}

/**
 * Debug helper: logs intersection topology
 */
export function debugIntersection(node: RoadNode): void {
  if (!node.neighbors) {
    console.log(`${node.id}: Not an intersection`)
    return
  }

  console.log(`${node.id} topology:`)
  console.log(`  N (0): ${node.neighbors[0] || 'null'}`)
  console.log(`  E (1): ${node.neighbors[1] || 'null'}`)
  console.log(`  S (2): ${node.neighbors[2] || 'null'}`)
  console.log(`  W (3): ${node.neighbors[3] || 'null'}`)
}
