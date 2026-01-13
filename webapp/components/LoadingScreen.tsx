'use client'

import { useEffect } from 'react'
import styles from '@/styles/pages/LoadingScreen.module.css'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 3500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className={styles.loadingContainer}>
      <svg
        className={styles.logoSvg}
        viewBox="0 0 200 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          className={styles.logoShapeOuter}
          points="100,20 180,60 180,140 100,180 20,140 20,60"
        />
        <circle
          className={styles.logoShapeInner}
          cx="100"
          cy="100"
          r="40"
        />
        <text
          className={styles.logoText}
          x="100"
          y="220"
          textAnchor="middle"
        >
          WAYNE MO
        </text>
      </svg>
    </div>
  )
}
