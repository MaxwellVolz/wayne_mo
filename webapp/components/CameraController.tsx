'use client'

import { useCameraControls } from '@/hooks/useCameraControls'

/**
 * Component that adds WASD camera controls to the scene
 * Must be placed inside the Canvas
 */
export function CameraController() {
  useCameraControls(10) // 10 units per second pan speed
  return null
}
