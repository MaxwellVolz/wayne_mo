'use client'

import dynamic from 'next/dynamic'

// Load Scene only on client side (Three.js doesn't work with SSR)
const Scene = dynamic(() => import('./Scene'), {
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
      Loading game...
    </div>
  ),
})

/**
 * Main game component
 * Houses the Three.js canvas and UI overlay
 */
export default function Game() {
  return (
    <div className="game-container">
      {/* Three.js scene */}
      <Scene />

      {/* UI overlay */}
      <div className="ui-overlay">
        {/* STOP/GO button will be added here in Phase 2 */}
      </div>

      <style jsx>{`
        .game-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .ui-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  )
}
