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
  triggerPress,
  DEFAULT_ANIMATION_CONFIG,
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
  animationStateRef,
}: {
  config: InteractableConfig
  hovered: boolean
  animationStateRef?: React.MutableRefObject<AnimationState>
}) {
  const groupRef = useRef<THREE.Group>(null)
  const internalAnimationState = useRef<AnimationState>({
    baseHeight: 0,
    rotation: new THREE.Euler(0, 0, 0),
  })

  // Use external ref if provided, otherwise use internal
  const animationState = animationStateRef || internalAnimationState

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
  animationStateRef,
}: {
  config: InteractableConfig
  hovered: boolean
  setHovered: (value: boolean) => void
  isPointerDown: boolean
  animationStateRef?: React.MutableRefObject<AnimationState>
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
    // Trigger press animation if this is a press-type interactable
    if (config.animationType === 'press' && animationStateRef) {
      const animConfig = { ...DEFAULT_ANIMATION_CONFIG, ...config.animationConfig }
      triggerPress(animationStateRef.current, animConfig)
    }

    config.onClick?.()
  }

  if (config.visible === false) return null

  // Toggle for debugging interaction spheres
  const DEBUG_SPHERES = false

  return (
    <mesh
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <sphereGeometry args={[config.radius, 16, 16]} />
      <meshBasicMaterial
        visible={DEBUG_SPHERES}
        color={hovered ? "#00ff00" : "#ff0000"}
        transparent
        opacity={0.5}
      />
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
 * Note: Models with baked positions render at origin, interaction sphere uses config.position
 */
export default function Interactable({ config, isPointerDown }: InteractableProps) {
  const [hovered, setHovered] = useState(false)
  const animationStateRef = useRef<AnimationState>({
    baseHeight: 0,
    rotation: new THREE.Euler(0, 0, 0),
  })

  return (
    <>
      {/* Model renders at origin - uses baked position from GLB */}
      <InteractableModel
        config={config}
        hovered={hovered}
        animationStateRef={animationStateRef}
      />
      {/* Interaction sphere at explicit position for click detection */}
      <group position={config.position}>
        <InteractionSphere
          config={config}
          hovered={hovered}
          setHovered={setHovered}
          isPointerDown={isPointerDown}
          animationStateRef={animationStateRef}
        />
      </group>
      <InteractableLabel config={config} />
    </>
  )
}
