'use client'

import { useState, useEffect } from 'react'
import { getHighScore } from '@/lib/highScore'

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
    <div className="intro-scene">
      <div className="intro-content">
        <h1 className="game-title">Wayne Mo</h1>
        <p className="game-subtitle">&quot;AI&quot; Taxi Game</p>

        <button
          className="tutorial-button"
          onClick={onTutorial}
        >
          HOW TO PLAY
        </button>

        {highScore > 0 && (
          <div className="high-score-display">
            <div className="high-score-label">High Score</div>
            <div className="high-score-value">${highScore}</div>
          </div>
        )}

        <div className="intro-hints">
          <p>Command your autonomous taxi fleet</p>
        </div>
      </div>

      <div className="button-container">
        <button
          className="play-button"
          onClick={onPlay}
        >
          PLAY
        </button>
      </div>

      <style jsx>{`
        .intro-scene {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh; /* Use dynamic viewport height for mobile */
          background:
            linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          z-index: 1000;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 2rem 1rem;
          -webkit-overflow-scrolling: touch;
        }

        .intro-scene::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image:
            linear-gradient(45deg, #000000 25%, transparent 25%),
            linear-gradient(-45deg, #000000 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #000000 75%),
            linear-gradient(-45deg, transparent 75%, #000000 75%);
          background-size: 80px 80px;
          background-position: 0 0, 0 40px, 40px -40px, -40px 0px;
          background-color: #ffff00;
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }

        .intro-content {
          text-align: center;
          color: white;
          animation: fadeIn 1s ease-in;
          width: 100%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .button-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
          width: 100%;
          max-width: 600px;
          padding: 0 2rem;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .game-title {
          font-family: var(--font-racing-sans-one), 'Arial Black', sans-serif;
          font-size: 10rem;
          font-weight: 400;
          letter-spacing: 0.2em;
          margin: 0;
          text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
          color: #ffff00;
          -webkit-text-stroke: 2px #ff6b00;
        }

        .game-subtitle {
          font-size: 1.2rem;
          letter-spacing: 0.3em;
          margin: 1rem 0 1rem;
          opacity: 0.9;
        }

        .high-score-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin: 2rem 0;
          padding: 2.5rem 4rem;
          background: rgba(0, 0, 0, 0.3);
          border: 4px solid #ffff00;
          border-radius: 16px;
          box-shadow:
            0 0 30px rgba(255, 255, 0, 0.3),
            inset 0 0 20px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          width: 90%;
          max-width: 600px;
        }

        .high-score-display::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 0, 0.05) 10px,
              rgba(255, 255, 0, 0.05) 20px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 0, 0.05) 10px,
              rgba(255, 255, 0, 0.05) 20px
            );
          pointer-events: none;
          z-index: 0;
        }

        .high-score-label {
          font-size: 1rem;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          font-weight: bold;
          position: relative;
          z-index: 1;
        }

        .high-score-value {
          font-size: 3.5rem;
          font-weight: 900;
          color: #00ff00;
          text-shadow:
            0 0 20px rgba(0, 255, 0, 0.8),
            0 0 40px rgba(0, 255, 0, 0.4),
            2px 2px 4px rgba(0, 0, 0, 0.8);
          font-family: monospace;
          position: relative;
          z-index: 1;
        }

        .play-button {
          background: #ffff00;
          color: #000;
          border: 4px solid #ff6b00;
          padding: 1.5rem 4rem;
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          width: 100%;
        }

        .play-button:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
          background: #fff200;
        }

        .play-button:active {
          transform: translateY(-2px) scale(1.02);
        }

        .tutorial-button {
          background: transparent;
          color: #fff;
          border: 3px solid #ffff00;
          padding: 1rem 3rem;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-top: 2rem;
        }

        .tutorial-button:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 20px rgba(255, 255, 0, 0.3);
          background: rgba(255, 255, 0, 0.1);
        }

        .tutorial-button:active {
          transform: translateY(-2px) scale(1.02);
        }

        .intro-hints {
          margin-top: 2rem;
          opacity: 0.7;
        }

        .intro-hints p {
          margin: 0.5rem 0;
          font-size: 1.1rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .intro-scene {
            padding: 1.5rem 0;
            justify-content: center;
            gap: 1.5rem;
          }

          .intro-content {
            justify-content: center;
            padding-top: 0;
          }

          .game-title {
            font-family: var(--font-racing-sans-one), 'Arial Black', sans-serif;
            font-size: 4rem;
            letter-spacing: 0.15em;
            -webkit-text-stroke: 1.5px #ff6b00;
            margin-bottom: 0.5rem;
            width: 100%;
            padding: 0 1rem;
          }

          .game-subtitle {
            font-size: 1rem;
            letter-spacing: 0.25em;
            margin: 0.75rem 0 1.5rem;
            width: 100%;
          }

          .high-score-display {
            margin: 1.5rem 0;
            padding: 1.5rem 2.5rem;
            border: 3px solid #ffff00;
            border-radius: 12px;
          }

          .high-score-label {
            font-size: 0.9rem;
          }

          .high-score-value {
            font-size: 2.5rem;
          }

          .play-button {
            padding: 1.25rem 3rem;
            font-size: 1.75rem;
            letter-spacing: 0.15em;
            width: 100%;
            border: 3px solid #ff6b00;
          }

          .button-container {
            gap: 1.25rem;
            padding: 0 1.5rem;
            max-width: 500px;
          }

          .tutorial-button {
            padding: 0.9rem 2rem;
            font-size: 1.2rem;
            letter-spacing: 0.12em;
            margin-top: 1.5rem;
          }

          .high-score-display {
            width: 85%;
            padding: 2rem 3rem;
          }

          .intro-hints {
            margin-top: 2rem;
          }

          .intro-hints p {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .intro-scene {
            padding: 1rem 0;
            gap: 1rem;
          }

          .intro-content {
            padding-top: 0;
          }

          .game-title {
            font-family: var(--font-racing-sans-one), 'Arial Black', sans-serif;
            font-size: 3rem;
            letter-spacing: 0.1em;
            -webkit-text-stroke: 1.25px #ff6b00;
            margin-bottom: 0.5rem;
            width: 100%;
            padding: 0 0.75rem;
          }

          .game-subtitle {
            font-size: 0.85rem;
            letter-spacing: 0.2em;
            margin: 0.5rem 0 1.25rem;
            width: 100%;
          }

          .high-score-display {
            margin: 1.25rem 0;
            padding: 1.25rem 2rem;
            border: 3px solid #ffff00;
            border-radius: 10px;
          }

          .high-score-label {
            font-size: 0.8rem;
          }

          .high-score-value {
            font-size: 2rem;
          }

          .play-button {
            padding: 1rem 2.5rem;
            font-size: 1.5rem;
            letter-spacing: 0.1em;
            border: 3px solid #ff6b00;
            width: 100%;
          }

          .button-container {
            gap: 1rem;
            padding: 0 1rem;
            max-width: 400px;
          }

          .tutorial-button {
            padding: 0.8rem 1.75rem;
            font-size: 1.1rem;
            margin-top: 1.25rem;
          }

          .high-score-display {
            width: 90%;
          }

          .intro-hints {
            margin-top: 1.5rem;
          }

          .intro-hints p {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 360px) {
          .intro-scene {
            padding: 0.75rem 0;
            gap: 0.75rem;
          }

          .intro-content {
            padding-top: 0;
          }

          .game-title {
            font-family: var(--font-racing-sans-one), 'Arial Black', sans-serif;
            font-size: 2.5rem;
            letter-spacing: 0.08em;
            -webkit-text-stroke: 1px #ff6b00;
            width: 100%;
            padding: 0 0.5rem;
          }

          .game-subtitle {
            font-size: 0.75rem;
            letter-spacing: 0.15em;
            margin: 0.5rem 0 1rem;
            width: 100%;
          }

          .high-score-display {
            margin: 1rem 0;
            padding: 1rem 1.5rem;
            border: 2px solid #ffff00;
            border-radius: 8px;
          }

          .high-score-label {
            font-size: 0.7rem;
          }

          .high-score-value {
            font-size: 1.75rem;
          }

          .play-button {
            padding: 0.9rem 2rem;
            font-size: 1.3rem;
            letter-spacing: 0.08em;
            border: 3px solid #ff6b00;
            width: 100%;
          }

          .button-container {
            gap: 0.85rem;
            padding: 0 0.75rem;
            max-width: 350px;
          }

          .tutorial-button {
            padding: 0.7rem 1.5rem;
            font-size: 1rem;
            margin-top: 1rem;
          }

          .high-score-display {
            width: 92%;
          }

          .intro-hints {
            margin-top: 1.25rem;
          }

          .intro-hints p {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  )
}
