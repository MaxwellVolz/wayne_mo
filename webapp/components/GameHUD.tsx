'use client'

import { useState, useEffect, type MutableRefObject } from 'react'
import { Play, Pause } from 'lucide-react'
import type { Taxi } from '@/types/game'
import { getRoadNetwork } from '@/data/roads'

interface GameHUDProps {
  taxisRef: MutableRefObject<Taxi[]>
  onGameOver: (finalScore: number) => void
  isPaused: boolean
  onTogglePause: () => void
  onRushHourChange?: (isRushHour: boolean) => void
}

const INITIAL_TAXI_COST = 300
const TAXI_COST_INCREMENT = 100
const GAME_DURATION = 120 // seconds

/**
 * Game HUD overlay - renders outside the Three.js Canvas
 * Shows total money and provides controls for spawning taxis
 */
export function GameHUD({ taxisRef, onGameOver, isPaused, onTogglePause, onRushHourChange }: GameHUDProps) {
  const [totalMoney, setTotalMoney] = useState(0)
  const [nextTaxiCost, setNextTaxiCost] = useState(INITIAL_TAXI_COST)
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [isRushHour, setIsRushHour] = useState(false)
  const [showRushHourBanner, setShowRushHourBanner] = useState(false)

  // Update total money and timer periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const total = taxisRef.current.reduce((sum, taxi) => sum + taxi.money, 0)
      setTotalMoney(total)

      // Only update timer when not paused
      if (!isPaused) {
        const now = Date.now()
        const delta = (now - lastUpdateTime) / 1000
        setLastUpdateTime(now)

        const newElapsed = elapsedTime + delta
        setElapsedTime(newElapsed)

        const remaining = Math.max(0, GAME_DURATION - newElapsed)
        setTimeRemaining(remaining)

        // Check for RUSH HOUR at 30 seconds
        if (remaining <= 30 && remaining > 0 && !isRushHour) {
          setIsRushHour(true)
          setShowRushHourBanner(true)
          onRushHourChange?.(true)

          // Hide banner after 3 seconds
          setTimeout(() => {
            setShowRushHourBanner(false)
          }, 3000)
        }

        // Check if game over
        if (remaining <= 0) {
          onGameOver(total)
        }
      } else {
        // Update lastUpdateTime even when paused to avoid time jump
        setLastUpdateTime(Date.now())
      }
    }, 100) // Update 10 times per second

    return () => clearInterval(interval)
  }, [taxisRef, onGameOver, isPaused, elapsedTime, lastUpdateTime, isRushHour, onRushHourChange])

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

    // Find a path that starts FROM INT_bottom_left (exact spawn position)
    const spawnPaths = network.paths.filter((p) =>
      p.id.startsWith('INT_bottom_left_to_')
    )
    const startPath = spawnPaths.length > 0 ? spawnPaths[0] : network.paths[0]

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
      {/* Top left - spawn button */}
      <div className="top-bar">
        <button
          className="spawn-button"
          onClick={handleSpawnTaxi}
          disabled={!canAffordTaxi}
        >
          + Taxi (${nextTaxiCost})
        </button>
      </div>

      {/* Top center - timer */}
      <div className="timer-display">
        {secondsRemaining}
      </div>

      {/* Top right - total money */}
      <div className="money-display">
        ${totalMoney}
      </div>

      {/* Bottom right - pause button */}
      <div className="pause-container">
        <button
          className="pause-button"
          onClick={onTogglePause}
          title={isPaused ? 'Resume Game ($0)' : 'Pause Game ($10)'}
        >
          {isPaused ? <Play className="icon" size={24} /> : <Pause className="icon" size={24} />}
        </button>
      </div>

      {/* RUSH HOUR banner */}
      {showRushHourBanner && (
        <div className="rush-hour-banner">
          <div className="rush-hour-text">RUSH HOUR</div>
        </div>
      )}

      <style jsx>{`
        .top-bar {
          position: fixed;
          top: 20px;
          left: 20px;
          pointer-events: auto;
          z-index: 100;
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
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 32px;
          font-weight: bold;
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          font-family: monospace;
          padding: 8px 16px;
          border-radius: 4px;
          min-width: 80px;
          text-align: center;
          background: rgba(0, 0, 0, 0.5);
          pointer-events: none;
          z-index: 100;
        }

        .pause-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          pointer-events: auto;
          z-index: 100;
        }

        .pause-button {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.9);
          color: #000000;
          border: 2px solid #333;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .pause-button:hover {
          background: #ffffff;
          transform: scale(1.1);
          border-color: #ff8800;
        }

        .pause-button:active {
          transform: scale(0.95);
        }

        .icon {
          width: 24px;
          height: 24px;
        }

        .money-display {
          position: fixed;
          top: 20px;
          right: 20px;
          font-size: 32px;
          font-weight: bold;
          color: #ffff00;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          font-family: monospace;
          pointer-events: none;
          z-index: 100;
        }

        .rush-hour-banner {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #ff0000, #ff8800, #ff0000);
          padding: 40px 80px;
          border-radius: 20px;
          border: 6px solid #ffff00;
          box-shadow: 0 0 40px rgba(255, 0, 0, 0.8), inset 0 0 20px rgba(255, 255, 0, 0.5);
          pointer-events: none;
          z-index: 200;
          animation: rushHourPulse 0.5s ease-in-out infinite alternate, rushHourZoom 0.3s ease-out;
        }

        .rush-hour-text {
          font-size: 80px;
          font-weight: bold;
          color: #ffffff;
          text-shadow:
            4px 4px 8px rgba(0,0,0,0.9),
            0 0 20px #ffff00,
            0 0 40px #ff8800;
          font-family: 'Impact', monospace;
          letter-spacing: 8px;
        }

        @keyframes rushHourPulse {
          from {
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            transform: translate(-50%, -50%) scale(1.05);
          }
        }

        @keyframes rushHourZoom {
          from {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .top-bar {
            top: 10px;
            left: 10px;
          }

          .spawn-button {
            font-size: 14px;
            padding: 6px 12px;
          }

          .timer-display {
            top: 10px;
            font-size: 24px;
            padding: 6px 12px;
            min-width: 60px;
          }

          .money-display {
            top: 10px;
            right: 10px;
            font-size: 24px;
          }

          .pause-container {
            bottom: 10px;
            right: 10px;
          }

          .pause-button {
            width: 40px;
            height: 40px;
          }

          .icon {
            width: 20px;
            height: 20px;
          }

          .rush-hour-banner {
            padding: 20px 40px;
            border: 4px solid #ffff00;
          }

          .rush-hour-text {
            font-size: 48px;
            letter-spacing: 4px;
          }
        }
      `}</style>
    </>
  )
}
