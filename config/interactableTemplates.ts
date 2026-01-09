/**
 * Interactable Templates
 * Copy-paste examples for common interactable patterns
 *
 * To use: Copy a template, customize the values, and add to introInteractables.ts
 */

import { InteractableConfig } from '@/lib/interactableSystem'

// Import your model here
// import { Model as YourModel } from '@/generated_components/your_model'

/**
 * TEMPLATE 1: Basic clickable object with hover effect
 * Perfect for: Buttons, menu items, simple interactions
 */
const TEMPLATE_BASIC: InteractableConfig = {
  id: 'unique_id_here',
  modelComponent: null as any, // Replace with your model
  position: [0, 1.5, 0],
  radius: 0.2,
  onClick: () => {
    console.log('Clicked!')
  },
  animationType: 'hover_bobble',
  label: 'Click Me',
  labelPosition: [0, 2, 0],
}

/**
 * TEMPLATE 2: Door with open animation
 * Perfect for: Entrances, interactive doors, gates
 */
const TEMPLATE_DOOR: InteractableConfig = {
  id: 'door_entrance',
  modelComponent: null as any, // Replace with door model
  position: [-8, 1.2, 9],
  radius: 0.3,
  onClick: () => {
    // Navigate or trigger event
    console.log('Opening door...')
  },
  animationType: 'glb',
  animationConfig: {
    clipName: 'DoorOpen', // Must match Blender clip name
    playOnHover: true,
    loop: false,
  },
  label: 'Enter',
  labelPosition: [-8, 1.8, 9.3],
}

/**
 * TEMPLATE 3: Rotating collectible
 * Perfect for: Coins, power-ups, pickups, displays
 */
const TEMPLATE_ROTATING_COLLECTIBLE: InteractableConfig = {
  id: 'collectible_coin',
  modelComponent: null as any, // Replace with collectible model
  position: [-6.5, 1.5, 10],
  radius: 0.15,
  onClick: () => {
    // Collect item
    console.log('Collected!')
  },
  animationType: 'spin',
  animationConfig: {
    spinSpeed: 2,
    spinAxis: 'y',
  },
}

/**
 * TEMPLATE 4: Animated character/NPC
 * Perfect for: Characters, vendors, NPCs with idle animations
 */
const TEMPLATE_NPC: InteractableConfig = {
  id: 'npc_vendor',
  modelComponent: null as any, // Replace with character model
  position: [-7.5, 1.2, 9.5],
  radius: 0.4,
  onClick: () => {
    // Open dialogue or menu
    console.log('Talk to NPC...')
  },
  animationType: 'glb',
  animationConfig: {
    clipName: 'Idle',
    loop: true,
    timeScale: 1,
  },
  label: 'Talk',
  labelPosition: [-7.5, 2.5, 9.5],
}

/**
 * TEMPLATE 5: Pulsing/glowing object
 * Perfect for: Quest markers, important items, points of interest
 */
const TEMPLATE_PULSING: InteractableConfig = {
  id: 'quest_marker',
  modelComponent: null as any, // Replace with marker model
  position: [-7, 1.3, 11],
  radius: 0.25,
  onClick: () => {
    console.log('Quest started!')
  },
  animationType: 'bobble',
  animationConfig: {
    bobbleAmplitude: 0.08,
    bobbleFrequency: 2,
  },
}

/**
 * TEMPLATE 6: Static decoration (no animation)
 * Perfect for: Background props, scenery, environmental details
 */
const TEMPLATE_STATIC: InteractableConfig = {
  id: 'decoration_plant',
  modelComponent: null as any, // Replace with decoration model
  position: [-8.5, 1.0, 9.2],
  radius: 0.1,
  onClick: () => {
    // Optional: easter egg or flavor text
    console.log('Just a plant.')
  },
  animationType: 'none',
}

/**
 * TEMPLATE 7: Animated machine/device
 * Perfect for: Vending machines, terminals, interactive devices
 */
const TEMPLATE_MACHINE: InteractableConfig = {
  id: 'vending_machine',
  modelComponent: null as any, // Replace with machine model
  position: [-9, 1.2, 8.5],
  radius: 0.35,
  onClick: () => {
    console.log('Opening shop...')
  },
  animationType: 'glb',
  animationConfig: {
    clipName: 'Working',
    loop: true,
    timeScale: 0.8,
  },
  label: 'Shop',
  labelPosition: [-9, 2.2, 8.5],
}

/**
 * TEMPLATE 8: Hover-triggered animation
 * Perfect for: Interactive props that respond to hover
 */
const TEMPLATE_HOVER_TRIGGER: InteractableConfig = {
  id: 'interactive_prop',
  modelComponent: null as any, // Replace with prop model
  position: [-6, 1.4, 10.8],
  radius: 0.2,
  onClick: () => {
    console.log('Interacted!')
  },
  onHoverStart: () => {
    console.log('Hover started - play sound/animation')
  },
  onHoverEnd: () => {
    console.log('Hover ended')
  },
  animationType: 'glb',
  animationConfig: {
    clipName: 'Activate',
    playOnHover: true,
    loop: false,
  },
}

/**
 * TEMPLATE 9: Conditional visibility
 * Perfect for: Quest items, unlockables, state-dependent objects
 */
const TEMPLATE_CONDITIONAL: InteractableConfig = {
  id: 'secret_item',
  modelComponent: null as any, // Replace with secret model
  position: [-9.5, 0.8, 7.5],
  radius: 0.15,
  onClick: () => {
    console.log('Secret found!')
  },
  animationType: 'hover_bobble',
  // Toggle visibility based on game state
  visible: false, // Set to true when unlocked
}

/**
 * TEMPLATE 10: Multi-callback complex interaction
 * Perfect for: Main menu items, critical interactions
 */
const TEMPLATE_COMPLEX: InteractableConfig = {
  id: 'main_button',
  modelComponent: null as any, // Replace with button model
  position: [-7.2, 1.5, 10.7],
  radius: 0.2,
  onClick: () => {
    // Multiple actions
    console.log('Button clicked')
    // playSound('click')
    // trackAnalytics('button_press')
    // navigateToGame()
  },
  onHoverStart: () => {
    // playSound('hover')
    console.log('Hover start')
  },
  onHoverEnd: () => {
    // stopSound('hover')
    console.log('Hover end')
  },
  animationType: 'hover_bobble',
  animationConfig: {
    hoverHeight: 0.2,
    hoverSpeed: 0.12,
    bobbleAmplitude: 0.06,
    bobbleFrequency: 3.5,
  },
  label: 'START',
  labelPosition: [-7.2, 2.0, 10.7],
}

// Export all templates for reference
export const INTERACTABLE_TEMPLATES = {
  BASIC: TEMPLATE_BASIC,
  DOOR: TEMPLATE_DOOR,
  ROTATING_COLLECTIBLE: TEMPLATE_ROTATING_COLLECTIBLE,
  NPC: TEMPLATE_NPC,
  PULSING: TEMPLATE_PULSING,
  STATIC: TEMPLATE_STATIC,
  MACHINE: TEMPLATE_MACHINE,
  HOVER_TRIGGER: TEMPLATE_HOVER_TRIGGER,
  CONDITIONAL: TEMPLATE_CONDITIONAL,
  COMPLEX: TEMPLATE_COMPLEX,
}

/**
 * QUICK START GUIDE:
 *
 * 1. Copy a template above that matches your use case
 * 2. Replace null as any with your model import
 * 3. Update id, position, radius to match your scene
 * 4. Customize onClick callback
 * 5. Adjust animation settings if needed
 * 6. Add to introInteractables.ts
 *
 * Example:
 *
 * import { Model as MyDoor } from '@/generated_components/door'
 *
 * {
 *   ...TEMPLATE_DOOR,
 *   id: 'shop_entrance',
 *   modelComponent: MyDoor,
 *   onClick: () => router.push('/shop'),
 * }
 */
