'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Play, Pause } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTutorialGameLoop } from '@/hooks/useTutorialGameLoop'
import { TaxiControls } from './TaxiControls'

// Load Scene only on client side
const TutorialGameScene = dynamic(() => import('./TutorialGameScene'), {
  ssr: false,
})

interface TutorialSceneProps {
  onComplete: () => void
  onClose: () => void
}

/**
 * Tutorial level teaching how to make a car turn at an intersection
 */
export default function TutorialScene({ onComplete, onClose }: TutorialSceneProps) {
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

  const handleClose = () => {
    setShowModal(false)
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
    <div className="tutorial-container">
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
      <div className="tutorial-overlay">
        {/* Taxi camera controls */}
        <TaxiControls
          taxisRef={taxisRef}
          onTaxiSelect={handleTaxiSelect}
          onResetCamera={handleResetCamera}
          selectedTaxiId={selectedTaxiId}
        />

        {/* Control buttons (top left) */}
        <div className="top-left-buttons">
          <button className="start-game-button" onClick={handleStartGame}>
            Start Game
          </button>
          {!showModal && (
            <button className="show-tutorial-button" onClick={handleShowModal}>
              Show Tutorial
            </button>
          )}
        </div>

        {/* Pause button */}
        <div className="pause-container">
          <button className="pause-button" onClick={handleTogglePause}>
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
        </div>

        {/* Money display */}
        <div className="money-display">
          ${taxisRef.current[0]?.money || 0}
        </div>

        {/* Instruction panel */}
        {showModal && (
          <div className="instruction-panel">
            <h2 className="step-title">{currentStep.title}</h2>
            <p className="step-description">{currentStep.description}</p>

            <div className="button-group">
              {step > 0 && (
                <button className="previous-button" onClick={handlePrevious}>
                  Previous
                </button>
              )}
              <button className="next-button" onClick={handleNext}>
                {step < tutorialSteps.length - 1 ? 'Next' : 'Play Tutorial'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .tutorial-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #000;
        }

        .tutorial-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
        }

        .top-left-buttons {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: auto;
        }

        .start-game-button {
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

        .start-game-button:hover {
          background: #00dd00;
          transform: scale(1.05);
        }

        .start-game-button:active {
          transform: scale(0.95);
        }

        .show-tutorial-button {
          background: transparent;
          color: #fff;
          border: 2px solid #ffff00;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(255, 255, 0, 0.2);
        }

        .show-tutorial-button:hover {
          background: rgba(255, 255, 0, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 255, 0, 0.3);
        }

        .pause-container {
          position: absolute;
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
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

        .instruction-panel {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.9);
          border-top: 3px solid #ffff00;
          padding: 2rem;
          width: 100%;
          pointer-events: auto;
          box-shadow: 0 -8px 32px rgba(255, 255, 0, 0.3);
          z-index: 50;
          min-height: 180px;
        }

        .step-title {
          color: #ffff00;
          font-size: 1.5rem;
          font-weight: 900;
          margin: 0 0 0.75rem 0;
          text-align: center;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .step-description {
          color: #ffffff;
          font-size: 1rem;
          margin: 0 0 1.5rem 0;
          padding: 0 2rem;
          text-align: center;
          line-height: 1.6;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .next-button, .previous-button {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .next-button {
          background: #ffff00;
          color: #000;
          box-shadow: 0 4px 12px rgba(255, 255, 0, 0.4);
        }

        .next-button:hover {
          background: #fff200;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 255, 0, 0.5);
        }

        .previous-button {
          background: transparent;
          color: #fff;
          border: 2px solid #666;
        }

        .previous-button:hover {
          border-color: #fff;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .instruction-panel {
            padding: 1.5rem 1rem;
          }

          .step-title {
            font-size: 1.25rem;
          }

          .step-description {
            font-size: 0.9rem;
            margin-bottom: 1.25rem;
          }

          .next-button, .previous-button {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
          }

          .top-left-buttons {
            top: 10px;
            left: 10px;
            gap: 8px;
          }

          .start-game-button {
            padding: 6px 12px;
            font-size: 14px;
          }

          .show-tutorial-button {
            padding: 6px 12px;
            font-size: 14px;
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
        }

        @media (max-width: 480px) {
          .instruction-panel {
            padding: 1.25rem 0.75rem;
          }

          .step-title {
            font-size: 1.1rem;
          }

          .step-description {
            font-size: 0.85rem;
            margin-bottom: 1rem;
          }

          .next-button, .previous-button {
            padding: 0.65rem 1.25rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  )
}
