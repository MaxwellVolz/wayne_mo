'use client'

import { useState, useEffect, useRef, type MutableRefObject } from 'react'
import { Play, Pause, RotateCcw, X, ChevronDown } from 'lucide-react'
import type { Taxi } from '@/types/game'
import { playRushHourSound, playGameOverSound } from '@/lib/audioManager'
import { MuteButton } from './MuteButton'
import { KeyboardHints } from './KeyboardHints'
import { SettingsPanel } from './SettingsPanel'
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
  onReset: () => void
  onExit: () => void
}

const GAME_DURATION = 120 // seconds

/**
 * Game HUD overlay - renders outside the Three.js Canvas
 * Shows timer, money display, pause button, reset button, exit button, and rush hour banner
 */
export function GameHUD({ taxisRef, onGameOver, isPaused, onTogglePause, onRushHourChange, onReset, onExit }: GameHUDProps) {
  const [totalMoney, setTotalMoney] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [isRushHour, setIsRushHour] = useState(false)
  const [showRushHourBanner, setShowRushHourBanner] = useState(false)
  const [hudVisible, setHudVisible] = useState(false)
  const [showPauseArrow, setShowPauseArrow] = useState(true)
  const [arrowOpacity, setArrowOpacity] = useState(1)

  // Use ref to avoid recreating interval on pause state change
  const isPausedRef = useRef(isPaused)
  const gameOverCalledRef = useRef(false) // Prevent multiple onGameOver calls

  // Keep ref in sync with state
  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  // Fade in HUD after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setHudVisible(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Fade out pause arrow after 3 seconds (starts when HUD becomes visible)
  useEffect(() => {
    if (!hudVisible) return

    const fadeStart = 2500 // Start fading at 2.5s after HUD visible
    const fadeEnd = 3500 // Fully gone at 3.5s
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      if (elapsed >= fadeEnd) {
        setShowPauseArrow(false)
        clearInterval(interval)
      } else if (elapsed >= fadeStart) {
        const fadeProgress = (elapsed - fadeStart) / (fadeEnd - fadeStart)
        setArrowOpacity(1 - fadeProgress)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [hudVisible])

  // Update total money and timer periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const total = taxisRef.current.reduce((sum, taxi) => sum + taxi.money, 0)
      setTotalMoney(total)

      // Only update timer when not paused (use ref to avoid recreating interval)
      if (!isPausedRef.current) {
        setLastUpdateTime(prevLastUpdate => {
          const now = Date.now()
          const delta = (now - prevLastUpdate) / 1000

          setElapsedTime(prevElapsed => {
            const newElapsed = prevElapsed + delta

            const remaining = Math.max(0, GAME_DURATION - newElapsed)
            setTimeRemaining(remaining)

            // Check for RUSH HOUR at 30 seconds
            if (remaining <= 30 && remaining > 0 && !isRushHour) {
              setIsRushHour(true)
              setShowRushHourBanner(true)
              onRushHourChange?.(true)
              playRushHourSound()

              // Hide banner after 3 seconds
              setTimeout(() => {
                setShowRushHourBanner(false)
              }, 3000)
            }

            // Check if game over (use ref to prevent multiple calls)
            if (remaining <= 0 && !gameOverCalledRef.current) {
              gameOverCalledRef.current = true
              playGameOverSound()
              onGameOver(total)
            }

            return newElapsed
          })

          return now
        })
      } else {
        // Update lastUpdateTime even when paused to avoid time jump
        setLastUpdateTime(Date.now())
      }
    }, 100) // Update 10 times per second

    return () => clearInterval(interval)
  }, [taxisRef, onGameOver, isRushHour, onRushHourChange])

  const secondsRemaining = Math.floor(timeRemaining)
  const millisecondsRemaining = Math.floor((timeRemaining % 1) * 100)

  return (
    <>
      {/* HUD container with fade-in effect */}
      <div
        style={{
          opacity: hudVisible ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          pointerEvents: hudVisible ? 'auto' : 'none',
        }}
      >
        {/* Top left - reset, exit, and mute buttons */}
        <div className={positionStyles.topLeft} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className={buttonStyles.icon}
            onClick={onReset}
            title="Reset Game"
          >
            <RotateCcw size={24} />
          </button>
          <button
            className={buttonStyles.icon}
            onClick={onExit}
            title="Exit to Menu"
          >
            <X size={24} />
          </button>
          <MuteButton />
          <KeyboardHints />
          <SettingsPanel />
        </div>

        {/* Top center - timer */}
        <div className={displayStyles.timerDisplay}>
          <span className={displayStyles.timerSeconds}>{secondsRemaining}</span>
          <span className={displayStyles.timerSymbol}>&quot;</span>
          <span className={displayStyles.timerMs}>{millisecondsRemaining.toString().padStart(2, '0')}</span>
        </div>

        {/* Top right - total money */}
        <div className={displayStyles.moneyDisplay}>
          ${totalMoney}
        </div>

        {/* Bottom right - pause button with bouncing arrow */}
        <div className={positionStyles.bottomRight} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Bouncing arrow pointing at pause button */}
          {showPauseArrow && (
            <div
              style={{
                animation: 'bounce 0.5s ease-in-out infinite',
                opacity: arrowOpacity,
                marginBottom: '8px',
                filter: 'drop-shadow(0 0 8px #ffff00)',
              }}
            >
              <ChevronDown size={32} color="#ffff00" strokeWidth={3} />
            </div>
          )}
          <button
            className={styles.pauseButton}
            onClick={onTogglePause}
            title={isPaused ? 'Resume Game ($0)' : 'Pause Game ($10)'}
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
        </div>
      </div>

      {/* RUSH HOUR banner (outside fade container - has own animation) */}
      {showRushHourBanner && (
        <div className={styles.rushHourBanner}>
          <div className={styles.rushHourText}>RUSH HOUR</div>
        </div>
      )}
    </>
  )
}
