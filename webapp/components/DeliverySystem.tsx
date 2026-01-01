'use client'

import { useFrame } from '@react-three/fiber'
import type { MutableRefObject } from 'react'
import type { DeliveryEvent, RoadNode, Taxi } from '@/types/game'
import { spawnDeliveryEvent, checkDeliveryCollisions } from '@/lib/deliverySystem'

interface DeliverySystemProps {
  deliveriesRef: MutableRefObject<DeliveryEvent[]>
  deliveryTimerRef: MutableRefObject<number>
  pickupNodesRef: MutableRefObject<RoadNode[]>
  taxisRef: MutableRefObject<Taxi[]>
  isPaused: boolean
  isRushHour: boolean
}

const SPAWN_INTERVAL = 10000 // 10 seconds in milliseconds
const RUSH_HOUR_SPAWN_INTERVAL = 5000 // 5 seconds during rush hour (2x faster)

/**
 * Manages delivery spawn timer and collision detection
 * Runs every frame using useFrame
 */
export function DeliverySystem({
  deliveriesRef,
  deliveryTimerRef,
  pickupNodesRef,
  taxisRef,
  isPaused,
  isRushHour
}: DeliverySystemProps) {
  useFrame((_, delta) => {
    // Don't process deliveries when paused
    if (isPaused) return

    const deltaMs = delta * 1000 // Convert to milliseconds

    // Update spawn timer
    deliveryTimerRef.current -= deltaMs

    // Spawn new delivery if timer expired
    if (deliveryTimerRef.current <= 0) {
      const currentInterval = isRushHour ? RUSH_HOUR_SPAWN_INTERVAL : SPAWN_INTERVAL
      console.log(`⏰ Delivery spawn timer expired! Pickup nodes available: ${pickupNodesRef.current.length} ${isRushHour ? '🚦 RUSH HOUR' : ''}`)

      if (pickupNodesRef.current.length >= 2) {
        const newDelivery = spawnDeliveryEvent(pickupNodesRef.current, deliveriesRef.current)
        if (newDelivery) {
          deliveriesRef.current.push(newDelivery)
          console.log(`📦 Spawned delivery ${newDelivery.id}: ${newDelivery.pickupNodeId} → ${newDelivery.dropoffNodeId} [${newDelivery.color}]`)
          console.log(`   Total active deliveries: ${deliveriesRef.current.length}`)
        }
      } else {
        console.warn(`⚠️ Not enough pickup nodes (need 2, have ${pickupNodesRef.current.length})`)
      }

      deliveryTimerRef.current = currentInterval
    }

    // Check for pickup/dropoff collisions
    const completedIds = checkDeliveryCollisions(
      taxisRef.current,
      deliveriesRef.current,
      pickupNodesRef.current
    )

    // Remove completed deliveries
    if (completedIds.length > 0) {
      console.log(`✅ Removing ${completedIds.length} completed deliveries:`, completedIds)
      deliveriesRef.current = deliveriesRef.current.filter(
        d => !completedIds.includes(d.id)
      )
      console.log(`   Remaining active deliveries: ${deliveriesRef.current.length}`)
    }
  })

  return null // This component doesn't render anything
}
