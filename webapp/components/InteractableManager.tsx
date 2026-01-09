/**
 * InteractableManager Component
 * Manages all interactive objects in the intro scene
 */

'use client'

import Interactable from './Interactable'
import { InteractableConfig } from '@/lib/interactableSystem'

interface InteractableManagerProps {
  interactables: InteractableConfig[]
  isPointerDown: boolean
}

/**
 * Renders all interactable objects from a configuration array
 */
export default function InteractableManager({
  interactables,
  isPointerDown,
}: InteractableManagerProps) {
  return (
    <>
      {interactables.map((config) => (
        <Interactable key={config.id} config={config} isPointerDown={isPointerDown} />
      ))}
    </>
  )
}
