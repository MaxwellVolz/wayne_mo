'use client'

import { Line } from '@react-three/drei'
import { testRoadNetwork } from '@/data/roads'

/**
 * Visualizes road paths with debug lines
 * Shows the path network that taxis follow
 */
export default function RoadVisualizer() {
  return (
    <group>
      {testRoadNetwork.paths.map((path) => {
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

      {/* Show nodes as small spheres */}
      {testRoadNetwork.nodes.map((node) => (
        <mesh key={node.id} position={node.position}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#ff0088" emissive="#ff0088" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}
