# Implementation Plan - Intersection Routing Game

Based on `docs/game_concept.md` - Player controls intersections, not taxis.

## Design Summary

**Core Mechanic:** Tap intersections to toggle routing (pass through / turn left / turn right)

**Player Never:** Directly controls taxis, assigns deliveries, micromanages

**Player Always:** Sets persistent traffic rules that all taxis follow

## What We Have (Foundation Complete)

- ✅ Path-based movement system
- ✅ Blender workflow with path nodes
- ✅ Intersection nodes in road graph
- ✅ Taxi visualization with state colors
- ✅ Node connection system (`next_nodes`)
- ✅ Multiple taxi support

## What We Need (MVP Features)

### Phase 1: Intersection Control System (Core Mechanic)

**Goal:** Player can tap intersections and taxis respond to routing

#### 1.1 Intersection State
```typescript
type IntersectionMode = 'pass_through' | 'turn_left' | 'turn_right'

interface IntersectionState {
  nodeId: string
  mode: IntersectionMode
  visualIndicator: THREE.Object3D  // Arrow or icon
}
```

**Tasks:**
- Add `mode` property to intersection nodes
- Default all intersections to `pass_through`
- Store in game state

#### 1.2 Intersection Visual Indicators
- Create 3D arrow/icon above each intersection
- Color code:
  - Pass through: Green arrow forward
  - Turn left: Blue arrow left
  - Turn right: Orange arrow right
- Scale large enough to see from camera distance

#### 1.3 Intersection Click Detection
- Use raycasting on intersection nodes
- On click: cycle mode (pass → left → right → pass)
- Update visual indicator immediately
- No UI menu needed - just tap to cycle

#### 1.4 Taxi Routing Logic
When taxi reaches intersection:
```typescript
function getNextPathFromIntersection(
  currentPath: RoadPath,
  intersection: IntersectionState
): RoadPath {
  const destinationNode = currentPath.split('_to_')[1]
  const node = findNode(destinationNode)

  switch (intersection.mode) {
    case 'pass_through':
      return straightPath(node)
    case 'turn_left':
      return leftPath(node)
    case 'turn_right':
      return rightPath(node)
  }
}
```

**Implementation:**
- Update `getNextPath()` in `data/roads.ts`
- Check if destination node is an intersection
- If yes, apply intersection mode to choose path
- If no, use default path selection

**Files to modify:**
- `data/roads.ts` - Add intersection state, update getNextPath()
- `types/game.ts` - Add IntersectionState type
- `components/Intersection.tsx` - New component for visual indicator
- `hooks/useIntersectionClick.ts` - New hook for raycasting clicks

**Deliverable:** Player taps intersection, taxis change routes

---

### Phase 2: Delivery System

**Goal:** Deliveries spawn, taxis claim them, earn money

#### 2.1 Delivery Spawn
```typescript
interface Delivery {
  id: string
  pickupNode: string
  dropoffNode: string
  claimedBy: string | null  // taxi id
  payout: number
  status: 'available' | 'claimed' | 'completed'
}
```

**Tasks:**
- Spawn deliveries at random pickup nodes (not intersections)
- Choose random dropoff node
- Display ribbon/line connecting pickup to dropoff
- Show delivery icon at pickup location

#### 2.2 Auto-Claiming
- When taxi enters pickup node, check for unclaimed deliveries
- First taxi to arrive claims it
- Update taxi visual (change color to show "has package")
- Update delivery status

#### 2.3 Delivery Completion
- When taxi with delivery reaches dropoff node
- Award money
- Remove delivery
- Taxi becomes available again

**Visual Feedback:**
- Pickup: Glowing cube/package icon
- Dropoff: Target circle/marker
- Ribbon: Curved line connecting them (Three.js CatmullRomCurve3)
- Claimed: Package follows taxi

**Files to create:**
- `lib/deliverySystem.ts` - Spawn, claim, complete logic
- `components/Delivery.tsx` - Visual representation
- `components/DeliveryRibbon.tsx` - Connecting line
- `hooks/useDeliverySpawner.ts` - Automatic spawning

**Deliverable:** Deliveries spawn, taxis auto-claim, money increases

---

### Phase 3: Collision System

**Goal:** Taxis that collide reverse direction

#### 3.1 Collision Detection
```typescript
function checkCollisions(taxis: Taxi[]): void {
  for (let i = 0; i < taxis.length; i++) {
    for (let j = i + 1; j < taxis.length; j++) {
      const distance = taxis[i].position.distanceTo(taxis[j].position)
      if (distance < COLLISION_RADIUS) {
        handleCollision(taxis[i], taxis[j])
      }
    }
  }
}
```

#### 3.2 Reverse Logic
```typescript
function handleCollision(taxiA: Taxi, taxiB: Taxi): void {
  // Both taxis reverse direction on their current path
  taxiA.t = Math.max(0, taxiA.t - 0.1)  // Go backwards
  taxiB.t = Math.max(0, taxiB.t - 0.1)

  // Mark as colliding (visual feedback)
  taxiA.isColliding = true
  taxiB.isColliding = true

  // Reset after delay
  setTimeout(() => {
    taxiA.isColliding = false
    taxiB.isColliding = false
  }, 1000)
}
```

**Visual Feedback:**
- Flash red when colliding
- Show "COLLISION" text briefly
- Slight screen shake (optional)

**Files to modify:**
- `lib/movement.ts` - Add collision detection
- `components/Taxi.tsx` - Add collision visual state
- `types/game.ts` - Add isColliding flag

**Deliverable:** Taxis reverse on collision, lose time

---

### Phase 4: Multi-Taxi Scaling

**Goal:** Start with 1 taxi, add more as difficulty scales

#### 4.1 Dynamic Taxi Spawning
- Start with 1 taxi
- Add taxi when:
  - Player earns $X
  - OR after Y successful deliveries
  - OR after Z time
- Spawn at random available node
- Max cap (e.g., 10 taxis)

#### 4.2 Visual Differentiation
- Number each taxi (1, 2, 3, etc.)
- Different colors or markings (optional)
- Clear visual distinction

**Files to modify:**
- `lib/gameState.ts` - Add taxi spawning logic
- `hooks/useGameLoop.ts` - Track spawn conditions

**Deliverable:** Game starts easy, gets harder with more taxis

---

### Phase 5: UI & Polish

**Goal:** Minimal UI, maximum readability

#### 5.1 HUD
```
┌─────────────────────────────┐
│ Money: $250                 │
│ Active Deliveries: 3/5      │
│ Taxis: 4                    │
│                             │
│              [PAUSE]        │
└─────────────────────────────┘
```

#### 5.2 Pause System
- Pause button or spacebar
- Game state freezes
- Taxis stop moving
- Can still change intersections while paused

#### 5.3 Visual Polish
- Camera zoom/pan controls
- Grid lines on roads
- Building shadows (optional)
- Particle effects on delivery completion

**Files to create:**
- `components/HUD.tsx` - Stats display
- `components/PauseButton.tsx` - Pause control
- `hooks/usePause.ts` - Pause state management

**Deliverable:** Clean UI, pausable gameplay

---

## Implementation Order (Recommended)

### Week 1: Core Loop
1. ✅ Foundation (already done!)
2. **Phase 1** - Intersection control (2-3 days)
3. **Phase 2** - Delivery system (2-3 days)

### Week 2: Dynamics
4. **Phase 3** - Collision system (1 day)
5. **Phase 4** - Multi-taxi scaling (1 day)
6. **Phase 5** - UI & Polish (2-3 days)

## Technical Architecture

### Key Systems

**1. Intersection Manager**
```typescript
class IntersectionManager {
  intersections: Map<string, IntersectionState>

  toggleMode(nodeId: string): void
  getMode(nodeId: string): IntersectionMode
  getNextPath(currentPath: string): RoadPath
}
```

**2. Delivery Manager**
```typescript
class DeliveryManager {
  activeDeliveries: Delivery[]

  spawn(): void
  claim(taxiId: string, deliveryId: string): void
  complete(deliveryId: string): void
}
```

**3. Game State**
```typescript
interface GameState {
  taxis: Taxi[]
  intersections: Map<string, IntersectionState>
  deliveries: Delivery[]
  money: number
  isPaused: boolean
  score: number
}
```

## Out of Scope (v1)

- Service stations
- Taxi upgrades
- Multiple cities/levels
- Traffic lights (intersections handle this)
- Pedestrians
- Weather/day-night
- Achievements

## Success Criteria (MVP)

MVP is complete when:
1. ✅ Player can tap intersections to change routing
2. ✅ Taxis follow intersection rules
3. ✅ Deliveries spawn and can be completed
4. ✅ Collisions reverse taxis
5. ✅ Money system works
6. ✅ Can pause the game
7. ✅ Game scales with more taxis
8. ✅ Playable for 5-10 minute sessions

## Why This Design Wins

- **Simple:** 5 systems instead of 10
- **Unique:** No other game does intersection control like this
- **Scalable:** Easy to add difficulty (more taxis, more deliveries)
- **Debuggable:** Clear cause-effect (bad intersection → collision)
- **Fast to build:** No timing windows, no slow-motion, no per-taxi UI

Let's build it! 🚕🚦
