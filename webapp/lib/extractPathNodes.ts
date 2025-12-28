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
    // Find all objects whose names start with "PathNode_"
    // Can be Empty objects, groups, or small mesh markers
    if (object.name.startsWith('PathNode_')) {
      const types = parseNodeTypes(object.name)

      // Get world position (in case object is parented/transformed)
      const worldPosition = new THREE.Vector3()
      object.getWorldPosition(worldPosition)

      // Parse next_nodes from userData if available
      let nextNodes: string[] = []
      if (object.userData && object.userData.next_nodes) {
        try {
          // Handle both JSON string and array
          const nextNodesData = object.userData.next_nodes
          if (typeof nextNodesData === 'string') {
            // Parse JSON string like '[ "PathNode_02", "PathNode_04" ]'
            nextNodes = JSON.parse(nextNodesData)
          } else if (Array.isArray(nextNodesData)) {
            nextNodes = nextNodesData
          }
        } catch (e) {
          console.warn(`⚠️ Failed to parse next_nodes for ${object.name}:`, e)
        }
      }

      nodes.push({
        id: object.name,
        position: worldPosition,
        next: nextNodes,
        types,
        metadata: object.userData // Blender custom properties become userData
      })
    }
  })

  // Sort by name to maintain sequential order (PathNode_001, PathNode_002, etc.)
  nodes.sort((a, b) => a.id.localeCompare(b.id))

  // If no next connections defined, auto-connect sequential nodes
  const nodesWithoutConnections = nodes.filter(n => n.next.length === 0)
  if (nodesWithoutConnections.length === nodes.length) {
    console.log('📍 No next_nodes defined in Blender, auto-connecting sequential nodes...')
    const pathNodes = nodes.filter(n => n.types.includes('path') || n.types.includes('intersection'))
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const currentNode = nodes.find(n => n.id === pathNodes[i].id)
      if (currentNode) {
        currentNode.next.push(pathNodes[i + 1].id)
      }
    }
    // Connect last to first to complete the loop
    if (pathNodes.length > 0) {
      const lastNode = nodes.find(n => n.id === pathNodes[pathNodes.length - 1].id)
      if (lastNode) {
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
