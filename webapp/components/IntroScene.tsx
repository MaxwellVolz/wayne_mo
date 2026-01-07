'use client'

import { useState, useEffect } from 'react'
import { getHighScore } from '@/lib/highScore'
import styles from '@/styles/pages/IntroScene.module.css'

interface IntroSceneProps {
  onPlay: () => void
  onTutorial: () => void
}

/**
 * Intro scene with play button
 * Displays before the main game starts
 */
export default function IntroScene({ onPlay, onTutorial }: IntroSceneProps) {
  // Load high score immediately on first render
  const [highScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return getHighScore()
    }
    return 0
  })

  return (
    <div className={styles.introScene}>
      <div className={styles.introContent}>
        <div>
          <h1 className={styles.gameTitle}>Wayne Mo</h1>
          <p className={styles.gameSubtitle}>One Man. An Entire &quot;AI&quot; Taxi Fleet</p>
        </div>

        {highScore > 0 && (
          <div className={styles.highScoreDisplay}>
            <div className={styles.highScoreLabel}>High Score</div>
            <div className={styles.highScoreValue}>${highScore}</div>
          </div>
        )}
      </div>

      <div className={styles.buttonContainer}>
        <button
          className={styles.playButton}
          onClick={onPlay}
        >
          Play
        </button>

        <button
          className={styles.tutorialButton}
          onClick={onTutorial}
        >
          How to Play
        </button>
      </div>
    </div>
  )
}
