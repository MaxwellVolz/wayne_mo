'use client'

import { useState, useCallback, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTutorialGameLoop } from '@/hooks/useTutorialGameLoop'
import { TaxiControls } from './TaxiControls'
import buttonStyles from '@/styles/components/buttons.module.css'
import displayStyles from '@/styles/components/displays.module.css'
import positionStyles from '@/styles/utilities/positioning.module.css'
import styles from '@/styles/pages/TutorialScene.module.css'

// Load Scene only on client side
const TutorialGameScene = dynamic(() => import('./TutorialGameScene'), {
  ssr: false,
})

interface TutorialSceneProps {
  onComplete: () => void
}

/**
 * Tutorial level teaching how to make a car turn at an intersection
 */
export default function TutorialScene({ onComplete }: TutorialSceneProps) {
  const [step, setStep] = useState(0)
  const [selectedTaxiId, setSelectedTaxiId] = useState<string | null>('tutorial-taxi-1') // Start in chase cam mode
  const [isPaused, setIsPaused] = useState(false)
  const [showModal, setShowModal] = useState(true)

  // Tutorial game state
  const { taxisRef, deliveriesRef, pickupNodesRef, deliveryTimerRef } = useTutorialGameLoop()

  const tutorialSteps = [
    {
      title: "Camera Controls",
      description: "Bottom left icons set chase or overview.",
    },
    {
      title: "Run the Intersections",
      description: "Tap intersections to direct traffic!",
    },
    {
      title: "Deliver Packages",
      description: "Pick up packages and deliver them to matching color drop-offs.",
    },
  ]

  const currentStep = tutorialSteps[step]

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1)
    } else {
      setShowModal(false)
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleStartGame = () => {
    onComplete()
  }

  const handleShowModal = () => {
    setShowModal(true)
  }

  const handleTaxiSelect = useCallback((taxiId: string) => {
    // Toggle selection
    setSelectedTaxiId(prev => prev === taxiId ? null : taxiId)
  }, [])

  const handleResetCamera = useCallback(() => {
    setSelectedTaxiId(null)
  }, [])

  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  // Add keyboard support for pause (Space bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault() // Prevent page scroll
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
        <div className={positionStyles.topLeft} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className={buttonStyles.primary} onClick={handleStartGame}>
            Start Game
          </button>
          {!showModal && (
            <button className={buttonStyles.secondary} onClick={handleShowModal}>
              Show Tutorial
            </button>
          )}
        </div>

        {/* Pause button */}
        <div className={positionStyles.bottomRight}>
          <button className={buttonStyles.icon} onClick={handleTogglePause}>
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
        </div>

        {/* Money display */}
        <div className={displayStyles.moneyDisplay}>
          ${taxisRef.current[0]?.money || 0}
        </div>

        {/* Instruction panel */}
        {showModal && (
          <div className={styles.instructionPanel}>
            <h2 className={styles.stepTitle}>{currentStep.title}</h2>
            <p className={styles.stepDescription}>{currentStep.description}</p>

            <div className={styles.buttonGroup}>
              {step > 0 && (
                <button className={buttonStyles.secondary} onClick={handlePrevious}>
                  Previous
                </button>
              )}
              <button className={buttonStyles.primary} onClick={handleNext}>
                {step < tutorialSteps.length - 1 ? 'Next' : 'Play Tutorial'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
