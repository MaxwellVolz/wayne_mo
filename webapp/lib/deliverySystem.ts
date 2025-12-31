import * as THREE from 'three'
import type { DeliveryEvent, RoadNode, Taxi, CombatTextEvent } from '@/types/game'

/**
 * Collision threshold for pickup/dropoff detection (in units)
 */
const COLLISION_THRESHOLD = 2.0

/**
 * Base payout for deliveries
 */
const BASE_PAYOUT = 100

/**
 * Payout per unit of distance
 */
const PAYOUT_PER_DISTANCE = 10

/**
 * Color palette for delivery events (16 distinct colors)
 */
const DELIVERY_COLORS = [
  '#00ff00', // Green
  '#0088ff', // Blue
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#ff8800', // Orange
  '#00ffff', // Cyan
  '#ff0088', // Pink
  '#88ff00', // Lime
  '#ff0000', // Red
  '#8800ff', // Purple
  '#00ff88', // Teal
  '#ff8888', // Light Red
  '#88ff88', // Light Green
  '#8888ff', // Light Blue
  '#ffff88', // Light Yellow
  '#ff88ff', // Light Magenta
]

/**
 * Spawns a new delivery event with random pickup and dropoff nodes
 *
 * @param pickupNodes - Array of nodes that can be pickup points
 * @param activeDeliveries - Currently active deliveries (to avoid color conflicts)
 * @returns New delivery event
 */
export function spawnDeliveryEvent(
  pickupNodes: RoadNode[],
  activeDeliveries: DeliveryEvent[] = []
): DeliveryEvent | null {
  if (pickupNodes.length < 2) {
    console.warn('⚠️ Not enough pickup nodes to spawn delivery')
    return null
  }

  // Select random pickup node
  const pickupNode = pickupNodes[Math.floor(Math.random() * pickupNodes.length)]

  // Select random dropoff node (different from pickup)
  let dropoffNode: RoadNode
  do {
    dropoffNode = pickupNodes[Math.floor(Math.random() * pickupNodes.length)]
  } while (dropoffNode.id === pickupNode.id)

  // Calculate distance for payout
  const distance = pickupNode.position.distanceTo(dropoffNode.position)

  // Calculate payout (base + distance bonus + zone multipliers)
  const pickupMultiplier = pickupNode.metadata?.payoutMultiplier || 1.0
  const dropoffMultiplier = dropoffNode.metadata?.payoutMultiplier || 1.0
  const payout = Math.floor(
    (BASE_PAYOUT + distance * PAYOUT_PER_DISTANCE) *
    ((pickupMultiplier + dropoffMultiplier) / 2)
  )

  // Select color that's not already in use by active deliveries
  const usedColors = new Set(activeDeliveries.map(d => d.color))
  const availableColors = DELIVERY_COLORS.filter(c => !usedColors.has(c))

  // If all colors are in use, just pick a random one (unlikely with 16 colors)
  const colorPool = availableColors.length > 0 ? availableColors : DELIVERY_COLORS
  const color = colorPool[Math.floor(Math.random() * colorPool.length)]

  const event: DeliveryEvent = {
    id: `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pickupNodeId: pickupNode.id,
    dropoffNodeId: dropoffNode.id,
    status: 'waiting_pickup',
    spawnTime: Date.now(),
    payout,
    color
  }

  console.log(`📦 Spawned delivery: ${pickupNode.id} → ${dropoffNode.id} ($${payout}) [${color}]`)
  return event
}

/**
 * Finds active pickup near a position
 *
 * @param position - Position to check
 * @param activeDeliveries - Array of active delivery events
 * @param pickupNodes - Array of pickup nodes
 * @returns Delivery event and node if found
 */
export function findActivePickupNear(
  position: THREE.Vector3,
  activeDeliveries: DeliveryEvent[],
  pickupNodes: RoadNode[]
): { event: DeliveryEvent; node: RoadNode } | null {
  // Find deliveries waiting for pickup
  const waitingDeliveries = activeDeliveries.filter(d => d.status === 'waiting_pickup')

  for (const delivery of waitingDeliveries) {
    const pickupNode = pickupNodes.find(n => n.id === delivery.pickupNodeId)
    if (!pickupNode) continue

    const distance = position.distanceTo(pickupNode.position)
    if (distance < COLLISION_THRESHOLD) {
      return { event: delivery, node: pickupNode }
    }
  }

  return null
}

/**
 * Finds active dropoff for a specific delivery near a position
 *
 * @param position - Position to check
 * @param deliveryId - ID of the delivery being carried
 * @param activeDeliveries - Array of active delivery events
 * @param pickupNodes - Array of pickup nodes (used as dropoffs too)
 * @returns Delivery event and node if found
 */
export function findActiveDropoffNear(
  position: THREE.Vector3,
  deliveryId: string,
  activeDeliveries: DeliveryEvent[],
  pickupNodes: RoadNode[]
): { event: DeliveryEvent; node: RoadNode } | null {
  const delivery = activeDeliveries.find(d => d.id === deliveryId && d.status === 'in_transit')
  if (!delivery) return null

  const dropoffNode = pickupNodes.find(n => n.id === delivery.dropoffNodeId)
  if (!dropoffNode) return null

  const distance = position.distanceTo(dropoffNode.position)
  if (distance < COLLISION_THRESHOLD) {
    return { event: delivery, node: dropoffNode }
  }

  return null
}

/**
 * Handles pickup collision - taxi claims a delivery
 *
 * @param taxi - Taxi that picked up the package
 * @param event - Delivery event being picked up
 */
export function handlePickup(taxi: Taxi, event: DeliveryEvent): void {
  taxi.hasPackage = true
  taxi.currentDeliveryId = event.id
  event.status = 'in_transit'
  event.claimedByTaxiId = taxi.id
  event.pickupTime = Date.now()

  console.log(`🚕 ${taxi.id} picked up ${event.id} at ${event.pickupNodeId}`)
}

/**
 * Handles dropoff collision - taxi completes a delivery
 *
 * @param taxi - Taxi that delivered the package
 * @param event - Delivery event being completed
 * @returns Payout amount
 */
export function handleDropoff(taxi: Taxi, event: DeliveryEvent): number {
  taxi.hasPackage = false
  taxi.currentDeliveryId = undefined
  taxi.money += event.payout
  event.status = 'completed'
  event.deliveryTime = Date.now()

  const deliveryTime = ((event.deliveryTime - event.spawnTime) / 1000).toFixed(1)
  console.log(`✅ ${taxi.id} completed ${event.id} at ${event.dropoffNodeId} (+$${event.payout}) in ${deliveryTime}s`)

  return event.payout
}

/**
 * Checks all taxis for pickup/dropoff collisions and handles them
 *
 * @param taxis - Array of taxis to check
 * @param activeDeliveries - Array of active delivery events
 * @param pickupNodes - Array of pickup nodes
 * @returns Object with completed delivery IDs and combat text events
 */
export function checkDeliveryCollisions(
  taxis: Taxi[],
  activeDeliveries: DeliveryEvent[],
  pickupNodes: RoadNode[]
): { completedIds: string[]; combatTextEvents: CombatTextEvent[] } {
  const completedIds: string[] = []
  const combatTextEvents: CombatTextEvent[] = []

  for (const taxi of taxis) {
    if (!taxi.path) continue

    // Get current taxi position (interpolate along path)
    const points = taxi.path.points
    if (points.length < 2) continue

    // Simple interpolation for collision check
    const segmentLength = 1 / (points.length - 1)
    const segmentIndex = Math.floor(taxi.t / segmentLength)
    const localT = (taxi.t % segmentLength) / segmentLength

    const p1 = points[Math.min(segmentIndex, points.length - 2)]
    const p2 = points[Math.min(segmentIndex + 1, points.length - 1)]
    const taxiPosition = new THREE.Vector3().lerpVectors(p1, p2, localT)

    // Check for pickup collision (ONLY if taxi doesn't have package - one at a time!)
    if (!taxi.hasPackage) {
      const pickup = findActivePickupNear(taxiPosition, activeDeliveries, pickupNodes)
      if (pickup) {
        handlePickup(taxi, pickup.event)
      }
    }
    // If taxi already has package, ignore other pickups
    else {
      // Check if we're near a pickup (to log that we're ignoring it)
      const nearbyPickup = findActivePickupNear(taxiPosition, activeDeliveries, pickupNodes)
      if (nearbyPickup && Math.random() < 0.1) { // Log 10% of the time to avoid spam
        console.log(`🚫 ${taxi.id} ignoring pickup ${nearbyPickup.event.id} (already carrying ${taxi.currentDeliveryId})`)
      }
    }

    // Check for dropoff collision (ONLY if taxi has package)
    if (taxi.currentDeliveryId) {
      const dropoff = findActiveDropoffNear(
        taxiPosition,
        taxi.currentDeliveryId,
        activeDeliveries,
        pickupNodes
      )
      if (dropoff) {
        const payout = handleDropoff(taxi, dropoff.event)
        completedIds.push(dropoff.event.id)

        // Create combat text event
        combatTextEvents.push({
          id: `combat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          position: taxiPosition.clone(),
          text: `+$${payout}`,
          spawnTime: Date.now()
        })
      }
    }
  }

  return { completedIds, combatTextEvents }
}
