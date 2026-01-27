'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import type { MutableRefObject } from 'react'
import type { Taxi as TaxiType, DeliveryEvent, RoadNode } from '@/types/game'
import { IntersectionManager } from './IntersectionManager'
import { TaxiManager } from './TaxiManager'
import { CameraController } from './CameraController'
import { DeliverySystem } from './DeliverySystem'
import { DeliveryManager } from './DeliveryManager'
import { SceneEffects } from './SceneEffects'
import { Model as TutorialModel } from '@/generated_components/TutorialModelGenerated'
import { extractPathNodesFromGLTF } from '@/lib/extractPathNodes'
import { updateRoadNetwork } from '@/data/roads'
import { getAssetPath } from '@/lib/assetPath'

interface TutorialGameSceneProps {
  taxisRef: MutableRefObject<TaxiType[]>
  deliveriesRef: MutableRefObject<DeliveryEvent[]>
  pickupNodesRef: MutableRefObject<RoadNode[]>
  deliveryTimerRef: MutableRefObject<number>
  followTaxiId: string | null
  isPaused: boolean
}

/**
 * Tutorial game scene with tutorial_01.glb model
 */
export default function TutorialGameScene({
  taxisRef,
  deliveriesRef,
  pickupNodesRef,
  deliveryTimerRef,
  followTaxiId,
  isPaused,
}: TutorialGameSceneProps) {
  return (
    <Canvas
      camera={{
        position: [5, 8, 5],
        fov: 50,
      }}
      shadows={false}
      frameloop="always"
    >
      {/* Scene effects (fog and renderer config) */}
      <SceneEffects />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow={false}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={20}
        panSpeed={0.8}
        makeDefault
      />

      {/* WASD camera panning and taxi following */}
      <CameraController taxisRef={taxisRef} followTaxiId={followTaxiId} />

      {/* Tutorial model and path node extraction */}
      <TutorialModelWithPathNodes />

      {/* Intersection control tiles */}
      <IntersectionManager />

      {/* Delivery system logic (spawn timer & collision detection) */}
      <DeliverySystem
        deliveriesRef={deliveriesRef}
        deliveryTimerRef={deliveryTimerRef}
        pickupNodesRef={pickupNodesRef}
        taxisRef={taxisRef}
        isPaused={isPaused}
        isRushHour={false}
      />

      {/* Delivery visual indicators (pickup/dropoff/package) */}
      <DeliveryManager
        deliveriesRef={deliveriesRef}
        pickupNodesRef={pickupNodesRef}
        taxisRef={taxisRef}
      />

      {/* Taxis */}
      <TaxiManager taxisRef={taxisRef} deliveriesRef={deliveriesRef} isPaused={isPaused} />

      {/* Grid helper */}
      {/* <gridHelper args={[10, 10, '#444', '#222']} /> */}
    </Canvas>
  )
}

/**
 * Wrapper that renders the generated tutorial model
 * and extracts path nodes for taxi navigation
 */
function TutorialModelWithPathNodes() {
  const gltf = useGLTF(getAssetPath('models/tutorial_01.glb'))

  // Extract and register path nodes
  React.useEffect(() => {
    console.log('📚 Tutorial model loaded')

    // Hide path node markers
    gltf.scene.traverse((object) => {
      if (object.name.startsWith('PathNode_') || object.name.startsWith('INT_')) {
        object.visible = false
      }
    })

    // Extract path nodes
    const pathNodes = extractPathNodesFromGLTF(gltf)

    if (pathNodes.length > 0) {
      console.log(`✅ Tutorial extracted ${pathNodes.length} path nodes`)

      // Update global road network
      const updatedNetwork = updateRoadNetwork(pathNodes)

      // Notify tutorial game loop
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('roadNetworkUpdated', {
          detail: { network: updatedNetwork }
        }))
      }
    } else {
      console.warn('⚠️ No path nodes found in tutorial model!')
    }
  }, [gltf])

  return <TutorialModel />
}

// Preload tutorial model
useGLTF.preload(getAssetPath('models/tutorial_01.glb'))
