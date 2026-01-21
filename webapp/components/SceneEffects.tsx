'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment, Stars } from '@react-three/drei'
import * as THREE from 'three'

interface SceneEffectsProps {
  fogDensity?: number
  showSky?: boolean
  showStars?: boolean
}

/**
 * Shared scene effects component
 * Adds atmospheric fog, skybox, and configures renderer settings
 * Used by Scene.tsx, TutorialGameScene.tsx, SmallCitySceneCanvas.tsx, IntroScene.tsx
 */
export function SceneEffects({
  fogDensity = 0.035,
  showSky = true,
  showStars = true,
}: SceneEffectsProps) {
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

  return (
    <>
      {/* Night sky environment - provides ambient lighting and background */}
      {showSky && (
        <Environment
          preset="night"
          background
          backgroundBlurriness={0.5}
          backgroundIntensity={0.3}
          environmentIntensity={0.4}
        />
      )}

      {/* Procedural starfield for night atmosphere */}
      {showStars && (
        <>
          <Stars
            radius={10}
            depth={50}
            count={3000}
            factor={4}
            saturation={1}
            fade
            speed={2.5}
          />
          <Stars
            radius={50}
            depth={100}
            count={2000}
            factor={8}
            saturation={1}
            fade
            speed={0.5}
          />
        </>
      )}
    </>
  )
}
