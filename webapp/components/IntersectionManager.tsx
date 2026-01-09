'use client'

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

  // Get network fresh each render (it's cached internally anyway)
  const network = getRoadNetwork()

  return (
    <group name="intersection-manager">
      {Array.from(intersections.entries())
        .map(([nodeId, state]) => {
          const node = network.nodes.find(n => n.id === nodeId)
          if (!node) {
            // Silently skip - this is normal during network initialization
            // The hook will re-initialize once the real network loads
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
        })
        .filter(Boolean)}
    </group>
  )
}
