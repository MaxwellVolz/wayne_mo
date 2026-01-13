'use client'

import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import { Model as SmallCityModelGenerated } from '@/generated_components/SmallCityModelGenerated'
import { extractPathNodesFromGLTF } from '@/lib/extractPathNodes'
import { updateRoadNetwork } from '@/data/roads'
import { getAssetPath } from '@/lib/assetPath'

/**
 * Small City Model component
 * Loads Small City Blender model and extracts path nodes for taxi navigation
 */
export default function SmallCityModelWrapper() {
  const gltf = useGLTF(getAssetPath('models/small_city_01.glb'))

  useEffect(() => {
    console.log('🏙️ Small City model loaded')
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
      if (object.name.startsWith('PathNode_') || object.name.startsWith('INT_') || object.name.startsWith('StarterNode') || object.name.startsWith('Pickup_')) {
        object.visible = false
        console.log(`👻 Hiding path node marker: ${object.name}`)
      }
    })
    console.log('All objects in Small City scene:', allObjects)

    // Extract path nodes
    const pathNodes = extractPathNodesFromGLTF(gltf)

    if (pathNodes.length > 0) {
      console.log(`✅ Extracted ${pathNodes.length} path nodes from Small City:`, pathNodes)

      // Log each node with details
      pathNodes.forEach(node => {
        console.log(`  - ${node.id}:`, {
          position: node.position,
          types: node.types,
          neighbors: node.neighbors,
          metadata: node.metadata
        })
      })

      // Update global road network with extracted nodes
      const updatedNetwork = updateRoadNetwork(pathNodes)
      console.log('📍 Small City road network updated:', updatedNetwork)

      // Update taxi to use first path from extracted network
      if (typeof window !== 'undefined') {
        // Trigger taxi path update via window event
        window.dispatchEvent(new CustomEvent('roadNetworkUpdated', {
          detail: { network: updatedNetwork }
        }))
      }
    } else {
      console.warn('⚠️ No path nodes found in Small City model!')
      console.log('💡 Check that small_city_01.glb has INT_ and StarterNode markers')
    }
  }, [gltf])

  // Render the generated small city model
  return <SmallCityModelGenerated />
}

// Preload model
useGLTF.preload(getAssetPath('models/small_city_01.glb'))
