import * as THREE from 'three'
import type { RoadPath, RoadNode } from '@/types/game'
import { calculatePathLength } from '@/lib/movement'

/**
 * Road network that can be dynamically updated from Blender model
 * Starts with test data but can be replaced with extracted nodes
 */

// Test road network (will be replaced by extracted nodes from Blender)
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
    types: ['intersection'],
  },
  {
    id: 'node-2',
    position: new THREE.Vector3(-15, 0.2, 15),
    next: ['node-3'],
    types: ['intersection', 'pickup'],
    metadata: {
      zoneName: 'North Terminal',
      payoutMultiplier: 1.2,
    },
  },
  {
    id: 'node-3',
    position: new THREE.Vector3(15, 0.2, 15),
    next: ['node-4'],
    types: ['intersection', 'red_light'],
    metadata: {
      redLightDuration: 3,
      greenLightDuration: 5,
      currentState: 'green',
    },
  },
  {
    id: 'node-4',
    position: new THREE.Vector3(15, 0.2, -15),
    next: ['node-1'],
    types: ['intersection', 'dropoff'],
    metadata: {
      zoneName: 'Downtown',
      payoutMultiplier: 1.0,
    },
  },
]

// Active road network (starts with test data, gets replaced by extracted nodes)
let activeRoadNetwork = {
  paths: [path1, path2, path3, path4],
  nodes,
}

export const testRoadNetwork = activeRoadNetwork

/**
 * Updates the active road network with nodes extracted from Blender model
 * Generates paths by connecting nodes based on their next[] connections
 */
export function updateRoadNetwork(extractedNodes: RoadNode[]) {
  console.log(`🛣️ Updating road network with ${extractedNodes.length} extracted nodes`)

  // Generate paths between connected nodes
  const generatedPaths: RoadPath[] = []
  const pathsAdded = new Set<string>()

  extractedNodes.forEach(node => {
    node.next.forEach(nextNodeId => {
      // Create unique path ID for this connection
      const pathId = `${node.id}_to_${nextNodeId}`
      const reversePath = `${nextNodeId}_to_${node.id}`

      // Skip if we already created this path (avoid duplicates)
      if (pathsAdded.has(pathId) || pathsAdded.has(reversePath)) {
        return
      }

      // Find the next node
      const nextNode = extractedNodes.find(n => n.id === nextNodeId)
      if (!nextNode) {
        console.warn(`⚠️ Node ${nextNodeId} referenced by ${node.id} not found`)
        return
      }

      // Create path with just start and end points (straight line)
      const pathPoints = [node.position.clone(), nextNode.position.clone()]

      generatedPaths.push({
        id: pathId,
        points: pathPoints,
        length: calculatePathLength(pathPoints)
      })

      pathsAdded.add(pathId)
      console.log(`  ✅ Created path: ${pathId}`)
    })
  })

  // Update active network
  activeRoadNetwork = {
    nodes: extractedNodes,
    paths: generatedPaths
  }

  console.log(`✅ Road network updated: ${extractedNodes.length} nodes, ${generatedPaths.length} paths`)

  return activeRoadNetwork
}

/**
 * Get the active road network
 */
export function getRoadNetwork() {
  return activeRoadNetwork
}

/**
 * Get next path in sequence (for looping)
 */
export function getNextPath(currentPathId: string): RoadPath | null {
  const paths = activeRoadNetwork.paths
  const currentIndex = paths.findIndex((p) => p.id === currentPathId)

  if (currentIndex === -1) return null

  // Loop back to start
  const nextIndex = (currentIndex + 1) % paths.length
  return paths[nextIndex]
}
