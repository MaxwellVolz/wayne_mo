Crazy Taxi AI Management Automation Game

---

One player commands a fleet of “AI” taxis operating in a downtown cartoon city.

The game focuses on observation, timing, and automation rather than direct control.

---

## Visuals

Low-poly city composed of 8x8 blocks. AI taxis autonomously drive between pickup and dropoff locations.

Design priorities:

- Strong visual readability at a distance
- Clear iconography above taxis
- Instantly recognizable taxi states:
    - Idle
    - En Route
    - Needs Service
    - Broken

The city remains in constant motion to reinforce a living system.

---

## Player Interaction

### 3D Scene

- Player selects a taxi directly in the world

### Foreground UI

- Single contextual action button centered on the dashboard:
    - STOP when the taxi is moving
    - GO when the taxi is stopped or loading

This minimizes UI clutter and reduces player cognitive load.

---

## Taxi Behavior Model

Each taxi operates as a simple state machine.

States:

- Idle
- DrivingToPickup
- DrivingToDropoff
- Stopped
    - Includes loading and unloading passengers
- NeedsService
- Broken

No additional AI complexity is required for the MVP.

---

## Core Interaction Loop

### Focus Triggering Events

Pickup phase:

- Taxi approaches a pickup zone
- Player times STOP
- Success:
    - Faster loading
    - Tip bonus
- Failure:
    - Taxi loops the block, costing time

Drop-off phase:

- Identical timing mechanic
- Primary reward is fare payout instead of tip

Looping the block is a time penalty, not a direct monetary loss.

---

## Time Flow and Focus

- The game runs continuously in real time
- When a taxi enters an interaction window:
    - Time slows to approximately 20 to 30 percent speed
    - The taxi is visually highlighted
- Time never fully pauses
- The player may ignore or miss interactions

If multiple taxis trigger focus simultaneously:

- Slow motion does not stack
- The most recent event takes priority

This preserves motion while allowing deliberate player response.

---

## Service Management

- Taxis accumulate wear over time
- Service jobs appear as flags on a zoomed-out map view
- Players send taxis to service locations to prevent breakdowns
- Ignoring service leads to reduced efficiency or broken taxis

---

## Progression Through Automation

Automation is the primary form of progression.

Automation upgrades exist to reduce how often the game interrupts the player.

Automation examples:

- Auto-restart after stopping
- Auto-service below a health threshold
- Wider stop timing windows
- Reduced frequency of service needs

Risk and reward modifiers:

- Higher-paying jobs that generate more frequent interaction events

Automation shifts the game from manual intervention to system supervision.

---

## Design Pillars

- Motion over menus
- Attention as a limited resource
- Skill first, automation second
- Failure is recoverable and readable

---

If you want, the next logical steps are:

- A one-taxi vertical slice definition
- Taxi state machine pseudocode
- First 60 seconds of gameplay and tutorial flow
- Automation tier progression chart

---

## Part 1: 10-Feature “Do Not Exceed” Scope

These are the **only features allowed** before launch.

Anything not on this list is a post-revenue idea.

1. Single city map
    
    One handcrafted 8x8 block layout. No procedural generation.
    
2. Road graph with fixed paths
    
    Roads are predefined paths. Cars never leave them.
    
3. One taxi at start, second taxi unlock
    
    Hard cap at two taxis for v1.
    
4. Path-based taxi movement
    
    Constant speed interpolation along paths. No physics.
    
5. STOP / GO interaction
    
    Single contextual button. No extra UI controls.
    
6. Pickup and dropoff timing windows
    
    Two interaction points per job. Same mechanic, different reward.
    
7. Slow-motion focus
    
    Time scales to 0.25x when a taxi enters an interaction window. No pausing.
    
8. Failure loop
    
    Missed timing causes a visible block loop. Costs time only.
    
9. One automation upgrade
    
    Choose one:
    
    - Wider timing window
    - Auto-resume after load
10. Local save
    
    Money, automation unlocked, second taxi state saved via localStorage.
    

That is it.

No pedestrians logic.

No traffic simulation.

No service jobs yet unless trivialized into a timer.

---

## Part 2: Exact Three.js Movement Model

This is a **rails-based system**, not AI driving.

### Core Principle

Cars do not decide.

They move along predefined paths and respond to gates.

---

## Data Model

### Road Graph

Use a node + path system.

```tsx
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

Paths are authored manually. You can draw them in Blender and export points.

---

## Taxi State

```tsx
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
  t: number
  speed: number
  isFocused: boolean
}

```

`t` is normalized 0–1 along the current path.

---

## Movement Loop

No physics. No velocity integration.

```tsx
function updateTaxi(taxi: Taxi, delta: number) {
  if (taxi.state === 'stopped') return

  taxi.t += (delta * taxi.speed) / taxi.path.length

  if (taxi.t >= 1) {
    taxi.t = 1
    onPathEnd(taxi)
  }

  const pos = samplePath(taxi.path, taxi.t)
  taxiMesh.position.copy(pos)
}

```

---

## Path Sampling

Precompute cumulative distances for speed.

```tsx
function samplePath(path: RoadPath, t: number): THREE.Vector3 {
  const index = Math.floor(t * (path.points.length - 1))
  const localT = (t * (path.points.length - 1)) % 1

  return path.points[index]
    .clone()
    .lerp(path.points[index + 1], localT)
}

```

Good enough visually. Upgrade later if needed.

---

## Pickup and Dropoff Zones

Zones are distance-based windows on the path.

```tsx
interface InteractionZone {
  pathId: string
  startT: number
  endT: number
  type: 'pickup' | 'dropoff'
}

```

Trigger when `taxi.t` enters the window.

---

## Focus and Slow Motion

Single global time scale.

```tsx
let timeScale = 1

function updateFocus(taxi: Taxi) {
  if (inInteractionWindow(taxi)) {
    timeScale = 0.25
    taxi.isFocused = true
  } else {
    timeScale = 1
    taxi.isFocused = false
  }
}

```

Multiple taxis:

- Last taxi entering focus wins
- No stacking

---

## STOP / GO Logic

```tsx
function onStopPressed(taxi: Taxi) {
  if (!taxi.isFocused) return

  if (inInteractionWindow(taxi)) {
    taxi.state = 'stopped'
    handleSuccess(taxi)
  } else {
    handleMiss(taxi)
  }
}

```

Miss logic:

- Assign a loop path
- Reset `t = 0`
- Continue moving

---

## Traffic Lights (Optional but Cheap)

Lights are just path gates.

```tsx
interface Gate {
  pathId: string
  t: number
  isOpen: boolean
}

```

If taxi reaches gate and `isOpen === false`, set state to `stopped`.

This gives you the illusion of traffic rules with almost no code.

---

## Why This Works

- Deterministic
- Debuggable
- Visually convincing
- Scales to dozens of taxis
- Zero physics bugs
- Perfect for slow motion

This is a **systems animation**, not AI.

---