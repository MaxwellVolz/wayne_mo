# Crazy Taxi Management - Web Application

The game client built with Next.js, React, and Three.js.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Three.js 0.180** - 3D rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for react-three-fiber
- **TypeScript 5** - Type safety
- **Blender** - 3D modeling and path node authoring

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Commands

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler checks

## Project Structure

```
webapp/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── components/       # React components
│   └── Game.tsx      # Main game component
├── lib/              # Game logic
│   ├── movement.ts   # Path-based movement system
│   └── gameState.ts  # State management and save/load
├── types/            # TypeScript type definitions
│   └── game.ts       # Core game types
├── data/             # Static game data
│   └── README.md     # Data structure documentation
└── public/           # Static assets (models, textures)
```

## Architecture Overview

### Blender Integration

The game uses **Blender as the primary level design tool**:

- City models created in Blender and exported as GLB
- Path nodes are small mesh markers in Blender (named `PathNode_*`)
- Node types defined by naming: `PathNode_Intersection_Pickup_001`
- Node connections defined via custom properties: `next_nodes`
- Runtime extraction converts Blender nodes to game paths
- See `/docs/blender.md` for complete workflow guide

**Key Files:**
- `lib/extractPathNodes.ts` - Extracts nodes from GLB models
- `components/CityModel.tsx` - Loads city and extracts path nodes
- `data/roads.ts` - Road network updated from extracted nodes

### Movement System

The game uses a **deterministic path-following system**, not physics simulation:

- Taxis follow `RoadPath` objects extracted from Blender path nodes
- Movement is controlled by a normalized `t` parameter (0-1) along the path
- Position is calculated via linear interpolation between path points
- Rotation automatically faces movement direction
- Animation via Three.js `useFrame` hook at 60fps
- See `lib/movement.ts` for implementation

### State Management

Game state includes:
- Taxi fleet (max 2 taxis)
- Money and automation status
- Time scale (1.0 normal, 0.25 slow-motion)

Local save via `localStorage` stores:
- Money amount
- Automation unlock status
- Second taxi unlock status

### Type System

All core game types are defined in `types/game.ts`:
- `RoadNode` and `RoadPath` - Road graph structure
- `Taxi` - Taxi entity with state machine
- `InteractionZone` - Pickup/dropoff windows
- `GameState` - Global game state

## Development Guidelines

### Scope Constraints

This project operates under a **strict 10-feature scope**. See `/CLAUDE.md` for the complete list. Do not add features outside this scope.

### Code Style

- Prefer functional components and hooks
- Keep components small and focused
- Document complex game logic with comments
- Use TypeScript strictly (no `any` types)

### Three.js Integration

- Use `@react-three/fiber` for declarative Three.js
- Use `@react-three/drei` helpers for common patterns
- Keep Three.js code separate from React UI logic

## Testing the Movement System

You can test the path-based movement system by:

1. Creating a simple `RoadPath` with test points
2. Creating a `Taxi` object
3. Calling `updateTaxi()` in a loop with delta time
4. Sampling position with `samplePath()` for rendering

Example:

```typescript
import { updateTaxi, samplePath } from '@/lib/movement'
import * as THREE from 'three'

const testPath = {
  id: 'test',
  points: [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(10, 0, 0),
    new THREE.Vector3(10, 0, 10),
  ],
  length: 20,
}

const taxi = {
  id: 'taxi1',
  state: 'driving_to_pickup' as const,
  path: testPath,
  t: 0,
  speed: 5,
  isFocused: false,
}

// In game loop
updateTaxi(taxi, deltaTime)
const position = samplePath(taxi.path, taxi.t)
```

## Working with Blender Models

### Exporting from Blender

1. Model your city in Blender
2. Add small mesh markers for path nodes (scale 0.01)
3. Name them: `PathNode_001`, `PathNode_Intersection_002`, etc.
4. Add custom property `next_nodes`: `[ "PathNode_002", "PathNode_003" ]`
5. Export as GLB to `webapp/public/models/`

### Generating TypeScript Components

After exporting GLB files from Blender:

```bash
# From webapp directory
npm run buildcity    # Generate city model + auto-fix types
npm run buildtaxi    # Generate taxi model + auto-fix types
npm run buildmodels  # Generate all models at once
```

**These commands automatically:**
1. Run gltfjsx to generate TypeScript components
2. Fix TypeScript errors (GLTFAction, JSX types, assertions)
3. Add necessary imports

No manual post-processing needed!

### Path Node Types

- `PathNode_001` → Regular path point
- `PathNode_Intersection_001` → Where paths branch
- `PathNode_Pickup_Downtown_001` → Pickup location
- `PathNode_Dropoff_Airport_001` → Dropoff location
- `PathNode_RedLight_001` → Traffic light
- `PathNode_Service_001` → Service station
- `PathNode_Intersection_RedLight_001` → Multiple types

See `/docs/blender.md` for detailed documentation.

## Next Steps

1. ✅ Three.js scene with Blender city model
2. ✅ Road graph extracted from Blender path nodes
3. ✅ Taxi visualization with emissive state indicators
4. ⏳ Implement STOP/GO UI button
5. ⏳ Add interaction zone detection based on node types
6. ⏳ Implement slow-motion focus mechanic
7. ⏳ Job system and economy
8. ⏳ Second taxi unlock
9. ⏳ Automation upgrade
