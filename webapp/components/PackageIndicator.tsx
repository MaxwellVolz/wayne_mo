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
 * Shows the same box model that was picked up with a glowing sphere around it
 */
export function PackageIndicator({ taxiPosition, color, multiplier }: PackageIndicatorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
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
    const bob = Math.sin(timeRef.current * 4) * 0.05
    groupRef.current.position.set(
      taxiPosition.x,
      taxiPosition.y + 0.6 + bob,
      taxiPosition.z
    )

    // Pulse the sphere opacity
    if (sphereRef.current) {
      const material = sphereRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.15 + Math.sin(timeRef.current * 3) * 0.1
    }
  })

  return (
    <group ref={groupRef} >
      {/* Glowing sphere around package */}
      <mesh ref={sphereRef} position={[0, 0.11, 0]}>
        <sphereGeometry args={[0.35, 16, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
      {/* Box model with textures (smaller scale) */}
      <group scale={0.5} position={[0, 0, 0]}>
        <primitive object={boxClone} />
      </group>
    </group>
  )
}

// Preload all box models
Object.values(BOX_MODELS).forEach((model) => {
  useGLTF.preload(model)
})
