'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DropoffIndicatorProps {
  position: THREE.Vector3
  color: string
  opacity?: number
}

/**
 * Enhanced dropoff indicator with ground circle and rotating target rings
 */
export function DropoffIndicator({ position, color, opacity = 0.9 }: DropoffIndicatorProps) {
  const ringRef1 = useRef<THREE.Mesh>(null)
  const ringRef2 = useRef<THREE.Mesh>(null)
  const beaconRef = useRef<THREE.Mesh>(null)
  const groundCircleRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta

    // Unified pulse for all elements
    const pulse = Math.sin(timeRef.current * 2) * 0.15 + 1

    // Pulse outer ring
    if (ringRef1.current) {
      ringRef1.current.scale.set(pulse, pulse, pulse)
    }

    // Pulse inner ring
    if (ringRef2.current) {
      ringRef2.current.scale.set(pulse, pulse, pulse)
    }

    // Pulse beacon
    if (beaconRef.current) {
      beaconRef.current.scale.set(pulse, pulse, pulse)
    }

    // Pulse ground circle with opacity fade
    if (groundCircleRef.current) {
      groundCircleRef.current.scale.set(pulse, pulse, pulse)

      // Fade pulse
      const material = groundCircleRef.current.material as THREE.MeshBasicMaterial
      material.opacity = (Math.sin(timeRef.current * 2) * 0.25 + 0.45) * opacity
    }
  })

  return (
    <group position={[position.x, position.y, position.z]}>

      {/* Ground circle marker */}
      <mesh
        ref={groundCircleRef}
        position={[0, 0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.8, 0.06, 8, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.9}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer rotating ring */}
      <mesh
        ref={ringRef1}
        position={[0, 0.4, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.6, 0.04, 8, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={opacity * 0.6}
        />
      </mesh>

      {/* Inner rotating ring */}
      <mesh
        ref={ringRef2}
        position={[0, .6, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.3, 0.03, 8, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.0}
          transparent
          opacity={opacity * 0.8}
        />
      </mesh>

    </group>
  )
}
