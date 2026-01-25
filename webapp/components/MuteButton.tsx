'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import buttonStyles from '@/styles/components/buttons.module.css'

interface MuteButtonProps {
  className?: string
}

export function MuteButton({ className }: MuteButtonProps) {
  const { muted, toggleMute } = useAudio()

  return (
    <button
      onClick={toggleMute}
      className={`${buttonStyles.icon} ${className || ''}`}
      title={muted ? 'Unmute' : 'Mute'}
      aria-label={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
    </button>
  )
}
