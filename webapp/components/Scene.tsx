'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import CityModel from './CityModel'
import Taxi from './Taxi'
import RoadVisualizer from './RoadVisualizer'
import { useGameLoop } from '@/hooks/useGameLoop'

/**
 * Main Three.js scene container
 * Sets up camera, lighting, and controls
 */
export default function Scene() {
  const { taxisRef } = useGameLoop()

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
        target={[-1.5, 0, 1.5]}
      />

      {/* Old procedural city (disabled - using Blender model instead) */}
      {/* <City /> */}

      {/* Blender city model (buildings and path nodes) */}
      <CityModel />

      {/* Road network visualization */}
      <RoadVisualizer />

      {/* Taxis */}
      {taxisRef.current.map((taxi) => (
        <Taxi key={taxi.id} taxi={taxi} />
      ))}

      {/* Grid helper for debugging */}
      <gridHelper args={[20, 20, '#444', '#222']} />
    </Canvas>
  )
}
