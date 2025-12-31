'use client'

import { useState } from 'react'
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
      money: 0,
      isReversing: false,
      collisionCooldown: 0,
    }]
    deliveriesRef.current = []
    deliveryTimerRef.current = 10000
    initialSpawnDoneRef.current = false // Reset to allow initial spawn again

    setGameOver(false)
    setFinalScore(0)
    setGameKey(prev => prev + 1) // Force remount to reset all state
  }

  return (
    <div className="game-container" key={gameKey}>
      {/* Three.js scene */}
      <Scene
        taxisRef={taxisRef}
        deliveriesRef={deliveriesRef}
        pickupNodesRef={pickupNodesRef}
        deliveryTimerRef={deliveryTimerRef}
      />

      {/* UI overlay */}
      <div className="ui-overlay">
        <GameHUD taxisRef={taxisRef} onGameOver={handleGameOver} />
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
      `}</style>
    </div>
  )
}
