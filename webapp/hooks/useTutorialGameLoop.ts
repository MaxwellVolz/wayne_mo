'use client'

import { useRef, useEffect } from 'react'
import type { Taxi, DeliveryEvent, RoadNode } from '@/types/game'
import { spawnDeliveryEvent } from '@/lib/deliverySystem'

/**
 * Tutorial game state hook
 * Simplified version for tutorial level with deliveries
 */
export function useTutorialGameLoop() {
  // Single taxi for tutorial
  const taxisRef = useRef<Taxi[]>([
    {
      id: 'tutorial-taxi-1',
      state: 'driving_to_pickup',
      path: null,
      t: 0,
      speed: 1.5,
      isFocused: false,
      currentIntersectionId: undefined,
      incomingDir: 0,
      previousNodeId: undefined,
      hasPackage: false,
      currentDeliveryId: undefined,
      money: 0,
      isReversing: false,
      collisionCooldown: 0,
    },
  ])

  // Tutorial delivery system
  const deliveriesRef = useRef<DeliveryEvent[]>([])
  const deliveryTimerRef = useRef<number>(10000) // 10 seconds until next delivery
  const pickupNodesRef = useRef<RoadNode[]>([])
  const initialSpawnDoneRef = useRef<boolean>(false)

  // Listen for tutorial road network updates
  useEffect(() => {
    const handleNetworkUpdate = ((event: CustomEvent) => {
      const { network } = event.detail
      console.log('📚 Tutorial received road network update:', network)

      // Update taxi to use first path from tutorial network
      if (network.paths.length > 0 && taxisRef.current[0]) {
        const startPath = network.paths[0]
        taxisRef.current[0].path = startPath
        taxisRef.current[0].t = 0
        console.log(`✅ Tutorial taxi on path: ${startPath.id}`)
        console.log(`   Total paths: ${network.paths.length}`)
      }

      // Extract pickup nodes and spawn initial deliveries
      if (network.nodes) {
        const pickups = network.nodes.filter((n: RoadNode) =>
          n.types.includes('pickup')
        )
        pickupNodesRef.current = pickups
        console.log(`📍 Tutorial has ${pickups.length} pickup nodes`)

        // Spawn 2 initial deliveries for tutorial
        if (pickups.length >= 2 && !initialSpawnDoneRef.current) {
          for (let i = 0; i < 2; i++) {
            const newDelivery = spawnDeliveryEvent(pickups, deliveriesRef.current)
            if (newDelivery) {
              deliveriesRef.current.push(newDelivery)
            }
          }
          initialSpawnDoneRef.current = true
          console.log(`🎮 Tutorial spawned 2 initial deliveries`)
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
  }
}
