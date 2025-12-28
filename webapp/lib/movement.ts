import * as THREE from 'three'
import type { Taxi, RoadPath } from '@/types/game'
import { getNextPath } from '@/data/roads'

/**
 * Updates taxi position along its path based on delta time
 * No physics - pure linear interpolation along predefined path
 */
export function updateTaxi(taxi: Taxi, delta: number): void {
  if (taxi.state === 'stopped' || !taxi.path) return

  taxi.t += (delta * taxi.speed) / taxi.path.length

  if (taxi.t >= 1) {
    taxi.t = 1
    onPathEnd(taxi)
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
 */
function onPathEnd(taxi: Taxi): void {
  if (!taxi.path) return

  const currentPathId = taxi.path.id
  const nextPath = getNextPath(currentPathId)

  if (nextPath) {
    console.log(`🚕 Path transition: ${currentPathId} → ${nextPath.id}`)
    taxi.path = nextPath
    taxi.t = 0
  } else {
    console.warn(`⚠️ No next path found for ${currentPathId}`)
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
