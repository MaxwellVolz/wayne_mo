'use client'

import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'
import buttonStyles from '@/styles/components/buttons.module.css'
import styles from '@/styles/pages/KeyboardHints.module.css'

interface KeyboardHintsProps {
  className?: string
}

const SHORTCUTS = [
  { key: 'Space', action: 'Pause / Resume' },
  { key: '1', action: 'Overview camera' },
  { key: '2-9', action: 'Follow taxi #' },
  { key: '?', action: 'Toggle this help' },
]

export function KeyboardHints({ className }: KeyboardHintsProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for "?" key to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setIsOpen(prev => !prev)
      } else if (e.key === 'Escape' && isOpen) {
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
        title="Keyboard shortcuts (?)"
        aria-label="Keyboard shortcuts"
      >
        <Keyboard size={24} />
      </button>

      {/* Hints overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <h3 className={styles.title}>Keyboard Shortcuts</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.list}>
              {SHORTCUTS.map(({ key, action }) => (
                <div key={key} className={styles.row}>
                  <kbd className={styles.key}>{key}</kbd>
                  <span className={styles.action}>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
