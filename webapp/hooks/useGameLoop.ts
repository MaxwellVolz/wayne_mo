'use client'

import { useRef } from 'react'
import type { Taxi } from '@/types/game'
import { testRoadNetwork } from '@/data/roads'

/**
 * Main game state hook
 * Manages taxi state using refs to avoid React re-renders
 * Animation is handled by useFrame in individual components
 */
export function useGameLoop() {
  // Use ref to store taxis - no re-renders on updates
  const taxisRef = useRef<Taxi[]>([
    {
      id: 'taxi-1',
      state: 'driving_to_pickup',
      path: testRoadNetwork.paths[0],
      t: 0,
      speed: 3, // Units per second
      isFocused: false,
    },
  ])

  return {
    taxisRef,
  }
}
