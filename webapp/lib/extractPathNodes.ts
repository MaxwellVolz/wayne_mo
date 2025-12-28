import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'
import type { RoadNode } from '@/types/game'

/**
 * Extracts path nodes from a loaded GLTF model
 * Looks for Empty objects whose names start with "PathNode_"
 *
 * @param gltf - Loaded GLTF model from useGLTF
 * @returns Array of RoadNode objects with positions
 */
export function extractPathNodesFromGLTF(gltf: GLTF): RoadNode[] {
  const nodes: RoadNode[] = []

  gltf.scene.traverse((object) => {
    // Find all objects whose names start with "PathNode_"
    if (object.name.startsWith('PathNode_')) {
      nodes.push({
        id: object.name,
        position: new THREE.Vector3(
          object.position.x,
          object.position.y,
          object.position.z
        ),
        next: [] // Will be populated based on node order or custom properties
      })
    }
  })

  // Sort by name to maintain sequential order (PathNode_001, PathNode_002, etc.)
  nodes.sort((a, b) => a.id.localeCompare(b.id))

  // Automatically connect sequential nodes
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].next.push(nodes[i + 1].id)
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
      // Extract custom property for connections
      const nextNodes = object.userData.next_nodes
        ? (object.userData.next_nodes as string).split(',').map(s => s.trim())
        : []

      nodes.push({
        id: object.name,
        position: new THREE.Vector3().copy(object.position),
        next: nextNodes
      })
    }
  })

  return nodes
}

/**
 * Extracts interaction zones (pickup/dropoff) from the model
 * Looks for Empty objects starting with "PickupZone_" or "DropoffZone_"
 *
 * @param gltf - Loaded GLTF model from useGLTF
 * @returns Object containing arrays of pickup and dropoff zone positions
 */
export function extractInteractionZones(gltf: GLTF) {
  const pickupZones: Array<{ id: string; position: THREE.Vector3 }> = []
  const dropoffZones: Array<{ id: string; position: THREE.Vector3 }> = []

  gltf.scene.traverse((object) => {
    if (object.name.startsWith('PickupZone_')) {
      pickupZones.push({
        id: object.name,
        position: new THREE.Vector3().copy(object.position)
      })
    } else if (object.name.startsWith('DropoffZone_')) {
      dropoffZones.push({
        id: object.name,
        position: new THREE.Vector3().copy(object.position)
      })
    }
  })

  return { pickupZones, dropoffZones }
}
