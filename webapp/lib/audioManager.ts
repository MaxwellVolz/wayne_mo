/**
 * Audio Manager for Wayne Mo
 *
 * Handles all game sound effects and music with:
 * - Lazy loading of audio files
 * - Volume control with localStorage persistence
 * - SSR-safe (no window access during build)
 */

type SoundId =
  | 'pickup'
  | 'delivery'
  | 'intersection'
  | 'taxiSpawn'
  | 'rushHour'
  | 'gameOver'
  | 'horn'
  | 'whip'
  | 'music'

interface AudioSettings {
  masterVolume: number
  sfxVolume: number
  musicVolume: number
  muted: boolean
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  sfxVolume: 0.8,
  musicVolume: 0.5,
  muted: false,
}

// Sound file paths - update these when adding actual audio files
const SOUND_PATHS: Record<SoundId, string> = {
  pickup: '/audio/pickup.mp3',
  delivery: '/audio/delivery.mp3',
  intersection: '/audio/click.mp3',
  taxiSpawn: '/audio/coin.mp3',
  rushHour: '/audio/rush_hour.mp3',
  gameOver: '/audio/game_over.mp3',
  horn: '/audio/horn.mp3',
  whip: '/audio/whip.mp3',
  music: '/audio/music.mp3',
}

// Volume multipliers for each sound (relative to category volume)
const SOUND_VOLUMES: Record<SoundId, number> = {
  pickup: 0.6,
  delivery: 1.0,
  intersection: 0.4,
  taxiSpawn: 0.7,
  rushHour: 0.1,
  gameOver: 0.8,
  horn: 0.3,
  whip: 0.8,
  music: 1.0,
}

class AudioManager {
  private audioContext: AudioContext | null = null
  private audioBuffers: Map<SoundId, AudioBuffer> = new Map()
  private loadingPromises: Map<SoundId, Promise<AudioBuffer | null>> = new Map()
  private settings: AudioSettings = DEFAULT_SETTINGS
  private musicSource: AudioBufferSourceNode | null = null
  private musicGainNode: GainNode | null = null
  private initialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings()
    }
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      this.initialized = true

      // Preload common sounds
      await Promise.all([
        this.loadSound('pickup'),
        this.loadSound('delivery'),
        this.loadSound('intersection'),
      ])
    } catch (e) {
      console.warn('Failed to initialize audio context:', e)
    }
  }

  /**
   * Resume audio context if suspended (required after user gesture)
   */
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /**
   * Load a sound file into memory
   */
  private async loadSound(id: SoundId): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null

    // Return cached buffer
    const cached = this.audioBuffers.get(id)
    if (cached) return cached

    // Return existing loading promise
    const existing = this.loadingPromises.get(id)
    if (existing) return existing

    // Start loading
    const loadPromise = (async () => {
      try {
        const response = await fetch(SOUND_PATHS[id])
        if (!response.ok) {
          console.warn(`Sound not found: ${SOUND_PATHS[id]}`)
          return null
        }
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer)
        this.audioBuffers.set(id, audioBuffer)
        return audioBuffer
      } catch (e) {
        console.warn(`Failed to load sound ${id}:`, e)
        return null
      }
    })()

    this.loadingPromises.set(id, loadPromise)
    return loadPromise
  }

  /**
   * Play a sound effect
   */
  async play(id: SoundId): Promise<void> {
    if (!this.audioContext || this.settings.muted) return

    await this.resume()

    let buffer: AudioBuffer | null | undefined = this.audioBuffers.get(id)
    if (!buffer) {
      buffer = await this.loadSound(id)
      if (!buffer) return
    }

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()

    source.buffer = buffer
    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Calculate final volume
    const isMusic = id === 'music'
    const categoryVolume = isMusic ? this.settings.musicVolume : this.settings.sfxVolume
    const soundVolume = SOUND_VOLUMES[id]
    gainNode.gain.value = this.settings.masterVolume * categoryVolume * soundVolume

    source.start(0)
  }

  /**
   * Play background music (loops)
   */
  async playMusic(): Promise<void> {
    if (!this.audioContext || this.settings.muted) return

    await this.resume()
    this.stopMusic()

    let buffer: AudioBuffer | null | undefined = this.audioBuffers.get('music')
    if (!buffer) {
      buffer = await this.loadSound('music')
      if (!buffer) return
    }

    this.musicSource = this.audioContext.createBufferSource()
    this.musicGainNode = this.audioContext.createGain()

    this.musicSource.buffer = buffer
    this.musicSource.loop = true
    this.musicSource.connect(this.musicGainNode)
    this.musicGainNode.connect(this.audioContext.destination)

    this.musicGainNode.gain.value =
      this.settings.masterVolume * this.settings.musicVolume * SOUND_VOLUMES.music

    this.musicSource.start(0)
  }

  /**
   * Stop background music
   */
  stopMusic(): void {
    if (this.musicSource) {
      try {
        this.musicSource.stop()
      } catch {
        // Already stopped
      }
      this.musicSource = null
      this.musicGainNode = null
    }
  }

  /**
   * Play a random car horn (for ambient traffic sounds)
   */
  async playRandomHorn(): Promise<void> {
    // Add slight randomization to volume and pitch
    if (!this.audioContext || this.settings.muted) return

    await this.resume()

    let buffer: AudioBuffer | null | undefined = this.audioBuffers.get('horn')
    if (!buffer) {
      buffer = await this.loadSound('horn')
      if (!buffer) return
    }

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()

    source.buffer = buffer
    source.playbackRate.value = 0.85 + Math.random() * 0.3 // Pitch variation (0.85-1.15)
    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Wide volume range to simulate horns at different distances
    const randomVolume = 0.15 + Math.random() * 0.85 // 0.15-1.0 range
    gainNode.gain.value =
      this.settings.masterVolume * this.settings.sfxVolume * SOUND_VOLUMES.horn * randomVolume

    source.start(0)
  }

  // Settings management

  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume))
    this.updateMusicVolume()
    this.saveSettings()
  }

  setSfxVolume(volume: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }

  setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume))
    this.updateMusicVolume()
    this.saveSettings()
  }

  setMuted(muted: boolean): void {
    this.settings.muted = muted
    if (muted) {
      this.stopMusic()
    }
    this.saveSettings()
  }

  toggleMute(): boolean {
    this.setMuted(!this.settings.muted)
    return this.settings.muted
  }

  private updateMusicVolume(): void {
    if (this.musicGainNode) {
      this.musicGainNode.gain.value =
        this.settings.masterVolume * this.settings.musicVolume * SOUND_VOLUMES.music
    }
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('wayneAudioSettings')
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      }
    } catch {
      // Use defaults
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('wayneAudioSettings', JSON.stringify(this.settings))
    } catch {
      // Storage not available
    }
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager()
  }
  return audioManagerInstance
}

// Convenience functions for common sounds
export const playPickupSound = () => getAudioManager().play('pickup')
export const playDeliverySound = () => getAudioManager().play('delivery')
export const playIntersectionSound = () => getAudioManager().play('intersection')
export const playTaxiSpawnSound = () => getAudioManager().play('taxiSpawn')
export const playRushHourSound = () => getAudioManager().play('rushHour')
export const playGameOverSound = () => getAudioManager().play('gameOver')
export const playWhipSound = () => getAudioManager().play('whip')
export const playRandomHorn = () => getAudioManager().playRandomHorn()
