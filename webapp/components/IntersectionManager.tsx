'use client'

import { useMemo } from 'react'
import { IntersectionTile } from './IntersectionTile'
import { useIntersectionManager } from '@/hooks/useIntersectionManager'
import { getRoadNetwork } from '@/data/roads'

/**
 * Manages and renders all intersection control tiles
 * Each intersection displays a visual indicator showing its current mode
 * Click to cycle through modes: pass → left → right → pass
 */
export function IntersectionManager() {
  const { intersections, toggleIntersectionMode } = useIntersectionManager()
  const network = useMemo(() => getRoadNetwork(), [])

  return (
    <group name="intersection-manager">
      {Array.from(intersections.entries()).map(([nodeId, state]) => {
        const node = network.nodes.find(n => n.id === nodeId)
        if (!node) {
          console.warn(`⚠️ Intersection node ${nodeId} not found in network`)
          return null
        }

        return (
          <IntersectionTile
            key={nodeId}
            position={node.position}
            mode={state.mode}
            onClick={() => toggleIntersectionMode(nodeId)}
          />
        )
      })}
    </group>
  )
}
