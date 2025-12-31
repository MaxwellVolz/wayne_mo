'use client'

import { useState, useEffect, type MutableRefObject } from 'react'
import type { Taxi } from '@/types/game'
import { getRoadNetwork } from '@/data/roads'

interface GameHUDProps {
  taxisRef: MutableRefObject<Taxi[]>
  onGameOver: (finalScore: number) => void
}

const INITIAL_TAXI_COST = 300
const TAXI_COST_INCREMENT = 100
const GAME_DURATION = 120 // seconds

/**
 * Game HUD overlay - renders outside the Three.js Canvas
 * Shows total money and provides controls for spawning taxis
 */
export function GameHUD({ taxisRef, onGameOver }: GameHUDProps) {
  const [totalMoney, setTotalMoney] = useState(0)
  const [taxiCount, setTaxiCount] = useState(1)
  const [nextTaxiCost, setNextTaxiCost] = useState(INITIAL_TAXI_COST)
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION)
  const [gameStartTime] = useState(Date.now())

  // Update total money and timer periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const total = taxisRef.current.reduce((sum, taxi) => sum + taxi.money, 0)
      setTotalMoney(total)
      setTaxiCount(taxisRef.current.length)

      // Update timer
      const elapsed = (Date.now() - gameStartTime) / 1000
      const remaining = Math.max(0, GAME_DURATION - elapsed)
      setTimeRemaining(remaining)

      // Check if game over
      if (remaining <= 0) {
        onGameOver(total)
      }
    }, 100) // Update 10 times per second

    return () => clearInterval(interval)
  }, [taxisRef, gameStartTime, onGameOver])

  const handleSpawnTaxi = () => {
    // Check if player can afford it
    if (totalMoney < nextTaxiCost) {
      console.log(`❌ Not enough money! Need $${nextTaxiCost}, have $${totalMoney}`)
      return
    }

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
      money: -nextTaxiCost, // Deduct cost from this taxi's money
      isReversing: false,
      collisionCooldown: 0,
    }

    taxisRef.current.push(newTaxi)
    console.log(`🚕 Spawned ${newTaxi.id} on path ${startPath.id} for $${nextTaxiCost}`)

    // Increase cost for next taxi
    setNextTaxiCost(nextTaxiCost + TAXI_COST_INCREMENT)
  }

  const canAffordTaxi = totalMoney >= nextTaxiCost
  const secondsRemaining = Math.floor(timeRemaining)

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
          disabled={!canAffordTaxi}
        >
          + Spawn Taxi (${nextTaxiCost})
        </button>
      </div>

      {/* Bottom left - timer */}
      <div className="timer-display">
        {secondsRemaining}
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

        .spawn-button:disabled {
          background: #666666;
          color: #999999;
          cursor: not-allowed;
          transform: none;
        }

        .spawn-button:disabled:hover {
          background: #666666;
          transform: none;
        }

        .timer-display {
          position: fixed;
          bottom: 20px;
          left: 20px;
          font-size: 32px;
          font-weight: bold;
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          font-family: monospace;
          pointer-events: none;
          z-index: 100;
          padding: 8px 16px;
          border-radius: 4px;
          min-width: 80px;
          text-align: center;
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
