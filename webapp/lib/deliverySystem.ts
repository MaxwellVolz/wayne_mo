import * as THREE from 'three'
import type { DeliveryEvent, RoadNode, Taxi } from '@/types/game'

/**
 * Collision threshold for pickup detection (in units)
 */
const PICKUP_COLLISION_THRESHOLD = 1.1

/**
 * Collision threshold for dropoff detection (in units)
 */
const DROPOFF_COLLISION_THRESHOLD = 1.1

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
  '#ff1a1a', // Vivid Red
  '#ff6a00', // Hot Orange
  '#ffb000', // Deep Yellow
  '#ff00aa', // Neon Pink
  '#c400ff', // Electric Purple
  '#5a00ff', // Royal Violet
  '#004dff', // Bold Blue
  '#0019ff', // Deep Blue
  '#8b0000', // Dark Red
  '#ff3d00', // Vermilion
  '#ff0099', // Punch Pink
  '#9b00ff', // Saturated Purple
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

  // Get all nodes currently in use by active deliveries
  const usedNodeIds = new Set<string>()
  activeDeliveries.forEach(delivery => {
    if (delivery.status === 'waiting_pickup') {
      usedNodeIds.add(delivery.pickupNodeId)
    }
    if (delivery.status === 'in_transit') {
      usedNodeIds.add(delivery.dropoffNodeId)
    }
  })

  // Filter out nodes that are already in use
  const availableNodes = pickupNodes.filter(node => !usedNodeIds.has(node.id))

  if (availableNodes.length < 2) {
    console.warn('⚠️ Not enough available pickup nodes (all nodes in use)')
    return null
  }

  // Select random pickup node from available nodes
  const pickupNode = availableNodes[Math.floor(Math.random() * availableNodes.length)]

  // Select random dropoff node (different from pickup)
  // For dropoff, we can use ANY pickup node (not just available ones)
  // This gives us more options and prevents infinite loops
  const dropoffCandidates = pickupNodes.filter(node => node.id !== pickupNode.id)

  if (dropoffCandidates.length === 0) {
    console.warn('⚠️ No valid dropoff nodes (only one pickup node exists)')
    return null
  }

  const dropoffNode = dropoffCandidates[Math.floor(Math.random() * dropoffCandidates.length)]

  // Double-check that pickup and dropoff are different
  if (pickupNode.id === dropoffNode.id) {
    console.error('❌ GUARD FAILED: Pickup and dropoff are the same node!')
    return null
  }

  // Calculate distance for payout
  const distance = pickupNode.position.distanceTo(dropoffNode.position)

  // Calculate zone multipliers
  const pickupMultiplier = pickupNode.metadata?.payoutMultiplier || 1.0
  const dropoffMultiplier = dropoffNode.metadata?.payoutMultiplier || 1.0
  const avgZoneMultiplier = (pickupMultiplier + dropoffMultiplier) / 2

  // Calculate delivery multiplier (1-4) with good distribution
  // Use distance-based tiers with randomization for variety
  let deliveryMultiplier: number
  const random = Math.random()

  if (distance < 8) {
    // Short distance: 60% tier 1, 30% tier 2, 10% tier 3
    deliveryMultiplier = random < 0.6 ? 1 : random < 0.9 ? 2 : 3
  } else if (distance < 16) {
    // Medium distance: 20% tier 1, 50% tier 2, 25% tier 3, 5% tier 4
    deliveryMultiplier = random < 0.2 ? 1 : random < 0.7 ? 2 : random < 0.95 ? 3 : 4
  } else if (distance < 24) {
    // Long distance: 10% tier 2, 60% tier 3, 30% tier 4
    deliveryMultiplier = random < 0.1 ? 2 : random < 0.7 ? 3 : 4
  } else {
    // Very long distance: 20% tier 3, 80% tier 4
    deliveryMultiplier = random < 0.2 ? 3 : 4
  }

  // Calculate payout (base + distance bonus + zone multipliers)
  const payout = Math.floor(
    (BASE_PAYOUT + distance * PAYOUT_PER_DISTANCE) *
    avgZoneMultiplier
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
    color,
    multiplier: deliveryMultiplier,
    distance
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
    if (distance < PICKUP_COLLISION_THRESHOLD) {
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
  if (distance < DROPOFF_COLLISION_THRESHOLD) {
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
 * @returns Array of completed delivery IDs
 */
export function checkDeliveryCollisions(
  taxis: Taxi[],
  activeDeliveries: DeliveryEvent[],
  pickupNodes: RoadNode[]
): string[] {
  const completedIds: string[] = []

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
        handleDropoff(taxi, dropoff.event)
        completedIds.push(dropoff.event.id)
      }
    }
  }

  return completedIds
}
