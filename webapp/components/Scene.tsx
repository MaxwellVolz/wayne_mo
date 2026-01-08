'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { MutableRefObject } from 'react'
import type { Taxi as TaxiType, DeliveryEvent, RoadNode } from '@/types/game'
import CityModel from './CityModel'
import RoadVisualizer from './RoadVisualizer'
import { IntersectionManager } from './IntersectionManager'
import { DeliveryManager } from './DeliveryManager'
import { DeliverySystem } from './DeliverySystem'
import { CollisionSystem } from './CollisionSystem'
import { TaxiManager } from './TaxiManager'
import { CameraController } from './CameraController'
import { Model as TheOGShop } from '@/generated_components/the_og_shop'


interface SceneProps {
  taxisRef: MutableRefObject<TaxiType[]>
  deliveriesRef: MutableRefObject<DeliveryEvent[]>
  pickupNodesRef: MutableRefObject<RoadNode[]>
  deliveryTimerRef: MutableRefObject<number>
  isPaused: boolean
  debugMode: boolean
  isRushHour: boolean
  followTaxiId: string | null
}

/**
 * Main Three.js scene container
 * Sets up camera, lighting, and controls
 * Memoized to prevent re-renders when parent state changes
 */
const Scene = React.memo(function Scene({
  taxisRef,
  deliveriesRef,
  pickupNodesRef,
  deliveryTimerRef,
  isPaused,
  debugMode,
  isRushHour,
  followTaxiId
}: SceneProps) {

  return (
    <Canvas
      camera={{
        position: [8, 10, 8],
        fov: 50,
      }}
      shadows={false}
      frameloop="always"
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow={false}
      />

      {/* Camera controls - orbit around city */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={30}
        panSpeed={0.8}
        makeDefault
      />

      {/* WASD camera panning and taxi following */}
      <CameraController taxisRef={taxisRef} followTaxiId={followTaxiId} />

      {/* Blender city model (buildings and path nodes) */}
      <CityModel />

      {/* Road network visualization */}
      <RoadVisualizer debugMode={debugMode} />

      {/* Intersection control tiles */}
      <IntersectionManager />

      {/* Collision detection system */}
      <CollisionSystem taxisRef={taxisRef} isPaused={isPaused} />

      <TheOGShop />

      {/* Delivery system logic (spawn timer & collision detection) */}
      <DeliverySystem
        deliveriesRef={deliveriesRef}
        deliveryTimerRef={deliveryTimerRef}
        pickupNodesRef={pickupNodesRef}
        taxisRef={taxisRef}
        isPaused={isPaused}
        isRushHour={isRushHour}
      />

      {/* Delivery visual indicators (pickup/dropoff/package) */}
      <DeliveryManager
        deliveriesRef={deliveriesRef}
        pickupNodesRef={pickupNodesRef}
        taxisRef={taxisRef}
      />

      {/* Taxis */}
      <TaxiManager taxisRef={taxisRef} deliveriesRef={deliveriesRef} isPaused={isPaused} />

      {/* Grid helper for debugging */}
      {/* <gridHelper args={[20, 20, '#444', '#222']} /> */}
    </Canvas>
  )
})

export default Scene
