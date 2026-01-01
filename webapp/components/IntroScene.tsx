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
          overflow-x: hidden;
          padding: 2rem 1rem;
          -webkit-overflow-scrolling: touch;
        }

        .intro-content {
          text-align: center;
          color: white;
          animation: fadeIn 1s ease-in;
          margin-bottom: 2rem;
          width: 100%;
          max-width: 1200px;
        }

        .tutorial-section {
          width: 100%;
          max-width: 800px;
          margin: 2rem auto 0;
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
            -webkit-text-stroke: 1.5px #ff6b00;
          }

          .game-subtitle {
            font-size: 0.9rem;
            letter-spacing: 0.2em;
            margin: 0.5rem 0 1.5rem;
          }

          .play-button {
            padding: 1rem 2rem;
            font-size: 1.5rem;
            letter-spacing: 0.1em;
            width: auto;
            min-width: 200px;
          }

          .tutorial-title {
            font-size: 1.5rem;
            -webkit-text-stroke: 0.5px #ff6b00;
          }

          .tutorial-section {
            margin-top: 1.5rem;
          }

          .intro-hints {
            margin-top: 1.5rem;
          }

          .intro-hints p {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .intro-scene {
            padding: 0.5rem 0.25rem;
          }

          .game-title {
            font-size: 1.75rem;
            letter-spacing: 0.05em;
            -webkit-text-stroke: 1px #ff6b00;
            margin-bottom: 0.5rem;
          }

          .game-subtitle {
            font-size: 0.7rem;
            letter-spacing: 0.1em;
            margin: 0.25rem 0 1rem;
          }

          .play-button {
            padding: 0.75rem 1.5rem;
            font-size: 1.1rem;
            letter-spacing: 0.05em;
            border: 3px solid #ff6b00;
            min-width: 160px;
          }

          .tutorial-title {
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
            -webkit-text-stroke: 0.5px #ff6b00;
          }

          .tutorial-section {
            max-width: 100%;
            margin-top: 1rem;
            padding: 0 0.25rem;
          }

          .intro-hints {
            margin-top: 1rem;
          }

          .intro-hints p {
            font-size: 0.8rem;
            margin: 0.25rem 0;
          }
        }

        @media (max-width: 360px) {
          .intro-scene {
            padding: 0.25rem 0.125rem;
          }

          .game-title {
            font-size: 1.5rem;
            letter-spacing: 0.03em;
            -webkit-text-stroke: 0.75px #ff6b00;
          }

          .game-subtitle {
            font-size: 0.65rem;
            letter-spacing: 0.08em;
          }

          .play-button {
            padding: 0.6rem 1.2rem;
            font-size: 1rem;
            letter-spacing: 0.03em;
            border: 2px solid #ff6b00;
            min-width: 140px;
          }

          .tutorial-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
