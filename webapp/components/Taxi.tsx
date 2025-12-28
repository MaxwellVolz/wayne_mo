'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Taxi as TaxiType } from '@/types/game'
import { updateTaxi, samplePath } from '@/lib/movement'
import { getTimeScale } from '@/lib/gameState'

interface TaxiProps {
  taxi: TaxiType
}

/**
 * Taxi component - renders a single taxi and handles its movement
 * Uses useFrame for smooth 60fps animation
 */
export default function Taxi({ taxi }: TaxiProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const previousPosition = useRef<THREE.Vector3>(new THREE.Vector3())

  // Use Three.js render loop for smooth animation
  useFrame((state, delta) => {
    if (!meshRef.current || !taxi.path) return

    // Apply time scale for slow-motion
    const timeScale = getTimeScale()
    const scaledDelta = delta * timeScale

    // Update taxi position along path
    updateTaxi(taxi, scaledDelta)

    // Sample new position from path
    const position = samplePath(taxi.path, taxi.t)
    meshRef.current.position.copy(position)

    // Calculate rotation to face movement direction
    if (!previousPosition.current.equals(position)) {
      const direction = new THREE.Vector3()
        .subVectors(position, previousPosition.current)
        .normalize()

      if (direction.length() > 0.01) {
        const angle = Math.atan2(direction.x, direction.z)
        meshRef.current.rotation.y = angle
      }
    }

    previousPosition.current.copy(position)
  })

  // Color based on state
  const getColor = () => {
    switch (taxi.state) {
      case 'idle':
        return '#ffff00' // Yellow
      case 'driving_to_pickup':
      case 'driving_to_dropoff':
        return '#00ff00' // Green
      case 'stopped':
        return '#ff0000' // Red
      case 'needs_service':
        return '#ff8800' // Orange
      case 'broken':
        return '#440000' // Dark red
      default:
        return '#ffffff'
    }
  }

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
      {/* Simple box taxi for now - can be replaced with proper model later */}
      <boxGeometry args={[1.5, 0.8, 2.5]} />
      <meshStandardMaterial color={getColor()} />

      {/* Taxi roof light */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.4]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
      </mesh>
    </mesh>
  )
}
