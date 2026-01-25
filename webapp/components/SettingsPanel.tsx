'use client'

import { useState, useEffect } from 'react'
import { Settings, X, Volume2 } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import buttonStyles from '@/styles/components/buttons.module.css'
import styles from '@/styles/pages/SettingsPanel.module.css'

interface SettingsPanelProps {
  className?: string
}

export function SettingsPanel({ className }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const {
    muted,
    masterVolume,
    sfxVolume,
    musicVolume,
    toggleMute,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
  } = useAudio()

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      {/* Toggle button */}
      <button
        className={`${buttonStyles.icon} ${className || ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        title="Settings"
        aria-label="Settings"
      >
        <Settings size={24} />
      </button>

      {/* Settings overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <h3 className={styles.title}>Settings</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <Volume2 size={16} />
                Audio
              </h4>

              {/* Mute toggle */}
              <div className={styles.row}>
                <label className={styles.label}>Sound</label>
                <button
                  className={`${styles.toggleButton} ${!muted ? styles.toggleActive : ''}`}
                  onClick={toggleMute}
                >
                  {muted ? 'OFF' : 'ON'}
                </button>
              </div>

              {/* Master Volume */}
              <div className={styles.row}>
                <label className={styles.label}>Master</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume * 100}
                  onChange={e => setMasterVolume(parseInt(e.target.value) / 100)}
                  className={styles.slider}
                  disabled={muted}
                />
                <span className={styles.value}>{Math.round(masterVolume * 100)}%</span>
              </div>

              {/* SFX Volume */}
              <div className={styles.row}>
                <label className={styles.label}>SFX</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume * 100}
                  onChange={e => setSfxVolume(parseInt(e.target.value) / 100)}
                  className={styles.slider}
                  disabled={muted}
                />
                <span className={styles.value}>{Math.round(sfxVolume * 100)}%</span>
              </div>

              {/* Music Volume */}
              <div className={styles.row}>
                <label className={styles.label}>Music</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume * 100}
                  onChange={e => setMusicVolume(parseInt(e.target.value) / 100)}
                  className={styles.slider}
                  disabled={muted}
                />
                <span className={styles.value}>{Math.round(musicVolume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
