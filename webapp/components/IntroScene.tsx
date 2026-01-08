'use client'

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { getHighScore, getCumulativeScore } from '@/lib/highScore'
import CityModel from './CityModel'

// 3D Models
import { Model as TheShop } from '@/generated_components/the_shop'
import { Model as TheHeadset } from '@/generated_components/vr_headset'
import { Model as ThePizza } from '@/generated_components/pizza'

interface IntroSceneProps {
  onPlay: () => void
  onTutorial: () => void
}

/**
 * First-person look-around camera controls
 * User can rotate view but cannot move position
 */
function LookAroundControls({ setIsPointerDown }: {
  setIsPointerDown: (v: boolean) => void
}) {
  const { camera, gl } = useThree()
  const isPointerDown = useRef(false)
  const rotation = useRef({ x: 0, y: 0 })

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

      // Update rotation based on mouse/touch movement
      rotation.current.y -= e.movementX * 0.002
      rotation.current.x -= e.movementY * 0.002

      // Clamp vertical rotation to prevent flipping
      rotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotation.current.x))
    }

    // Prevent scrolling only during drag (touchmove), not on tap (touchstart)
    // This allows clicks/taps to work while preventing scroll
    const onTouchMove = (e: TouchEvent) => {
      if (isPointerDown.current) {
        e.preventDefault()
      }
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointerup', onPointerUp)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('touchmove', onTouchMove)
    }
  }, [gl, setIsPointerDown])

  useFrame(() => {
    // Apply rotation to camera
    camera.rotation.order = 'YXZ'
    camera.rotation.y = rotation.current.y
    camera.rotation.x = rotation.current.x
  })

  return null
}

/**
 * Interactive headset that floats on hover and starts game on click
 */
function InteractiveHeadset({ hovered }: {
  hovered: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const baseHeight = useRef(0)

  useFrame((state) => {
    if (groupRef.current) {
      if (hovered) {
        // Smoothly rise to hover height
        baseHeight.current += (0.15 - baseHeight.current) * 0.1
        // Add gentle bobble on top
        const bobble = Math.sin(state.clock.elapsedTime * 3) * 0.05
        groupRef.current.position.y = baseHeight.current + bobble
      } else {
        // Smoothly drop back down
        baseHeight.current *= 0.9
        groupRef.current.position.y = baseHeight.current
      }
    }
  })

  return (
    <group ref={groupRef}>
      <TheHeadset />
    </group>
  )
}

/**
 * Invisible interaction sphere for headset
 */
function HeadsetInteractionSphere({ onClick, setHovered, isPointerDown }: {
  onClick: () => void
  setHovered: (value: boolean) => void
  isPointerDown: boolean
}) {
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default'
    }
  }, [])

  return (
    <mesh
      position={[-7.2, 1.48, 10.7]}
      onPointerEnter={() => {
        if (isPointerDown) return
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerLeave={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
      onClick={onClick}
    >
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

/**
 * Interactive pizza that floats on hover and opens tutorial on click
 */
function InteractivePizza({ hovered }: {
  hovered: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const baseHeight = useRef(0)

  useFrame((state) => {
    if (groupRef.current) {
      if (hovered) {
        // Smoothly rise to hover height
        baseHeight.current += (0.15 - baseHeight.current) * 0.1
        // Add gentle bobble on top
        const bobble = Math.sin(state.clock.elapsedTime * 3) * 0.05
        groupRef.current.position.y = baseHeight.current + bobble
      } else {
        // Smoothly drop back down
        baseHeight.current *= 0.9
        groupRef.current.position.y = baseHeight.current
      }
    }
  })

  return (
    <group ref={groupRef}>
      <ThePizza />
    </group>
  )
}

/**
 * Invisible interaction sphere for pizza
 */
function PizzaInteractionSphere({ onClick, setHovered, isPointerDown }: {
  onClick: () => void
  setHovered: (value: boolean) => void
  isPointerDown: boolean
}) {
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default'
    }
  }, [])

  return (
    <mesh
      position={[-7.6, 1.5, 10.6]}
      onPointerEnter={() => {
        if (isPointerDown) return
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerLeave={() => {
        if (isPointerDown) return
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
      onClick={onClick}
    >
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

/**
 * 3D Text display for intro scene
 */
function IntroText({ highScore, cumulativeScore }: { highScore: number; cumulativeScore: number }) {
  return (
    <group position={[-7.2, 1.75, 10.2]}>
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

      {/* High Score */}
      {highScore > 0 && (
        <>
          <Text
            position={[0, -0.1, 0]}
            fontSize={0.12}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.008}
            outlineColor="#000000"
          >
            Score To Beat
          </Text>
          <Text
            position={[0, -0.3, 0]}
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
            position={[0, highScore > 0 ? -0.5 : -0.1, 0]}
            fontSize={0.08}
            color="#ff6b00"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.006}
            outlineColor="#000000"
          >
            Career Earnings
          </Text>
          <Text
            position={[0, highScore > 0 ? -0.65 : -0.25, 0]}
            fontSize={0.15}
            color="#ffff00"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.008}
            outlineColor="#000000"
          >
            ${cumulativeScore}
          </Text>
        </>
      )}

      {/* Tutorial instruction (pizza) */}
      <Text
        position={[-.4, -.15, .6]}
        rotation={[0, Math.PI * 0.3, 0]}
        fontSize={0.04}
        lineHeight={1.1}
        color="#ff6b00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        {`
How
  To
   Play
 Pizza`}
      </Text>

      {/* Play instruction (headset) */}
      <Text
        position={[.15, -.15, .7]}
        rotation={[0, -Math.PI * 0.1, 0]}
        fontSize={0.04}
        lineHeight={1.1}
        color="#ff6b00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        ← Play
      </Text>
    </group>
  )
}

/**
 * Intro scene with play button
 * Displays before the main game starts
 */
export default function IntroScene({ onPlay, onTutorial }: IntroSceneProps) {
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
  const [headsetHovered, setHeadsetHovered] = useState(false)
  const [pizzaHovered, setPizzaHovered] = useState(false)

  return (
    <Canvas
      camera={{
        position: [-7.2, 1.9, 11.2],
        fov: 120,
      }}
      shadows={false}
      frameloop="always"
    >
      {/* Camera - look around only - drag to rotate view */}
      <LookAroundControls setIsPointerDown={setIsPointerDown} />

      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow={false}
      />

      <CityModel />

      <TheShop />

      {/* Interactive objects with invisible spheres for interaction */}
      <InteractiveHeadset hovered={headsetHovered} />
      <HeadsetInteractionSphere onClick={onPlay} setHovered={setHeadsetHovered} isPointerDown={isPointerDown} />

      <InteractivePizza hovered={pizzaHovered} />
      <PizzaInteractionSphere onClick={onTutorial} setHovered={setPizzaHovered} isPointerDown={isPointerDown} />

      {/* 3D Text display */}
      <IntroText highScore={highScore} cumulativeScore={cumulativeScore} />
    </Canvas>
  )
}
