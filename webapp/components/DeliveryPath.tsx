'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface DeliveryPathProps {
  pickupPosition: THREE.Vector3
  dropoffPosition: THREE.Vector3
  color: string
  opacity?: number
  size?: number
}

/**
 * Arc of spheres showing the path from pickup to dropoff
 */
export function DeliveryPath({
  pickupPosition,
  dropoffPosition,
  color,
  opacity = 0.5,
  size = 0.15
}: DeliveryPathProps) {
  // Calculate points along the curve
  const spherePoints = useMemo(() => {
    const start = new THREE.Vector3(
      pickupPosition.x,
      pickupPosition.y + 0.6,
      pickupPosition.z
    )
    const end = new THREE.Vector3(
      dropoffPosition.x,
      dropoffPosition.y + 0.6,
      dropoffPosition.z
    )

    // Create an arc by raising the midpoint
    const midX = (pickupPosition.x + dropoffPosition.x) / 2
    const midZ = (pickupPosition.z + dropoffPosition.z) / 2
    const distance = pickupPosition.distanceTo(dropoffPosition)
    console.log(distance);
    const arcHeight = Math.min(distance * 0.5, 4)

    const midPoint = new THREE.Vector3(
      midX,
      Math.max(pickupPosition.y, dropoffPosition.y) + 0.4 + arcHeight,
      midZ
    )

    // Sample points along quadratic bezier curve
    // const numSpheres = 8
    const numSpheres = Math.floor(distance * 2)


    const visibleSpheres = numSpheres - 1
    const points: { position: THREE.Vector3; opacity: number, size: number }[] = []

    for (let i = 0; i < numSpheres; i++) {
      const t = i / (numSpheres - 1)

      // Quadratic Bezier formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
      const point = new THREE.Vector3()
      point.x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * midPoint.x + Math.pow(t, 2) * end.x
      point.y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * midPoint.y + Math.pow(t, 2) * end.y
      point.z = Math.pow(1 - t, 2) * start.z + 2 * (1 - t) * t * midPoint.z + Math.pow(t, 2) * end.z

      // Opacity decreases from start to end with harder falloff
      const sphereOpacity = opacity * Math.pow(1 - t, .8) // Exponential falloff
      const sphereSize = 0.05 + (0.4 - 0.1) * Math.pow(1 - t, 0.75)
      points.push({ position: point, opacity: sphereOpacity, size: sphereSize })
    }

    return points.slice(1, visibleSpheres)
  }, [pickupPosition, dropoffPosition, opacity])

  return (
    <group>
      {spherePoints.map((point, index) => (
        <mesh key={index} position={point.position}>
          <sphereGeometry args={[point.size, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            transparent
            opacity={point.opacity}
          />
        </mesh>
      ))}
    </group>
  )
}
