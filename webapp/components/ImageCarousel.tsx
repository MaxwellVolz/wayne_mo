'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import CarouselSlide from './CarouselSlide'
import { carouselSlides } from '@/config/carouselSlides'
import buttonStyles from '@/styles/components/buttons.module.css'
import styles from '@/styles/pages/ImageCarousel.module.css'

interface ImageCarouselProps {
  onClose: () => void
}

export default function ImageCarousel({ onClose }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  const goToNext = useCallback(() => {
    setDirection('right')
    setCurrentIndex((prev) => (prev + 1) % carouselSlides.length)
  }, [])

  const goToPrevious = useCallback(() => {
    setDirection('left')
    setCurrentIndex(
      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length
    )
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goToNext, goToPrevious])

  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      goToNext()
    }
    if (touchStart - touchEnd < -75) {
      goToPrevious()
    }
  }

  return (
    <div
      className={styles.carouselContainer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className={`${buttonStyles.icon} ${styles.closeButton}`}
        onClick={onClose}
        aria-label="Close carousel"
      >
        <X size={24} />
      </button>

      <div className={styles.slideContainer}>
        <CarouselSlide
          slide={carouselSlides[currentIndex]}
          direction={direction}
          key={currentIndex}
        />
      </div>

      <button
        className={`${buttonStyles.icon} ${styles.navButton} ${styles.navButtonLeft}`}
        onClick={goToPrevious}
        aria-label="Previous slide"
        disabled={currentIndex === 0}
      >
        <ChevronLeft size={32} />
      </button>

      <button
        className={`${buttonStyles.icon} ${styles.navButton} ${styles.navButtonRight}`}
        onClick={goToNext}
        aria-label="Next slide"
        disabled={currentIndex === carouselSlides.length - 1}
      >
        <ChevronRight size={32} />
      </button>

      <div className={styles.progressDots}>
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
            onClick={() => {
              setDirection(index > currentIndex ? 'right' : 'left')
              setCurrentIndex(index)
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
