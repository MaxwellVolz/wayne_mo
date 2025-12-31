import * as THREE from 'three'
import type { RoadNode, RoadPath } from '@/types/game'

/**
 * Determines the relative direction of a path from an intersection
 *
 * Uses vector math to calculate if an outgoing path goes straight, left, or right
 * relative to the incoming direction.
 *
 * @param incomingPath - The path the taxi is currently on
 * @param intersection - The intersection node being approached
 * @param outgoingPath - A possible next path to evaluate
 * @returns 'straight' | 'left' | 'right'
 */
export function getPathDirection(
  incomingPath: RoadPath,
  intersection: RoadNode,
  outgoingPath: RoadPath
): 'straight' | 'left' | 'right' {
  // Get incoming direction vector (last segment of incoming path)
  const incomingDir = new THREE.Vector3()
    .subVectors(
      incomingPath.points[incomingPath.points.length - 1],
      incomingPath.points[incomingPath.points.length - 2]
    )
    .normalize()

  // Get outgoing direction vector (first segment of outgoing path)
  const outgoingDir = new THREE.Vector3()
    .subVectors(
      outgoingPath.points[1],
      outgoingPath.points[0]
    )
    .normalize()

  // Calculate cross product to determine turn direction
  const cross = new THREE.Vector3().crossVectors(incomingDir, outgoingDir)

  // Dot product to determine if continuing straight
  const dot = incomingDir.dot(outgoingDir)

  // Straight: dot product close to 1 (vectors aligned)
  // Threshold of 0.8 allows for ~36° deviation
  if (dot > 0.8) {
    return 'straight'
  }

  // Left vs Right: check cross product Y component (assuming Y-up world)
  // Positive Y = left turn, Negative Y = right turn
  if (cross.y > 0.1) {
    return 'left'
  } else if (cross.y < -0.1) {
    return 'right'
  }

  // Default to straight if angle is ambiguous
  return 'straight'
}

/**
 * Categorizes all paths from an intersection by direction
 *
 * Given an intersection and the path approaching it, this determines which
 * outgoing paths go straight, left, or right.
 *
 * @param incomingPathId - Current path taxi is on (format: "NodeA_to_NodeB")
 * @param intersection - Intersection node
 * @param allPaths - All paths in the network
 * @returns Object with straight, left, and right path IDs (null if not available)
 */
export function categorizePaths(
  incomingPathId: string,
  intersection: RoadNode,
  allPaths: RoadPath[]
): {
  straight: string | null
  left: string | null
  right: string | null
} {
  // Find all outgoing paths from this intersection
  const outgoingPaths = allPaths.filter(p =>
    p.id.startsWith(`${intersection.id}_to_`)
  )

  // Find the incoming path
  const incomingPath = allPaths.find(p => p.id === incomingPathId)
  if (!incomingPath) {
    console.warn(`⚠️ Incoming path ${incomingPathId} not found`)
    return { straight: null, left: null, right: null }
  }

  // If there's only one outgoing path, it's always "straight"
  if (outgoingPaths.length === 1) {
    return {
      straight: outgoingPaths[0].id,
      left: null,
      right: null
    }
  }

  const result = {
    straight: null as string | null,
    left: null as string | null,
    right: null as string | null
  }

  // Categorize each outgoing path
  outgoingPaths.forEach(path => {
    const direction = getPathDirection(incomingPath, intersection, path)

    // Only assign if not already set (first match wins)
    if (!result[direction]) {
      result[direction] = path.id
    } else {
      console.warn(`⚠️ Multiple paths detected as "${direction}" at ${intersection.id}`)
    }
  })

  // Debug logging
  console.log(`📍 Path categorization at ${intersection.id}:`, {
    incoming: incomingPathId,
    straight: result.straight,
    left: result.left,
    right: result.right
  })

  return result
}

/**
 * Validates that an intersection has at least one valid outgoing path
 * for each mode it might be set to.
 *
 * @param intersection - Intersection node to validate
 * @param allPaths - All paths in the network
 * @returns True if intersection is valid, false otherwise
 */
export function validateIntersection(
  intersection: RoadNode,
  allPaths: RoadPath[]
): boolean {
  const outgoingPaths = allPaths.filter(p =>
    p.id.startsWith(`${intersection.id}_to_`)
  )

  // Must have at least 2 outgoing paths to be a valid intersection
  if (outgoingPaths.length < 2) {
    console.warn(`⚠️ Intersection ${intersection.id} has only ${outgoingPaths.length} outgoing paths`)
    return false
  }

  return true
}
