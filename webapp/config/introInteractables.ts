/**
 * Intro Scene Interactables Configuration
 * Defines all interactive objects in the intro scene
 */

import { InteractableConfig } from '@/lib/interactableSystem'

// Import 3D models
import { Model as TheHeadset } from '@/generated_components/vr_headset'
import { Model as ThePizza } from '@/generated_components/pizza'
import { Model as TheNutcracker } from '@/generated_components/nutcracker'

/**
 * Create interactables configuration for intro scene
 */
export function createIntroInteractables(
  onPlay: () => void,
  onTutorial: () => void,
  onNutcrackerClick?: () => void
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

    // Pizza - Tutorial button
    {
      id: 'pizza_tutorial',
      modelComponent: ThePizza,
      position: [-7.6, 1.5, 10.6],
      radius: 0.2,
      onClick: onTutorial,
      animationType: 'hover',
      animationConfig: {
        hoverHeight: 0.15,
        hoverSpeed: 0.1,
        bobbleAmplitude: 0.05,
        bobbleFrequency: 3,
      },
      label: `How\n  To\n   Play\n Pizza`,
      labelPosition: [-0.4, -0.15, 0.6], // Relative to text group, not object
    },

    // Nutcracker - Navigate to Small City
    {
      id: 'nutcracker_city',
      modelComponent: TheNutcracker,
      position: [-8.199, 1, 11.07], // Interaction sphere position
      radius: 0.4, // Larger radius for easier clicking
      onClick: () => {
        console.log('Nutcracker clicked!')
        onNutcrackerClick?.()
      },
      animationType: 'hover',
      animationConfig: {
        hoverHeight: 0.1,
        hoverSpeed: 0.08,
        bobbleAmplitude: 0.04,
        bobbleFrequency: 2.5,
      },
    },

    // Example: Additional interactables to add later
    // Uncomment and customize as needed:

    // {
    //   id: 'shop_entrance',
    //   modelComponent: SomeDoorModel,
    //   position: [-8, 1.2, 9],
    //   radius: 0.3,
    //   onClick: () => console.log('Open shop'),
    //   animationType: 'glb',
    //   animationConfig: {
    //     clipName: 'DoorOpen',
    //     playOnHover: true,
    //     loop: false,
    //   },
    // },

    // {
    //   id: 'neon_sign',
    //   modelComponent: NeonSignModel,
    //   position: [-7, 2.5, 10],
    //   radius: 0.4,
    //   onClick: () => console.log('Toggle neon'),
    //   animationType: 'glb',
    //   animationConfig: {
    //     clipName: 'Flicker',
    //     loop: true,
    //   },
    // },

    // {
    //   id: 'rotating_taxi',
    //   modelComponent: TaxiModel,
    //   position: [-6.5, 1.3, 11],
    //   radius: 0.25,
    //   onClick: () => console.log('Inspect taxi'),
    //   animationType: 'spin',
    //   animationConfig: {
    //     spinSpeed: 0.5,
    //     spinAxis: 'y',
    //   },
    // },
  ]
}
