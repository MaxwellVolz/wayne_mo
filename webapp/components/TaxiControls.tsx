'use client'

import { CarTaxiFront, Globe } from 'lucide-react'
import type { MutableRefObject } from 'react'
import type { Taxi } from '@/types/game'

interface TaxiControlsProps {
  taxisRef: MutableRefObject<Taxi[]>
  onTaxiSelect: (taxiId: string) => void
  onResetCamera: () => void
  selectedTaxiId: string | null
}

/**
 * Bottom-left taxi control icons
 * Allows clicking to follow individual taxis with camera
 */
export function TaxiControls({ taxisRef, onTaxiSelect, onResetCamera, selectedTaxiId }: TaxiControlsProps) {
  const taxis = taxisRef.current

  return (
    <>
      <div className="taxi-controls">
        {/* Globe button to reset camera */}
        <button
          className={`taxi-icon globe-icon ${!selectedTaxiId ? 'active' : ''}`}
          onClick={onResetCamera}
          title="Reset Camera to Center"
        >
          <Globe className="icon" size={24} />
        </button>

        {/* Separator */}
        <div className="separator" />

        {/* Taxi follow buttons */}
        {taxis.map((taxi, index) => (
          <button
            key={taxi.id}
            className={`taxi-icon ${selectedTaxiId === taxi.id ? 'active' : ''}`}
            onClick={() => onTaxiSelect(taxi.id)}
            title={`Follow ${taxi.id}`}
          >
            <CarTaxiFront className="icon" size={24} />
            <span className="taxi-number">{index + 1}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .taxi-controls {
          position: fixed;
          bottom: 80px;
          left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: auto;
          z-index: 100;
        }

        .taxi-icon {
          position: relative;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #333;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .taxi-icon:hover {
          background: #ffffff;
          transform: scale(1.1);
          border-color: #00ff00;
        }

        .taxi-icon.active {
          background: #00ff00;
          border-color: #00aa00;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }

        .taxi-icon.active:hover {
          background: #00dd00;
        }

        .taxi-icon.globe-icon {
          border-color: #0088ff;
        }

        .taxi-icon.globe-icon:hover {
          border-color: #0088ff;
          box-shadow: 0 0 8px rgba(0, 136, 255, 0.4);
        }

        .taxi-icon.globe-icon.active {
          background: #0088ff;
          border-color: #0066cc;
          box-shadow: 0 0 10px rgba(0, 136, 255, 0.5);
        }

        .separator {
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          margin: 4px 0;
        }

        .taxi-number {
          position: absolute;
          bottom: 2px;
          right: 4px;
          font-size: 10px;
          font-weight: bold;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }

        .icon {
          width: 24px;
          height: 24px;
        }

        @media (max-width: 768px) {
          .taxi-controls {
            bottom: 10px;
            left: 10px;
            gap: 6px;
          }

          .taxi-icon {
            width: 40px;
            height: 40px;
          }

          .icon {
            width: 20px;
            height: 20px;
          }

          .taxi-number {
            font-size: 8px;
            padding: 1px 3px;
          }
        }
      `}</style>
    </>
  )
}
