'use client'

import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import { Model as CityModelGenerated } from '@/generated_components/CityModelGenerated'
import { extractPathNodesFromGLTF } from '@/lib/extractPathNodes'
import { updateRoadNetwork } from '@/data/roads'
import { getAssetPath } from '@/lib/assetPath'

/**
 * City Model component
 * Loads Blender model and extracts path nodes for taxi navigation
 */
export default function CityModel() {
  const gltf = useGLTF(getAssetPath('models/city_01.glb'))

  useEffect(() => {
    console.log('🏙️ City model loaded')
    console.log('GLTF scene:', gltf.scene)

    // Debug: List all objects in the scene
    const allObjects: Array<{ name: string; type: string; position: THREE.Vector3 }> = []
    gltf.scene.traverse((object) => {
      allObjects.push({
        name: object.name,
        type: object.type,
        position: object.position
      })

      // Hide mesh-based path node markers (make them invisible in game)
      if (object.name.startsWith('PathNode_')) {
        object.visible = false
        console.log(`👻 Hiding path node marker: ${object.name}`)
      }
    })
    console.log('All objects in scene:', allObjects)

    // Extract path nodes
    const pathNodes = extractPathNodesFromGLTF(gltf)

    if (pathNodes.length > 0) {
      console.log(`✅ Extracted ${pathNodes.length} path nodes:`, pathNodes)

      // Log each node with details
      pathNodes.forEach(node => {
        console.log(`  - ${node.id}:`, {
          position: node.position,
          types: node.types,
          next: node.next,
          metadata: node.metadata
        })
      })

      // Update global road network with extracted nodes
      const updatedNetwork = updateRoadNetwork(pathNodes)

      // Update taxi to use first path from extracted network
      if (typeof window !== 'undefined') {
        // Trigger taxi path update via window event
        window.dispatchEvent(new CustomEvent('roadNetworkUpdated', {
          detail: { network: updatedNetwork }
        }))
      }
    } else {
      console.warn('⚠️ No path nodes found!')
      console.log('💡 Troubleshooting:')
      console.log('   1. In Blender, use small mesh objects (spheres) instead of Empty objects')
      console.log('   2. Name them starting with "PathNode_" (e.g., PathNode_001)')
      console.log('   3. Export with GLTF settings: Include > Custom Properties enabled')
      console.log('   4. See docs/blender.md for detailed instructions')
    }
  }, [gltf])

  // Render the generated city model
  return <CityModelGenerated />
}

// Preload model
useGLTF.preload(getAssetPath('models/city_01.glb'))
