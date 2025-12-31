import * as THREE from 'three'
import type { Taxi, RoadPath, IntersectionState } from '@/types/game'
import { getNextPath } from '@/data/roads'

/**
 * Updates taxi position along its path based on delta time
 * No physics - pure linear interpolation along predefined path
 *
 * @param taxi - The taxi to update
 * @param delta - Time elapsed since last update (seconds)
 * @param intersections - Optional intersection states for routing
 */
export function updateTaxi(
  taxi: Taxi,
  delta: number,
  intersections?: Map<string, IntersectionState>
): void {
  if (taxi.state === 'stopped' || !taxi.path) return

  const movement = (delta * taxi.speed) / taxi.path.length

  if (taxi.isReversing) {
    // Move backwards along current path
    taxi.t -= movement

    // Reached start of path - back at previous node
    if (taxi.t <= 0) {
      taxi.t = 0
      taxi.isReversing = false
      console.log(`✅ ${taxi.id} finished reversing, back at start of path`)

      // We're at the START of current path - route from here
      onReversalComplete(taxi, intersections)
    }
  } else {
    // Normal forward movement
    taxi.t += movement

    if (taxi.t >= 1) {
      taxi.t = 1
      onPathEnd(taxi, intersections)
    }
  }
}

/**
 * Samples position along a path at normalized parameter t (0-1)
 * Uses linear interpolation between path points
 */
export function samplePath(path: RoadPath, t: number): THREE.Vector3 {
  if (path.points.length === 0) {
    return new THREE.Vector3()
  }

  if (path.points.length === 1) {
    return path.points[0].clone()
  }

  const clampedT = Math.max(0, Math.min(1, t))
  const index = Math.floor(clampedT * (path.points.length - 1))
  const nextIndex = Math.min(index + 1, path.points.length - 1)
  const localT = (clampedT * (path.points.length - 1)) % 1

  return path.points[index].clone().lerp(path.points[nextIndex], localT)
}

/**
 * Called when taxi reaches end of current path
 * Transitions to next path in network
 *
 * @param taxi - The taxi that reached the end of its path
 * @param intersections - Optional intersection states for routing decisions
 */
function onPathEnd(taxi: Taxi, intersections?: Map<string, IntersectionState>): void {
  if (!taxi.path) return

  const currentPathId = taxi.path.id

  // Extract destination node from current path (format: "NodeA_to_NodeB")
  const parts = currentPathId.split('_to_')
  if (parts.length === 2) {
    // Track the node we came from for collision recovery
    taxi.previousNodeId = parts[0]
  }

  // Pass taxi object to getNextPath for topological routing
  const nextPath = getNextPath(currentPathId, intersections, taxi)

  if (nextPath) {
    console.log(`🚕 Path transition: ${currentPathId} → ${nextPath.id}`)
    taxi.path = nextPath
    taxi.t = 0
  } else {
    console.warn(`⚠️ No next path found for ${currentPathId}`)
  }
}

/**
 * Called when taxi finishes reversing and is back at start of path
 * Routes from the SOURCE node instead of destination
 *
 * @param taxi - The taxi that finished reversing
 * @param intersections - Optional intersection states for routing decisions
 */
function onReversalComplete(taxi: Taxi, intersections?: Map<string, IntersectionState>): void {
  if (!taxi.path) return

  const currentPathId = taxi.path.id

  // Extract source node from current path (format: "NodeA_to_NodeB")
  // At t=0, we're at NodeA (the start)
  const parts = currentPathId.split('_to_')
  if (parts.length !== 2) {
    console.warn(`⚠️ Invalid path ID format: ${currentPathId}`)
    return
  }

  const sourceNodeId = parts[0] // We're at the START node now
  const destinationNodeId = parts[1]

  // We need to find a path FROM sourceNodeId (not destinationNodeId!)
  // Create a synthetic "previous path" ID that ends at sourceNodeId
  const syntheticPathId = `${destinationNodeId}_to_${sourceNodeId}`

  console.log(`🔄 ${taxi.id} at ${sourceNodeId}, routing from here (was reversing on ${currentPathId})`)

  // Pass taxi object to getNextPath - it will route FROM sourceNodeId
  const nextPath = getNextPath(syntheticPathId, intersections, taxi)

  if (nextPath) {
    console.log(`🚕 Post-reversal transition: ${sourceNodeId} → ${nextPath.id}`)
    taxi.path = nextPath
    taxi.t = 0
  } else {
    console.warn(`⚠️ No next path found from ${sourceNodeId} after reversal`)
  }
}

/**
 * Checks if taxi is within an interaction window
 */
export function inInteractionWindow(
  taxi: Taxi,
  startT: number,
  endT: number
): boolean {
  return taxi.t >= startT && taxi.t <= endT
}

/**
 * Calculates total length of a path by summing segment distances
 */
export function calculatePathLength(points: THREE.Vector3[]): number {
  let length = 0
  for (let i = 0; i < points.length - 1; i++) {
    length += points[i].distanceTo(points[i + 1])
  }
  return length
}
