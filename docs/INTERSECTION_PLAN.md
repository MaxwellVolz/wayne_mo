# Intersection Control System - Implementation Plan

**Based on:** `game_concept.md` (Intersection Design)
**Date:** 2025-12-29
**Status:** Planning Phase

---

## Executive Summary

The player controls **intersections, not taxis**. Taxis are autonomous agents that follow persistent routing rules set by the player. This plan details how to implement the intersection control system that replaces random path selection with player-directed routing.

---

## Current System Analysis

### What We Have ✅

**Foundation (Complete):**
- Path-based movement system (`lib/movement.ts`)
- Blender workflow with path node extraction (`lib/extractPathNodes.ts`)
- Node type system with intersection support (`types/game.ts`)
- Road network with nodes and paths (`data/roads.ts`)
- Taxi rendering and animation

**Current Routing Logic (`data/roads.ts:191-220`):**
```typescript
export function getNextPath(currentPathId: string): RoadPath | null {
  // ...
  // If multiple paths, pick randomly (for intersections)
  if (possiblePaths.length === 1) {
    return possiblePaths[0]
  } else {
    const randomIndex = Math.floor(Math.random() * possiblePaths.length)
    return possiblePaths[randomIndex]  // ← REPLACE THIS
  }
}
```

**Problem:** Taxis pick paths randomly at intersections. Players have no control.

**Solution:** Replace random selection with intersection state lookup.

---

## Architecture Design

### 1. Intersection State Data Model

```typescript
// types/game.ts - ADD THESE

/**
 * Intersection routing modes
 * - pass_through: Continue straight (default)
 * - turn_left: Take leftmost available path
 * - turn_right: Take rightmost available path
 */
export type IntersectionMode = 'pass_through' | 'turn_left' | 'turn_right'

/**
 * Intersection state stores player's routing decision
 */
export interface IntersectionState {
  nodeId: string              // e.g., "PathNode_Intersection_Main_01"
  mode: IntersectionMode      // Current routing rule
  availablePaths: string[]    // All possible next paths from this node
}

/**
 * Add to GameState interface
 */
export interface GameState {
  taxis: Taxi[]
  intersections: Map<string, IntersectionState>  // ← ADD THIS
  timeScale: number
  money: number
  automationUnlocked: boolean
  secondTaxiUnlocked: boolean
}
```

### 2. Path Direction Detection

To determine which path is "straight", "left", or "right", we need geometric analysis:

```typescript
// lib/intersectionGeometry.ts - NEW FILE

import * as THREE from 'three'
import type { RoadNode, RoadPath } from '@/types/game'

/**
 * Determines the relative direction of a path from an intersection
 *
 * @param incomingPath - The path the taxi is currently on
 * @param intersection - The intersection node
 * @param outgoingPath - A possible next path
 * @returns 'straight' | 'left' | 'right'
 */
export function getPathDirection(
  incomingPath: RoadPath,
  intersection: RoadNode,
  outgoingPath: RoadPath
): 'straight' | 'left' | 'right' {
  // Get incoming direction vector (last segment of incoming path)
  const incomingDir = new THREE.Vector3()
    .subVectors(
      incomingPath.points[incomingPath.points.length - 1],
      incomingPath.points[incomingPath.points.length - 2]
    )
    .normalize()

  // Get outgoing direction vector (first segment of outgoing path)
  const outgoingDir = new THREE.Vector3()
    .subVectors(
      outgoingPath.points[1],
      outgoingPath.points[0]
    )
    .normalize()

  // Calculate cross product to determine turn direction
  const cross = new THREE.Vector3().crossVectors(incomingDir, outgoingDir)

  // Dot product to determine if continuing straight
  const dot = incomingDir.dot(outgoingDir)

  // Straight: dot product close to 1 (vectors aligned)
  if (dot > 0.8) {
    return 'straight'
  }

  // Left vs Right: check cross product Y component (assuming Y-up world)
  // Positive Y = left turn, Negative Y = right turn
  if (cross.y > 0.1) {
    return 'left'
  } else if (cross.y < -0.1) {
    return 'right'
  }

  // Default to straight if angle is ambiguous
  return 'straight'
}

/**
 * Categorizes all paths from an intersection by direction
 *
 * @param incomingPathId - Current path taxi is on
 * @param intersection - Intersection node
 * @param allPaths - All paths in the network
 * @returns Object with straight, left, and right path IDs
 */
export function categorizePaths(
  incomingPathId: string,
  intersection: RoadNode,
  allPaths: RoadPath[]
): {
  straight: string | null
  left: string | null
  right: string | null
} {
  // Find all outgoing paths from this intersection
  const outgoingPaths = allPaths.filter(p =>
    p.id.startsWith(`${intersection.id}_to_`)
  )

  // Find the incoming path
  const incomingPath = allPaths.find(p => p.id === incomingPathId)
  if (!incomingPath) {
    return { straight: null, left: null, right: null }
  }

  const result = {
    straight: null as string | null,
    left: null as string | null,
    right: null as string | null
  }

  outgoingPaths.forEach(path => {
    const direction = getPathDirection(incomingPath, intersection, path)
    if (!result[direction]) {
      result[direction] = path.id
    }
  })

  return result
}
```

### 3. Updated Routing Logic

Replace random selection with intersection mode lookup:

```typescript
// data/roads.ts - MODIFY getNextPath()

import { categorizePaths } from '@/lib/intersectionGeometry'
import { getIntersectionMode } from '@/lib/gameState'  // New function

export function getNextPath(
  currentPathId: string,
  currentIntersections?: Map<string, IntersectionState>  // Optional for backward compat
): RoadPath | null {
  const paths = activeRoadNetwork.paths
  const nodes = activeRoadNetwork.nodes

  // Extract destination node ID
  const parts = currentPathId.split('_to_')
  if (parts.length !== 2) {
    console.warn(`⚠️ Invalid path ID format: ${currentPathId}`)
    return null
  }

  const destinationNodeId = parts[1]
  const destinationNode = nodes.find(n => n.id === destinationNodeId)

  // Check if destination is an intersection
  const isIntersection = destinationNode?.types.includes('intersection')

  // Find all possible next paths
  const possiblePaths = paths.filter(p => p.id.startsWith(`${destinationNodeId}_to_`))

  if (possiblePaths.length === 0) {
    console.warn(`⚠️ No next path found from node: ${destinationNodeId}`)
    return null
  }

  // Single path? Return it (no choice needed)
  if (possiblePaths.length === 1) {
    return possiblePaths[0]
  }

  // Multiple paths AND it's an intersection AND we have intersection state
  if (isIntersection && currentIntersections && destinationNode) {
    const intersectionState = currentIntersections.get(destinationNodeId)

    if (intersectionState) {
      // Categorize paths by direction
      const pathsByDirection = categorizePaths(
        currentPathId,
        destinationNode,
        paths
      )

      // Select path based on intersection mode
      let selectedPathId: string | null = null

      switch (intersectionState.mode) {
        case 'pass_through':
          selectedPathId = pathsByDirection.straight
          break
        case 'turn_left':
          selectedPathId = pathsByDirection.left
          break
        case 'turn_right':
          selectedPathId = pathsByDirection.right
          break
      }

      // If selected path exists, return it
      if (selectedPathId) {
        const selectedPath = paths.find(p => p.id === selectedPathId)
        if (selectedPath) {
          return selectedPath
        }
      }

      // Fallback: if selected direction doesn't exist, try straight
      if (pathsByDirection.straight) {
        return paths.find(p => p.id === pathsByDirection.straight) || null
      }
    }
  }

  // Fallback: random selection (for backward compatibility or non-intersections)
  const randomIndex = Math.floor(Math.random() * possiblePaths.length)
  return possiblePaths[randomIndex]
}
```

### 4. Intersection Manager Hook

Centralized state management for intersections:

```typescript
// hooks/useIntersectionManager.ts - NEW FILE

import { useState, useCallback, useEffect } from 'react'
import type { IntersectionState, RoadNode } from '@/types/game'
import { getNodesByType } from '@/lib/extractPathNodes'
import { getRoadNetwork } from '@/data/roads'

export function useIntersectionManager() {
  const [intersections, setIntersections] = useState<Map<string, IntersectionState>>(
    new Map()
  )

  // Initialize intersections when road network loads
  useEffect(() => {
    const network = getRoadNetwork()
    const intersectionNodes = getNodesByType(network.nodes, 'intersection')

    const initialStates = new Map<string, IntersectionState>()

    intersectionNodes.forEach(node => {
      // Find all outgoing paths from this intersection
      const availablePaths = network.paths
        .filter(p => p.id.startsWith(`${node.id}_to_`))
        .map(p => p.id)

      // Only create state if node has multiple outgoing paths
      if (availablePaths.length > 1) {
        initialStates.set(node.id, {
          nodeId: node.id,
          mode: 'pass_through',  // Default mode
          availablePaths
        })
      }
    })

    setIntersections(initialStates)
    console.log(`🚦 Initialized ${initialStates.size} intersections`)
  }, [])

  // Toggle intersection mode: pass → left → right → pass
  const toggleIntersectionMode = useCallback((nodeId: string) => {
    setIntersections(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(nodeId)

      if (!current) {
        console.warn(`⚠️ No intersection state for ${nodeId}`)
        return prev
      }

      // Cycle through modes
      const nextMode =
        current.mode === 'pass_through' ? 'turn_left' :
        current.mode === 'turn_left' ? 'turn_right' :
        'pass_through'

      newMap.set(nodeId, {
        ...current,
        mode: nextMode
      })

      console.log(`🚦 ${nodeId} mode: ${current.mode} → ${nextMode}`)
      return newMap
    })
  }, [])

  // Get mode for a specific intersection
  const getMode = useCallback((nodeId: string) => {
    return intersections.get(nodeId)?.mode || 'pass_through'
  }, [intersections])

  return {
    intersections,
    toggleIntersectionMode,
    getMode
  }
}
```

---

## Visual Design

### 5. Intersection Tile Visualization

Visual feedback through **animated tile transitions** - the road surface itself shows routing mode.

**Three approaches, pick one:**

| Approach             | Complexity | Visual Quality | Best For            |
| -------------------- | ---------- | -------------- | ------------------- |
| **Material-Based**   | ⭐ Easy     | Good           | MVP, fast iteration |
| **Arrow Decals**     | ⭐⭐ Medium  | Better         | More visual clarity |
| **Blender Variants** | ⭐⭐⭐ Hard   | Best           | Production polish   |

**Recommendation:** Start with **Material-Based** for MVP. Upgrade to Blender Variants later if needed.

#### Approach 1: Material-Based (Recommended - Simple)

Use animated materials on intersection tiles:

```typescript
// components/IntersectionTile.tsx - NEW FILE

'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { IntersectionMode } from '@/types/game'

interface IntersectionTileProps {
  position: THREE.Vector3
  mode: IntersectionMode
  onClick: () => void
  baseTexture?: THREE.Texture  // Original road texture from Blender
}

export function IntersectionTile({
  position,
  mode,
  onClick,
  baseTexture
}: IntersectionTileProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  // Color coding for mode
  const modeColor = mode === 'pass_through' ? '#00ff00' :  // Green
                    mode === 'turn_left' ? '#0088ff' :     // Blue
                    '#ff8800'                              // Orange

  // Animate emissive intensity for "pulse" effect
  useFrame((state, delta) => {
    timeRef.current += delta
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      // Subtle pulse: 0.1 to 0.3
      material.emissiveIntensity = 0.2 + Math.sin(timeRef.current * 2) * 0.1
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}  // Horizontal for ground
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      {/* Intersection tile geometry (plane or imported from Blender) */}
      <planeGeometry args={[4, 4]} />

      <meshStandardMaterial
        map={baseTexture}  // Keep original road texture
        emissive={modeColor}
        emissiveIntensity={0.2}
        transparent
        opacity={0.95}
      />
    </mesh>
  )
}
```

**Visual Result:**
- Road tile glows with mode color (green/blue/orange)
- Subtle pulsing animation
- Original road texture preserved underneath
- Cursor changes on hover

#### Approach 2: Arrow Decals (Advanced - More Visual)

Paint animated arrow markings on the road surface:

```typescript
// components/IntersectionArrowDecal.tsx - NEW FILE

'use client'

import { Decal } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { IntersectionMode } from '@/types/game'

interface ArrowDecalProps {
  mode: IntersectionMode
  targetMesh: THREE.Mesh  // The road mesh to project onto
}

export function IntersectionArrowDecal({ mode, targetMesh }: ArrowDecalProps) {
  const decalRef = useRef<THREE.Mesh>(null)

  // Arrow rotation based on mode
  const rotation = mode === 'pass_through' ? 0 :
                   mode === 'turn_left' ? Math.PI / 2 :
                   -Math.PI / 2

  // Animated arrow texture (scrolling effect)
  const arrowTexture = useArrowTexture(mode)

  useFrame((state) => {
    if (arrowTexture) {
      // Animate UV offset for "flowing" arrow effect
      arrowTexture.offset.y = (state.clock.elapsedTime * 0.5) % 1
    }
  })

  return (
    <Decal
      ref={decalRef}
      mesh={targetMesh}
      position={[0, 0.1, 0]}  // Slightly above road surface
      rotation={[0, rotation, 0]}
      scale={[3, 3, 3]}
    >
      <meshStandardMaterial
        map={arrowTexture}
        transparent
        opacity={0.8}
        emissive={mode === 'pass_through' ? '#00ff00' :
                  mode === 'turn_left' ? '#0088ff' : '#ff8800'}
        emissiveIntensity={0.3}
      />
    </Decal>
  )
}

// Helper to generate arrow texture
function useArrowTexture(mode: IntersectionMode): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Draw arrow shape
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  // Arrow pointing up (will be rotated by Decal)
  ctx.moveTo(128, 50)   // Top point
  ctx.lineTo(180, 150)  // Right wing
  ctx.lineTo(140, 150)  // Right inner
  ctx.lineTo(140, 200)  // Right stem
  ctx.lineTo(116, 200)  // Left stem
  ctx.lineTo(116, 150)  // Left inner
  ctx.lineTo(76, 150)   // Left wing
  ctx.closePath()
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.repeat.set(1, 3)  // Repeat for flowing effect
  return texture
}
```

**Visual Result:**
- Arrow markings painted on road surface
- Animated "flowing" effect (arrows scroll in direction)
- Color-coded by mode
- Integrates seamlessly with road geometry

#### Approach 3: Blender Tile Variants (Production Quality)

Create 3 intersection tile variants in Blender with baked arrow textures:

**In Blender:**
1. Model intersection tile with arrow markings painted in texture
2. Create 3 variants: `Intersection_Straight.glb`, `Intersection_Left.glb`, `Intersection_Right.glb`
3. Export each variant separately

**In Code:**
```typescript
// Swap tile model based on mode with smooth transition
export function IntersectionTile({ mode, position, onClick }) {
  const [currentModel, setCurrentModel] = useState(mode)
  const fadeRef = useRef(0)

  // Preload all variants
  const straightModel = useGLTF('/models/Intersection_Straight.glb')
  const leftModel = useGLTF('/models/Intersection_Left.glb')
  const rightModel = useGLTF('/models/Intersection_Right.glb')

  const model = mode === 'pass_through' ? straightModel :
                mode === 'turn_left' ? leftModel : rightModel

  // Fade transition
  useFrame((state, delta) => {
    if (currentModel !== mode) {
      fadeRef.current = Math.min(1, fadeRef.current + delta * 3)
      if (fadeRef.current >= 1) {
        setCurrentModel(mode)
        fadeRef.current = 0
      }
    }
  })

  return (
    <group position={position} onClick={onClick}>
      <primitive object={model.scene.clone()} />
    </group>
  )
}
```

**Visual Result:**
- Professional art-directed arrows
- Seamless integration with city aesthetic
- Smooth cross-fade transitions
- Best visual quality
```

### 6. Intersection Manager Component

Renders all intersection tiles with animated transitions:

```typescript
// components/IntersectionManager.tsx - NEW FILE

'use client'

import { IntersectionTile } from './IntersectionTile'
import { useIntersectionManager } from '@/hooks/useIntersectionManager'
import { getRoadNetwork } from '@/data/roads'

export function IntersectionManager() {
  const { intersections, toggleIntersectionMode } = useIntersectionManager()
  const network = getRoadNetwork()

  return (
    <group name="intersections">
      {Array.from(intersections.entries()).map(([nodeId, state]) => {
        const node = network.nodes.find(n => n.id === nodeId)
        if (!node) return null

        return (
          <IntersectionTile
            key={nodeId}
            position={node.position}
            mode={state.mode}
            onClick={() => toggleIntersectionMode(nodeId)}
          />
        )
      })}
    </group>
  )
}
```

**Integration Notes:**
- Place `<IntersectionManager />` in the main Scene component
- Tiles render at intersection node positions from Blender
- Each tile is independently clickable
- Smooth transitions when mode changes (pulsing glow or model swap)

---

## Integration Checklist

### Phase 1: Core Routing (2-3 days)
- [ ] Add new types to `types/game.ts` (IntersectionMode, IntersectionState)
- [ ] Create `lib/intersectionGeometry.ts` with direction detection
- [ ] Update `data/roads.ts` - modify `getNextPath()` to use intersection state
- [ ] Create `hooks/useIntersectionManager.ts` for state management
- [ ] Test routing logic with console logs

### Phase 2: Visual Tiles (1-2 days)
- [ ] Choose visual approach (Material-based recommended for MVP)
- [ ] Create `components/IntersectionTile.tsx` with animated materials
- [ ] Create `components/IntersectionManager.tsx` to render all tiles
- [ ] Add click detection with raycasting (built into mesh)
- [ ] Add visual feedback (emissive pulse, hover effects)
- [ ] Test intersection toggling and transitions in browser

### Phase 3: Game Integration (1 day)
- [ ] Update `hooks/useGameLoop.ts` to pass intersection state to taxis
- [ ] Modify taxi movement to use new `getNextPath()` signature
- [ ] Update `GameState` interface to include intersections
- [ ] Add save/load support for intersection states (localStorage)
- [ ] Test with multiple taxis

### Phase 4: Polish (1 day)
- [ ] Add smooth transition animations when toggling modes
- [ ] Add sound effects (optional)
- [ ] Add keyboard shortcuts (1/2/3 to set mode on selected intersection)
- [ ] Add visual debug mode (show path directions as colored lines)
- [ ] Performance optimization (memoization, culling distant intersections)

---

## Testing Strategy

### Unit Tests
1. **Path Direction Detection**
   - Test straight path detection
   - Test left turn detection
   - Test right turn detection
   - Test edge cases (T-junctions, acute angles)

2. **Routing Logic**
   - Test intersection mode changes affect path selection
   - Test fallback to straight when mode path unavailable
   - Test non-intersection nodes are unaffected

### Integration Tests
1. **Multiple Taxis**
   - Spawn 3 taxis
   - Set intersection to "turn_left"
   - Verify ALL taxis turn left

2. **Mode Persistence**
   - Change intersection mode
   - Refresh page
   - Verify mode loads from localStorage

### Manual QA
- [ ] Click intersection indicator, verify it cycles through modes
- [ ] Verify taxis follow intersection rules
- [ ] Verify visual indicators match current mode
- [ ] Test with 1, 2, 5, 10 taxis
- [ ] Verify performance (60fps with many taxis)

---

## Risks & Mitigation

### Risk 1: Path Direction Ambiguity
**Problem:** Complex intersection geometry may confuse left/right detection
**Mitigation:**
- Use conservative thresholds in `getPathDirection()` (dot > 0.8)
- Add debug visualization (colored lines showing detected directions)
- Manual override in Blender custom properties if needed

### Risk 2: Too Many Intersections
**Problem:** 8x8 grid could have 64+ intersections → overwhelming
**Mitigation:**
- Only create intersection state for nodes with >1 outgoing path
- Use camera culling to hide distant indicators
- Add "autopilot" mode that manages non-critical intersections

### Risk 3: Player Confusion
**Problem:** Players may not understand how taxis follow rules
**Mitigation:**
- Add tutorial overlay on first load
- Show preview line when hovering over intersection (where taxis will go)
- Add slow-motion on first taxi arrival at intersection

---

## Success Criteria

**Minimum Viable Product (MVP):**
1. ✅ Player can click intersection to cycle modes (pass/left/right)
2. ✅ Visual indicator shows current mode (color + arrow direction)
3. ✅ Taxis follow intersection rules (all taxis, not just one)
4. ✅ Mode persists until player changes it
5. ✅ Works with multiple taxis simultaneously

**Stretch Goals:**
- [ ] Smooth camera zoom to intersection on click
- [ ] Path preview (show where taxi will go with current settings)
- [ ] Intersection analytics (traffic count, average wait time)
- [ ] Keyboard shortcuts for power users

---

## Implementation Order (Recommended)

**Day 1: Core Logic**
1. Morning: Add types, create `intersectionGeometry.ts`
2. Afternoon: Update `getNextPath()`, test with console logs

**Day 2: Visual + State**
1. Morning: Create `IntersectionIndicator.tsx` component
2. Afternoon: Create `useIntersectionManager` hook, wire up click handling

**Day 3: Integration**
1. Morning: Integrate with game loop and taxi movement
2. Afternoon: Test with multiple taxis, fix edge cases

**Day 4: Polish**
1. Morning: Add animations, sound, visual feedback
2. Afternoon: Performance optimization, final testing

---

## File Changes Summary

**New Files:**
```
lib/intersectionGeometry.ts         - Path direction detection
hooks/useIntersectionManager.ts     - Intersection state management
components/IntersectionTile.tsx      - Animated tile component (choose 1 approach)
components/IntersectionManager.tsx   - Renders all intersection tiles
```

**Modified Files:**
```
types/game.ts                       - Add IntersectionMode, IntersectionState
data/roads.ts                       - Update getNextPath() logic
hooks/useGameLoop.ts                - Pass intersection state to movement
components/Scene.tsx                - Add <IntersectionManager /> component
```

**No Changes Needed:**
```
lib/movement.ts                     - Movement logic stays the same
lib/extractPathNodes.ts             - Node extraction unchanged
components/Taxi.tsx                 - Taxi rendering unchanged
```

---

## Next Steps

1. **Review this plan** - Confirm approach with team
2. **Update CLAUDE.md** - Replace STOP/GO design with Intersection Design
3. **Start Phase 1** - Implement core routing logic
4. **Iterate** - Test early, adjust as needed

---

**Questions? Check:**
- `/docs/game_concept.md` - Core game design
- `/docs/IMPLEMENTATION_PLAN.md` - Higher-level feature roadmap
- `/docs/blender.md` - How to add intersections in Blender

**Ready to build!** 🚦🚕
