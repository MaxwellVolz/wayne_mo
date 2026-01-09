/**
 * Interactable Component
 * Renders a single interactive 3D object with animations and click handling
 */

'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import {
  InteractableConfig,
  AnimationState,
  applyAnimation,
  initializeGLBAnimation,
  updateGLBAnimation,
} from '@/lib/interactableSystem'

interface InteractableProps {
  config: InteractableConfig
  isPointerDown: boolean
}

/**
 * Renders the animated 3D model
 */
export function InteractableModel({
  config,
  hovered,
}: {
  config: InteractableConfig
  hovered: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const animationState = useRef<AnimationState>({
    baseHeight: 0,
    rotation: new THREE.Euler(0, 0, 0),
  })

  // Initialize GLB animations if needed
  useEffect(() => {
    if (groupRef.current && config.animationType === 'glb') {
      initializeGLBAnimation(groupRef.current, config, animationState.current)
    }

    // Cleanup
    return () => {
      const mixer = animationState.current.animationMixer
      if (mixer) {
        mixer.stopAllAction()
      }
    }
  }, [config])

  // Animation loop
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Update GLB animations
    if (config.animationType === 'glb') {
      updateGLBAnimation(animationState.current, delta, hovered, config)
    }

    // Apply procedural animations
    applyAnimation(
      groupRef.current,
      config,
      hovered,
      state.clock,
      animationState.current
    )
  })

  const ModelComponent = config.modelComponent

  return (
    <group ref={groupRef}>
      <ModelComponent {...(config.modelProps || {})} />
    </group>
  )
}

/**
 * Invisible interaction sphere for click/hover detection
 */
export function InteractionSphere({
  config,
  hovered,
  setHovered,
  isPointerDown,
}: {
  config: InteractableConfig
  hovered: boolean
  setHovered: (value: boolean) => void
  isPointerDown: boolean
}) {
  // Cleanup cursor on unmount
  useEffect(() => {
    return () => {
      if (hovered) {
        document.body.style.cursor = 'default'
      }
    }
  }, [hovered])

  const handlePointerEnter = () => {
    if (isPointerDown) return
    setHovered(true)
    document.body.style.cursor = 'pointer'
    config.onHoverStart?.()
  }

  const handlePointerLeave = () => {
    setHovered(false)
    document.body.style.cursor = 'default'
    config.onHoverEnd?.()
  }

  const handleClick = () => {
    config.onClick?.()
  }

  if (config.visible === false) return null

  return (
    <mesh
      position={config.position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <sphereGeometry args={[config.radius, 16, 16]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

/**
 * Optional text label for interactable
 */
export function InteractableLabel({ config }: { config: InteractableConfig }) {
  if (!config.label || !config.labelPosition) return null
  if (config.visible === false) return null

  return (
    <Text
      position={config.labelPosition}
      fontSize={0.04}
      lineHeight={1.1}
      color="#ff6b00"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.005}
      outlineColor="#000000"
    >
      {config.label}
    </Text>
  )
}

/**
 * Complete interactable object with model, collision, and label
 */
export default function Interactable({ config, isPointerDown }: InteractableProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <>
      <InteractableModel config={config} hovered={hovered} />
      <InteractionSphere
        config={config}
        hovered={hovered}
        setHovered={setHovered}
        isPointerDown={isPointerDown}
      />
      <InteractableLabel config={config} />
    </>
  )
}
