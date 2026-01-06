'use client'

import { CarTaxiFront, Globe } from 'lucide-react'
import type { MutableRefObject } from 'react'
import type { Taxi } from '@/types/game'
import styles from '@/styles/pages/TaxiControls.module.css'

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
    <div className={styles.taxiControls}>
      {/* Globe button to reset camera */}
      <button
        className={!selectedTaxiId ? styles.globeIconActive : styles.globeIcon}
        onClick={onResetCamera}
        title="Reset Camera to Center"
      >
        <Globe className={styles.icon} size={24} />
      </button>

      {/* Separator */}
      <div className={styles.separator} />

      {/* Taxi follow buttons */}
      {taxis.map((taxi, index) => (
        <button
          key={taxi.id}
          className={selectedTaxiId === taxi.id ? styles.taxiIconActive : styles.taxiIcon}
          onClick={() => onTaxiSelect(taxi.id)}
          title={`Follow ${taxi.id}`}
        >
          <CarTaxiFront className={styles.icon} size={24} />
          <span className={styles.taxiNumber}>{index + 1}</span>
        </button>
      ))}
    </div>
  )
}
