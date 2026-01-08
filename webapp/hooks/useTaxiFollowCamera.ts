'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { MutableRefObject } from 'react'
import type { Taxi } from '@/types/game'
import * as THREE from 'three'

interface UseTaxiFollowCameraOptions {
  taxisRef: MutableRefObject<Taxi[]>
  followTaxiId: string | null
  lerpSpeed?: number
}

/**
 * Hook for smooth camera following of selected taxi
 * Allows orbiting around the followed taxi using OrbitControls
 */
export function useTaxiFollowCamera({
  taxisRef,
  followTaxiId,
  lerpSpeed = 2.5,
}: UseTaxiFollowCameraOptions) {
  const { camera } = useThree()
  const targetPositionRef = useRef(new THREE.Vector3())
  const defaultTarget = useRef(new THREE.Vector3(0.5, 1, -1.5)) // World overview camera target
  const defaultCameraPos = useRef(new THREE.Vector3(8, 10, 8))
  const initializedRef = useRef(false)
  const wasFollowingRef = useRef(false)
  const transitionTimeRef = useRef(0)
  const resetTransitionTimeRef = useRef(0)
  const isResetTransitioningRef = useRef(false)
  const TRANSITION_DURATION = 1.0 // 1 second transition

  useFrame(({ controls }, delta) => {
    if (!controls || !('target' in controls)) return

    const target = (controls as any).target as THREE.Vector3

    // Initialize target to default on first frame
    if (!initializedRef.current) {
      target.copy(defaultTarget.current)
      initializedRef.current = true
    }

    // Camera always works, even when paused

    if (followTaxiId) {
      const taxi = taxisRef.current.find(t => t.id === followTaxiId)
      if (!taxi || !taxi.path) return

      // Calculate taxi position from path
      const points = taxi.path.points
      if (points.length < 2) return

      const segmentLength = 1 / (points.length - 1)
      const segmentIndex = Math.floor(taxi.t / segmentLength)
      const localT = (taxi.t % segmentLength) / segmentLength

      const p1 = points[Math.min(segmentIndex, points.length - 2)]
      const p2 = points[Math.min(segmentIndex + 1, points.length - 1)]
      const taxiPosition = p1.clone().lerp(p2, localT)

      // Just transitioned to following - reset transition timer
      if (!wasFollowingRef.current) {
        transitionTimeRef.current = 0
        wasFollowingRef.current = true
      }

      // Update transition timer
      transitionTimeRef.current += delta

      // Calculate desired camera position
      const cameraOffset = new THREE.Vector3(-5, 8, -5)
      const desiredCameraPos = taxiPosition.clone().add(cameraOffset)

      // During transition (first 1 second), lerp camera position
      if (transitionTimeRef.current < TRANSITION_DURATION) {
        // Smooth transition to chase position
        const t = Math.min(transitionTimeRef.current / TRANSITION_DURATION, 1)
        const transitionSpeed = lerpSpeed * (1 + t * 2) // Speed up over time
        camera.position.lerp(desiredCameraPos, transitionSpeed * delta)
        target.lerp(taxiPosition, transitionSpeed * delta)
      } else {
        // After transition, only update target (allow free orbit)
        target.lerp(taxiPosition, lerpSpeed * delta)
      }

      // Store for reference
      targetPositionRef.current.copy(taxiPosition)
    } else {
      // When not following, transition back to default view
      if (wasFollowingRef.current) {
        // Just stopped following - start reset transition
        wasFollowingRef.current = false
        transitionTimeRef.current = 0
        resetTransitionTimeRef.current = 0
        isResetTransitioningRef.current = true
      }

      // Handle reset transition
      if (isResetTransitioningRef.current) {
        resetTransitionTimeRef.current += delta

        // During reset transition (first 1 second), lerp camera and target
        if (resetTransitionTimeRef.current < TRANSITION_DURATION) {
          const t = Math.min(resetTransitionTimeRef.current / TRANSITION_DURATION, 1)
          const transitionSpeed = lerpSpeed * (1 + t * 2) // Speed up over time
          camera.position.lerp(defaultCameraPos.current, transitionSpeed * delta)
          target.lerp(defaultTarget.current, transitionSpeed * delta)
        } else {
          // Transition complete - allow free controls
          isResetTransitioningRef.current = false
          target.copy(defaultTarget.current) // Snap to ensure precision
        }
      }
    }
  })

}
