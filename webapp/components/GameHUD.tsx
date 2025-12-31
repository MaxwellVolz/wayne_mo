'use client'

import { useState, useEffect, type MutableRefObject } from 'react'
import type { Taxi } from '@/types/game'
import { getRoadNetwork } from '@/data/roads'

interface GameHUDProps {
  taxisRef: MutableRefObject<Taxi[]>
}

/**
 * Game HUD overlay - renders outside the Three.js Canvas
 * Shows total money and provides controls for spawning taxis
 */
export function GameHUD({ taxisRef }: GameHUDProps) {
  const [totalMoney, setTotalMoney] = useState(0)
  const [taxiCount, setTaxiCount] = useState(1)

  // Update total money periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const total = taxisRef.current.reduce((sum, taxi) => sum + taxi.money, 0)
      setTotalMoney(total)
      setTaxiCount(taxisRef.current.length)
    }, 100) // Update 10 times per second

    return () => clearInterval(interval)
  }, [taxisRef])

  const handleSpawnTaxi = () => {
    const network = getRoadNetwork()
    if (network.paths.length === 0) {
      console.warn('⚠️ No paths available to spawn taxi')
      return
    }

    // Find a path that starts from an intersection for variety
    const intersectionPaths = network.paths.filter((p) =>
      p.id.includes('Intersection')
    )
    const startPath = intersectionPaths.length > 0
      ? intersectionPaths[Math.floor(Math.random() * intersectionPaths.length)]
      : network.paths[0]

    const newTaxi: Taxi = {
      id: `taxi-${taxisRef.current.length + 1}`,
      state: 'driving_to_pickup',
      path: startPath,
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
    }

    taxisRef.current.push(newTaxi)
    console.log(`🚕 Spawned ${newTaxi.id} on path ${startPath.id}`)
  }

  return (
    <>
      {/* Top bar with taxi count and spawn button */}
      <div className="top-bar">
        <div className="taxi-info">
          Taxis: {taxiCount}
        </div>
        <button
          className="spawn-button"
          onClick={handleSpawnTaxi}
        >
          + Spawn Taxi
        </button>
      </div>

      {/* Bottom right - total money */}
      <div className="money-display">
        ${totalMoney}
      </div>

      <style jsx>{`
        .top-bar {
          position: fixed;
          top: 20px;
          left: 20px;
          display: flex;
          gap: 16px;
          align-items: center;
          pointer-events: auto;
          z-index: 100;
        }

        .taxi-info {
          font-size: 24px;
          font-weight: bold;
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          font-family: monospace;
          background: rgba(0, 0, 0, 0.5);
          padding: 8px 16px;
          border-radius: 4px;
        }

        .spawn-button {
          font-size: 18px;
          font-weight: bold;
          padding: 8px 16px;
          background: #00ff00;
          color: #000000;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
          transition: all 0.2s;
        }

        .spawn-button:hover {
          background: #00dd00;
          transform: scale(1.05);
        }

        .spawn-button:active {
          transform: scale(0.95);
        }

        .money-display {
          position: fixed;
          bottom: 20px;
          right: 20px;
          font-size: 32px;
          font-weight: bold;
          color: #ffff00;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          font-family: monospace;
          pointer-events: none;
          z-index: 100;
        }
      `}</style>
    </>
  )
}
