'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { MutableRefObject } from 'react'
import type { Taxi as TaxiType, DeliveryEvent, RoadNode, CombatTextEvent } from '@/types/game'
import CityModel from './CityModel'
import RoadVisualizer from './RoadVisualizer'
import { IntersectionManager } from './IntersectionManager'
import { DeliveryManager } from './DeliveryManager'
import { DeliverySystem } from './DeliverySystem'
import { CollisionSystem } from './CollisionSystem'
import { TaxiManager } from './TaxiManager'

interface SceneProps {
  taxisRef: MutableRefObject<TaxiType[]>
  deliveriesRef: MutableRefObject<DeliveryEvent[]>
  pickupNodesRef: MutableRefObject<RoadNode[]>
  deliveryTimerRef: MutableRefObject<number>
  combatTextRef: MutableRefObject<CombatTextEvent[]>
}

/**
 * Main Three.js scene container
 * Sets up camera, lighting, and controls
 */
export default function Scene({
  taxisRef,
  deliveriesRef,
  pickupNodesRef,
  deliveryTimerRef,
  combatTextRef
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
        target={[0.5, 0, -0.5]}
      />

      {/* Blender city model (buildings and path nodes) */}
      <CityModel />

      {/* Road network visualization */}
      <RoadVisualizer />

      {/* Intersection control tiles */}
      <IntersectionManager />

      {/* Collision detection system */}
      <CollisionSystem taxisRef={taxisRef} />

      {/* Delivery system logic (spawn timer & collision detection) */}
      <DeliverySystem
        deliveriesRef={deliveriesRef}
        deliveryTimerRef={deliveryTimerRef}
        pickupNodesRef={pickupNodesRef}
        taxisRef={taxisRef}
        combatTextRef={combatTextRef}
      />

      {/* Delivery visual indicators (pickup/dropoff/package/combat text) */}
      <DeliveryManager
        deliveriesRef={deliveriesRef}
        pickupNodesRef={pickupNodesRef}
        taxisRef={taxisRef}
        combatTextRef={combatTextRef}
      />

      {/* Taxis */}
      <TaxiManager taxisRef={taxisRef} />

      {/* Grid helper for debugging */}
      <gridHelper args={[20, 20, '#444', '#222']} />
    </Canvas>
  )
}
