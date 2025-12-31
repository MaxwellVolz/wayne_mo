'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PackageIndicatorProps {
  taxiPosition: THREE.Vector3
}

/**
 * Yellow package indicator that follows taxi when carrying a delivery
 */
export function PackageIndicator({ taxiPosition }: PackageIndicatorProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    if (!meshRef.current) return

    timeRef.current += delta

    // Gentle rotation
    meshRef.current.rotation.y = timeRef.current

    // Slight bob
    const bob = Math.sin(timeRef.current * 4) * 0.1
    meshRef.current.position.set(
      taxiPosition.x,
      taxiPosition.y + 0.8 + bob,
      taxiPosition.z
    )
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial
        color="#ffff00"
        emissive="#ffff00"
        emissiveIntensity={0.6}
      />
    </mesh>
  )
}
