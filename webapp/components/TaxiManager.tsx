'use client'

import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { MutableRefObject } from 'react'
import type { Taxi as TaxiType } from '@/types/game'
import Taxi from './Taxi'

interface TaxiManagerProps {
  taxisRef: MutableRefObject<TaxiType[]>
}

/**
 * Manages rendering of all taxis
 * Uses useState + useFrame to re-render when taxis are added/removed
 */
export function TaxiManager({ taxisRef }: TaxiManagerProps) {
  // Force re-render every frame to show new taxis
  const [, setTick] = useState(0)

  useFrame(() => {
    setTick(t => t + 1)
  })

  const taxis = taxisRef.current

  return (
    <group>
      {taxis.map((taxi) => (
        <Taxi key={taxi.id} taxi={taxi} />
      ))}
    </group>
  )
}
