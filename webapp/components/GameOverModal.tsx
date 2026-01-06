'use client'

import { useEffect, useState } from 'react'
import { getHighScore, saveHighScore } from '@/lib/highScore'
import positionStyles from '@/styles/utilities/positioning.module.css'
import effectStyles from '@/styles/components/effects.module.css'
import styles from '@/styles/pages/GameOverModal.module.css'

interface GameOverModalProps {
  score: number
  onRestart: () => void
}

/**
 * Game over modal showing final score
 */
export function GameOverModal({ score, onRestart }: GameOverModalProps) {
  const [highScore, setHighScore] = useState(0)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  useEffect(() => {
    const currentHighScore = getHighScore()
    setHighScore(currentHighScore)

    // Check if this is a new high score
    const newRecord = saveHighScore(score)
    setIsNewHighScore(newRecord)

    // Update high score display if new record
    if (newRecord) {
      setHighScore(score)
    }
  }, [score])

  return (
    <>
      <div className={positionStyles.modalOverlay}>
        {/* Fireworks effect for new high score */}
        {isNewHighScore && (
          <>
            <div className={effectStyles.fireworksContainer}>
              {[...Array(30)].map((_, i) => {
                const colors = ['#ff0000', '#00ff00', '#0088ff', '#ff00ff', '#ffff00', '#00ffff', '#ff8800']
                const color = colors[Math.floor(Math.random() * colors.length)]
                return (
                  <div key={i} className={effectStyles.firework} style={{
                    left: `${Math.random() * 100}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1 + Math.random()}s`,
                    background: color,
                    boxShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`
                  }}></div>
                )
              })}
            </div>
            <div className={effectStyles.screenFlash}></div>
          </>
        )}

        <div className={isNewHighScore ? styles.modalContentHighScore : styles.modalContent}>
          <h1 className={styles.title}>Game Over!</h1>
          <div className={styles.scoreSection}>
            <div className={styles.scoreLabel}>Final Score</div>
            <div className={styles.scoreValue}>${score}</div>
            {isNewHighScore && (
              <div className={styles.newRecord}>🏆 NEW HIGH SCORE!</div>
            )}
          </div>
          <div className={styles.highScoreSection}>
            <div className={styles.highScoreLabel}>High Score</div>
            <div className={styles.highScoreValue}>${highScore}</div>
          </div>
          <button className={styles.restartButton} onClick={onRestart}>
            Play Again
          </button>
        </div>
      </div>
    </>
  )
}
