'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getAssetPath } from '@/lib/assetPath'

interface PickupIndicatorProps {
  position: THREE.Vector3
  dropoffPosition: THREE.Vector3
  color: string
  deliveryId: string
  multiplier: number // 1-4, determines box type
  distance: number // Distance from pickup to dropoff
}

// Box models mapped by multiplier (1-4)
const BOX_MODELS: Record<number, string> = {
  1: getAssetPath('models/box_small.glb'),
  2: getAssetPath('models/box_large.glb'),
  3: getAssetPath('models/box_long.glb'),
  4: getAssetPath('models/box_wide.glb'),
}

// Arrow models based on distance
const ARROW_SHORT = getAssetPath('models/arrow_chevron.glb') // distance <= 4
const ARROW_LONG = getAssetPath('models/arrow.glb') // distance > 4

/**
 * Pulsing indicator for active pickup locations using box models
 * Box type determined by multiplier, arrow type by distance
 */
export function PickupIndicator({ position, dropoffPosition, color, deliveryId, multiplier, distance }: PickupIndicatorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  // Select box model based on multiplier (clamp to 1-4)
  const boxModelPath = useMemo(() => {
    const clampedMultiplier = Math.min(4, Math.max(1, Math.floor(multiplier)))
    return BOX_MODELS[clampedMultiplier]
  }, [multiplier])

  // Select arrow model based on distance
  const arrowModelPath = useMemo(() => {
    console.log("distance", distance)
    return distance > 8 ? ARROW_LONG : ARROW_SHORT
  }, [distance])

  const { scene: boxScene } = useGLTF(boxModelPath)
  const { scene: arrowScene } = useGLTF(arrowModelPath)

  // Clone the models preserving original textures
  const boxClone = useMemo(() => {
    return boxScene.clone()
  }, [boxScene])

  const arrowClone = useMemo(() => {
    const clone = arrowScene.clone()

    // Apply delivery color to arrow material
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const material = (mesh.material as THREE.MeshStandardMaterial).clone()
          material.color = new THREE.Color(color)
          material.emissive = new THREE.Color(color)
          material.emissiveIntensity = 0.8

          material.transparent = true
          material.opacity = 0.5

          mesh.material = material
        }
      }
    })

    return clone
  }, [arrowScene, color])

  const directionIndicator = useMemo(() => {
    // Calculate direction from pickup to dropoff
    const direction = new THREE.Vector3().subVectors(dropoffPosition, position).normalize()

    // Calculate rotation to point the arrow in the right direction
    // Arrows point to -X by default in Blender (Y+ Up)
    const targetQuaternion = new THREE.Quaternion()
    const arrowDefaultDirection = new THREE.Vector3(-1, 0, 0)

    // Rotate from arrow's default -X direction to target direction
    targetQuaternion.setFromUnitVectors(arrowDefaultDirection, direction)

    // Position the arrow slightly offset from the box
    const arrowPosition = new THREE.Vector3(
      0, .8, 0
      // direction.x * 0.5,
      // 0,
      // direction.z * 0.5
    )

    return {
      position: arrowPosition,
      quaternion: targetQuaternion,
    }
  }, [position, dropoffPosition])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    timeRef.current += delta

    // Gentle pulse animation (scale)
    const pulse = Math.sin(timeRef.current * 2) * 0.08 + 1
    groupRef.current.scale.set(pulse, pulse, pulse)

    // Subtle bob up and down
    const bob = Math.sin(timeRef.current * 1.5) * 0.1
    groupRef.current.position.y = position.y + 0.4 + bob

  })

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y + 0.4, position.z]}
    >
      {/* Box model based on multiplier */}
      <primitive object={boxClone} />

      {/* Directional arrow pointing to dropoff */}
      <group
        position={directionIndicator.position}
        quaternion={directionIndicator.quaternion}
        scale={0.7}
      >
        <primitive object={arrowClone} />
      </group>

      {/* Colored glow ring around the box */}
      {/* <mesh
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.4, 0.03, 8, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh> */}
    </group>
  )
}

// Preload all box models and arrow models
Object.values(BOX_MODELS).forEach((model) => {
  useGLTF.preload(model)
})
useGLTF.preload(ARROW_SHORT)
useGLTF.preload(ARROW_LONG)
