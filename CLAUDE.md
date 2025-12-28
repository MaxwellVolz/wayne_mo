# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Crazy Taxi-inspired AI management automation game where the player commands a fleet of autonomous taxis in a downtown cartoon city. The focus is on observation, timing, and automation rather than direct control.

**Tech Stack:**
- Three.js (3D rendering)
- Next.js (web framework)
- Stack is not yet fully determined

## Critical Design Constraints

### 10-Feature Hard Limit (Pre-Launch)

The project operates under a strict 10-feature scope before launch. **Any feature not on this list is explicitly out of scope:**

1. Single city map (8x8 blocks, handcrafted)
2. Road graph with fixed paths
3. One taxi at start, second taxi unlock (hard cap at 2 taxis)
4. Path-based taxi movement (constant speed interpolation)
5. STOP/GO interaction (single contextual button only)
6. Pickup and dropoff timing windows
7. Slow-motion focus (0.25x time scale, no pausing)
8. Failure loop (missed timing causes block loop, time penalty only)
9. One automation upgrade (either wider timing window OR auto-resume after load)
10. Local save (money, automation state, second taxi state via localStorage)

**Explicitly excluded for v1:**
- Pedestrian logic
- Traffic simulation
- Service jobs (unless trivialized to a timer)
- More than 2 taxis
- Procedural generation
- Physics simulation

When implementing features, verify they align with this scope. Reject scope creep.

## Core Architecture

### Movement System: Rails-Based, Not AI

The game uses a deterministic path-following system, not physics or AI pathfinding.

**Data Model:**
```typescript
type NodeId = string

interface RoadNode {
  id: NodeId
  position: THREE.Vector3
  next: NodeId[]
}

interface RoadPath {
  id: string
  points: THREE.Vector3[]
  length: number
}
```

**Taxi State Machine:**
```typescript
type TaxiState =
  | 'idle'
  | 'driving_to_pickup'
  | 'driving_to_dropoff'
  | 'stopped'
  | 'needs_service'
  | 'broken'

interface Taxi {
  state: TaxiState
  path: RoadPath
  t: number              // normalized 0-1 along current path
  speed: number
  isFocused: boolean
}
```

**Movement Implementation:**
- No physics or velocity integration
- Use normalized `t` parameter (0-1) along path
- Update via: `taxi.t += (delta * taxi.speed) / taxi.path.length`
- Position via linear interpolation between path points

### Interaction Zones

Pickup and dropoff zones are distance-based windows on paths:

```typescript
interface InteractionZone {
  pathId: string
  startT: number
  endT: number
  type: 'pickup' | 'dropoff'
}
```

Trigger slow-motion when `taxi.t` enters zone range.

### Time Flow

- Single global `timeScale` variable
- Normal speed: `timeScale = 1`
- Focus mode: `timeScale = 0.25`
- When multiple taxis trigger focus: most recent event wins, no stacking
- Time never fully pauses

### Player Interaction Model

**UI constraints:**
- Single contextual button: displays "STOP" when taxi moving, "GO" when stopped
- No additional UI controls
- Players select taxis directly in 3D scene
- Minimize UI clutter

**Interaction logic:**
- Success: player presses STOP within interaction window → taxi stops, bonus reward
- Failure: missed timing → taxi loops the block (time penalty only, no money loss)

## Design Pillars

1. **Motion over menus** - Keep the city in constant motion
2. **Attention as a limited resource** - Focus mechanics create strategic decisions
3. **Skill first, automation second** - Player mastery before automation unlocks
4. **Failure is recoverable and readable** - Block loops are visible, time-based penalties

## Visual Design Priorities

- Low-poly aesthetic
- Strong visual readability at distance
- Clear iconography above taxis
- Instantly recognizable taxi states (Idle, En Route, Needs Service, Broken)
- Cartoon city vibe

## Progression Philosophy

Automation is the primary progression mechanic. Automation upgrades exist to **reduce interrupt frequency**, not to replace player skill.

Examples of valid automation:
- Auto-restart after stopping
- Auto-service below health threshold
- Wider stop timing windows
- Reduced service frequency

Risk/reward modifiers:
- Higher-paying jobs generate more frequent interactions

## Development Philosophy

When implementing features:

1. Verify against the 10-feature scope
2. Prefer deterministic systems over complex AI
3. Keep the movement system path-based (no physics)
4. Maintain visual clarity and readability
5. Ensure failures are recoverable time penalties, not resource losses
6. Default to simpler solutions that preserve the core game loop
