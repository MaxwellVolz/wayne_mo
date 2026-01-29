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
    title: 'Yo, what up! First day? Do you have any experience?',
    description: '',
    animation: 'handshake',
    nextButtonText: 'Not really...',
  },
  {
    title: 'Oh...that\s great.',
    description: '',
    animation: 'shakeitoff',
    nextButtonText: 'Uh...',
  },
  {
    title: "All good. We'll get you up to speed in no time.",
    description: '',
    animation: 'stretching',
    nextButtonText: 'Okay!',
  },
  {
    title: 'Adjust the viewport with the camera controls in the bottom left.',
    description: '',
    animation: 'talking',
    nextButtonText: "Let's go!",
  },
  {
    title: "The taxis will stay on the road, you just gotta direct them to the biggest packages.",
    description: '',
    animation: 'agreeing',
    nextButtonText: 'Got it',
  },
  {
    title: 'Tap an intersection to set the vibe. The next cab that rolls through will know what to do.',
    description: '',
    animation: 'dismiss',
    nextButtonText: '🤙',
  },
  {
    title: 'Once you got a pickup, the cabs underglow will match the dropoff rings. Direct it there ASAP.',
    description: '',
    animation: 'salute.001',
    nextButtonText: "Great!",
  },
  {
    title: "Remember...Passthrough, Counter Clock-wise, Clock-wise...I think...'yeah I just finished up'",
    description: '',
    animation: 'cellphone_convo',
    nextButtonText: "...Ok bye!",
  }
]
