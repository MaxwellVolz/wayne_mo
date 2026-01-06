'use client'

import { CarTaxiFront, Globe, Plus } from 'lucide-react'
import type { MutableRefObject } from 'react'
import type { Taxi } from '@/types/game'
import styles from '@/styles/pages/TaxiControls.module.css'

interface TaxiControlsProps {
  taxisRef: MutableRefObject<Taxi[]>
  onTaxiSelect: (taxiId: string) => void
  onResetCamera: () => void
  selectedTaxiId: string | null
  onSpawnTaxi?: () => void
  nextTaxiCost?: number
  canAffordTaxi?: boolean
}

/**
 * Bottom-left taxi control icons
 * Allows clicking to follow individual taxis with camera
 */
export function TaxiControls({ taxisRef, onTaxiSelect, onResetCamera, selectedTaxiId, onSpawnTaxi, nextTaxiCost, canAffordTaxi }: TaxiControlsProps) {
  const taxis = taxisRef.current

  return (
    <div className={styles.taxiControls}>
      {/* Globe button to reset camera */}
      <button
        className={!selectedTaxiId ? styles.globeIconActive : styles.globeIcon}
        onClick={onResetCamera}
        title="Reset Camera to Center (Press 1)"
      >
        <Globe className={styles.icon} size={24} />
        <span className={styles.keyHint}>1</span>
      </button>

      {/* Separator */}
      <div className={styles.separator} />

      {/* Taxi follow buttons */}
      {taxis.map((taxi, index) => (
        <button
          key={taxi.id}
          className={selectedTaxiId === taxi.id ? styles.taxiIconActive : styles.taxiIcon}
          onClick={() => onTaxiSelect(taxi.id)}
          title={`Follow ${taxi.id} (Press ${index + 2})`}
        >
          <CarTaxiFront className={styles.icon} size={24} />
          <span className={styles.keyHint}>{index + 2}</span>
        </button>
      ))}

      {/* Spawn taxi button (only in main game, not tutorial) */}
      {onSpawnTaxi && nextTaxiCost !== undefined && canAffordTaxi !== undefined && (
        <>
          {/* Separator */}
          <div className={styles.separator} />

          <button
            className={canAffordTaxi ? styles.spawnButton : styles.spawnButtonDisabled}
            onClick={onSpawnTaxi}
            disabled={!canAffordTaxi}
            title={canAffordTaxi ? `Spawn Taxi - $${nextTaxiCost}` : `Need $${nextTaxiCost}`}
          >
            <Plus className={styles.icon} size={24} />
            <span className={styles.price}>${nextTaxiCost}</span>
          </button>
        </>
      )}
    </div>
  )
}
