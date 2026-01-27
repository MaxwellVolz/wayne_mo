'use client'

import { RefObject, Suspense, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { SceneEffects } from './SceneEffects'
import { Model as CityModel } from '@/generated_components/CityModelGenerated'
import { Maxwell, MaxwellRef, ActionName } from '@/components/Maxwell'

interface DialogueSceneCanvasProps {
  characterRef: RefObject<MaxwellRef | null>
  initialAnimation?: ActionName
}

/**
 * First-person look-around camera controls with zoom
 * Uses quaternions for stable rotation regardless of camera position
 */
function LookAroundControls({
  lookAt,
  initialFov,
}: {
  lookAt: [number, number, number]
  initialFov: number
}) {
  const { camera, gl } = useThree()
  const isPointerDown = useRef(false)
  const yaw = useRef(0)
  const pitch = useRef(0)
  const fov = useRef(initialFov)
  const initialized = useRef(false)

  // Initialize camera orientation toward lookAt target
  useEffect(() => {
    if (!initialized.current) {
      // Use Three.js lookAt to get correct initial orientation
      camera.lookAt(lookAt[0], lookAt[1], lookAt[2])

      // Extract yaw and pitch from the resulting rotation
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
      yaw.current = euler.y
      pitch.current = euler.x
      fov.current = initialFov

      initialized.current = true
    }
  }, [camera, lookAt, initialFov])

  useEffect(() => {
    const element = gl.domElement
    let lastPinchDistance = 0

    const onPointerDown = () => {
      isPointerDown.current = true
    }

    const onPointerUp = () => {
      isPointerDown.current = false
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown.current) return

      // Update yaw and pitch based on mouse movement
      yaw.current -= e.movementX * 0.002
      pitch.current -= e.movementY * 0.002

      // Clamp pitch to prevent flipping
      pitch.current = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch.current))
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      // Zoom by adjusting FOV (scroll up = zoom in = lower FOV)
      fov.current += e.deltaY * 0.05
      // Clamp FOV between 20 and 120 degrees
      fov.current = Math.max(20, Math.min(120, fov.current))
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Calculate initial pinch distance
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        lastPinchDistance = Math.sqrt(dx * dx + dy * dy)
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        // Calculate new pinch distance
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const pinchDistance = Math.sqrt(dx * dx + dy * dy)

        // Adjust FOV based on pinch delta (pinch in = zoom out, pinch out = zoom in)
        const delta = lastPinchDistance - pinchDistance
        fov.current += delta * 0.1
        fov.current = Math.max(20, Math.min(120, fov.current))

        lastPinchDistance = pinchDistance
      } else if (isPointerDown.current) {
        e.preventDefault()
      }
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('wheel', onWheel, { passive: false })
    element.addEventListener('touchstart', onTouchStart, { passive: false })
    element.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointerup', onPointerUp)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('wheel', onWheel)
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchmove', onTouchMove)
    }
  }, [gl])

  useFrame(() => {
    // Build rotation from yaw and pitch using YXZ order
    const quaternion = new THREE.Quaternion()
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
    quaternion.setFromEuler(euler)
    camera.quaternion.copy(quaternion)

    // Update FOV for zoom
    if ('fov' in camera) {
      const perspCam = camera as THREE.PerspectiveCamera
      perspCam.fov = fov.current
      perspCam.updateProjectionMatrix()
    }
  })

  return null
}

/**
 * 3D scene for the dialogue sequence
 * Uses city_01.glb for environment and maxwell.glb for animated character
 */
export default function DialogueSceneCanvas({ characterRef, initialAnimation }: DialogueSceneCanvasProps) {
  // Camera configuration
  const cameraPosition: [number, number, number] = [-1.5, 8.24, 1]
  const cameraLookAt: [number, number, number] = [-1.5, 8.25, 1.5]
  const initialFov = 90

  return (
    <Canvas
      camera={{
        position: cameraPosition,
        fov: initialFov,
        near: 0.01,
        far: 100,
      }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      {/* Camera controls - drag to rotate, scroll to zoom */}
      <LookAroundControls lookAt={cameraLookAt} initialFov={initialFov} />

      {/* Scene lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
      />
      <pointLight
        position={[-3.5, 1.5, 11]}
        intensity={0.5}
        color="#ffaa55"
      />

      {/* Scene effects (fog, skybox, stars) */}
      <SceneEffects fogDensity={0.02} showSky={true} showStars={true} />

      {/* City environment */}
      <Suspense fallback={null}>
        <CityModel />
      </Suspense>

      {/* Animated character */}
      <Suspense fallback={null}>
        <Maxwell ref={characterRef} initialAnimation={initialAnimation} />
      </Suspense>
    </Canvas>
  )
}
