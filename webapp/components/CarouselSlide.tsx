'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { SlideConfig } from '@/config/carouselSlides'
import styles from '@/styles/pages/ImageCarousel.module.css'

interface CarouselSlideProps {
  slide: SlideConfig
  direction: 'left' | 'right'
}

export default function CarouselSlide({
  slide,
  direction,
}: CarouselSlideProps) {
  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? -1000 : 1000,
      opacity: 0,
    }),
  }

  return (
    <motion.div
      className={styles.slide}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <div className={styles.imageWrapper}>
        <Image
          src={slide.imageSrc}
          alt={slide.alt}
          width={1080}
          height={1080}
          className={styles.image}
          priority
        />
      </div>

      <AnimatePresence>
        {slide.animations.map((anim, index) => (
          <motion.div
            key={index}
            className={styles.animatedOverlay}
            style={{
              position: 'absolute',
              ...anim.initialPosition,
            }}
            initial={anim.initial}
            animate={anim.animate}
            transition={anim.transition}
          >
            {anim.content}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
