'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Book } from 'lucide-react'
import { getHighScore, getCumulativeScore } from '@/lib/highScore'
import { getCurrentApartment } from '@/lib/progressionSystem'
import { ProgressionShop } from './ProgressionShop'
import CityModel from './CityModel'
import InteractableManager from './InteractableManager'
import { SceneEffects } from './SceneEffects'
import { createIntroInteractables, DESK_ANCHOR, DESK_LEVELS } from '@/config/introInteractables'
import buttonStyles from '@/styles/components/buttons.module.css'
import positionStyles from '@/styles/utilities/positioning.module.css'

// 3D Models
import { Model as TheShop } from '@/generated_components/the_shop'

interface IntroSceneProps {
  onPlay: () => void
  onTutorial: () => void
  onSmallCity: () => void
  onOpenCarousel?: () => void
}

/**
 * First-person look-around camera controls with zoom
 * Uses quaternions for stable rotation regardless of camera position
 */
function LookAroundControls({
  setIsPointerDown,
  lookAt,
  initialFov
}: {
  setIsPointerDown: (v: boolean) => void
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

    const onPointerDown = () => {
      isPointerDown.current = true
      setIsPointerDown(true)
    }

    const onPointerUp = () => {
      isPointerDown.current = false
      setIsPointerDown(false)
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

    const onTouchMove = (e: TouchEvent) => {
      if (isPointerDown.current) {
        e.preventDefault()
      }
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('wheel', onWheel, { passive: false })
    element.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointerup', onPointerUp)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('wheel', onWheel)
      element.removeEventListener('touchmove', onTouchMove)
    }
  }, [gl, setIsPointerDown])

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
 * 3D Text display for intro scene
 * Uses DESK_ANCHOR from introInteractables config - update there to move everything!
 */
function IntroText({ highScore, cumulativeScore }: { highScore: number; cumulativeScore: number }) {
  return (
    <group position={DESK_ANCHOR}>
      {/* Game Title */}
      <Text
        position={[0, 0.55, 0]}
        fontSize={0.42}
        color="#ffff00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Wayne Mo
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, .20, 0]}
        fontSize={0.12}
        color="#ff6b00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        One Man. One Mission. Optimization.
      </Text>

      <group position={[-1.9, 2, -4.2]} rotation={[0, 0, 0]}>


        {/* High Score */}
        {highScore > 0 && (
          <>
            <Text
              position={[0, 0, 0]}
              fontSize={0.12}
              color="#00ff00"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.008}
              outlineColor="#000000"
            >
              Highscore
            </Text>
            <Text
              position={[0, -0.2, 0]}
              fontSize={0.25}
              color="#ffff00"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="#000000"
            >
              ${highScore}
            </Text>
          </>
        )}

        {/* Cumulative Score */}
        {cumulativeScore > 0 && (
          <>
            <Text
              position={[0, -.4, 0]}
              fontSize={0.12}
              color="#ff6b00"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.008}
              outlineColor="#000000"
            >
              Lifetime
            </Text>
            <Text
              position={[0, -.6, 0]}
              fontSize={0.25}
              color="#ffff00"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="#000000"
            >
              ${cumulativeScore}
            </Text>
          </>
        )}
      </group>

      {/* Tutorial instruction (pizza) */}
      <Text
        position={[-.2, -.2, .42]}
        rotation={[0, Math.PI * 0.2, 0]}
        fontSize={0.04}
        lineHeight={1.1}
        color="#ff6b00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        {`
Endless Mode`}
      </Text>

      {/* Play instruction (headset) */}
      <Text
        position={[.12, -.2, .45]}
        rotation={[0, -Math.PI * 0.1, 0]}
        fontSize={0.04}
        lineHeight={1.1}
        color="#ff6b00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        Play
      </Text>

      <Text
        position={[.5, -.2, .52]}
        rotation={[0, -Math.PI * 0.2, 0]}
        fontSize={0.04}
        lineHeight={1.1}
        color="#ff6b00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        Tutorial
      </Text>

      {/* Desk Level Labels - hidden, toggle DEBUG_DESK_LABELS to show */}
      {false && (
        <>
          <Text
            position={[0.8, -0.35 + DESK_LEVELS.desk1, 0.5]}
            fontSize={0.08}
            color="#00ff00"
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.006}
            outlineColor="#000000"
          >
            Desk 1: Van
          </Text>
          <Text
            position={[0.8, -0.35 + DESK_LEVELS.desk2, 0.5]}
            fontSize={0.08}
            color="#ffff00"
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.006}
            outlineColor="#000000"
          >
            Desk 2: Taco Shop
          </Text>
          <Text
            position={[0.8, -0.35 + DESK_LEVELS.desk3, 0.5]}
            fontSize={0.08}
            color="#ff6b00"
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.006}
            outlineColor="#000000"
          >
            Desk 3: Mid-City
          </Text>
        </>
      )}
    </group>
  )
}

/**
 * Intro scene with play button
 * Displays before the main game starts
 */
export default function IntroScene({ onPlay, onTutorial, onSmallCity, onOpenCarousel }: IntroSceneProps) {
  // Load high score immediately on first render
  const [highScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return getHighScore()
    }
    return 0
  })

  // Load cumulative score immediately on first render
  const [cumulativeScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return getCumulativeScore()
    }
    return 0
  })

  const [isPointerDown, setIsPointerDown] = useState(false)

  // Get current apartment for camera position
  const [apartment, setApartment] = useState(() => getCurrentApartment())
  const handleApartmentChange = () => {
    setApartment(getCurrentApartment())
  }

  // Create interactables configuration (memoized to prevent recreation)
  const interactables = useMemo(
    () => createIntroInteractables(onPlay, onTutorial, onSmallCity),
    [onPlay, onTutorial, onSmallCity]
  )

  return (
    <>
      {/* 3D Canvas */}
      <Canvas
        key={apartment.id} // Re-mount canvas when apartment changes
        camera={{
          position: apartment.cameraPosition,
          fov: apartment.cameraFov,
          near: 0.01,  // Reduce near clipping for close geometry
        }}
        shadows={false}
        frameloop="always"
      >
        {/* Scene effects (fog and renderer config) */}
        <SceneEffects />

        {/* Camera controls - drag to rotate, scroll to zoom */}
        <LookAroundControls
          setIsPointerDown={setIsPointerDown}
          lookAt={apartment.cameraLookAt}
          initialFov={apartment.cameraFov}
        />

        {/* Lights */}
        <ambientLight intensity={0.6} />

        <directionalLight
          position={[5, 10, 5]}
          intensity={0.8}
          castShadow={false}
        />

        <CityModel />

        <TheShop />

        {/* Interactive objects managed by config */}
        <InteractableManager interactables={interactables} isPointerDown={isPointerDown} />

        {/* 3D Text display */}
        <IntroText highScore={highScore} cumulativeScore={cumulativeScore} />
      </Canvas>

      {/* UI Overlay */}
      <div className={positionStyles.topLeft} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {onOpenCarousel && (
          <button
            className={buttonStyles.icon}
            onClick={onOpenCarousel}
            aria-label="Open tutorial carousel"
            title="View Tutorial"
          >
            <Book size={24} />
          </button>
        )}
        <ProgressionShop onApartmentChange={handleApartmentChange} />
      </div>
    </>
  )
}
