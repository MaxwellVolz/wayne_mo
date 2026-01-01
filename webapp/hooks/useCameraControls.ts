'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Custom hook for WASD camera panning controls
 * @param speed - Pan speed in units per second
 */
export function useCameraControls(speed: number = 10) {
  const { camera } = useThree()
  const keysPressed = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd'].includes(key)) {
        keysPressed.current.add(key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keysPressed.current.delete(key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(({ controls }, delta) => {
    const moveDistance = speed * delta

    // Get camera's right and forward vectors (ignoring Y)
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0))
    right.normalize()

    // Apply movement based on pressed keys
    const movement = new THREE.Vector3()

    if (keysPressed.current.has('w')) {
      movement.add(forward.clone().multiplyScalar(moveDistance))
    }
    if (keysPressed.current.has('s')) {
      movement.add(forward.clone().multiplyScalar(-moveDistance))
    }
    if (keysPressed.current.has('a')) {
      movement.add(right.clone().multiplyScalar(-moveDistance))
    }
    if (keysPressed.current.has('d')) {
      movement.add(right.clone().multiplyScalar(moveDistance))
    }

    if (movement.length() > 0) {
      // Move only camera position for horizontal panning
      // Don't move the target - this allows true panning instead of focus shift
      camera.position.add(movement)

      // Update OrbitControls target to maintain camera angle
      if (controls && 'target' in controls) {
        const target = (controls as any).target as THREE.Vector3
        target.add(movement)
      }
    }
  })
}
