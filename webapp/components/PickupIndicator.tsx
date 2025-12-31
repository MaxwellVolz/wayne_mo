'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PickupIndicatorProps {
  position: THREE.Vector3
  color: string
}

/**
 * Pulsing indicator for active pickup locations
 */
export function PickupIndicator({ position, color }: PickupIndicatorProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    if (!meshRef.current) return

    timeRef.current += delta

    // Pulse animation (scale and opacity)
    const pulse = Math.sin(timeRef.current * 3) * 0.2 + 1
    meshRef.current.scale.set(pulse, pulse, pulse)

    // Bob up and down
    const bob = Math.sin(timeRef.current * 2) * 0.2
    meshRef.current.position.y = position.y + 1.0 + bob
  })

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y + 1.0, position.z]}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}
