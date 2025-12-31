'use client'

import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { MutableRefObject } from 'react'
import type { Taxi } from '@/types/game'

interface ScoreDisplayProps {
  taxisRef: MutableRefObject<Taxi[]>
}

/**
 * Displays total money earned in the bottom right corner
 */
export function ScoreDisplay({ taxisRef }: ScoreDisplayProps) {
  const [totalMoney, setTotalMoney] = useState(0)

  // Update total money every frame
  useFrame(() => {
    const total = taxisRef.current.reduce((sum, taxi) => sum + taxi.money, 0)
    setTotalMoney(total)
  })

  return (
    <Html
      fullscreen
      style={{
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#ffff00',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          fontFamily: 'monospace',
        }}
      >
        ${totalMoney}
      </div>
    </Html>
  )
}
