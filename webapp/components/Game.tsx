'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useGameLoop } from '@/hooks/useGameLoop'
import { GameHUD } from './GameHUD'
import { GameOverModal } from './GameOverModal'
import { TaxiControls } from './TaxiControls'
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
  const [selectedTaxiId, setSelectedTaxiId] = useState<string | null>(null)

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

    // Find a path that starts FROM INT_bottom_left (exact spawn position)
    const spawnPaths = network.paths.filter((p) =>
      p.id.startsWith('INT_bottom_left_to_')
    )
    const startPath = spawnPaths.length > 0 ? spawnPaths[0] : network.paths[0]

    taxisRef.current = [{
      id: 'taxi-1',
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

  const handleTaxiSelect = useCallback((taxiId: string) => {
    // Toggle selection - if already selected, deselect
    setSelectedTaxiId(prev => prev === taxiId ? null : taxiId)
  }, [])

  const handleResetCamera = useCallback(() => {
    // Deselect any followed taxi to return to center view
    setSelectedTaxiId(null)
  }, [])

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
        followTaxiId={selectedTaxiId}
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
        <TaxiControls
          taxisRef={taxisRef}
          onTaxiSelect={handleTaxiSelect}
          onResetCamera={handleResetCamera}
          selectedTaxiId={selectedTaxiId}
        />
        {debugMode && (
          <div className="debug-indicator">DEBUG MODE (Press D to toggle)</div>
        )}
      </div>

      {/* Game over modal */}
      {gameOver && (
        <GameOverModal score={finalScore} onRestart={handleRestart} />
      )}
    </div>
  )
}
