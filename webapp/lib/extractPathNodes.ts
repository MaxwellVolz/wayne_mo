import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'
import type { RoadNode, NodeType } from '@/types/game'

/**
 * Parses node types from Blender object name
 *
 * Naming conventions:
 * - PathNode_001 → types: ['path']
 * - PathNode_Intersection_001 → types: ['intersection']
 * - PathNode_Pickup_Downtown_001 → types: ['pickup']
 * - PathNode_Dropoff_Airport_001 → types: ['dropoff']
 * - PathNode_RedLight_001 → types: ['red_light']
 * - PathNode_Service_001 → types: ['service']
 * - PathNode_Intersection_RedLight_001 → types: ['intersection', 'red_light']
 *
 * @param name - Blender object name
 * @returns Array of node types
 */
function parseNodeTypes(name: string): NodeType[] {
  const types: NodeType[] = []
  const nameLower = name.toLowerCase()

  // Check for each type keyword in the name
  if (nameLower.includes('intersection')) types.push('intersection')
  if (nameLower.includes('pickup')) types.push('pickup')
  if (nameLower.includes('dropoff')) types.push('dropoff')
  if (nameLower.includes('redlight') || nameLower.includes('red_light')) types.push('red_light')
  if (nameLower.includes('service')) types.push('service')

  // If no specific type found, it's a regular path node
  if (types.length === 0) types.push('path')

  return types
}

/**
 * Extracts path nodes from a loaded GLTF model
 * Looks for objects (meshes or empties) whose names start with "PathNode_"
 * Parses node types from the object name
 *
 * @param gltf - Loaded GLTF model from useGLTF
 * @returns Array of RoadNode objects with positions and types
 */
export function extractPathNodesFromGLTF(gltf: GLTF): RoadNode[] {
  const nodes: RoadNode[] = []

  gltf.scene.traverse((object) => {
    // Find all objects that are path nodes:
    // 1. Name starts with "PathNode_", "INT_", "Pickup_", or "Dropoff_" OR
    // 2. Has topological neighbor properties (north/east/south/west or neighbors)
    const isPathNode = object.name.startsWith('PathNode_') ||
                       object.name.startsWith('INT_') ||
                       object.name.startsWith('Pickup_') ||
                       object.name.startsWith('Dropoff_') ||
                       (object.userData && (
                         object.userData.north ||
                         object.userData.east ||
                         object.userData.south ||
                         object.userData.west ||
                         object.userData.neighbors ||
                         object.userData.next_nodes
                       ))

    if (isPathNode) {
      // Get world position (in case object is parented/transformed)
      const worldPosition = new THREE.Vector3()
      object.getWorldPosition(worldPosition)

      // Parse neighbors (topological) or next_nodes (legacy) from userData
      let nextNodes: string[] | undefined = undefined
      let neighbors: (string | null)[] | undefined = undefined

      // Try parsing neighbors - support multiple formats
      // FORMAT 1 (RECOMMENDED): Separate properties (north, east, south, west)
      if (object.userData && (object.userData.north || object.userData.east || object.userData.south || object.userData.west)) {
        const north = object.userData.north ? String(object.userData.north).trim() : null
        const east = object.userData.east ? String(object.userData.east).trim() : null
        const south = object.userData.south ? String(object.userData.south).trim() : null
        const west = object.userData.west ? String(object.userData.west).trim() : null

        neighbors = [
          north || null,
          east || null,
          south || null,
          west || null
        ]

        console.log(`  📍 ${object.name} [TOPO-SPLIT] → N:${north || '-'}, E:${east || '-'}, S:${south || '-'}, W:${west || '-'}`)
      }
      // FORMAT 2 (LEGACY): Single neighbors property
      else if (object.userData && object.userData.neighbors) {
        try {
          const neighborsData = object.userData.neighbors
          if (typeof neighborsData === 'string') {
            let rawNeighbors: string

            // Check if it's a JSON array format: '["NodeA","NodeB",,"NodeC"]'
            if (neighborsData.trim().startsWith('[') && neighborsData.trim().endsWith(']')) {
              // Strip brackets and parse as comma-separated
              rawNeighbors = neighborsData.trim().slice(1, -1) // Remove [ and ]
              rawNeighbors = rawNeighbors.replace(/"/g, '').replace(/'/g, '')
              console.log(`  📍 ${object.name} [JSON format] → parsing: "${rawNeighbors}"`)
            } else {
              // Already comma-separated format: "NodeA,NodeB,,NodeC"
              rawNeighbors = neighborsData
            }

            // Parse comma-separated string: "NodeA,NodeB,,NodeD" → [NodeA, NodeB, null, NodeD]
            neighbors = rawNeighbors.split(',').map(s => {
              const trimmed = s.trim()
              return trimmed === '' ? null : trimmed
            })

            // Ensure exactly 4 slots
            if (neighbors.length !== 4) {
              console.warn(`⚠️ ${object.name} neighbors should have 4 slots, got ${neighbors.length}`)
              neighbors = [...neighbors, null, null, null, null].slice(0, 4)
            }

            console.log(`  📍 ${object.name} [TOPO-STRING] → neighbors:`, neighbors)
          }
        } catch (e) {
          console.error(`❌ Failed to parse neighbors for ${object.name}:`, e)
          console.error(`   Raw value:`, object.userData.neighbors)
        }
      }

      // Fall back to next_nodes (legacy model) if neighbors not available
      if (!neighbors && object.userData && object.userData.next_nodes) {
        try {
          // Handle both JSON string and array
          const nextNodesData = object.userData.next_nodes
          if (typeof nextNodesData === 'string') {
            // Parse JSON string like '[ "PathNode_02", "PathNode_04" ]'
            nextNodes = JSON.parse(nextNodesData)
            console.log(`  📍 ${object.name} [LEGACY] → next_nodes parsed:`, nextNodes)
          } else if (Array.isArray(nextNodesData)) {
            nextNodes = nextNodesData
            console.log(`  📍 ${object.name} [LEGACY] → next_nodes array:`, nextNodes)
          }
        } catch (e) {
          console.error(`❌ Failed to parse next_nodes for ${object.name}:`, e)
          console.error(`   Raw value:`, object.userData.next_nodes)
        }
      }

      if (!neighbors && !nextNodes) {
        console.log(`  ⚠️ ${object.name} has NO neighbors or next_nodes property`)
      }

      // Determine node types
      const types = parseNodeTypes(object.name)

      // Auto-detect intersection: ONLY if name starts with "INT_" or contains "Intersection"
      const isIntersectionNamed = object.name.startsWith('INT_') || object.name.toLowerCase().includes('intersection')
      if (isIntersectionNamed && neighbors) {
        const connectionCount = neighbors.filter(n => n !== null).length
        if (connectionCount >= 2 && !types.includes('intersection')) {
          types.push('intersection')
          console.log(`  🚦 ${object.name} detected as intersection (${connectionCount} neighbors)`)
        }
      }

      nodes.push({
        id: object.name,
        position: worldPosition,
        next: nextNodes,
        neighbors: neighbors,
        types,
        metadata: object.userData // Blender custom properties become userData
      })
    }
  })

  // Sort by name to maintain sequential order (PathNode_001, PathNode_002, etc.)
  nodes.sort((a, b) => a.id.localeCompare(b.id))

  // If no connections defined (neither neighbors nor next), auto-connect sequential nodes
  // Only applies to legacy nodes - topological nodes MUST have neighbors defined
  const nodesWithoutConnections = nodes.filter(n =>
    !n.neighbors && (!n.next || n.next.length === 0)
  )

  if (nodesWithoutConnections.length === nodes.length) {
    console.log('📍 No connections defined in Blender, auto-connecting sequential nodes (legacy mode)...')
    const pathNodes = nodes.filter(n => n.types.includes('path') || n.types.includes('intersection'))
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const currentNode = nodes.find(n => n.id === pathNodes[i].id)
      if (currentNode && !currentNode.neighbors) {
        // Only auto-connect if using legacy next[] format
        if (!currentNode.next) currentNode.next = []
        currentNode.next.push(pathNodes[i + 1].id)
      }
    }
    // Connect last to first to complete the loop
    if (pathNodes.length > 0) {
      const lastNode = nodes.find(n => n.id === pathNodes[pathNodes.length - 1].id)
      if (lastNode && !lastNode.neighbors) {
        if (!lastNode.next) lastNode.next = []
        lastNode.next.push(pathNodes[0].id)
      }
    }
  }

  return nodes
}

/**
 * Extracts path nodes with custom connection data from Blender custom properties
 * Expects custom property "next_nodes" as comma-separated string: "PathNode_002,PathNode_003"
 *
 * @param gltf - Loaded GLTF model from useGLTF
 * @returns Array of RoadNode objects with custom connections
 */
export function extractPathNodesWithConnections(gltf: GLTF): RoadNode[] {
  const nodes: RoadNode[] = []

  gltf.scene.traverse((object) => {
    if (object.name.startsWith('PathNode_')) {
      const types = parseNodeTypes(object.name)

      // Extract custom property for connections
      const nextNodes = object.userData.next_nodes
        ? (object.userData.next_nodes as string).split(',').map(s => s.trim())
        : []

      nodes.push({
        id: object.name,
        position: new THREE.Vector3().copy(object.position),
        next: nextNodes,
        types,
        metadata: object.userData
      })
    }
  })

  return nodes
}

/**
 * Helper to get nodes by type
 *
 * @param nodes - Array of RoadNode objects
 * @param type - NodeType to filter by
 * @returns Filtered array of nodes matching the type
 */
export function getNodesByType(nodes: RoadNode[], type: NodeType): RoadNode[] {
  return nodes.filter(node => node.types.includes(type))
}

/**
 * Helper to check if a node has a specific type
 *
 * @param node - RoadNode to check
 * @param type - NodeType to check for
 * @returns True if node has the specified type
 */
export function nodeHasType(node: RoadNode, type: NodeType): boolean {
  return node.types.includes(type)
}
