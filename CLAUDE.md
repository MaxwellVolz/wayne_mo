# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Crazy Taxi-inspired AI management automation game where the player controls **intersections, not taxis**. Autonomous taxis navigate the city following persistent routing rules set by the player at each intersection. The focus is on spatial routing puzzles and traffic flow optimization rather than direct taxi control or timing mechanics.

## Tech Stack

- **Next.js 15** - React framework with App Router (configured for static export)
- **React 19** - UI library
- **Three.js 0.180** - 3D rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - React Three.js helpers
- **TypeScript 5** - Type safety
- **Blender** - 3D modeling and path node authoring
- **Lucide React** - Professional icon library for UI

### Deployment Configuration

The project is configured for **static export** deployment:
- `next.config.ts` has `output: 'export'` enabled
- Images use `unoptimized: true` for static hosting
- No server-side rendering dependencies
- Can be deployed to GitHub Pages, Netlify, Vercel, or any static host
- High scores stored in browser localStorage (client-side only)

## CSS Architecture

The project uses a **token-based CSS Modules architecture** for maintainable, reusable styles.

### Design System Structure

```
webapp/styles/
├── tokens.css                    # Design tokens (CSS Custom Properties)
├── animations.css                # Shared @keyframes
├── globals.css                   # Global styles with token imports
├── components/                   # Reusable component styles
│   ├── buttons.module.css       # Button variants (primary, secondary, hero, icon, iconActive)
│   ├── displays.module.css      # HUD displays (money, timer, score)
│   └── effects.module.css       # Visual effects (fireworks, particles)
├── utilities/                    # Utility classes
│   └── positioning.module.css   # Fixed positioning patterns (topLeft, bottomRight, modalOverlay)
└── pages/                        # Page-specific component styles
    ├── IntroScene.module.css
    ├── TutorialSlider.module.css
    ├── TutorialScene.module.css
    ├── TaxiControls.module.css
    ├── GameHUD.module.css
    └── GameOverModal.module.css
```

### Design Tokens (tokens.css)

All design values are centralized as CSS Custom Properties:

**Colors (Arcade/Retro Theme):**
- `--color-primary: #ffff00` (Yellow)
- `--color-secondary: #ff6b00` (Orange)
- `--color-success: #00ff00` (Green)
- `--color-info: #0088ff` (Blue)
- `--color-danger: #ff0000` (Red)

**Spacing Scale:**
- `--space-xs` through `--space-7xl` (4px → 80px)
- `--hud-spacing-desktop`, `--hud-spacing-mobile`

**Z-Index Layers:**
- `--z-base: 0`
- `--z-hud: 100`
- `--z-overlay: 200`
- `--z-modal-backdrop: 1000`
- `--z-modal-content: 1001`

**Typography:**
- Font families, sizes (`--text-xs` through `--text-9xl`)
- Shadows (`--shadow-text-md`, `--glow-green-strong`)

**Motion:**
- Durations (`--duration-fast`, `--duration-normal`, `--duration-slow`)
- Easing functions (`--ease-out`, `--ease-in-out`)

### Component Styling Pattern

```tsx
// Import shared modules + component-specific styles
import buttonStyles from '@/styles/components/buttons.module.css'
import displayStyles from '@/styles/components/displays.module.css'
import positionStyles from '@/styles/utilities/positioning.module.css'
import styles from '@/styles/pages/ComponentName.module.css'

export function Component() {
  return (
    <div className={styles.container}>
      <div className={positionStyles.topRight}>
        <div className={displayStyles.moneyDisplay}>$100</div>
      </div>
      <button className={buttonStyles.primary}>Action</button>
    </div>
  )
}
```

### Key Principles

1. **Token-based design** - All design values in `tokens.css`
2. **CSS Modules** - Component-scoped styles with type-safe imports
3. **Composition** - Use `composes:` keyword for style inheritance
4. **BEM-inspired camelCase** - Class naming: `.elementName`, `.elementNameActive`
5. **Shared patterns** - Buttons, displays, positioning extracted to reusable modules
6. **Responsive** - Standard breakpoints (768px, 480px, 360px)
7. **Dynamic inline styles** - Only for runtime-computed values (firework positions, Three.js portals)

### Special Cases

**Three.js Html Components (IntersectionTile):**
- Animations must be global (defined in `animations.css`)
- Html portals render outside CSS cascade
- Reference animations by name in inline styles

**Dynamic Styles:**
- Firework particle positions (random at runtime)
- Colors from delivery system
- Animation delays for visual variety

### Migration Benefits

- ~60% reduction in CSS code (1,500 lines → ~600 lines)
- Single source of truth for design tokens
- Reusable component patterns eliminate duplication
- Type-safe imports prevent typos
- Better Next.js optimization and tree-shaking
- Easier theming and design system updates

## Interactable System (Intro Scene)

The intro scene uses a **configuration-driven interactable system** for managing interactive 3D objects. Instead of writing duplicate code for each interactive object, define them in a configuration array.

### Architecture

```
webapp/
├── lib/
│   └── interactableSystem.ts           # Core animation/interaction logic
├── components/
│   ├── Interactable.tsx                # Single interactable renderer
│   └── InteractableManager.tsx         # Renders all interactables
├── config/
│   ├── introInteractables.ts           # Interactable definitions
│   └── interactableTemplates.ts        # Copy-paste templates
```

### Quick Usage

Add a new interactable by adding to `config/introInteractables.ts`:

```typescript
{
  id: 'my_object',
  modelComponent: MyGLBModel,
  position: [-7, 1.5, 10],
  radius: 0.2,
  onClick: () => console.log('Clicked!'),
  animationType: 'hover_bobble',  // See animation types below
}
```

### Animation Types

- **`hover`** - Float up on hover
- **`bobble`** - Gentle sinusoidal motion
- **`hover_bobble`** - Combined (default for UI elements)
- **`spin`** - Continuous rotation (good for collectibles)
- **`glb`** - Play Blender animation clips (doors, characters, etc.)

### GLB Animation Setup

For objects with Blender animations:

```typescript
{
  animationType: 'glb',
  animationConfig: {
    clipName: 'DoorOpen',      // Blender clip name
    playOnHover: true,          // Play on hover
    loop: false,                // Don't loop
  }
}
```

**Requirements:**
1. Export GLB from Blender with "Animation" enabled
2. Generate component: `npx gltfjsx public/models/model.glb -o generated_components/ModelGenerated.tsx -t`
3. Use exact clip name from Blender

### Benefits

- **~90% less code** vs. old approach (200 lines → 10 lines per interactable)
- **Scalable** to 10+ objects without duplication
- **GLB animation support** for doors, NPCs, machines
- **Type-safe** configuration with TypeScript
- **Consistent behavior** across all interactables

### Documentation

See `/docs/interactables.md` for complete guide and templates.

## Critical Design Constraints

### Core Game Mechanics (Implemented)

The game is built around **intersection control** as the primary mechanic:

**✅ IMPLEMENTED:**
1. Single city map (8x8 blocks, handcrafted in Blender)
2. Road graph with fixed paths extracted from Blender
3. Path-based taxi movement (constant speed interpolation)
4. **Intersection routing control** - Player clicks intersections to toggle modes:
   - Pass Through (Green Move icon)
   - Turn Left (Yellow RefreshCcw - spinning counter-clockwise)
   - Turn Right (Blue RefreshCw - spinning clockwise)
5. Autonomous taxis that follow intersection rules
6. Multiple taxi support (scalable from 1 to 10+)
7. **Delivery spawn and auto-claiming system** - Timer-based spawning with collision detection
8. **Money/payout system** - Distance-based payouts, taxi spawning costs
9. **Collision detection** - Taxis reverse on collision with cooldown
10. **Pause system** - Space bar to pause ($10 cost), allows camera movement and intersection changes
11. **Rush Hour mechanic** - At 30 seconds remaining, delivery spawn rate doubles (10s → 5s)
12. **Game timer** - 120 second timed sessions with Game Over screen
13. **Delivery visuals** - Pickup indicators, dropoff indicators, curved arc delivery paths
14. **Smart spawning** - Prevents overlapping pickups/dropoffs on same nodes
15. **Intro/Menu System** - Title screen with high score display, play and tutorial buttons
16. **Tutorial System** - Interactive 3-step tutorial with image slides and in-game guidance
17. **High Score System** - Persistent localStorage-based high score tracking
18. **Mobile Responsiveness** - Comprehensive mobile support with breakpoints (768px, 480px, 360px)
19. **Static Export** - Next.js configured for static deployment

**📋 PLANNED (Next Features):**
- Sound effects and music
- Additional visual polish
- Performance optimizations for 5+ taxis

**❌ EXPLICITLY EXCLUDED:**
- Direct taxi control (no STOP/GO buttons)
- Timing windows or reflex-based mechanics
- Per-taxi commands or micromanagement
- Pedestrian logic
- Traffic simulation AI
- Physics simulation
- Procedural generation

**Design Principle:** Player sets persistent routing rules. Taxis are fully autonomous. No micromanagement.

## Core Architecture

### Blender-Driven Development Workflow

The game uses **Blender as the primary level design tool**:
- City geometry, buildings, and roads are modeled in Blender
- Path nodes are placed as small mesh markers in Blender scenes
- Node types are defined via naming conventions (e.g., `PathNode_Pickup_Downtown_001`)
- Node connections are defined via custom properties (`next_nodes`)
- Models are exported as GLB files to `webapp/public/models/`
- Path nodes are extracted at runtime and converted to game paths

**Benefits:**
- Visual level design instead of coding coordinates
- Quick iteration (update Blender → re-export → instant reload)
- Node metadata (zone names, payout multipliers) stored in Blender custom properties
- Single source of truth for both visuals and game logic

See `/docs/blender.md` for complete integration guide.

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
- Rotation automatically faces movement direction
- Uses Three.js `useFrame` hook for 60fps animation

**Current Implementation:**
- File: `webapp/lib/movement.ts` - Core movement functions
- File: `webapp/components/Taxi.tsx` - Taxi component with animation
- File: `webapp/hooks/useGameLoop.ts` - Game state management
- Uses real Blender models (`taxi.glb`) with texture preservation

### Node Type System

Path nodes extracted from Blender have types that define their behavior:

```typescript
type NodeType =
  | 'path'          // Regular waypoint
  | 'intersection'  // WHERE PLAYER CONTROLS ROUTING (core mechanic!)
  | 'pickup'        // Passenger pickup location
  | 'dropoff'       // Passenger dropoff location
  | 'red_light'     // Traffic light
  | 'service'       // Service station

interface RoadNode {
  id: string
  position: THREE.Vector3
  next: string[]       // Connected node IDs from Blender
  types: NodeType[]    // Multiple types possible
  metadata?: {         // From Blender custom properties
    zoneName?: string
    payoutMultiplier?: number
    redLightDuration?: number
    // ... other type-specific data
  }
}
```

**⚠️ CRITICAL: Intersection Nodes**

Intersections are the **core game mechanic** - this is what the player controls!

**Requirements:**
- Must have `Intersection` keyword in node name
- Must have 2+ paths in `next_nodes` property (ideally 3 for straight/left/right)
- Automatically become clickable player controls in-game

**Visual Indicators:**
- Green + = Pass Through mode
- Blue ↶ = Turn Left mode
- Orange ↷ = Turn Right mode

**Naming Convention in Blender:**
- `PathNode_001` → Regular path node AKA "forced turns"
- `INT_*` → ⭐ **Player-controlled routing**
- `PathNode_Pickup_Downtown_001` → Pickup zone
- `PathNode_Intersection_RedLight_001` → Both types

See `/docs/blender.md` for complete intersection setup guide.

### Intersection Control System ✅ IMPLEMENTED

**Core Mechanic:** Player controls intersections, NOT taxis.

**How It Works:**
1. Player clicks an intersection in the 3D scene
2. Intersection cycles through modes: Pass Through → Turn Left → Turn Right → Pass Through
3. ALL taxis follow the same rule when they reach that intersection
4. Routing is persistent until player changes it

**Technical Implementation:**

```typescript
// Intersection modes
type IntersectionMode = 'pass_through' | 'turn_left' | 'turn_right'

// When taxi reaches intersection
function getNextPath(currentPath: string, intersections: Map<string, IntersectionState>) {
  // Categorize paths by direction using vector math
  const paths = categorizePaths(incomingPath, intersection, allPaths)

  // Select based on intersection mode
  switch (intersectionState.mode) {
    case 'pass_through': return paths.straight
    case 'turn_left': return paths.left
    case 'turn_right': return paths.right
  }
}
```

**Key Files:**
- `lib/intersectionGeometry.ts` - Path direction detection (straight/left/right)
- `hooks/useIntersectionManager.ts` - Intersection state management (with network ready check)
- `components/IntersectionTile.tsx` - Visual indicators using Lucide React icons
- `components/IntersectionManager.tsx` - Renders all intersection controls
- `data/roads.ts` - Network management with `isRoadNetworkReady()` flag

**Initialization:**
- ✅ Deferred initialization - waits for real Blender network to load
- ✅ Race condition fixed - uses `isRoadNetworkReady()` flag to prevent test data initialization
- ✅ Event-driven - listens for `roadNetworkUpdated` event from CityModel
- See `/docs/INTERSECTION_LOADING_FIX.md` for details

**Visual Feedback:**
- Professional icons from Lucide React library (Move, RefreshCcw, RefreshCw)
- 124px icons with glowing drop shadows
- Rotation animations (4s per revolution) for turn modes
- Click to cycle modes (Pass Through → Turn Left → Turn Right)
- Cursor changes on hover
- Semi-transparent colored base circles

### Player Interaction Model

**What Player Controls:**
- ✅ Intersections (persistent routing rules)
- ✅ Game pause (Space bar - costs $10, allows camera movement)
- ✅ Taxi spawning (buy new taxis, cost increases: $300, $400, $500...)
- ❌ NOT individual taxis
- ❌ NOT timing-based interactions

**UI Philosophy:**
- Minimal UI - focus on 3D world
- Direct 3D interaction (click intersections in scene)
- Clear visual feedback (colored symbols)
- No menus or complex interfaces

**Interaction Flow:**
1. Observe taxis moving autonomously
2. Identify routing problems
3. Click intersection to change routing mode
4. Watch taxis follow new rule
5. Iterate as needed

### Game Flow and Modes

The game has three distinct modes managed via state machine:

**1. Intro Scene (Entry Point)**
- Displays game title and branding
- Shows current high score (if any)
- Two buttons: "PLAY" (skip to game) or "HOW TO PLAY" (tutorial)
- Mobile-responsive design with multiple breakpoints

**2. Tutorial Mode (Optional)**
- Interactive 3-step walkthrough:
  - Step 1: Camera controls explanation
  - Step 2: Intersection routing mechanics
  - Step 3: Delivery system and objectives
- Live 3D scene with functional game mechanics
- "Start Game" button to proceed to main game
- Can be skipped from intro screen

**3. Main Game Mode**
- Full 120-second timed gameplay session
- All core mechanics active
- Ends with Game Over screen showing final score
- Automatically saves high score if beaten
- "Play Again" returns to intro screen

**Technical Implementation:**
- File: `webapp/app/page.tsx` - Game mode state machine
- Modes: `'intro' | 'tutorial' | 'game'`
- Lazy loading for tutorial scene (performance optimization)

## Design Pillars

1. **Spatial puzzles over timing** - Routing optimization, not reflex-based
2. **Persistent rules over micromanagement** - Set it and observe
3. **System-level thinking** - Control traffic flow, not individual taxis
4. **Observable automation** - Taxis are fully autonomous, player influences indirectly
5. **Failure is time loss** - Poor routing slows down deliveries, no hard punishments

## Visual Design Priorities

- Low-poly aesthetic
- Strong visual readability at distance
- Clear iconography above taxis
- Instantly recognizable taxi states (Idle, En Route, Needs Service, Broken)
- Cartoon city vibe

## Progression Philosophy

**Intersection control IS the automation.**

Unlike traditional management games, this game has no "automation upgrades" - the player's routing rules ARE the automation.

**Progression comes from:**
- More taxis (increases complexity)
- More deliveries (increases traffic density)
- More intersections (more strategic decisions)
- Money accumulation (unlock taxis/cosmetics)

**The challenge scales through:**
- Traffic density, not individual difficulty
- Strategic depth, not mechanical complexity
- Spatial optimization, not timing precision

## Development Philosophy

When implementing features:

1. Verify against the 10-feature scope
2. Prefer deterministic systems over complex AI
3. Keep the movement system path-based (no physics)
4. Maintain visual clarity and readability
5. Ensure failures are recoverable time penalties, not resource losses
6. Default to simpler solutions that preserve the core game loop
7. **Design levels in Blender, not in code** - Use visual tools for visual problems

## Current Implementation Status

**✅ COMPLETE - Core Game Mechanic Working:**

**Foundation:**
- Three.js scene with camera and lighting
- 8x8 city grid using Blender model
- Road network with path data structures
- Taxi visualization with state-based emissive colors
- Deterministic movement system (path-based, 60fps)

**Blender Integration:**
- Full workflow documentation (`docs/blender.md`)
- Path node extraction from GLB models
- Node type system with metadata support
- Texture-preserving model imports
- Auto-generated TypeScript components via gltfjsx
- **Intersection node setup guide**

**Intersection Control System (IMPLEMENTED):**
- ✅ Topological slot-based routing (4-direction model: N/E/S/W)
- ✅ Explicit priority-based fallback tables
- ✅ 3-tier routing: dead ends, corners, intersections
- ✅ Dynamic incoming direction calculation from paths
- ✅ Visual indicators using Lucide React icons (Move, RefreshCcw, RefreshCw)
- ✅ Animated spinning icons for turn modes (4s rotation)
- ✅ Click-to-toggle interaction (3 modes)
- ✅ No U-turns at corners
- ✅ Multi-taxi support
- ✅ Stable performance (60fps with 10+ intersections)

**Delivery System (IMPLEMENTED):**
- ✅ Timer-based delivery spawning (10s intervals, 5s during Rush Hour)
- ✅ Pickup and dropoff collision detection
- ✅ **Score multiplier system** (1-4) determines package value and visual type
- ✅ **Box model indicators** - 4 types: box_small, box_large, box_long, box_wide (mapped to multiplier)
- ✅ **Distance-based arrow indicators** - arrow.glb (distance > 4) or arrow_chevron.glb (distance ≤ 4)
- ✅ Arrow materials dynamically colored to match delivery color
- ✅ Visual indicators: pulsing box models with directional arrows, dropoff spheres
- ✅ Curved arc delivery path visualization (15 sphere particles)
- ✅ Distance-based payout calculation with multiplier tiers
- ✅ Zone-based payout multipliers
- ✅ 16-color palette to distinguish deliveries
- ✅ Smart spawning prevents overlapping deliveries on same nodes
- ✅ Package indicators above taxis during transit (matching box type)
- ✅ Separate collision thresholds (pickup: 1.1, dropoff: 1.1)

**Game Systems (IMPLEMENTED):**
- ✅ **Intro/Menu System** - Polished title screen with game branding
- ✅ **Tutorial System** - 3-step interactive tutorial with image slides
- ✅ **High Score System** - localStorage persistence, displayed on intro screen
- ✅ 120-second timed game sessions
- ✅ Rush Hour at 30s remaining (2x spawn frequency + dramatic banner)
- ✅ Pause system (Space bar, $10 cost, camera/intersection control still works)
- ✅ **Reset button** (top left corner) - instant game restart without returning to menu
- ✅ Debug mode toggle (H key) - shows road network nodes and paths
- ✅ Taxi collision detection with reverse behavior and cooldown
- ✅ Taxi spawn position fix - no flash at origin on scene load
- ✅ Money system with initial $100 starting balance
- ✅ Taxi spawning with incremental cost ($300, $400, $500...)
- ✅ Game Over screen with final score, high score detection, and restart
- ✅ Mobile-responsive UI with breakpoints (768px, 480px, 360px)
- ✅ Static export configuration for deployment

**Key Files:**
```
webapp/
├── app/
│   └── page.tsx                     ✅ Game mode management (intro/tutorial/game)
├── lib/
│   ├── intersectionTopology.ts      ✅ Priority-based routing with explicit tables
│   ├── intersectionGeometry.ts      ✅ Legacy vector-based detection
│   ├── intersectionState.ts         ✅ Global state
│   ├── movement.ts                  ✅ Topological routing + intersection integration
│   ├── deliverySystem.ts            ✅ Delivery spawning, collision, smart node allocation
│   ├── gameState.ts                 ✅ Time scale management
│   └── highScore.ts                 ✅ localStorage-based high score persistence
├── components/
│   ├── IntroScene.tsx               ✅ Title screen with high score display
│   ├── TutorialScene.tsx            ✅ Interactive tutorial game scene
│   ├── TutorialGameScene.tsx        ✅ 3D scene for tutorial mode
│   ├── IntersectionTile.tsx         ✅ Lucide icons (Move, RefreshCcw, RefreshCw)
│   ├── IntersectionManager.tsx      ✅ Renders all tiles
│   ├── Taxi.tsx                     ✅ Topological routing + state-based emissive
│   ├── DeliverySystem.tsx           ✅ Spawn timer + Rush Hour support
│   ├── DeliveryManager.tsx          ✅ Visual indicators orchestration
│   ├── DeliveryPath.tsx             ✅ Curved particle arc visualization
│   ├── PickupIndicator.tsx          ✅ Box models with colored directional arrows (multiplier-based)
│   ├── DropoffIndicator.tsx         ✅ Dropoff sphere indicators
│   ├── PackageIndicator.tsx         ✅ Above-taxi box display (matches pickup box type)
│   ├── CollisionSystem.tsx          ✅ Taxi collision detection
│   ├── GameHUD.tsx                  ✅ Timer, money, pause, reset, Rush Hour banner
│   ├── GameOverModal.tsx            ✅ End screen with high score detection + restart
│   └── Game.tsx                     ✅ Main game orchestration
├── hooks/
│   ├── useIntersectionManager.ts    ✅ State management
│   ├── useGameLoop.ts               ✅ Taxi/delivery ref management
│   └── useTutorialGameLoop.ts       ✅ Tutorial-specific game loop
├── data/
│   └── roads.ts                     ✅ Dual-mode routing (topological + legacy)
└── public/
    ├── models/
    │   ├── box_small.glb            ✅ Multiplier 1 package
    │   ├── box_large.glb            ✅ Multiplier 2 package
    │   ├── box_long.glb             ✅ Multiplier 3 package
    │   ├── box_wide.glb             ✅ Multiplier 4 package
    │   ├── arrow.glb                ✅ Long distance indicator (distance > 4)
    │   └── arrow_chevron.glb        ✅ Short distance indicator (distance ≤ 4)
    ├── tutorial_01.png              ✅ Tutorial slide images
    ├── tutorial_02.png
    └── tutorial_03.png
```

**📋 FUTURE PHASES:**
- Local save for game state (intersection states, persistent progress beyond high score)
- Sound effects and music
- Particle effects for pickups/dropoffs
- Additional visual polish and animations
- Performance optimizations for 20+ taxis
- Additional tutorial content/refinements

**Documentation:**
- `/docs/blender.md` - Blender integration guide (intersection setup)
- `/docs/game_concept.md` - Original game design document
- `/docs/INTERSECTION_SYSTEM_SUMMARY.md` - Complete routing implementation
- `/docs/TESTING_GUIDE.md` - How to test intersection system

**System Status:** 🎮 COMPLETE GAME - Full game loop with intro, tutorial, gameplay, and high score system. Mobile-responsive and ready for deployment.
