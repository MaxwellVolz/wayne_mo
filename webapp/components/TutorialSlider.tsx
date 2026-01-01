'use client'

import { useState } from 'react'
import Image from 'next/image'

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
    <div className="tutorial-slider">
      <div className="slider-content">
        {/* Previous Arrow */}
        <button className="arrow arrow-left" onClick={prevSlide}>
          ‹
        </button>

        {/* Slide */}
        <div className="slide">
          <div className="slide-image">
            <Image
              src={tutorialSlides[currentSlide].image}
              alt={`Tutorial step ${currentSlide + 1}`}
              width={600}
              height={400}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <p className="slide-text">{tutorialSlides[currentSlide].text}</p>
        </div>

        {/* Next Arrow */}
        <button className="arrow arrow-right" onClick={nextSlide}>
          ›
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="dots">
        {tutorialSlides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .tutorial-slider {
          width: 100%;
          max-width: 700px;
          margin: 2rem auto;
        }

        .slider-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
        }

        .arrow {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.5);
          color: white;
          font-size: 3rem;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          padding-bottom: 4px;
          flex-shrink: 0;
          line-height: 0;
          font-family: Arial, sans-serif;
        }

        .arrow:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }

        .arrow:active {
          transform: scale(0.95);
        }

        .slide {
          flex: 1;
          text-align: center;
        }

        .slide-image {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slide-text {
          color: white;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0;
          padding: 0 2rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .dots {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }

        .dot:hover {
          background: rgba(255, 255, 255, 0.5);
          transform: scale(1.2);
        }

        .dot.active {
          background: #ffff00;
          border-color: #ff6b00;
          transform: scale(1.3);
        }

        @media (max-width: 768px) {
          .tutorial-slider {
            max-width: 90%;
          }

          .slider-content {
            gap: 0.5rem;
          }

          .arrow {
            font-size: 2rem;
            width: 40px;
            height: 40px;
            line-height: 0;
            padding-bottom: 3px;
          }

          .slide-image {
            min-height: 250px;
            padding: 0.5rem;
          }

          .slide-text {
            font-size: 0.95rem;
            padding: 0 1rem;
          }
        }

        @media (max-width: 480px) {
          .tutorial-slider {
            max-width: 95%;
          }

          .slider-content {
            gap: 0.25rem;
          }

          .arrow {
            font-size: 1.5rem;
            width: 32px;
            height: 32px;
            line-height: 0;
            padding-bottom: 2px;
          }

          .slide-image {
            min-height: 200px;
            padding: 0.25rem;
          }

          .slide-text {
            font-size: 0.85rem;
            padding: 0 0.5rem;
          }

          .dots {
            gap: 0.5rem;
            margin-top: 1rem;
          }

          .dot {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
    </div>
  )
}
