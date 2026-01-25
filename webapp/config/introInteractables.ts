/**
 * Intro Scene Interactables Configuration
 * Defines all interactive objects in the intro scene
 *
 * Models have BAKED positions from Blender - no relative positioning needed!
 * 3 Desk levels at different Y heights:
 *   - Desk 1 (Van):        Y ≈ 0.4
 *   - Desk 2 (Taco Shop):  Y ≈ 2.2
 *   - Desk 3 (Mid-City):   Y ≈ 4.2
 */

import { InteractableConfig } from '@/lib/interactableSystem'
import { getAudioManager, playWhipSound } from '@/lib/audioManager'

// Import 3D models - numbered variants have baked positions for each desk level
import { Model as VrHeadset01 } from '@/generated_components/vr_headset_01'
import { Model as VrHeadset02 } from '@/generated_components/vr_headset_02'
import { Model as VrHeadset03 } from '@/generated_components/vr_headset_03'
import { Model as Pizza01 } from '@/generated_components/pizza_01'
import { Model as Pizza02 } from '@/generated_components/pizza_02'
import { Model as Pizza03 } from '@/generated_components/pizza_03'
import { Model as TutorialButton01 } from '@/generated_components/tutorial_button_01'
import { Model as TutorialButton02 } from '@/generated_components/tutorial_button_02'

/**
 * DESK ANCHOR POINT - used for text labels only
 * Update this when the shop model moves
 */
export const DESK_ANCHOR: [number, number, number] = [-3.55, 0.8, 10.35]

/**
 * Desk level Y offsets for labels
 */
export const DESK_LEVELS = {
  desk1: 0,      // Van - base level
  desk2: 1.78,   // Taco Shop - offset from base
  desk3: 3.78,   // Mid-City - offset from base
}

/**
 * Create interactables configuration for intro scene
 * Models have baked positions, so position is [0,0,0]
 * Interaction spheres need explicit positions for click detection
 */
export function createIntroInteractables(
  onPlay: () => void,
  onTutorial: () => void,
  onSmallCity?: () => void
): InteractableConfig[] {
  // Wrap onPlay to initialize audio and play whip sound
  const handlePlay = async () => {
    await getAudioManager().init()
    playWhipSound()
    onPlay()
  }

  return [
    // ========== DESK 1 (Van) ==========
    {
      id: 'headset_01',
      modelComponent: VrHeadset01,
      position: [-3.38, 0.421, 10.625],  // Exact baked position
      radius: 0.15,
      onClick: handlePlay,
      animationType: 'hover',
      animationConfig: { hoverHeight: 0.1, bobbleAmplitude: 0.03, bobbleFrequency: 2 },
    },
    {
      id: 'pizza_01',
      modelComponent: Pizza01,
      position: [-3.798, 0.421, 10.632],  // Exact baked position
      radius: 0.15,
      onClick: onSmallCity,
      animationType: 'hover',
      animationConfig: { hoverHeight: 0.1, bobbleAmplitude: 0.03, bobbleFrequency: 2 },
    },
    {
      id: 'tutorial_01',
      modelComponent: TutorialButton01,
      position: [-2.807, 0.456, 10.731],  // Exact baked position
      radius: 0.2,
      onClick: onTutorial,
      animationType: 'press',
      animationConfig: { pressDepth: 0.05, pressSpeed: 0.2, pressDuration: 150 },
    },

    // ========== DESK 2 (Taco Shop) ==========
    {
      id: 'headset_02',
      modelComponent: VrHeadset02,
      position: [-3.38, 2.203, 10.625],  // Exact baked position
      radius: 0.15,
      onClick: handlePlay,
      animationType: 'hover',
      animationConfig: { hoverHeight: 0.1, bobbleAmplitude: 0.03, bobbleFrequency: 2 },
    },
    {
      id: 'pizza_02',
      modelComponent: Pizza02,
      position: [-3.798, 2.203, 10.632],  // Exact baked position
      radius: 0.15,
      onClick: onSmallCity,
      animationType: 'hover',
      animationConfig: { hoverHeight: 0.1, bobbleAmplitude: 0.03, bobbleFrequency: 2 },
    },
    {
      id: 'tutorial_02',
      modelComponent: TutorialButton02,
      position: [-2.807, 2.231, 10.731],  // Exact baked position
      radius: 0.2,
      onClick: onTutorial,
      animationType: 'press',
      animationConfig: { pressDepth: 0.05, pressSpeed: 0.2, pressDuration: 150 },
    },

    // ========== DESK 3 (Mid-City) ==========
    {
      id: 'headset_03',
      modelComponent: VrHeadset03,
      position: [-3.38, 4.188, 10.625],  // Exact baked position
      radius: 0.15,
      onClick: handlePlay,
      animationType: 'hover',
      animationConfig: { hoverHeight: 0.1, bobbleAmplitude: 0.03, bobbleFrequency: 2 },
    },
    {
      id: 'pizza_03',
      modelComponent: Pizza03,
      position: [-3.798, 4.188, 10.632],  // Exact baked position
      radius: 0.15,
      onClick: onSmallCity,
      animationType: 'hover',
      animationConfig: { hoverHeight: 0.1, bobbleAmplitude: 0.03, bobbleFrequency: 2 },
    },
    // Note: Only 2 tutorial buttons exist (01 and 02)
  ]
}
