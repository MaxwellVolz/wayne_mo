/**
 * Interactable System
 * Configuration-driven system for managing interactive 3D objects in the intro scene
 * Supports GLB animations, procedural animations, and click interactions
 */

import * as THREE from 'three'

/**
 * Animation types for interactable objects
 */
export type AnimationType =
  | 'none'           // No animation
  | 'hover'          // Float up on hover
  | 'bobble'         // Gentle bobbing motion
  | 'hover_bobble'   // Combination of hover + bobble
  | 'spin'           // Continuous rotation
  | 'press'          // Press down animation on click
  | 'glb'            // Play GLB animation clip

/**
 * Configuration for a single interactable object
 */
export interface InteractableConfig {
  id: string                          // Unique identifier

  // Model
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelComponent: React.ComponentType<any>  // Generated GLB component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelProps?: Record<string, any>    // Props to pass to model component

  // Interaction sphere (invisible clickable area)
  position: [number, number, number]  // Sphere position
  radius: number                      // Sphere radius

  // Callbacks
  onClick?: () => void                // Click handler
  onHoverStart?: () => void           // Hover start callback
  onHoverEnd?: () => void             // Hover end callback

  // Animation
  animationType: AnimationType
  animationConfig?: {
    // For 'hover' and 'hover_bobble'
    hoverHeight?: number              // How high to float (default: 0.15)
    hoverSpeed?: number               // Smoothing speed (default: 0.1)

    // For 'bobble' and 'hover_bobble'
    bobbleAmplitude?: number          // Bobble height (default: 0.05)
    bobbleFrequency?: number          // Bobble speed (default: 3)

    // For 'spin'
    spinSpeed?: number                // Rotation speed in rad/s (default: 1)
    spinAxis?: 'x' | 'y' | 'z'        // Rotation axis (default: 'y')

    // For 'press'
    pressDepth?: number               // How far to push down (default: 0.05)
    pressSpeed?: number               // Press animation speed (default: 0.2)
    pressDuration?: number            // How long to stay pressed in ms (default: 150)

    // For 'glb'
    clipName?: string                 // Animation clip name to play
    playOnHover?: boolean             // Play animation on hover (default: false)
    loop?: boolean                    // Loop the animation (default: true)
    timeScale?: number                // Animation speed multiplier (default: 1)
  }

  // Optional label/tooltip
  label?: string
  labelPosition?: [number, number, number]

  // Visibility
  visible?: boolean                   // Show/hide (default: true)
}

/**
 * Default animation configs
 */
export const DEFAULT_ANIMATION_CONFIG = {
  hoverHeight: 0.15,
  hoverSpeed: 0.1,
  bobbleAmplitude: 0.05,
  bobbleFrequency: 3,
  spinSpeed: 1,
  spinAxis: 'y' as 'x' | 'y' | 'z',
  pressDepth: 0.05,
  pressSpeed: 0.2,
  pressDuration: 150,
  loop: true,
  timeScale: 1,
  playOnHover: false,
}

/**
 * Hook return type for animation state
 */
export interface AnimationState {
  baseHeight: number
  rotation: THREE.Euler
  animationMixer?: THREE.AnimationMixer
  currentAction?: THREE.AnimationAction
  pressOffset?: number
  pressTarget?: number
  pressingTime?: number
}

/**
 * Utility: Apply animation to a group based on config and hover state
 */
export function applyAnimation(
  group: THREE.Group,
  config: InteractableConfig,
  hovered: boolean,
  clock: THREE.Clock,
  animationState: AnimationState
): void {
  const animConfig = { ...DEFAULT_ANIMATION_CONFIG, ...config.animationConfig }

  switch (config.animationType) {
    case 'none':
      break

    case 'hover':
      applyHoverAnimation(group, hovered, animConfig, animationState)
      break

    case 'bobble':
      applyBobbleAnimation(group, clock.elapsedTime, animConfig)
      break

    case 'hover_bobble':
      applyHoverAnimation(group, hovered, animConfig, animationState)
      const hoverY = group.position.y
      applyBobbleAnimation(group, clock.elapsedTime, animConfig)
      group.position.y += hoverY // Add hover offset on top of bobble
      break

    case 'spin':
      applySpinAnimation(group, clock.elapsedTime, animConfig)
      break

    case 'press':
      applyPressAnimation(group, animConfig, animationState)
      break

    case 'glb':
      // GLB animations handled separately via AnimationMixer
      break
  }
}

/**
 * Hover animation: smooth float up/down
 */
function applyHoverAnimation(
  group: THREE.Group,
  hovered: boolean,
  config: typeof DEFAULT_ANIMATION_CONFIG,
  state: AnimationState
): void {
  if (hovered) {
    state.baseHeight += (config.hoverHeight - state.baseHeight) * config.hoverSpeed
  } else {
    state.baseHeight *= (1 - config.hoverSpeed)
  }
  group.position.y = state.baseHeight
}

/**
 * Bobble animation: gentle sinusoidal motion
 */
function applyBobbleAnimation(
  group: THREE.Group,
  time: number,
  config: typeof DEFAULT_ANIMATION_CONFIG
): void {
  const bobble = Math.sin(time * config.bobbleFrequency) * config.bobbleAmplitude
  group.position.y = bobble
}

/**
 * Spin animation: continuous rotation
 */
function applySpinAnimation(
  group: THREE.Group,
  time: number,
  config: typeof DEFAULT_ANIMATION_CONFIG
): void {
  const axis = config.spinAxis
  if (axis === 'x') group.rotation.x = time * config.spinSpeed
  if (axis === 'y') group.rotation.y = time * config.spinSpeed
  if (axis === 'z') group.rotation.z = time * config.spinSpeed
}

/**
 * Press animation: push down and spring back
 */
function applyPressAnimation(
  group: THREE.Group,
  config: typeof DEFAULT_ANIMATION_CONFIG,
  state: AnimationState
): void {
  // Initialize press state if needed
  if (state.pressOffset === undefined) {
    state.pressOffset = 0
  }
  if (state.pressTarget === undefined) {
    state.pressTarget = 0
  }

  // Smoothly interpolate to target
  const speed = config.pressSpeed
  state.pressOffset += (state.pressTarget - state.pressOffset) * speed

  // Apply offset
  group.position.y = state.pressOffset
}

/**
 * Trigger press animation
 */
export function triggerPress(
  state: AnimationState,
  config: typeof DEFAULT_ANIMATION_CONFIG
): void {
  if (state.pressOffset === undefined) {
    state.pressOffset = 0
  }

  // Press down
  state.pressTarget = -config.pressDepth

  // Schedule release
  setTimeout(() => {
    state.pressTarget = 0
  }, config.pressDuration)
}

/**
 * Initialize GLB animation if needed
 */
export function initializeGLBAnimation(
  group: THREE.Group,
  config: InteractableConfig,
  state: AnimationState
): void {
  if (config.animationType !== 'glb') return

  const animConfig = { ...DEFAULT_ANIMATION_CONFIG, ...config.animationConfig }

  // Find animation clips in the model
  const mixer = new THREE.AnimationMixer(group)
  state.animationMixer = mixer

  // Find the specified clip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clips = (group as any).animations || []
  const clip = animConfig.clipName
    ? clips.find((c: THREE.AnimationClip) => c.name === animConfig.clipName)
    : clips[0] // Use first clip if no name specified

  if (clip) {
    const action = mixer.clipAction(clip)
    action.timeScale = animConfig.timeScale
    action.loop = animConfig.loop ? THREE.LoopRepeat : THREE.LoopOnce

    if (!animConfig.playOnHover) {
      action.play()
    }

    state.currentAction = action
  } else {
    console.warn(`[Interactable] No animation clip found for ${config.id}`)
  }
}

/**
 * Update GLB animation mixer
 */
export function updateGLBAnimation(
  state: AnimationState,
  delta: number,
  hovered: boolean,
  config: InteractableConfig
): void {
  if (!state.animationMixer) return

  const animConfig = { ...DEFAULT_ANIMATION_CONFIG, ...config.animationConfig }

  // Handle play on hover
  if (animConfig.playOnHover && state.currentAction) {
    if (hovered && !state.currentAction.isRunning()) {
      state.currentAction.reset()
      state.currentAction.play()
    } else if (!hovered && state.currentAction.isRunning() && !animConfig.loop) {
      // Optionally stop on hover end for non-looping animations
    }
  }

  state.animationMixer.update(delta)
}
