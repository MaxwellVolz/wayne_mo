/**
 * Dialogue steps for the intro sequence
 * Displayed as cinematic text overlays with character animations
 */

import { ActionName } from '@/components/Maxwell'

export type AnimationType = ActionName | null

export interface DialogueStep {
  title: string
  description: string
  animation: AnimationType
  nextButtonText: string
}

export const dialogueSteps: DialogueStep[] = [
  {
    title: 'The new guy running our latest operation! Do you have any experience?',
    description: '',
    animation: 'handshake',
    nextButtonText: 'Not really...',
  },
  {
    title: 'Great.',
    description: '',
    animation: 'shakeitoff',
    nextButtonText: 'Uh...',
  },
  {
    title: "It's all good. We'll get you up to speed in no time.",
    description: '',
    animation: 'stretching',
    nextButtonText: 'Okay!',
  },
  {
    title: "It's easy. The taxis will stay on the road, you just gotta direct them to the biggest packages.",
    description: '',
    animation: 'talking',
    nextButtonText: 'Got it',
  },
  {
    title: 'Tap an intersection to set the vibe. The next cab that rolls through will know what to do.',
    description: '',
    animation: 'agreeing',
    nextButtonText: 'Makes sense',
  },
  {
    title: 'Once you pickup a box, the cabs underglow will match the dropoff rings. Get it there ASAP.',
    description: '',
    animation: 'point_ahead',
    nextButtonText: "Let's go!",
  },
]
