/**
 * React hook for audio system integration
 */

import { useCallback, useEffect, useState } from 'react'
import { getAudioManager } from '@/lib/audioManager'

interface UseAudioReturn {
  initialized: boolean
  muted: boolean
  masterVolume: number
  sfxVolume: number
  musicVolume: number
  init: () => Promise<void>
  toggleMute: () => void
  setMasterVolume: (v: number) => void
  setSfxVolume: (v: number) => void
  setMusicVolume: (v: number) => void
  playMusic: () => void
  stopMusic: () => void
}

export function useAudio(): UseAudioReturn {
  const [initialized, setInitialized] = useState(false)
  const [muted, setMuted] = useState(false)
  const [masterVolume, setMasterVolumeState] = useState(0.7)
  const [sfxVolume, setSfxVolumeState] = useState(0.8)
  const [musicVolume, setMusicVolumeState] = useState(0.5)

  // Load initial settings
  useEffect(() => {
    const audio = getAudioManager()
    const settings = audio.getSettings()
    setMuted(settings.muted)
    setMasterVolumeState(settings.masterVolume)
    setSfxVolumeState(settings.sfxVolume)
    setMusicVolumeState(settings.musicVolume)
  }, [])

  const init = useCallback(async () => {
    const audio = getAudioManager()
    await audio.init()
    setInitialized(true)
  }, [])

  const toggleMute = useCallback(() => {
    const audio = getAudioManager()
    const newMuted = audio.toggleMute()
    setMuted(newMuted)
  }, [])

  const setMasterVolume = useCallback((v: number) => {
    const audio = getAudioManager()
    audio.setMasterVolume(v)
    setMasterVolumeState(v)
  }, [])

  const setSfxVolume = useCallback((v: number) => {
    const audio = getAudioManager()
    audio.setSfxVolume(v)
    setSfxVolumeState(v)
  }, [])

  const setMusicVolume = useCallback((v: number) => {
    const audio = getAudioManager()
    audio.setMusicVolume(v)
    setMusicVolumeState(v)
  }, [])

  const playMusic = useCallback(() => {
    const audio = getAudioManager()
    audio.playMusic()
  }, [])

  const stopMusic = useCallback(() => {
    const audio = getAudioManager()
    audio.stopMusic()
  }, [])

  return {
    initialized,
    muted,
    masterVolume,
    sfxVolume,
    musicVolume,
    init,
    toggleMute,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    playMusic,
    stopMusic,
  }
}
