'use client'

import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { MutableRefObject } from 'react'
import type { Taxi as TaxiType, DeliveryEvent } from '@/types/game'
import Taxi from './Taxi'

interface TaxiManagerProps {
  taxisRef: MutableRefObject<TaxiType[]>
  deliveriesRef: MutableRefObject<DeliveryEvent[]>
  isPaused: boolean
}

/**
 * Manages rendering of all taxis
 * Uses useState + useFrame to re-render when taxis are added/removed
 */
export function TaxiManager({ taxisRef, deliveriesRef, isPaused }: TaxiManagerProps) {
  // Force re-render every frame to show new taxis
  const [, setTick] = useState(0)

  useFrame(() => {
    setTick(t => t + 1)
  })

  const taxis = taxisRef.current
  const deliveries = deliveriesRef.current

  return (
    <group>
      {taxis.map((taxi) => {
        // Find the delivery this taxi is carrying
        const delivery = deliveries.find(d => d.id === taxi.currentDeliveryId)

        return (
          <Taxi
            key={taxi.id}
            taxi={taxi}
            isPaused={isPaused}
            deliveryColor={delivery?.color}
          />
        )
      })}
    </group>
  )
}
