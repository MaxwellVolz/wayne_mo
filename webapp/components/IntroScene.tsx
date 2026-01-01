'use client'

import { TutorialSlider } from './TutorialSlider'

interface IntroSceneProps {
  onPlay: () => void
}

/**
 * Intro scene with play button
 * Displays before the main game starts
 */
export default function IntroScene({ onPlay }: IntroSceneProps) {
  return (
    <div className="intro-scene">
      <div className="intro-content">
        <h1 className="game-title">Wayne Mo</h1>
        <p className="game-subtitle">AI MANAGEMENT AUTOMATION</p>

        {/* How to Play Section */}
        <div className="tutorial-section">
          <h2 className="tutorial-title">How to Play</h2>
          <TutorialSlider />
        </div>

        <button
          className="play-button"
          onClick={onPlay}
        >
          PLAY
        </button>

        <div className="intro-hints">
          <p>Command your autonomous taxi fleet</p>
        </div>
      </div>

      <style jsx>{`
        .intro-scene {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          z-index: 1000;
          overflow-y: auto;
          padding: 2rem 1rem;
        }

        .intro-content {
          text-align: center;
          color: white;
          animation: fadeIn 1s ease-in;
          margin-bottom: 2rem;
        }

        .tutorial-section {
          width: 100%;
          max-width: 800px;
          margin-top: 2rem;
          animation: fadeIn 1.5s ease-in;
        }

        .tutorial-title {
          color: #ffff00;
          font-size: 2rem;
          font-weight: 900;
          text-align: center;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          -webkit-text-stroke: 1px #ff6b00;
        }

        .game-title {
          font-size: 4rem;
          font-weight: 900;
          letter-spacing: 0.2em;
          margin: 0;
          text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
          color: #ffff00;
          -webkit-text-stroke: 2px #ff6b00;
        }

        .game-subtitle {
          font-size: 1.2rem;
          letter-spacing: 0.3em;
          margin: 1rem 0 3rem;
          opacity: 0.9;
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
        }

        .play-button:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
          background: #fff200;
        }

        .play-button:active {
          transform: translateY(-2px) scale(1.02);
        }

        .intro-hints {
          margin-top: 3rem;
          opacity: 0.7;
        }

        .intro-hints p {
          margin: 0.5rem 0;
          font-size: 1rem;
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
            padding: 1rem 0.5rem;
          }

          .game-title {
            font-size: 2.5rem;
            letter-spacing: 0.1em;
          }

          .game-subtitle {
            font-size: 0.9rem;
            letter-spacing: 0.2em;
            margin: 0.5rem 0 2rem;
          }

          .play-button {
            padding: 1rem 2rem;
            font-size: 1.5rem;
            letter-spacing: 0.1em;
          }

          .tutorial-title {
            font-size: 1.5rem;
          }

          .intro-hints {
            margin-top: 2rem;
          }

          .intro-hints p {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .game-title {
            font-size: 2rem;
          }

          .game-subtitle {
            font-size: 0.75rem;
            letter-spacing: 0.15em;
          }

          .play-button {
            padding: 0.75rem 1.5rem;
            font-size: 1.25rem;
          }

          .tutorial-title {
            font-size: 1.25rem;
          }

          .tutorial-section {
            max-width: 95%;
          }
        }
      `}</style>
    </div>
  )
}
