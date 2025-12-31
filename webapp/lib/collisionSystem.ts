import type { Taxi } from '@/types/game'
import { samplePath } from './movement'

/**
 * Collision threshold between taxis (in units)
 */
const COLLISION_THRESHOLD = 0.5

/**
 * Collision cooldown duration (milliseconds)
 * Prevents immediate re-collision after reversal
 */
const COLLISION_COOLDOWN = 2000

/**
 * Checks for collisions between all taxis and handles reversals
 *
 * @param taxis - Array of all taxis in the game
 * @param deltaMs - Time elapsed since last frame in milliseconds
 */
export function checkTaxiCollisions(taxis: Taxi[], deltaMs: number): void {
  // Update cooldowns
  for (const taxi of taxis) {
    if (taxi.collisionCooldown > 0) {
      taxi.collisionCooldown -= deltaMs
    }
  }

  // Check each pair of taxis for collision
  for (let i = 0; i < taxis.length; i++) {
    for (let j = i + 1; j < taxis.length; j++) {
      const taxi1 = taxis[i]
      const taxi2 = taxis[j]

      // Skip if either taxi is on cooldown or already reversing
      if (taxi1.collisionCooldown > 0 || taxi2.collisionCooldown > 0) {
        continue
      }

      if (taxi1.isReversing || taxi2.isReversing) {
        continue
      }

      // Get positions
      if (!taxi1.path || !taxi2.path) continue

      const pos1 = samplePath(taxi1.path, taxi1.t)
      const pos2 = samplePath(taxi2.path, taxi2.t)

      const distance = pos1.distanceTo(pos2)

      // Collision detected!
      if (distance < COLLISION_THRESHOLD) {
        console.log(`💥 COLLISION: ${taxi1.id} ↔️ ${taxi2.id} (distance: ${distance.toFixed(2)})`)

        // Both taxis set destination to return to previous node
        sendTaxiBack(taxi1)
        sendTaxiBack(taxi2)
      }
    }
  }
}

/**
 * Immediately reverses taxi direction on current path
 *
 * @param taxi - Taxi to reverse
 */
function sendTaxiBack(taxi: Taxi): void {
  console.log(`⏪ ${taxi.id} reversing immediately at t=${taxi.t.toFixed(2)}`)

  // Immediately start reversing along current path
  taxi.isReversing = true

  // Set cooldown to prevent immediate re-collision
  taxi.collisionCooldown = COLLISION_COOLDOWN
}
