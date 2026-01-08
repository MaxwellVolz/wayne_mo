'use client'

import type { MutableRefObject } from 'react'
import type { Taxi } from '@/types/game'
import { useCameraControls } from '@/hooks/useCameraControls'
import { useTaxiFollowCamera } from '@/hooks/useTaxiFollowCamera'

interface CameraControllerProps {
  taxisRef: MutableRefObject<Taxi[]>
  followTaxiId: string | null
}

/**
 * Component that adds WASD camera controls and taxi following to the scene
 * Must be placed inside the Canvas
 */
export function CameraController({ taxisRef, followTaxiId }: CameraControllerProps) {
  // WASD panning controls (always work, even when paused)
  useCameraControls(10)

  // Taxi following camera (always work, even when paused)
  useTaxiFollowCamera({
    taxisRef,
    followTaxiId,
    lerpSpeed: 4.0,
  })

  return null
}
