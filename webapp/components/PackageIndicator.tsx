'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getAssetPath } from '@/lib/assetPath'

interface PackageIndicatorProps {
  taxiPosition: THREE.Vector3
  color: string
  deliveryId: string
  multiplier: number // 1-4, determines box type
}

// Box models mapped by multiplier (1-4) - same as PickupIndicator
const BOX_MODELS: Record<number, string> = {
  1: getAssetPath('models/box_small.glb'),
  2: getAssetPath('models/box_large.glb'),
  3: getAssetPath('models/box_long.glb'),
  4: getAssetPath('models/box_wide.glb'),
}

/**
 * Box model that follows taxi when carrying a delivery
 * Shows the same box model that was picked up
 */
export function PackageIndicator({ taxiPosition, deliveryId, multiplier }: PackageIndicatorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  // Select box model based on multiplier (clamp to 1-4)
  const boxModelPath = useMemo(() => {
    const clampedMultiplier = Math.min(4, Math.max(1, Math.floor(multiplier)))
    return BOX_MODELS[clampedMultiplier]
  }, [multiplier])

  const { scene } = useGLTF(boxModelPath)

  // Clone the model preserving original textures
  const boxClone = useMemo(() => {
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
      {/* Box model with textures */}
      <primitive object={boxClone} />
    </group>
  )
}

// Preload all box models
Object.values(BOX_MODELS).forEach((model) => {
  useGLTF.preload(model)
})
