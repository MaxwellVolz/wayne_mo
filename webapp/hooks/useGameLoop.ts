'use client'

import { useRef, useEffect } from 'react'
import type { Taxi, DeliveryEvent, RoadNode } from '@/types/game'
import { getRoadNetwork } from '@/data/roads'
import { spawnDeliveryEvent } from '@/lib/deliverySystem'

/**
 * Main game state hook
 * Manages taxi and delivery state using refs to avoid React re-renders
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
      previousNodeId: undefined,
      // Delivery state
      hasPackage: false,
      currentDeliveryId: undefined,
      money: 100, // Start with $100
      // Collision handling
      isReversing: false,
      collisionCooldown: 0,
    },
  ])

  // Delivery system state
  const deliveriesRef = useRef<DeliveryEvent[]>([])
  const deliveryTimerRef = useRef<number>(10000) // 10 seconds until next delivery
  const pickupNodesRef = useRef<RoadNode[]>([])
  const initialSpawnDoneRef = useRef<boolean>(false)

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

      // Extract pickup nodes from network
      if (network.nodes) {
        const pickups = network.nodes.filter((n: RoadNode) =>
          n.types.includes('pickup')
        )
        pickupNodesRef.current = pickups
        console.log(`📍 Found ${pickups.length} pickup nodes`)

        // Spawn 3 initial deliveries
        if (pickups.length >= 2 && !initialSpawnDoneRef.current) {
          for (let i = 0; i < 3; i++) {
            const newDelivery = spawnDeliveryEvent(pickups, deliveriesRef.current)
            if (newDelivery) {
              deliveriesRef.current.push(newDelivery)
            }
          }
          initialSpawnDoneRef.current = true
          console.log(`🎮 Spawned 3 initial deliveries`)
        }
      }
    }) as EventListener

    window.addEventListener('roadNetworkUpdated', handleNetworkUpdate)

    return () => {
      window.removeEventListener('roadNetworkUpdated', handleNetworkUpdate)
    }
  }, [])

  return {
    taxisRef,
    deliveriesRef,
    pickupNodesRef,
    deliveryTimerRef,
    initialSpawnDoneRef,
  }
}
