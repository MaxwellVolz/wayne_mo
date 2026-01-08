'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Game from '@/components/Game'
import IntroScene from '@/components/IntroScene'

// Lazy load tutorial scene
const TutorialScene = dynamic(() => import('@/components/TutorialScene'), {
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
      Loading tutorial...
    </div>
  ),
})

type GameMode = 'intro' | 'tutorial' | 'game'

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('intro')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [fadeInDuration, setFadeInDuration] = useState(1)

  // Fade in from black on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOverlay(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const transitionToMode = (newMode: GameMode) => {
    setIsTransitioning(true)
    setShowOverlay(true)

    // Wait for fade to black, then switch modes
    setTimeout(() => {
      setGameMode(newMode)
      setIsTransitioning(false)

      // Set longer fade-in for game scene
      if (newMode === 'game') {
        setFadeInDuration(4)
      } else {
        setFadeInDuration(.5)
      }

      // Fade in new scene
      setTimeout(() => {
        setShowOverlay(false)
      }, 100)
    }, 600) // Wait for fade out + small buffer
  }

  return (
    <>
      {/* Global transition overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          opacity: showOverlay ? 1 : 0,
          transition: `opacity ${showOverlay ? 0.6 : fadeInDuration}s ease-in-out`,
          pointerEvents: showOverlay ? 'all' : 'none',
          zIndex: 10000,
        }}
      />

      {/* Scene rendering */}
      {gameMode === 'intro' && (
        <IntroScene
          onPlay={() => transitionToMode('game')}
          onTutorial={() => transitionToMode('tutorial')}
        />
      )}

      {gameMode === 'tutorial' && (
        <TutorialScene
          onComplete={() => transitionToMode('game')}
        />
      )}

      {gameMode === 'game' && (
        <Game onExit={() => transitionToMode('intro')} />
      )}
    </>
  )
}
