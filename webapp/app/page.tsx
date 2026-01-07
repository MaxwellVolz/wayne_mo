'use client'

import { useState } from 'react'
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

  if (gameMode === 'intro') {
    return (
      <IntroScene
        onPlay={() => setGameMode('game')}
        onTutorial={() => setGameMode('tutorial')}
      />
    )
  }

  if (gameMode === 'tutorial') {
    return (
      <TutorialScene
        onComplete={() => setGameMode('game')}
      />
    )
  }

  return <Game onExit={() => setGameMode('intro')} />
}
