# Crazy Taxi Management

An AI taxi fleet management automation game where players observe, time interactions, and automate a fleet of autonomous taxis in a cartoon city.

## Quick Start

```bash
cd webapp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the game.

### Working with Blender Models

After exporting models from Blender to `webapp/public/models/`:

```bash
cd webapp
npm run buildcity    # Generate city model component
npm run buildtaxi    # Generate taxi model component
npm run buildmodels  # Generate all models at once
```

These commands automatically fix TypeScript errors in generated files.

## Project Structure

```
wayne_mo/
├── CLAUDE.md           # AI assistant guidance and architecture docs
├── docs/               # Game design documentation
│   └── game_concept.md # Complete game design document
└── webapp/             # Next.js + Three.js game client
    ├── app/            # Next.js pages and layouts
    ├── components/     # React components
    ├── lib/            # Game logic (movement, state)
    ├── types/          # TypeScript definitions
    ├── data/           # Static game data (roads, zones)
    └── public/         # Static assets
```

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Architecture overview and development constraints
- **[docs/game_concept.md](docs/game_concept.md)** - Complete game design specification
- **[webapp/README.md](webapp/README.md)** - Development guide and tech stack details

## 10-Feature Scope Limit

This project operates under a **strict 10-feature maximum** before launch. Any feature not on this list is explicitly out of scope:

1. **Single city map** - One handcrafted 8x8 block layout
2. **Road graph with fixed paths** - Predefined paths, no free movement
3. **One taxi at start, second taxi unlock** - Hard cap at 2 taxis
4. **Path-based taxi movement** - Constant speed interpolation, no physics
5. **STOP/GO interaction** - Single contextual button only
6. **Pickup and dropoff timing windows** - Two interaction points per job
7. **Slow-motion focus** - 0.25x time scale during interactions
8. **Failure loop** - Missed timing causes block loop (time penalty only)
9. **One automation upgrade** - Choose: wider timing window OR auto-resume after load
10. **Local save** - Money, automation state, second taxi unlock

**Explicitly excluded:**
- Pedestrian logic
- Traffic simulation
- Service jobs (unless trivialized to timer)
- More than 2 taxis
- Procedural generation
- Physics simulation

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Three.js 0.180** - 3D rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - React Three.js helpers
- **TypeScript 5** - Type safety
- **Blender** - 3D modeling and path node authoring

## Core Design Principles

1. **Motion over menus** - Constant visual motion, minimal UI
2. **Attention as limited resource** - Strategic focus management
3. **Skill first, automation second** - Player mastery before automation
4. **Failure is recoverable** - Time penalties, not resource loss

## Game Architecture Highlights

### Blender-Driven Workflow
- City geometry and path nodes designed in **Blender**
- Path nodes are small mesh markers with typed names
- Node types: `path`, `intersection`, `pickup`, `dropoff`, `red_light`, `service`
- Connections defined via Blender custom properties
- Models exported as GLB and loaded at runtime
- See `/docs/blender.md` for complete workflow

### Movement System
- **Deterministic path-following**, not AI or physics
- Taxis move along `RoadPath` objects extracted from Blender
- Position via normalized `t` parameter (0-1) along path
- Linear interpolation between path points
- Smooth rotation to face movement direction
- 60fps animation via Three.js `useFrame` hook

### State Machine
```
idle → driving_to_pickup → stopped → driving_to_dropoff → stopped → idle
                    ↓
              needs_service → broken
```

### Focus Mechanic
- Normal time: `timeScale = 1.0`
- Focus mode: `timeScale = 0.25`
- Triggered when taxi enters interaction window
- No stacking - last event wins

See **[CLAUDE.md](CLAUDE.md)** for complete architecture details.

## Development

All development happens in the `webapp/` directory. See [webapp/README.md](webapp/README.md) for:
- Installation instructions
- Available npm commands
- Code architecture
- Development guidelines
- Movement system testing
