'use client'

import { useState, useEffect, type MutableRefObject } from 'react'
import { Play, Pause } from 'lucide-react'
import type { Taxi } from '@/types/game'
import { getRoadNetwork } from '@/data/roads'
import buttonStyles from '@/styles/components/buttons.module.css'
import displayStyles from '@/styles/components/displays.module.css'
import positionStyles from '@/styles/utilities/positioning.module.css'
import styles from '@/styles/pages/GameHUD.module.css'

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
      <div className={positionStyles.topLeft}>
        <button
          className={buttonStyles.primary}
          onClick={handleSpawnTaxi}
          disabled={!canAffordTaxi}
        >
          + Taxi (${nextTaxiCost})
        </button>
      </div>

      {/* Top center - timer */}
      <div className={displayStyles.timerDisplay}>
        {secondsRemaining}
      </div>

      {/* Top right - total money */}
      <div className={displayStyles.moneyDisplay}>
        ${totalMoney}
      </div>

      {/* Bottom right - pause button */}
      <div className={positionStyles.bottomRight}>
        <button
          className={buttonStyles.icon}
          onClick={onTogglePause}
          title={isPaused ? 'Resume Game ($0)' : 'Pause Game ($10)'}
        >
          {isPaused ? <Play size={24} /> : <Pause size={24} />}
        </button>
      </div>

      {/* RUSH HOUR banner */}
      {showRushHourBanner && (
        <div className={styles.rushHourBanner}>
          <div className={styles.rushHourText}>RUSH HOUR</div>
        </div>
      )}
    </>
  )
}
