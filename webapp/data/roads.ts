import * as THREE from 'three'
import type { RoadPath, RoadNode } from '@/types/game'
import { calculatePathLength } from '@/lib/movement'

/**
 * Test road network for MVP
 * Simple loop around the city with 4 paths
 */

// Create a simple rectangular loop path
const loopPath1Points = [
  new THREE.Vector3(-15, 0.2, -15),
  new THREE.Vector3(-15, 0.2, -5),
  new THREE.Vector3(-15, 0.2, 5),
  new THREE.Vector3(-15, 0.2, 15),
]

const loopPath2Points = [
  new THREE.Vector3(-15, 0.2, 15),
  new THREE.Vector3(-5, 0.2, 15),
  new THREE.Vector3(5, 0.2, 15),
  new THREE.Vector3(15, 0.2, 15),
]

const loopPath3Points = [
  new THREE.Vector3(15, 0.2, 15),
  new THREE.Vector3(15, 0.2, 5),
  new THREE.Vector3(15, 0.2, -5),
  new THREE.Vector3(15, 0.2, -15),
]

const loopPath4Points = [
  new THREE.Vector3(15, 0.2, -15),
  new THREE.Vector3(5, 0.2, -15),
  new THREE.Vector3(-5, 0.2, -15),
  new THREE.Vector3(-15, 0.2, -15),
]

// Create paths with calculated lengths
const path1: RoadPath = {
  id: 'path-1',
  points: loopPath1Points,
  length: calculatePathLength(loopPath1Points),
}

const path2: RoadPath = {
  id: 'path-2',
  points: loopPath2Points,
  length: calculatePathLength(loopPath2Points),
}

const path3: RoadPath = {
  id: 'path-3',
  points: loopPath3Points,
  length: calculatePathLength(loopPath3Points),
}

const path4: RoadPath = {
  id: 'path-4',
  points: loopPath4Points,
  length: calculatePathLength(loopPath4Points),
}

// Create nodes at path junctions
const nodes: RoadNode[] = [
  {
    id: 'node-1',
    position: new THREE.Vector3(-15, 0.2, -15),
    next: ['node-2'],
  },
  {
    id: 'node-2',
    position: new THREE.Vector3(-15, 0.2, 15),
    next: ['node-3'],
  },
  {
    id: 'node-3',
    position: new THREE.Vector3(15, 0.2, 15),
    next: ['node-4'],
  },
  {
    id: 'node-4',
    position: new THREE.Vector3(15, 0.2, -15),
    next: ['node-1'],
  },
]

export const testRoadNetwork = {
  paths: [path1, path2, path3, path4],
  nodes,
}

/**
 * Get next path in sequence (for looping)
 */
export function getNextPath(currentPathId: string): RoadPath | null {
  const paths = testRoadNetwork.paths
  const currentIndex = paths.findIndex((p) => p.id === currentPathId)

  if (currentIndex === -1) return null

  // Loop back to start
  const nextIndex = (currentIndex + 1) % paths.length
  return paths[nextIndex]
}
