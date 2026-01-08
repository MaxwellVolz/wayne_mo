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
 * Smooth easing function (ease-in-out cubic)
 * Provides smooth acceleration and deceleration
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Hook for smooth camera following of selected taxi
 * Allows orbiting around the followed taxi using OrbitControls
 * Uses smooth easing for transitions between chase and Atlas views
 */
export function useTaxiFollowCamera({
  taxisRef,
  followTaxiId,
  lerpSpeed = 2.5,
}: UseTaxiFollowCameraOptions) {
  const { camera } = useThree()
  const targetPositionRef = useRef(new THREE.Vector3())

  // Atlas View (overview) - default camera position
  const atlasTarget = useRef(new THREE.Vector3(0, 1, 5))
  const atlasCameraPos = useRef(new THREE.Vector3(0, 20, 15))

  const initializedRef = useRef(false)
  const wasFollowingRef = useRef(false)
  const transitionTimeRef = useRef(0)
  const isTransitioningRef = useRef(false)

  // Store start positions for smooth lerping
  const transitionStartCameraPos = useRef(new THREE.Vector3())
  const transitionStartTarget = useRef(new THREE.Vector3())

  const TRANSITION_DURATION = 1.5 // 1.5 seconds for smooth transition

  useFrame(({ controls }, delta) => {
    if (!controls || !('target' in controls)) return

    const target = (controls as any).target as THREE.Vector3

    // Initialize target to Atlas View on first frame
    if (!initializedRef.current) {
      target.copy(atlasTarget.current)
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

      // Just transitioned to following - start transition from Atlas to Chase
      if (!wasFollowingRef.current) {
        transitionTimeRef.current = 0
        isTransitioningRef.current = true
        wasFollowingRef.current = true

        // Store current camera and target positions as start of transition
        transitionStartCameraPos.current.copy(camera.position)
        transitionStartTarget.current.copy(target)
      }

      // Calculate desired chase camera position
      const cameraOffset = new THREE.Vector3(-5, 8, -5)
      const desiredCameraPos = taxiPosition.clone().add(cameraOffset)

      // Update transition timer
      if (isTransitioningRef.current) {
        transitionTimeRef.current += delta

        if (transitionTimeRef.current < TRANSITION_DURATION) {
          // Smooth transition from Atlas View to Chase Camera
          const rawT = Math.min(transitionTimeRef.current / TRANSITION_DURATION, 1)
          const easedT = easeInOutCubic(rawT)

          // Lerp camera position using easing
          camera.position.lerpVectors(
            transitionStartCameraPos.current,
            desiredCameraPos,
            easedT
          )

          // Lerp target using easing
          target.lerpVectors(
            transitionStartTarget.current,
            taxiPosition,
            easedT
          )
        } else {
          // Transition complete - just follow target smoothly
          isTransitioningRef.current = false
          target.lerp(taxiPosition, lerpSpeed * delta)
        }
      } else {
        // After transition, only update target (allow free orbit)
        target.lerp(taxiPosition, lerpSpeed * delta)
      }

      // Store for reference
      targetPositionRef.current.copy(taxiPosition)
    } else {
      // When not following, transition back to Atlas View
      if (wasFollowingRef.current) {
        // Just stopped following - start transition from Chase to Atlas
        wasFollowingRef.current = false
        transitionTimeRef.current = 0
        isTransitioningRef.current = true

        // Store current camera and target positions as start of transition
        transitionStartCameraPos.current.copy(camera.position)
        transitionStartTarget.current.copy(target)
      }

      // Handle transition to Atlas View
      if (isTransitioningRef.current) {
        transitionTimeRef.current += delta

        if (transitionTimeRef.current < TRANSITION_DURATION) {
          // Smooth transition from Chase Camera to Atlas View
          const rawT = Math.min(transitionTimeRef.current / TRANSITION_DURATION, 1)
          const easedT = easeInOutCubic(rawT)

          // Lerp camera position using easing
          camera.position.lerpVectors(
            transitionStartCameraPos.current,
            atlasCameraPos.current,
            easedT
          )

          // Lerp target using easing
          target.lerpVectors(
            transitionStartTarget.current,
            atlasTarget.current,
            easedT
          )
        } else {
          // Transition complete - snap to ensure precision
          isTransitioningRef.current = false
          camera.position.copy(atlasCameraPos.current)
          target.copy(atlasTarget.current)
        }
      }
    }
  })

}
