'use client'

import * as THREE from 'three'
import React, { forwardRef, useImperativeHandle, useEffect, useRef } from 'react'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { getAssetPath } from '@/lib/assetPath'

export type ActionName = 'agreeing' | 'cellphone_convo' | 'dismiss' | 'handshake' | 'point_ahead' | 'salute.001' | 'shakeitoff' | 'stretching' | 'talking'

export interface MaxwellRef {
  playAnimation: (name: ActionName | null) => void
}

type GLTFResult = {
  nodes: {
    max_model: THREE.SkinnedMesh
    mixamorigHips: THREE.Bone
  }
  materials: {
    PolygonOffice_Charaters: THREE.MeshStandardMaterial
  }
}

interface MaxwellProps extends React.ComponentProps<'group'> {
  initialAnimation?: ActionName
}

/**
 * Maxwell character with animation control
 * Wraps the generated model with proper crossfade animation handling
 */
export const Maxwell = forwardRef<MaxwellRef, MaxwellProps>(function Maxwell(props, ref) {
  const { initialAnimation, ...rest } = props
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(getAssetPath('models/maxwell.glb'))
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult
  const { actions } = useAnimations(animations, group)
  const currentAction = useRef<THREE.AnimationAction | null>(null)
  const hasInitialized = useRef(false)

  useImperativeHandle(ref, () => ({
    playAnimation: (name: ActionName | null) => {
      if (name === null) {
        if (currentAction.current) {
          currentAction.current.fadeOut(0.3)
          currentAction.current = null
        }
        return
      }

      const newAction = actions[name]
      if (!newAction) return

      // Set the new action to play immediately
      newAction.reset()
      newAction.setEffectiveTimeScale(1)
      newAction.setEffectiveWeight(1)
      newAction.play()

      if (currentAction.current && currentAction.current !== newAction) {
        // Crossfade from old animation
        newAction.crossFadeFrom(currentAction.current, 0.3, true)
      }

      currentAction.current = newAction
    },
  }))

  // Play initial animation on mount
  useEffect(() => {
    if (initialAnimation && actions[initialAnimation] && !hasInitialized.current) {
      hasInitialized.current = true
      const action = actions[initialAnimation]
      action.reset()
      action.setEffectiveTimeScale(1)
      action.setEffectiveWeight(1)
      action.play()
      currentAction.current = action
    }
  }, [initialAnimation, actions])

  useEffect(() => {
    return () => {
      if (currentAction.current) {
        currentAction.current.stop()
      }
    }
  }, [])

  return (
    <group ref={group} {...rest} dispose={null}>
      <group name="Scene">
        <group name="maxwell_armature" position={[-1.475, 7.593, 1.854]} rotation={[Math.PI / 2, 0, -3.086]} scale={0.00005} userData={{ name: 'maxwell_armature' }}>
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh name="max_model" geometry={nodes.max_model.geometry} material={materials.PolygonOffice_Charaters} skeleton={nodes.max_model.skeleton} userData={{ name: 'max_model' }} />
        </group>
      </group>
    </group>
  )
})

useGLTF.preload(getAssetPath('models/maxwell.glb'))
