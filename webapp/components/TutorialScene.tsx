'use client'

import { useCallback, useEffect } from 'react'
import { Play, Pause, Trophy, ArrowLeft, ChevronDown } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTutorialGameLoop } from '@/hooks/useTutorialGameLoop'
import { TaxiControls } from './TaxiControls'
import buttonStyles from '@/styles/components/buttons.module.css'
import displayStyles from '@/styles/components/displays.module.css'
import positionStyles from '@/styles/utilities/positioning.module.css'
import styles from '@/styles/pages/TutorialScene.module.css'
import { useState } from 'react'

// Load Scene only on client side
const TutorialGameScene = dynamic(() => import('./TutorialGameScene'), {
  ssr: false,
})

interface TutorialSceneProps {
  onComplete: () => void
  onGoBack?: () => void
}

/**
 * Tutorial level - sandbox mode to practice before the main game
 */
export default function TutorialScene({ onComplete, onGoBack }: TutorialSceneProps) {
  const [selectedTaxiId, setSelectedTaxiId] = useState<string | null>('tutorial-taxi-1')
  const [isPaused, setIsPaused] = useState(true) // Start paused
  const [showPlayArrow, setShowPlayArrow] = useState(true)

  // Tutorial game state
  const { taxisRef, deliveriesRef, pickupNodesRef, deliveryTimerRef } = useTutorialGameLoop()

  const handleStartGame = () => {
    onComplete()
  }

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack()
    }
  }

  const handleTaxiSelect = useCallback((taxiId: string) => {
    setSelectedTaxiId(prev => prev === taxiId ? null : taxiId)
  }, [])

  const handleResetCamera = useCallback(() => {
    setSelectedTaxiId(null)
  }, [])

  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev)
    setShowPlayArrow(false) // Hide arrow after first interaction
  }, [])

  // Add keyboard support for pause (Space bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        handleTogglePause()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleTogglePause])

  return (
    <div className={styles.tutorialContainer}>
      {/* 3D Scene */}
      <TutorialGameScene
        taxisRef={taxisRef}
        deliveriesRef={deliveriesRef}
        pickupNodesRef={pickupNodesRef}
        deliveryTimerRef={deliveryTimerRef}
        followTaxiId={selectedTaxiId}
        isPaused={isPaused}
      />

      {/* Tutorial UI Overlay */}
      <div className={styles.tutorialOverlay}>
        {/* Taxi camera controls */}
        <TaxiControls
          taxisRef={taxisRef}
          onTaxiSelect={handleTaxiSelect}
          onResetCamera={handleResetCamera}
          selectedTaxiId={selectedTaxiId}
        />

        {/* Control buttons (top left) */}
        <div className={positionStyles.topLeft} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className={buttonStyles.icon}
            onClick={handleStartGame}
            title="Start Game"
          >
            <Trophy size={24} />
          </button>
          <button
            className={buttonStyles.icon}
            onClick={handleGoBack}
            title="Go Back to Menu"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Play/Pause button with bouncing arrow */}
        <div className={positionStyles.bottomRight} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Bouncing arrow pointing at play button */}
          {showPlayArrow && (
            <div
              style={{
                animation: 'bounce 0.5s ease-in-out infinite',
                marginBottom: '8px',
                filter: 'drop-shadow(0 0 8px #ffff00)',
              }}
            >
              <ChevronDown size={32} color="#ffff00" strokeWidth={3} />
            </div>
          )}
          <button className={buttonStyles.icon} onClick={handleTogglePause}>
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
        </div>

        {/* Money display */}
        <div className={displayStyles.moneyDisplay}>
          ${taxisRef.current[0]?.money || 0}
        </div>
      </div>
    </div>
  )
}
