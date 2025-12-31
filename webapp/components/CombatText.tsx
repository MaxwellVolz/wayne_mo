'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface CombatTextProps {
  position: THREE.Vector3
  text: string
  onComplete: () => void
}

/**
 * Scrolling combat text that appears above taxi when earning money
 * Animates upward and fades out over 2 seconds
 */
export function CombatText({ position, text, onComplete }: CombatTextProps) {
  const textRef = useRef<any>(null)
  const timeRef = useRef(0)
  const completedRef = useRef(false)
  const startY = position.y + 1.5

  useFrame((_, delta) => {
    if (!textRef.current || completedRef.current) return

    // Defensive check for material
    if (!textRef.current.material) return

    timeRef.current += delta

    // Duration: 2 seconds
    const duration = 2
    const progress = Math.min(timeRef.current / duration, 1)

    // Move upward
    try {
      const yOffset = progress * 3 // Move 3 units up over 2 seconds
      textRef.current.position.y = startY + yOffset

      // Fade out
      const opacity = 1 - progress
      textRef.current.material.opacity = opacity
    } catch (e) {
      console.error('CombatText animation error:', e)
      completedRef.current = true
      onComplete()
      return
    }

    // Remove when complete (only call once)
    if (progress >= 1 && !completedRef.current) {
      completedRef.current = true
      onComplete()
    }
  })

  return (
    <Text
      ref={textRef}
      position={[position.x, startY, position.z]}
      fontSize={0.5}
      color="#ffff00"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.05}
      outlineColor="#000000"
    >
      {text}
    </Text>
  )
}
