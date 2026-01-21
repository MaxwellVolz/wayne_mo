/**
 * Intro Scene Interactables Configuration
 * Defines all interactive objects in the intro scene
 */

import { InteractableConfig } from '@/lib/interactableSystem'

// Import 3D models
import { Model as TheHeadset } from '@/generated_components/vr_headset'
import { Model as ThePizza } from '@/generated_components/pizza'
import { Model as TheTutorialButton } from '@/generated_components/tutorial_button'

/**
 * Create interactables configuration for intro scene
 */
export function createIntroInteractables(
  onPlay: () => void,
  onTutorial: () => void,
  onSmallCity?: () => void
): InteractableConfig[] {
  return [
    // Headset - Play button
    {
      id: 'headset_play',
      modelComponent: TheHeadset,
      position: [-7.2, 1.48, 10.7],
      radius: 0.15,
      onClick: onPlay,
      animationType: 'hover',
      animationConfig: {
        hoverHeight: 0.15,
        hoverSpeed: 0.1,
        bobbleAmplitude: 0.05,
        bobbleFrequency: 3,
      },
      label: '← Play',
      labelPosition: [0.15, -0.15, 0.7], // Relative to text group, not object
    },

    // Pizza - Small City navigation
    {
      id: 'pizza_small_city',
      modelComponent: ThePizza,
      position: [-7.6, 1.5, 10.6],
      radius: 0.2,
      onClick: onSmallCity,
      animationType: 'hover',
      animationConfig: {
        hoverHeight: 0.15,
        hoverSpeed: 0.1,
        bobbleAmplitude: 0.05,
        bobbleFrequency: 3,
      },
      label: `Small\n  City`,
      labelPosition: [-0.4, -0.15, 0.6],
    },

    // Tutorial Button - Opens tutorial level
    {
      id: 'tutorial_button',
      modelComponent: TheTutorialButton,
      position: [-6.531, 1.43, 10.737], // Position from the model
      radius: 0.3,
      onClick: onTutorial,
      animationType: 'press',
      animationConfig: {
        pressDepth: 0.08,
        pressSpeed: 0.25,
        pressDuration: 150,
      },
    },
  ]
}
