'use client'

import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { MutableRefObject } from 'react'
import type { DeliveryEvent, RoadNode, Taxi } from '@/types/game'
import { PickupIndicator } from './PickupIndicator'
import { DropoffIndicator } from './DropoffIndicator'
import { PackageIndicator } from './PackageIndicator'

interface DeliveryManagerProps {
  deliveriesRef: MutableRefObject<DeliveryEvent[]>
  pickupNodesRef: MutableRefObject<RoadNode[]>
  taxisRef: MutableRefObject<Taxi[]>
}

/**
 * Manages rendering of all delivery-related visual indicators
 * Uses useState + useFrame to re-render when ref contents change
 */
export function DeliveryManager({
  deliveriesRef,
  pickupNodesRef,
  taxisRef
}: DeliveryManagerProps) {
  // Force re-render every frame to show updated delivery state
  const [, setTick] = useState(0)

  useFrame(() => {
    setTick(t => t + 1)
  })

  const activeDeliveries = deliveriesRef.current
  const pickupNodes = pickupNodesRef.current
  const taxis = taxisRef.current

  // Debug logging (only log occasionally to avoid spam)
  if (Math.random() < 0.01) { // ~1% of frames
    console.log(`📦 DeliveryManager: ${activeDeliveries.length} active deliveries, ${pickupNodes.length} pickup nodes`)
    // console.log(`   Waiting pickups: ${activeDeliveries.filter(d => d.status === 'waiting_pickup').length}`)
    // console.log(`   In transit: ${activeDeliveries.filter(d => d.status === 'in_transit').length}`)
  }

  return (
    <group>
      {/* Render pickup indicators for waiting deliveries */}
      {activeDeliveries
        .filter(d => d.status === 'waiting_pickup')
        .map(delivery => {
          const node = pickupNodes.find(n => n.id === delivery.pickupNodeId)
          if (!node) return null

          return (
            <PickupIndicator
              key={`pickup-${delivery.id}`}
              position={node.position}
              color={delivery.color}
            />
          )
        })}

      {/* Render dropoff indicators for in-transit deliveries */}
      {activeDeliveries
        .filter(d => d.status === 'in_transit')
        .map(delivery => {
          const node = pickupNodes.find(n => n.id === delivery.dropoffNodeId)
          if (!node) return null

          return (
            <DropoffIndicator
              key={`dropoff-${delivery.id}`}
              position={node.position}
              color={delivery.color}
            />
          )
        })}

      {/* Render package indicators for taxis carrying packages */}
      {taxis
        .filter(taxi => taxi.hasPackage && taxi.path)
        .map(taxi => {
          // Calculate taxi position from path
          const points = taxi.path!.points
          if (points.length < 2) return null

          const segmentLength = 1 / (points.length - 1)
          const segmentIndex = Math.floor(taxi.t / segmentLength)
          const localT = (taxi.t % segmentLength) / segmentLength

          const p1 = points[Math.min(segmentIndex, points.length - 2)]
          const p2 = points[Math.min(segmentIndex + 1, points.length - 1)]
          const taxiPosition = p1.clone().lerp(p2, localT)

          // Find the delivery to get its color
          const delivery = activeDeliveries.find(d => d.id === taxi.currentDeliveryId)
          const color = delivery?.color || '#ffff00' // Fallback to yellow

          return (
            <PackageIndicator
              key={`package-${taxi.id}`}
              taxiPosition={taxiPosition}
              color={color}
            />
          )
        })}
    </group>
  )
}
