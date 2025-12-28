# Crazy Taxi Management - Web Application

The game client built with Next.js, React, and Three.js.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **Three.js** - 3D rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for react-three-fiber
- **TypeScript** - Type safety

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

### Movement System

The game uses a **deterministic path-following system**, not physics simulation:

- Taxis follow predefined `RoadPath` objects
- Movement is controlled by a normalized `t` parameter (0-1) along the path
- Position is calculated via linear interpolation between path points
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

## Next Steps

1. Implement Three.js scene with basic 8x8 city grid
2. Create simple road graph with test paths
3. Add taxi visualization with state indicators
4. Implement STOP/GO UI button
5. Add interaction zone detection
6. Implement slow-motion focus mechanic
