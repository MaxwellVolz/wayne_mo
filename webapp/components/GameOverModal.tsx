'use client'

import { useEffect, useState } from 'react'
import { getHighScore, saveHighScore } from '@/lib/highScore'

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
      <div className="modal-overlay">
        {/* Fireworks effect for new high score */}
        {isNewHighScore && (
          <>
            <div className="fireworks">
              {[...Array(30)].map((_, i) => {
                const colors = ['#ff0000', '#00ff00', '#0088ff', '#ff00ff', '#ffff00', '#00ffff', '#ff8800']
                const color = colors[Math.floor(Math.random() * colors.length)]
                return (
                  <div key={i} className="firework" style={{
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
            <div className="screen-flash"></div>
          </>
        )}

        <div className={`modal-content ${isNewHighScore ? 'high-score-glow' : ''}`}>
          <h1 className="title">Game Over!</h1>
          <div className="score-section">
            <div className="score-label">Final Score</div>
            <div className="score-value">${score}</div>
            {isNewHighScore && (
              <div className="new-record">🏆 NEW HIGH SCORE!</div>
            )}
          </div>
          <div className="high-score-section">
            <div className="high-score-label">High Score</div>
            <div className="high-score-value">${highScore}</div>
          </div>
          <button className="restart-button" onClick={onRestart}>
            Play Again
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          pointer-events: auto;
        }

        .modal-content {
          background: #1a1a1a;
          border: 4px solid #00ff00;
          border-radius: 8px;
          padding: 48px 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          box-shadow: 0 0 40px rgba(0, 255, 0, 0.3);
          position: relative;
          z-index: 1001;
        }

        .modal-content.high-score-glow {
          border-color: #ffff00;
          animation: glowBorder 1.5s ease-in-out infinite;
        }

        @keyframes glowBorder {
          0%, 100% {
            box-shadow:
              0 0 40px rgba(255, 255, 0, 0.5),
              0 0 80px rgba(255, 255, 0, 0.3),
              inset 0 0 40px rgba(255, 255, 0, 0.1);
          }
          50% {
            box-shadow:
              0 0 60px rgba(255, 255, 0, 0.8),
              0 0 120px rgba(255, 255, 0, 0.5),
              inset 0 0 60px rgba(255, 255, 0, 0.2);
          }
        }

        .title {
          font-size: 48px;
          font-weight: bold;
          color: #00ff00;
          margin: 0;
          font-family: monospace;
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }

        .score-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .score-label {
          font-size: 24px;
          color: #ffffff;
          font-family: monospace;
        }

        .score-value {
          font-size: 64px;
          font-weight: bold;
          color: #ffff00;
          font-family: monospace;
          text-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
        }

        .new-record {
          font-size: 20px;
          font-weight: bold;
          color: #00ff00;
          margin-top: 8px;
          animation: recordPulse 1s ease-in-out infinite;
        }

        .high-score-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          margin-top: 16px;
        }

        .high-score-label {
          font-size: 18px;
          color: #999999;
          font-family: monospace;
        }

        .high-score-value {
          font-size: 32px;
          font-weight: bold;
          color: #00ff00;
          font-family: monospace;
        }

        @keyframes recordPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }

        .restart-button {
          font-size: 24px;
          font-weight: bold;
          padding: 16px 48px;
          background: #00ff00;
          color: #000000;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
          transition: all 0.2s;
        }

        .restart-button:hover {
          background: #00dd00;
          transform: scale(1.05);
        }

        .restart-button:active {
          transform: scale(0.95);
        }

        .fireworks {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 999;
        }

        .firework {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: fireworkExplode 1.5s ease-out infinite;
        }

        @keyframes fireworkExplode {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(0, -20px) scale(1);
          }
          40% {
            transform: translate(0, -80px) scale(3);
            opacity: 1;
          }
          50% {
            transform: translate(0, -100px) scale(4);
            opacity: 0.8;
            filter: brightness(2);
          }
          75% {
            transform: translate(30px, -130px) scale(2);
            opacity: 0.4;
          }
          100% {
            transform: translate(50px, -180px) scale(0);
            opacity: 0;
          }
        }

        .screen-flash {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,0,0.3) 0%, rgba(255,255,0,0) 70%);
          pointer-events: none;
          z-index: 998;
          animation: flashPulse 2s ease-in-out infinite;
        }

        @keyframes flashPulse {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
