# Delivery System Implementation Plan

## Overview

Implement the core gameplay loop: autonomous taxis pick up and deliver packages between pickup and dropoff zones marked in the Blender scene.

## Current State

✅ **Completed:**
- Topological intersection routing system
- Node extraction from Blender with type system
- Taxi movement along paths
- Intersection control UI

🎯 **Next Phase:** Delivery event system and collision detection

## Design Requirements

### 1. Blender Integration - Node Types

**Pickup Nodes:**
- Naming convention: `Pickup_*` (e.g., `Pickup_Downtown_01`, `Pickup_Airport`)
- Extracted via existing `parseNodeTypes()` in `extractPathNodes.ts`
- Already supported in type system: `NodeType = 'pickup'`

**Dropoff Nodes:**
- Naming convention: `Dropoff_*` (e.g., `Dropoff_Airport`, `Dropoff_Downtown_01`)
- Extracted via existing `parseNodeTypes()` in `extractPathNodes.ts`
- Already supported in type system: `NodeType = 'dropoff'`

**Metadata Support:**
- Optional custom properties in Blender:
  - `zoneName` - Display name (e.g., "Downtown District")
  - `payoutMultiplier` - Money multiplier for deliveries (default: 1.0)

### 2. Delivery Event System

**Event Structure:**
```typescript
interface DeliveryEvent {
  id: string
  pickupNodeId: string
  dropoffNodeId: string
  status: 'waiting_pickup' | 'in_transit' | 'completed'
  claimedByTaxiId?: string
  spawnTime: number
  pickupTime?: number
  deliveryTime?: number
  payout: number
}
```

**Spawn Logic:**
- Timer-based spawning: Every X seconds (configurable, start with 10s)
- Random pickup node selection
- Random dropoff node selection (different from pickup)
- Calculate payout based on distance and zone multipliers
- Add to active events list

**Event State Machine:**
1. `waiting_pickup` - Pickup node is active, waiting for taxi collision
2. `in_transit` - Package picked up by taxi, dropoff node now active
3. `completed` - Package delivered, event removed

### 3. Visual Indicators

**Active Pickup Indicator:**
- Position: Above pickup node at Y+1.0
- Visual: Pulsing/glowing sphere or box icon
- Color: Green (#00ff00)
- Animation: Slow pulse or bob up/down
- Component: `<PickupIndicator position={node.position} />`

**Active Dropoff Indicator:**
- Position: Above dropoff node at Y+1.0
- Visual: Pulsing/glowing sphere or box icon
- Color: Blue (#0088ff)
- Animation: Slow pulse or bob up/down
- Component: `<DropoffIndicator position={node.position} />`

**Taxi Package Indicator:**
- Position: Above taxi at Y+0.5 offset
- Visual: Small box/package icon
- Color: Yellow (#ffff00)
- Follows taxi position
- Only visible when `taxi.hasPackage === true`
- Component: `<PackageIndicator taxiPosition={taxi.position} />`

### 4. Collision Detection

**Approach: Position-based distance check**
- Run every frame in game loop
- For each taxi:
  - Check distance to active pickup nodes (if taxi doesn't have package)
  - Check distance to active dropoff nodes (if taxi has package)
- Collision threshold: 2.0 units (generous to avoid missed pickups)

**Pickup Collision:**
```typescript
if (!taxi.hasPackage) {
  const activePickup = findActivePickupNear(taxi.position)
  if (activePickup && distance < COLLISION_THRESHOLD) {
    // Consume pickup
    taxi.hasPackage = true
    taxi.currentDeliveryId = activePickup.id
    event.status = 'in_transit'
    event.claimedByTaxiId = taxi.id
    event.pickupTime = Date.now()
  }
}
```

**Dropoff Collision:**
```typescript
if (taxi.hasPackage && taxi.currentDeliveryId) {
  const activeDropoff = findActiveDropoffFor(taxi.currentDeliveryId)
  if (activeDropoff && distance < COLLISION_THRESHOLD) {
    // Consume dropoff
    taxi.hasPackage = false
    taxi.money += event.payout
    event.status = 'completed'
    event.deliveryTime = Date.now()
    removeEvent(event.id)
  }
}
```

### 5. Data Model Updates

**Taxi Interface Extensions:**
```typescript
interface Taxi {
  // ... existing fields
  hasPackage: boolean
  currentDeliveryId?: string
  money: number
}
```

**Game State Extensions:**
```typescript
interface GameState {
  // ... existing fields
  activeDeliveries: DeliveryEvent[]
  deliverySpawnTimer: number
  deliverySpawnInterval: number // milliseconds
}
```

## Implementation Steps

### Phase 1: Data Layer (1 hour)
- [ ] Update `types/game.ts` with DeliveryEvent interface
- [ ] Extend Taxi interface with hasPackage, currentDeliveryId, money
- [ ] Extend GameState with activeDeliveries array
- [ ] Create `lib/deliverySystem.ts` with event management functions
  - [ ] `spawnDeliveryEvent()`
  - [ ] `findActivePickupNear(position)`
  - [ ] `findActiveDropoffFor(deliveryId)`
  - [ ] `completeDelivery()`

### Phase 2: Visual Indicators (1 hour)
- [ ] Create `components/PickupIndicator.tsx` - green pulsing icon
- [ ] Create `components/DropoffIndicator.tsx` - blue pulsing icon
- [ ] Create `components/PackageIndicator.tsx` - yellow box above taxi
- [ ] Create `components/DeliveryManager.tsx` - renders all active indicators
- [ ] Add DeliveryManager to Scene.tsx

### Phase 3: Game Loop Integration (1 hour)
- [ ] Add delivery spawn timer to game loop
- [ ] Add collision detection to game loop
  - [ ] Check taxi-to-pickup distance
  - [ ] Check taxi-to-dropoff distance
  - [ ] Handle pickup consumption
  - [ ] Handle dropoff consumption
- [ ] Update useGameLoop to manage delivery events

### Phase 4: Testing & Polish (30 min)
- [ ] Test with 1 taxi, 1 delivery event
- [ ] Test with multiple delivery events
- [ ] Verify indicators show/hide correctly
- [ ] Verify package indicator follows taxi
- [ ] Test collision detection threshold
- [ ] Add console logging for delivery lifecycle

## Testing Checklist

- [ ] Pickup and dropoff nodes are extracted from Blender correctly
- [ ] Delivery event spawns every X seconds
- [ ] Pickup indicator appears at correct node
- [ ] Taxi can collide with pickup to claim it
- [ ] Package indicator appears above taxi after pickup
- [ ] Dropoff indicator appears after pickup is claimed
- [ ] Taxi can collide with dropoff to complete delivery
- [ ] Package indicator disappears after delivery
- [ ] Money is awarded to taxi after delivery
- [ ] Multiple delivery events can be active simultaneously
- [ ] Different taxis can claim different deliveries

## Future Enhancements (Out of Scope)

- Delivery time limits / urgency system
- Multiple packages per taxi
- Delivery history / statistics
- Visual path preview to destination
- Sound effects for pickup/dropoff
- Particle effects on collision
- Money display UI
- Combo multipliers for fast deliveries

## File Structure

```
webapp/
├── types/game.ts                    # Add DeliveryEvent, extend Taxi & GameState
├── lib/
│   └── deliverySystem.ts            # NEW - Event management functions
├── components/
│   ├── PickupIndicator.tsx          # NEW - Green pulsing pickup icon
│   ├── DropoffIndicator.tsx         # NEW - Blue pulsing dropoff icon
│   ├── PackageIndicator.tsx         # NEW - Yellow package above taxi
│   ├── DeliveryManager.tsx          # NEW - Renders all indicators
│   └── Scene.tsx                    # MODIFY - Add DeliveryManager
└── hooks/
    └── useGameLoop.ts               # MODIFY - Add delivery spawn timer & collision
```

## Success Criteria

✅ Delivery system is complete when:
1. Pickup and dropoff nodes are visible and extractable from Blender
2. Delivery events spawn automatically on a timer
3. Visual indicators show active pickups and dropoffs
4. Taxis can claim pickups via collision
5. Package indicator follows taxi during transit
6. Taxis can complete deliveries via collision
7. Money is awarded on completion
8. Multiple deliveries can be active at once
9. System is stable with 10+ active deliveries

## Notes

- Keep collision detection simple - distance checks are sufficient
- Use emissive materials for indicators to make them glow
- Default spawn interval: 10 seconds (adjustable later)
- Default collision threshold: 2.0 units
- Payout calculation: base 100 + distance * 10 + zoneMultiplier
- No taxi state changes needed - they continue autonomous routing
- Deliveries are "auto-claimed" by first taxi to collide with pickup
