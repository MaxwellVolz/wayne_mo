'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface SceneEffectsProps {
  fogDensity?: number
}

/**
 * Shared scene effects component
 * Adds atmospheric fog and configures renderer settings
 * Used by Scene.tsx, TutorialGameScene.tsx, SmallCitySceneCanvas.tsx, IntroScene.tsx
 */
export function SceneEffects({ fogDensity = 0.035 }: SceneEffectsProps) {
  const { scene, gl } = useThree()

  useEffect(() => {
    // Add atmospheric fog
    scene.fog = new THREE.FogExp2(0x0f1115, fogDensity)

    // Configure renderer for enhanced realism
    gl.outputColorSpace = THREE.SRGBColorSpace
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 0.9

    return () => {
      scene.fog = null
    }
  }, [scene, gl, fogDensity])

  return null
}
