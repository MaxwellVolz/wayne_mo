'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import City from './City'
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
        position: [20, 25, 20],
        fov: 50,
      }}
      shadows={false}
      frameloop="always"
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.8}
        castShadow={false}
      />

      {/* Camera controls - orbit around city */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={10}
        maxDistance={60}
        target={[0, 0, 0]}
      />

      {/* City grid and roads */}
      <City />

      {/* Blender city model (buildings and path nodes) */}
      <CityModel />

      {/* Road network visualization */}
      <RoadVisualizer />

      {/* Taxis */}
      {taxisRef.current.map((taxi) => (
        <Taxi key={taxi.id} taxi={taxi} />
      ))}

      {/* Grid helper for debugging */}
      <gridHelper args={[80, 16, '#444', '#222']} />
    </Canvas>
  )
}
