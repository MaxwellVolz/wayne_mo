'use client'

import { useFrame } from '@react-three/fiber'
import type { MutableRefObject } from 'react'
import type { Taxi } from '@/types/game'
import { checkTaxiCollisions } from '@/lib/collisionSystem'

interface CollisionSystemProps {
  taxisRef: MutableRefObject<Taxi[]>
}

/**
 * Manages taxi collision detection and handling
 * Runs every frame using useFrame
 */
export function CollisionSystem({ taxisRef }: CollisionSystemProps) {
  useFrame((_, delta) => {
    const deltaMs = delta * 1000 // Convert to milliseconds

    // Check for collisions between all taxis
    checkTaxiCollisions(taxisRef.current, deltaMs)
  })

  return null // This component doesn't render anything
}
