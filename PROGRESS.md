# Development Progress

## Phase 1: Foundation (3D Scene & Movement) ✅ COMPLETE

**Completed:** 2025-12-27

### What was built:

1. **Three.js Scene Setup**
   - Canvas with camera positioned at overhead angle (20, 25, 20)
   - Ambient and directional lighting
   - OrbitControls for camera manipulation
   - File: `webapp/components/Scene.tsx`

2. **8x8 City Grid**
   - Ground plane and road surface
   - 64 building blocks with random heights (2-8 units)
   - Low-poly aesthetic with subtle color variation
   - File: `webapp/components/City.tsx`

3. **Road Network**
   - Simple rectangular loop with 4 connected paths
   - Path data structure with pre-calculated lengths
   - Node-based graph system for path transitions
   - Road visualization with green lines and pink nodes
   - Files: `webapp/data/roads.ts`, `webapp/components/RoadVisualizer.tsx`

4. **Taxi Visualization**
   - Simple box geometry (1.5 x 0.8 x 2.5 units)
   - Roof light indicator
   - State-based color coding:
     - Yellow = idle
     - Green = driving
     - Red = stopped
     - Orange = needs service
   - File: `webapp/components/Taxi.tsx`

5. **Movement System**
   - Deterministic path-following with normalized `t` parameter
   - Delta-time based updates with time scale support
   - Automatic path transitions at path end
   - Smooth rotation to face movement direction
   - Files: `webapp/lib/movement.ts`, `webapp/hooks/useGameLoop.ts`

### How to test:

```bash
cd webapp
npm run dev
```

Open http://localhost:3000 - you should see:
- An 8x8 city grid with buildings
- Green lines showing the road network
- One yellow/green taxi driving around the loop
- Camera controls (click+drag to rotate, scroll to zoom)

### Technical notes:

- Game loop runs at 60fps via requestAnimationFrame
- Time scale system is in place (currently at 1.0)
- Taxi updates position every frame using linear interpolation
- Path transitions happen automatically when t >= 1.0

---

## Blender Integration ✅ COMPLETE

**Completed:** 2025-12-28

### What was built:

1. **Path Node Extraction System**
   - Utility to extract path nodes from Blender GLB models
   - Parses node types from object names (pickup, dropoff, intersection, red_light, service)
   - Reads custom properties for node connections and metadata
   - Auto-connects sequential nodes if no connections defined
   - File: `webapp/lib/extractPathNodes.ts`

2. **Node Type System**
   - Multiple node types: path, intersection, pickup, dropoff, red_light, service
   - Nodes can have multiple types (e.g., intersection + red_light)
   - Metadata support (zone names, payout multipliers, light durations)
   - Type-safe TypeScript definitions
   - File: `webapp/types/game.ts`

3. **Blender Workflow Documentation**
   - Complete guide for setting up Blender scenes
   - Naming conventions for node types
   - Custom properties for node connections
   - Export settings and troubleshooting
   - Texture preservation when adding game logic
   - File: `docs/blender.md`

4. **City Model Integration**
   - Loads Blender city model (city_01.glb)
   - Extracts path nodes at runtime
   - Updates road network dynamically
   - Hides path node markers in game
   - Notifies taxis of network updates
   - File: `webapp/components/CityModel.tsx`

5. **Taxi Model with Texture Preservation**
   - Loads Blender taxi model (taxi.glb)
   - Preserves original materials and textures
   - Adds emissive colors for state indication (stopped=red, service=orange)
   - Smooth movement and rotation
   - File: `webapp/components/Taxi.tsx`

6. **Road Network System**
   - Dynamic network updates from extracted nodes
   - Path generation between connected nodes
   - Test data with typed nodes (intersection, pickup, dropoff, red_light)
   - File: `webapp/data/roads.ts`

### How to test:

```bash
cd webapp
npm run dev
```

Open http://localhost:3000 - you should see:
- Blender city model with buildings
- Path nodes extracted from model (check console)
- Taxi following paths defined in Blender
- Green lines showing road network
- Camera controls

Check browser console for:
```
🏙️ City model loaded
✅ Extracted N path nodes:
  - PathNode_001: types: ['path'], next: ['PathNode_002']
  ...
🛣️ Updating road network with N extracted nodes
✅ Road network updated: N nodes, M paths
```

### Technical notes:

- Path nodes can be small mesh markers or Empty objects in Blender
- Mesh markers (spheres scaled to 0.01) are more reliable than Empties
- Node types parsed from names: `PathNode_Intersection_Pickup_Downtown_001`
- Connections defined via `next_nodes` custom property: `[ "PathNode_02", "PathNode_03" ]`
- gltfjsx generates TypeScript components from GLB files
- Custom properties from Blender become `userData` in Three.js

---

## Next: Phase 2 - Interaction Mechanics (STOP/GO)

### Upcoming tasks:

1. Create interaction zones based on node types (pickup/dropoff)
2. Add STOP/GO UI button
3. Implement timing windows with visual feedback
4. Trigger slow-motion focus when approaching interaction zones
5. Add failure loop mechanic

See `plan.md` for full roadmap.
