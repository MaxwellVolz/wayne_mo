import * as THREE from 'three'
import type { RoadPath, RoadNode, IntersectionState, Taxi, Dir } from '@/types/game'
import { calculatePathLength } from '@/lib/movement'
import { categorizePaths } from '@/lib/intersectionGeometry'
import { resolveTurn, flipDirection, getNextIntersection, getDirName } from '@/lib/intersectionTopology'

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
// Using NEW TOPOLOGICAL MODEL with neighbors array
// neighbors = [North, East, South, West] (indices 0,1,2,3)
const nodes: RoadNode[] = [
  {
    id: 'node-1',
    position: new THREE.Vector3(-15, 0.2, -15),
    neighbors: ['node-2', 'node-4', null, null], // N=node-2, E=node-4, S=null, W=null
    types: ['intersection'],
  },
  {
    id: 'node-2',
    position: new THREE.Vector3(-15, 0.2, 15),
    neighbors: [null, 'node-3', 'node-1', null], // N=null, E=node-3, S=node-1, W=null
    types: ['intersection', 'pickup'],
    metadata: {
      zoneName: 'North Terminal',
      payoutMultiplier: 1.2,
    },
  },
  {
    id: 'node-3',
    position: new THREE.Vector3(15, 0.2, 15),
    neighbors: [null, null, 'node-4', 'node-2'], // N=null, E=null, S=node-4, W=node-2
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
    neighbors: ['node-3', null, null, 'node-1'], // N=node-3, E=null, S=null, W=node-1
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
 * Generates paths by connecting nodes based on their connections
 * Supports both topological (neighbors array) and legacy (next array) formats
 */
export function updateRoadNetwork(extractedNodes: RoadNode[]) {
  console.log(`🛣️ Updating road network with ${extractedNodes.length} extracted nodes`)

  // Generate paths between connected nodes
  const generatedPaths: RoadPath[] = []
  const pathsAdded = new Set<string>()

  extractedNodes.forEach(node => {
    // Get connections - support both neighbors (topological) and next (legacy) formats
    let connections: string[] = []

    if (node.neighbors) {
      // Topological format: neighbors array [N, E, S, W]
      connections = node.neighbors.filter((n): n is string => n !== null)
      console.log(`  ${node.id}: topological format, ${connections.length} neighbors`)
    } else if (node.next) {
      // Legacy format: next array
      connections = node.next
      console.log(`  ${node.id}: legacy format, ${connections.length} next nodes`)
    }

    connections.forEach(nextNodeId => {
      // Create unique path ID for this connection
      const pathId = `${node.id}_to_${nextNodeId}`

      // Skip if we already created THIS EXACT path (not the reverse)
      // We want directed paths, so A→B and B→A are different
      if (pathsAdded.has(pathId)) {
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

  // Log the full network graph for debugging
  console.log('📊 Network Graph:')
  extractedNodes.forEach(node => {
    if (node.neighbors) {
      console.log(`  ${node.id} [TOPO] → N:${node.neighbors[0] || '-'}, E:${node.neighbors[1] || '-'}, S:${node.neighbors[2] || '-'}, W:${node.neighbors[3] || '-'}`)
    } else if (node.next) {
      console.log(`  ${node.id} [LEGACY] → [${node.next.join(', ')}]`)
    }
  })

  console.log('🛣️ Generated Paths:')
  generatedPaths.forEach(path => {
    console.log(`  ${path.id} (${path.length.toFixed(2)} units)`)
  })

  return activeRoadNetwork
}

/**
 * Get the active road network
 */
export function getRoadNetwork() {
  return activeRoadNetwork
}

/**
 * Get next path based on node connections and intersection state
 *
 * SUPPORTS TWO MODES:
 * 1. Topological (new): Uses neighbors array + incomingDir for deterministic routing
 * 2. Path-based (legacy): Uses next array + vector math for direction detection
 *
 * @param currentPathId - The path the taxi is currently on
 * @param intersections - Optional map of intersection states (player-controlled routing)
 * @param taxi - Optional taxi object with incomingDir (for topological routing)
 * @returns The next path to follow, or null if none found
 */
export function getNextPath(
  currentPathId: string,
  intersections?: Map<string, IntersectionState>,
  taxi?: Taxi
): RoadPath | null {
  const paths = activeRoadNetwork.paths
  const nodes = activeRoadNetwork.nodes

  // Extract the destination node from current path
  // Format: "PathNode_01_to_PathNode_02" -> destination is "PathNode_02"
  const parts = currentPathId.split('_to_')
  if (parts.length !== 2) {
    console.warn(`⚠️ Invalid path ID format: ${currentPathId}`)
    return null
  }

  const sourceNodeId = parts[0]
  const destinationNodeId = parts[1]
  const destinationNode = nodes.find(n => n.id === destinationNodeId)

  if (!destinationNode) {
    console.warn(`⚠️ Destination node ${destinationNodeId} not found`)
    return null
  }

  // TOPOLOGICAL MODE: Use neighbors array if available (corners, intersections, all nodes)
  if (destinationNode.neighbors && taxi) {
    // Calculate incoming direction from the path
    // Find which slot in the destination's neighbors array contains the source node
    let calculatedIncomingDir: Dir | undefined = undefined
    for (let i = 0; i < 4; i++) {
      if (destinationNode.neighbors[i] === sourceNodeId) {
        calculatedIncomingDir = i as Dir
        break
      }
    }

    // If we couldn't find the source in neighbors, fall back to taxi's stored incomingDir
    if (calculatedIncomingDir === undefined) {
      console.warn(`⚠️ Could not calculate incomingDir for ${sourceNodeId} → ${destinationNodeId}, using fallback`)
    }
    const actualIncomingDir = calculatedIncomingDir ?? taxi.incomingDir ?? 0
    // Get intersection state only if this node is marked as an intersection
    const isIntersection = destinationNode.types.includes('intersection')
    const intersectionState = isIntersection ? intersections?.get(destinationNodeId) : undefined
    const mode = intersectionState?.mode || 'pass_through'

    // Use topology system to resolve next intersection with priority fallback
    const result = getNextIntersection(destinationNode, actualIncomingDir, mode)

    if (result.nextId && result.outgoingDir !== null) {
      // Find path to next node
      const nextPath = paths.find(p => p.id === `${destinationNodeId}_to_${result.nextId}`)

      if (nextPath) {
        // Calculate incoming direction for next intersection
        const nextIncomingDir = flipDirection(result.outgoingDir)

        // Update taxi navigation state
        taxi.currentIntersectionId = destinationNodeId
        taxi.incomingDir = nextIncomingDir

        console.log(`🚦 ${destinationNodeId}: Mode ${mode}, In ${getDirName(actualIncomingDir)} → Out ${getDirName(result.outgoingDir)} → ${result.nextId}`)
        return nextPath
      } else {
        console.warn(`⚠️ Path ${destinationNodeId}_to_${result.nextId} not found in network`)
        return null
      }
    } else {
      // No valid path - taxi should reverse or stop
      console.warn(`⚠️ No available route from ${destinationNodeId}`)
      return null
    }
  }

  // PATH-BASED MODE (LEGACY): Fall back to old system for non-topological intersections
  // Find all paths that start from this destination node
  const possiblePaths = paths.filter(p => p.id.startsWith(`${destinationNodeId}_to_`))

  if (possiblePaths.length === 0) {
    console.warn(`⚠️ No next path found from node: ${destinationNodeId}`)
    return null
  }

  // Single path? Return it (no choice needed)
  if (possiblePaths.length === 1) {
    return possiblePaths[0]
  }

  // Multiple paths AND it's an intersection AND we have intersection state
  const isIntersection = destinationNode.types.includes('intersection')
  if (isIntersection && intersections) {
    const intersectionState = intersections.get(destinationNodeId)

    if (intersectionState) {
      // Categorize paths by direction (vector math)
      const pathsByDirection = categorizePaths(
        currentPathId,
        destinationNode,
        paths
      )

      // Select path based on intersection mode
      let selectedPathId: string | null = null

      switch (intersectionState.mode) {
        case 'pass_through':
          selectedPathId = pathsByDirection.straight
          break
        case 'turn_left':
          selectedPathId = pathsByDirection.left
          break
        case 'turn_right':
          selectedPathId = pathsByDirection.right
          break
      }

      // If selected path exists, return it
      if (selectedPathId) {
        const selectedPath = paths.find(p => p.id === selectedPathId)
        if (selectedPath) {
          console.log(`🚦 Path-based routing at ${destinationNodeId}: ${intersectionState.mode} → ${selectedPathId}`)
          return selectedPath
        }
      }

      // Fallback: if selected direction doesn't exist, try straight
      if (pathsByDirection.straight) {
        const straightPath = paths.find(p => p.id === pathsByDirection.straight)
        if (straightPath) {
          console.warn(`⚠️ Intersection ${destinationNodeId}: mode "${intersectionState.mode}" not available, using straight`)
          return straightPath
        }
      }
    }
  }

  // Fallback: random selection (for backward compatibility or non-intersections)
  const randomIndex = Math.floor(Math.random() * possiblePaths.length)
  console.log(`🎲 Random path selection at ${destinationNodeId}: ${possiblePaths[randomIndex].id}`)
  return possiblePaths[randomIndex]
}
