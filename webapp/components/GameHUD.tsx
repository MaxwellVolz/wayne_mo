'use client'

import { useState, useEffect, type MutableRefObject } from 'react'
import { Play, Pause } from 'lucide-react'
import type { Taxi } from '@/types/game'
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

const GAME_DURATION = 120 // seconds

/**
 * Game HUD overlay - renders outside the Three.js Canvas
 * Shows timer, money display, pause button, and rush hour banner
 */
export function GameHUD({ taxisRef, onGameOver, isPaused, onTogglePause, onRushHourChange }: GameHUDProps) {
  const [totalMoney, setTotalMoney] = useState(0)
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

  const secondsRemaining = Math.floor(timeRemaining)

  return (
    <>
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
