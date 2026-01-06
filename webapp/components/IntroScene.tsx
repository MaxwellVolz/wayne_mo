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
  const [highScore, setHighScore] = useState(0)

  useEffect(() => {
    setHighScore(getHighScore())
  }, [])

  return (
    <div className={styles.introScene}>
      <div className={styles.introContent}>
        <h1 className={styles.gameTitle}>Wayne Mo</h1>
        <p className={styles.gameSubtitle}>&quot;AI&quot; Taxi Game</p>

        <button
          className={styles.tutorialButton}
          onClick={onTutorial}
        >
          HOW TO PLAY
        </button>

        {highScore > 0 && (
          <div className={styles.highScoreDisplay}>
            <div className={styles.highScoreLabel}>High Score</div>
            <div className={styles.highScoreValue}>${highScore}</div>
          </div>
        )}

        <div className={styles.introHints}>
          <p>Command your autonomous taxi fleet</p>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          className={styles.playButton}
          onClick={onPlay}
        >
          PLAY
        </button>
      </div>
    </div>
  )
}
