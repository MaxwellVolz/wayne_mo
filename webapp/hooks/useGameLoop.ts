'use client'

import { useRef, useEffect } from 'react'
import type { Taxi } from '@/types/game'
import { getRoadNetwork } from '@/data/roads'

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
      path: getRoadNetwork().paths[0] || null,
      t: 0,
      speed: 1.5, // Units per second (slower for better visibility)
      isFocused: false,
      // Topological navigation state (initialized, will be set by first intersection)
      currentIntersectionId: undefined,
      incomingDir: 0, // Default to North, will be updated at first intersection
    },
  ])

  // Listen for road network updates from CityModel
  useEffect(() => {
    const handleNetworkUpdate = ((event: CustomEvent) => {
      const { network } = event.detail
      console.log('🚕 Taxi received road network update:', network)

      // Update taxi to use first path from new network
      if (network.paths.length > 0 && taxisRef.current[0]) {
        // Find a path that starts from an intersection for more variety
        const intersectionPaths = network.paths.filter((p: any) =>
          p.id.includes('Intersection')
        )
        const startPath = intersectionPaths.length > 0 ? intersectionPaths[0] : network.paths[0]

        taxisRef.current[0].path = startPath
        taxisRef.current[0].t = 0
        console.log(`✅ Taxi updated to starting path: ${startPath.id}`)
        console.log(`   Available paths: ${network.paths.length}`)
        console.log(`   Intersection paths: ${intersectionPaths.length}`)
      }
    }) as EventListener

    window.addEventListener('roadNetworkUpdated', handleNetworkUpdate)

    return () => {
      window.removeEventListener('roadNetworkUpdated', handleNetworkUpdate)
    }
  }, [])

  return {
    taxisRef,
  }
}
