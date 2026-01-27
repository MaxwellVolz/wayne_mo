'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Game from '@/components/Game'
import IntroScene from '@/components/IntroScene'
import LoadingScreen from '@/components/LoadingScreen'
import DialogueScene from '@/components/DialogueScene'
import {
  checkFirstVisit,
  markFirstVisitComplete,
} from '@/lib/firstVisitDetection'
import { getAudioManager } from '@/lib/audioManager'

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

// Lazy load small city game
const SmallCityGame = dynamic(() => import('@/components/SmallCityGame'), {
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
      Loading Small City...
    </div>
  ),
})

type GameMode = 'loading' | 'carousel' | 'intro' | 'tutorial' | 'game' | 'small_city'

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('intro')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [fadeInDuration, setFadeInDuration] = useState(1)
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false)

  // Check first visit and set initial mode
  useEffect(() => {
    const hasVisited = checkFirstVisit()
    setIsFirstVisit(!hasVisited)

    if (!hasVisited) {
      setGameMode('loading')
    } else {
      setGameMode('intro')
    }

    const timer = setTimeout(() => {
      setShowOverlay(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const transitionToMode = (newMode: GameMode) => {
    setIsTransitioning(true)
    setShowOverlay(true)

    // Initialize audio on first gameplay interaction
    if (newMode === 'game' || newMode === 'tutorial' || newMode === 'small_city') {
      getAudioManager().init()
    }

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

  const handleLoadingComplete = () => {
    transitionToMode('carousel')
  }

  const handleCarouselClose = () => {
    markFirstVisitComplete()
    transitionToMode('intro')
  }

  const handleOpenCarousel = () => {
    transitionToMode('carousel')
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
      {gameMode === 'loading' && (
        <div className="scene-container">
          <LoadingScreen onComplete={handleLoadingComplete} />
        </div>
      )}

      {gameMode === 'carousel' && (
        <div className="scene-container">
          <DialogueScene onClose={handleCarouselClose} />
        </div>
      )}

      {gameMode === 'intro' && (
        <div className="scene-container">
          <IntroScene
            onPlay={() => transitionToMode('game')}
            onTutorial={() => transitionToMode('tutorial')}
            onSmallCity={() => transitionToMode('small_city')}
            onOpenCarousel={handleOpenCarousel}
          />
        </div>
      )}

      {gameMode === 'tutorial' && (
        <div className="scene-container">
          <TutorialScene
            onComplete={() => transitionToMode('game')}
            onGoBack={() => transitionToMode('intro')}
          />
        </div>
      )}

      {gameMode === 'game' && (
        <Game onExit={() => transitionToMode('intro')} />
      )}

      {gameMode === 'small_city' && (
        <SmallCityGame onExit={() => transitionToMode('intro')} />
      )}
    </>
  )
}
