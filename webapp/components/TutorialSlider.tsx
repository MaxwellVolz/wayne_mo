'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from '@/styles/pages/TutorialSlider.module.css'

interface TutorialSlide {
  image: string
  text: string
}

const tutorialSlides: TutorialSlide[] = [
  {
    image: '/tutorial_01.png',
    text: 'Click intersections to control taxi routing. Green + for straight, blue ↶ for left, orange ↷ for right.'
  },
  {
    image: '/tutorial_02.png',
    text: 'Taxis automatically pick up colored packages and deliver them to matching colored destinations.'
  },
  {
    image: '/tutorial_03.png',
    text: 'Earn money from deliveries. Earn more tips for being timely. You have 120 seconds!'
  }
]

export function TutorialSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % tutorialSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + tutorialSlides.length) % tutorialSlides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className={styles.tutorialSlider}>
      <div className={styles.sliderContent}>
        {/* Previous Arrow */}
        <button className={styles.arrow} onClick={prevSlide}>
          ‹
        </button>

        {/* Slide */}
        <div className={styles.slide}>
          <div className={styles.slideImage}>
            <Image
              src={tutorialSlides[currentSlide].image}
              alt={`Tutorial step ${currentSlide + 1}`}
              width={600}
              height={400}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: 'auto',
                maxHeight: '100%'
              }}
              priority
            />
          </div>
          <p className={styles.slideText}>{tutorialSlides[currentSlide].text}</p>
        </div>

        {/* Next Arrow */}
        <button className={styles.arrow} onClick={nextSlide}>
          ›
        </button>
      </div>

      {/* Dots Indicator */}
      <div className={styles.dots}>
        {tutorialSlides.map((_, index) => (
          <button
            key={index}
            className={index === currentSlide ? styles.dotActive : styles.dot}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
