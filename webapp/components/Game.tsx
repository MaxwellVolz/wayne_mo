'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useGameLoop } from '@/hooks/useGameLoop'
import { GameHUD } from './GameHUD'
import { GameOverModal } from './GameOverModal'
import { getRoadNetwork } from '@/data/roads'

// Load Scene only on client side (Three.js doesn't work with SSR)
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff'
    }}>
      Loading game...
    </div>
  ),
})

/**
 * Main game component
 * Houses the Three.js canvas and UI overlay
 */
export default function Game() {
  const [gameOver, setGameOver] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [gameKey, setGameKey] = useState(0) // Used to force remount on restart
  const [isPaused, setIsPaused] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [isRushHour, setIsRushHour] = useState(false)

  // Game state management
  const { taxisRef, deliveriesRef, pickupNodesRef, deliveryTimerRef, initialSpawnDoneRef } = useGameLoop()

  const handleGameOver = (score: number) => {
    if (!gameOver) { // Prevent multiple calls
      setFinalScore(score)
      setGameOver(true)
    }
  }

  const handleRestart = () => {
    // Reset all game state
    const network = getRoadNetwork()
    taxisRef.current = [{
      id: 'taxi-1',
      state: 'driving_to_pickup',
      path: network.paths[0] || null,
      t: 0,
      speed: 1.5,
      isFocused: false,
      currentIntersectionId: undefined,
      incomingDir: 0,
      previousNodeId: undefined,
      hasPackage: false,
      currentDeliveryId: undefined,
      money: 100, // Start with $100
      isReversing: false,
      collisionCooldown: 0,
    }]
    deliveriesRef.current = []
    deliveryTimerRef.current = 10000
    initialSpawnDoneRef.current = false // Reset to allow initial spawn again

    setGameOver(false)
    setFinalScore(0)
    setIsRushHour(false)
    setGameKey(prev => prev + 1) // Force remount to reset all state
  }

  const handleRushHourChange = (rushHour: boolean) => {
    setIsRushHour(rushHour)
    console.log(`🚦 RUSH HOUR ${rushHour ? 'ACTIVATED' : 'ENDED'}`)
  }

  const handleTogglePause = useCallback(() => {
    // Check if player can afford to pause (cost $10)
    const PAUSE_COST = 10
    const totalMoney = taxisRef.current.reduce((sum, taxi) => sum + taxi.money, 0)

    if (!isPaused && totalMoney < PAUSE_COST) {
      console.log(`❌ Not enough money to pause! Need $${PAUSE_COST}, have $${totalMoney}`)
      return
    }

    // Deduct pause cost when pausing
    if (!isPaused) {
      // Deduct $10 from first taxi
      if (taxisRef.current.length > 0) {
        taxisRef.current[0].money -= PAUSE_COST
        console.log(`⏸️ Paused - Deducted $${PAUSE_COST}`)
      }
    }

    setIsPaused(!isPaused)
  }, [isPaused, taxisRef])

  // Debug mode toggle with 'D' key and pause with Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        setDebugMode(prev => !prev)
      } else if (e.key === ' ' && !gameOver) {
        e.preventDefault() // Prevent page scroll
        handleTogglePause()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, handleTogglePause])

  return (
    <div className="game-container" key={gameKey}>
      {/* Three.js scene */}
      <Scene
        taxisRef={taxisRef}
        deliveriesRef={deliveriesRef}
        pickupNodesRef={pickupNodesRef}
        deliveryTimerRef={deliveryTimerRef}
        isPaused={isPaused}
        debugMode={debugMode}
        isRushHour={isRushHour}
      />

      {/* UI overlay */}
      <div className="ui-overlay">
        <GameHUD
          taxisRef={taxisRef}
          onGameOver={handleGameOver}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onRushHourChange={handleRushHourChange}
        />
        {debugMode && (
          <div className="debug-indicator">DEBUG MODE (Press D to toggle)</div>
        )}
      </div>

      {/* Game over modal */}
      {gameOver && (
        <GameOverModal score={finalScore} onRestart={handleRestart} />
      )}

      <style jsx>{`
        .game-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .ui-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          padding: 2rem;
        }

        .debug-indicator {
          position: fixed;
          top: 70px;
          right: 20px;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 14px;
          font-weight: bold;
          pointer-events: auto;
          z-index: 100;
        }

        @media (max-width: 768px) {
          .debug-indicator {
            top: 60px;
            right: 10px;
            font-size: 12px;
            padding: 6px 12px;
          }
        }

        @media (max-width: 480px) {
          .debug-indicator {
            top: 55px;
            right: 10px;
            font-size: 10px;
            padding: 4px 8px;
          }
        }
      `}</style>
    </div>
  )
}
