'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { dialogueSteps } from '@/config/dialogueSteps'
import { MaxwellRef } from '@/components/Maxwell'
import buttonStyles from '@/styles/components/buttons.module.css'
import styles from '@/styles/pages/DialogueScene.module.css'

// Load Canvas only on client side
const DialogueSceneCanvas = dynamic(() => import('./DialogueSceneCanvas'), {
  ssr: false,
})

interface DialogueSceneProps {
  onClose: () => void
}

/**
 * Cinematic dialogue scene with Maxwell character
 * Replaces ImageCarousel with 3D animated sequence
 */
export default function DialogueScene({ onClose }: DialogueSceneProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const characterRef = useRef<MaxwellRef | null>(null)

  const step = dialogueSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === dialogueSteps.length - 1

  // Trigger animation when step changes
  useEffect(() => {
    if (characterRef.current && step.animation) {
      characterRef.current.playAnimation(step.animation)
    } else if (characterRef.current) {
      characterRef.current.playAnimation(null)
    }
  }, [currentStep, step.animation])

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onClose()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }, [isLastStep, onClose])

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [isFirstStep])

  const handleSkip = useCallback(() => {
    onClose()
  }, [onClose])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault()
          handleNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
        case 'Escape':
          e.preventDefault()
          handleSkip()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrevious, handleSkip])

  return (
    <div className={styles.dialogueContainer}>
      {/* 3D Scene */}
      <DialogueSceneCanvas characterRef={characterRef} initialAnimation={dialogueSteps[0].animation ?? undefined} />

      {/* UI Overlay */}
      <div className={styles.dialogueOverlay}>
        {/* Skip button */}
        <button
          className={`${buttonStyles.icon} ${styles.skipButton}`}
          onClick={handleSkip}
          title="Skip intro"
        >
          <X size={24} />
        </button>

        {/* Centered dialogue text */}
        <div className={styles.dialogueContent}>
          <h1 key={currentStep} className={styles.dialogueTitle}>
            {step.title}
          </h1>
          {step.description && (
            <p className={styles.dialogueDescription}>{step.description}</p>
          )}
        </div>

        {/* Bottom navigation */}
        <div className={styles.navigationArea}>
          {/* Progress dots */}
          <div className={styles.progressDots}>
            {dialogueSteps.map((_, index) => (
              <div
                key={index}
                className={`${styles.progressDot} ${
                  index === currentStep ? styles.progressDotActive : ''
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className={styles.buttonGroup}>
            {!isFirstStep && (
              <button className={buttonStyles.secondary} onClick={handlePrevious}>
                Previous
              </button>
            )}
            <button className={buttonStyles.primary} onClick={handleNext}>
              {step.nextButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
