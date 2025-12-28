'use client'

import { useEffect, useRef, useState } from 'react'
import type { Taxi } from '@/types/game'
import { getTimeScale } from '@/lib/gameState'
import { testRoadNetwork } from '@/data/roads'

/**
 * Main game loop hook
 * Manages game state, taxis, and frame timing
 */
export function useGameLoop() {
  const [taxis, setTaxis] = useState<Taxi[]>([])
  const [deltaTime, setDeltaTime] = useState(0)
  const lastFrameTime = useRef<number>(Date.now())
  const animationFrameId = useRef<number | undefined>(undefined)

  // Initialize game state
  useEffect(() => {
    // Create initial taxi
    const initialTaxi: Taxi = {
      id: 'taxi-1',
      state: 'driving_to_pickup',
      path: testRoadNetwork.paths[0], // Start on first path
      t: 0,
      speed: 3, // Units per second
      isFocused: false,
    }

    setTaxis([initialTaxi])
  }, [])

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now()
      const rawDelta = (now - lastFrameTime.current) / 1000 // Convert to seconds
      lastFrameTime.current = now

      // Apply time scale for slow-motion
      const timeScale = getTimeScale()
      const scaledDelta = rawDelta * timeScale

      setDeltaTime(scaledDelta)

      animationFrameId.current = requestAnimationFrame(gameLoop)
    }

    animationFrameId.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return {
    taxis,
    deltaTime,
  }
}
