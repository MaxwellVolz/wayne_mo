'use client'

// import { useGLTF } from '@react-three/drei'
// import { useEffect } from 'react'
// import * as THREE from 'three'

/**
 * City Model component
 * Loads Blender model and extracts path nodes for taxi navigation
 *
 * Setup Instructions:
 * 1. Create path nodes in Blender as Empty objects (named "PathNode_001", "PathNode_002", etc.)
 * 2. Export as .glb to /public/models/city.glb
 * 3. Uncomment the code below
 * 4. Extract path nodes and integrate with road network system
 *
 * See docs/blender.md for complete integration guide
 */
export default function CityModel() {
  // Uncomment when you have a model to load:
  /*
  const { scene } = useGLTF('/models/city.glb')

  useEffect(() => {
    const pathNodes: Array<{ id: string; position: THREE.Vector3 }> = []

    // Extract all Empty objects starting with "PathNode_"
    scene.traverse((object) => {
      if (object.name.startsWith('PathNode_')) {
        pathNodes.push({
          id: object.name,
          position: object.position.clone()
        })
      }
    })

    // Sort by name to maintain sequential order
    pathNodes.sort((a, b) => a.id.localeCompare(b.id))

    console.log(`Extracted ${pathNodes.length} path nodes:`, pathNodes)

    // TODO: Update road network with extracted nodes
    // updateRoadNetwork(pathNodes)
  }, [scene])

  return <primitive object={scene} />
  */

  // Placeholder until model is ready
  return null
}

// Preload model (uncomment when ready):
// useGLTF.preload('/models/city.glb')
