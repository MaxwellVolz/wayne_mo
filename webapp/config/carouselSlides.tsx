import { getAssetPath } from '@/lib/assetPath'
import { ArrowRight, Target, Zap } from 'lucide-react'

export interface AnimationConfig {
  content: React.ReactNode
  initialPosition: {
    top?: string
    left?: string
    right?: string
    bottom?: string
    transform?: string
  }
  initial: any
  animate: any
  transition: any
}

export interface SlideConfig {
  imageSrc: string
  alt: string
  animations: AnimationConfig[]
}

export const carouselSlides: SlideConfig[] = [
  {
    imageSrc: getAssetPath('/tutorial_01.png'),
    alt: 'Camera controls tutorial',
    animations: [
      {
        content: <ArrowRight size={48} color="#ffff00" strokeWidth={3} />,
        initialPosition: { top: '20%', left: '15%' },
        initial: { opacity: 0, scale: 0.5 },
        animate: {
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        },
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop' as const,
          delay: 0.5,
        },
      },
      {
        content: (
          <div
            style={{
              background: 'rgba(255, 255, 0, 0.9)',
              color: '#000',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '18px',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 4px 12px rgba(255, 255, 0, 0.3)',
            }}
          >
            DRAG TO LOOK AROUND
          </div>
        ),
        initialPosition: {
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
        },
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.6,
          delay: 1,
          ease: 'easeOut',
        },
      },
    ],
  },

  {
    imageSrc: getAssetPath('/tutorial_02.png'),
    alt: 'Intersection routing tutorial',
    animations: [
      {
        content: (
          <div
            style={{
              width: '120px',
              height: '120px',
              border: '4px solid #ff6b00',
              borderRadius: '50%',
              boxShadow:
                '0 0 20px rgba(255, 107, 0, 0.6), inset 0 0 20px rgba(255, 107, 0, 0.4)',
            }}
          />
        ),
        initialPosition: {
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
        initial: { scale: 0.8, opacity: 0 },
        animate: {
          scale: [1, 1.15, 1],
          opacity: [0.8, 1, 0.8],
        },
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'loop' as const,
        },
      },
      {
        content: <Target size={40} color="#ff6b00" strokeWidth={3} />,
        initialPosition: {
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
        },
        initial: { opacity: 0, y: -20 },
        animate: {
          opacity: 1,
          y: [0, -10, 0],
        },
        transition: {
          opacity: { duration: 0.4, delay: 0.3 },
          y: { duration: 1.5, repeat: Infinity, repeatType: 'loop' as const },
        },
      },
      {
        content: (
          <div
            style={{
              background: 'rgba(255, 107, 0, 0.95)',
              color: '#000',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)',
            }}
          >
            TAP TO CHANGE
            <br />
            DIRECTION
          </div>
        ),
        initialPosition: {
          top: '65%',
          left: '50%',
          transform: 'translateX(-50%)',
        },
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: {
          duration: 0.5,
          delay: 0.8,
        },
      },
    ],
  },

  {
    imageSrc: getAssetPath('/tutorial_03.png'),
    alt: 'Delivery mechanics tutorial',
    animations: [
      {
        content: (
          <div
            style={{
              width: '100px',
              height: '100px',
              background:
                'radial-gradient(circle, rgba(0, 255, 0, 0.6) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
        ),
        initialPosition: {
          top: '30%',
          left: '30%',
          transform: 'translate(-50%, -50%)',
        },
        initial: { scale: 0.5, opacity: 0 },
        animate: {
          scale: [1, 1.3, 1],
          opacity: [0.6, 0.9, 0.6],
        },
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop' as const,
        },
      },
      {
        content: (
          <svg width="200" height="100" style={{ overflow: 'visible' }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#00ffff" />
              </marker>
            </defs>
            <path
              d="M 10 50 Q 100 10, 190 50"
              stroke="#00ffff"
              strokeWidth="4"
              fill="none"
              markerEnd="url(#arrowhead)"
              strokeDasharray="10,5"
            />
          </svg>
        ),
        initialPosition: { top: '35%', left: '25%' },
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
        },
        transition: {
          opacity: { duration: 0.4, delay: 0.5 },
        },
      },
      {
        content: (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0, 255, 255, 0.9)',
              color: '#000',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '18px',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 4px 12px rgba(0, 255, 255, 0.3)',
            }}
          >
            <Zap size={28} color="#000" fill="#000" />
            MATCH THE COLORS
          </div>
        ),
        initialPosition: {
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
        },
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.6,
          delay: 1.2,
        },
      },
    ],
  },
]
