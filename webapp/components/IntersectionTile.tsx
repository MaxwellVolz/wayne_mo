'use client'

import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Move, RefreshCcw, RefreshCw } from 'lucide-react'
import type { IntersectionMode } from '@/types/game'

interface IntersectionTileProps {
  position: THREE.Vector3
  mode: IntersectionMode
  onClick: () => void
}

/**
 * Intersection tile with professional icon library icons
 * - Move for pass_through (Green)
 * - RefreshCcw for turn_left (Yellow) - spinning counter-clockwise
 * - RefreshCw for turn_right (Blue) - spinning clockwise
 */
export function IntersectionTile({
  position,
  mode,
  onClick
}: IntersectionTileProps) {
  // Color coding for mode
  const color = useMemo(() => {
    switch (mode) {
      case 'pass_through': return '#00ff00'  // Green
      case 'turn_left': return '#ffff00'     // Yellow
      case 'turn_right': return '#0088ff'    // Blue
    }
  }, [mode])

  // Icon component based on mode
  const Icon = useMemo(() => {
    switch (mode) {
      case 'pass_through': return Move
      case 'turn_left': return RefreshCcw
      case 'turn_right': return RefreshCw
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
      {/* Base circle (clickable area) */}
      <mesh position={[0, -0.44, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-10}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Icon overlay using HTML */}
      <group position={[0, -0.2, 0]}>
        <Html
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              animation: mode === 'turn_left'
                ? 'spinLeft 6s linear infinite'
                : mode === 'turn_right'
                  ? 'spinRight 6s linear infinite'
                  : 'none'
            }}
          >
            <Icon
              size={100}
              color={color}
              fill="none"
              strokeWidth={2}
              opacity={0.6}
              style={{
                filter: `drop-shadow(0 0 8px ${color})`,
                display: 'block'
              }}
            />
          </div>
        </Html>
      </group>
    </group>
  )
}
