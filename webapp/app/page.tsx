'use client'

import { useState } from 'react'
import Game from '@/components/Game'
import IntroScene from '@/components/IntroScene'

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)

  if (!gameStarted) {
    return <IntroScene onPlay={() => setGameStarted(true)} />
  }

  return <Game />
}
