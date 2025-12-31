'use client'

interface GameOverModalProps {
  score: number
  onRestart: () => void
}

/**
 * Game over modal showing final score
 */
export function GameOverModal({ score, onRestart }: GameOverModalProps) {
  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <h1 className="title">Game Over!</h1>
          <div className="score-section">
            <div className="score-label">Final Score</div>
            <div className="score-value">${score}</div>
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
      `}</style>
    </>
  )
}
