'use client'

import { Line } from '@react-three/drei'
import { getRoadNetwork } from '@/data/roads'
import { nodeHasType } from '@/lib/extractPathNodes'

interface RoadVisualizerProps {
  debugMode: boolean
}

/**
 * Visualizes road paths with debug lines
 * Shows the path network that taxis follow
 */
export default function RoadVisualizer({ debugMode }: RoadVisualizerProps) {
  const network = getRoadNetwork()

  return (
    <group>
      {/* Show paths as lines (only in debug mode) */}
      {debugMode && network.paths.map((path) => {
        const points = path.points.map((p) => [p.x, p.y, p.z] as [number, number, number])

        return (
          <Line
            key={path.id}
            points={points}
            color="#00ff88"
            lineWidth={2}
            dashed={false}
          />
        )
      })}

      {/* Show nodes as small spheres with colors based on type (only in debug mode) */}
      {debugMode && network.nodes.map((node) => {
        // Color based on node type
        let color = '#888888' // default gray
        if (nodeHasType(node, 'pickup')) color = '#00ff00' // green
        if (nodeHasType(node, 'dropoff')) color = '#ff0000' // red
        if (nodeHasType(node, 'red_light')) color = '#ff8800' // orange
        if (nodeHasType(node, 'service')) color = '#0088ff' // blue
        if (nodeHasType(node, 'intersection')) color = '#ffff00' // yellow

        return (
          <mesh key={node.id} position={node.position}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
        )
      })}
    </group>
  )
}
