'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface PackageIndicatorProps {
  taxiPosition: THREE.Vector3
  color: string
  deliveryId: string
}

// Available present models (same as PickupIndicator)
const PRESENT_MODELS = [
  '/models/present_white_cube.glb',
  '/models/present_green_round.glb',
  '/models/present_green_rectangle.glb',
  '/models/present_green_cube.glb',
  '/models/present_white_round.glb',
  '/models/present_white_rectangle.glb',
]

/**
 * Present model that follows taxi when carrying a delivery
 * Shows the same present model that was picked up
 */
export function PackageIndicator({ taxiPosition, deliveryId }: PackageIndicatorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  // Select the same model as the pickup location (consistent by delivery ID)
  const modelPath = useMemo(() => {
    const hash = deliveryId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return PRESENT_MODELS[hash % PRESENT_MODELS.length]
  }, [deliveryId])

  const { scene } = useGLTF(modelPath)

  // Clone the model preserving original textures
  const presentClone = useMemo(() => {
    return scene.clone()
  }, [scene])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    timeRef.current += delta

    // Gentle rotation
    groupRef.current.rotation.y = timeRef.current

    // Slight bob
    const bob = Math.sin(timeRef.current * 4) * 0.1
    groupRef.current.position.set(
      taxiPosition.x,
      taxiPosition.y + 0.8 + bob,
      taxiPosition.z
    )
  })

  return (
    <group ref={groupRef} scale={0.8}>
      {/* Original present model with textures */}
      <primitive object={presentClone} />
    </group>
  )
}

// Preload all present models
PRESENT_MODELS.forEach((model) => {
  useGLTF.preload(model)
})
