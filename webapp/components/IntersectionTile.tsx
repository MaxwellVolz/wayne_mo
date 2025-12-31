'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { IntersectionMode } from '@/types/game'

interface IntersectionTileProps {
  position: THREE.Vector3
  mode: IntersectionMode
  onClick: () => void
}

/**
 * Intersection tile with simple geometric symbols
 * - Plus (+) for pass_through (Green)
 * - 🔄 for turn_left / counter-clockwise (Yellow)
 * - 🔄 for turn_right / clockwise (Blue)
 */
export function IntersectionTile({
  position,
  mode,
  onClick
}: IntersectionTileProps) {
  // Color coding for mode
  const color = useMemo(() => {
    switch (mode) {
      case 'pass_through': return '#00ff00'  // Green +
      case 'turn_left': return '#ffff00'     // Yellow 🔄 (counter-clockwise)
      case 'turn_right': return '#0088ff'    // Blue 🔄 (clockwise)
    }
  }, [mode])

  return (
    <group
      position={[position.x, position.y + 0.5, position.z]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      {/* Base circle (clickable area) - smaller */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Symbol based on mode */}
      {mode === 'pass_through' ? (
        <PlusSymbol color={color} />
      ) : mode === 'turn_right' ? (
        <RotateSymbol color={color} clockwise={false} />
      ) : (
        <RotateSymbol color={color} clockwise={true} />
      )}
    </group>
  )
}

/**
 * Plus symbol (+) for pass through - smaller size
 */
function PlusSymbol({ color }: { color: string }) {
  return (
    <>
      {/* Vertical bar */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.1, 1.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Horizontal bar */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </>
  )
}

/**
 * Circular rotation symbol 🔄 for turns
 * Creates a circular arrow ring
 */
function RotateSymbol({ color, clockwise }: { color: string; clockwise: boolean }) {
  // Create circular path for rotation indicator
  const curve = useMemo(() => {
    // Create a near-complete circle (300 degrees to leave gap for arrow)
    const points: THREE.Vector3[] = []
    const radius = 0.6
    const segments = 30
    const angleRange = (Math.PI * 2 * 300) / 360 // 300 degrees

    for (let i = 0; i <= segments; i++) {
      // For clockwise: sweep forward; for counter-clockwise: sweep backward
      const angle = clockwise
        ? (i / segments) * angleRange - Math.PI / 2 // Start at top, go clockwise
        : -Math.PI / 2 - (i / segments) * angleRange // Start at top, go counter-clockwise

      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        )
      )
    }

    return new THREE.CatmullRomCurve3(points)
  }, [clockwise])

  // Arrow position and rotation based on direction
  const arrowPosition: [number, number, number] = clockwise
    ? [0, 0, -0.6]  // Bottom (clockwise end)
    : [0, 0, -0.6]   // Top (counter-clockwise end)

  const arrowRotation: [number, number, number] = clockwise
    ? [Math.PI / 2, 0, Math.PI / 2]       // Point right (clockwise)
    : [Math.PI / 2, 0, -Math.PI / 2]      // Point left (counter-clockwise)

  return (
    <>
      {/* Circular ring */}
      <mesh>
        <tubeGeometry args={[curve, 40, 0.12, 8, false]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Arrow head at the end */}
      <mesh position={arrowPosition} rotation={arrowRotation}>
        <coneGeometry args={[0.25, 0.4, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </>
  )
}
