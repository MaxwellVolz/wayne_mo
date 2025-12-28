# Blender Integration Guide

This guide covers how to export your city model from Blender and integrate path nodes for the taxi navigation system.

## Overview

The game uses a **rails-based movement system** where taxis follow predefined paths. These paths are defined by node positions that you'll create in Blender as Empty objects.

## Setting Up Your Blender Scene

### 1. City Model Structure

Your Blender scene should contain:
- **City geometry** (buildings, roads, ground)
- **Path nodes** (Empty objects marking path waypoints)
- **Optional:** Interaction zones for pickup/dropoff

### 2. Creating Path Nodes

Path nodes are the vector points that define where taxis can travel.

**Setup:**
1. In Blender, add Empty objects (`Shift+A` → Empty → Plain Axes)
2. Position them along your roads to create taxi paths
3. Name them with a clear convention:
   ```
   PathNode_001
   PathNode_002
   PathNode_003
   ...
   ```

**Naming Convention:**
- Use consistent prefixes: `PathNode_`, `PickupZone_`, `DropoffZone_`
- Number sequentially for path ordering
- Group related nodes: `PathNode_Main_001`, `PathNode_Loop_001`

**Best Practices:**
- Place nodes at **intersections** and **turns**
- Keep spacing relatively even (every 5-10 units)
- Nodes should be at **ground level** (y=0)
- Use **collections** to organize nodes vs geometry

### 3. Scene Organization

```
Collection: City
├── Buildings (Mesh)
├── Ground (Mesh)
└── Roads (Mesh)

Collection: PathNodes
├── PathNode_001 (Empty)
├── PathNode_002 (Empty)
└── ...

Collection: Zones (Optional)
├── PickupZone_001 (Empty)
└── DropoffZone_001 (Empty)
```

## Exporting from Blender

### Export Settings

**File → Export → glTF 2.0 (.gltf/.glb)**

Required settings:
- **Format:** `glTF Binary (.glb)` (smaller file size)
- **Include:**
  - ✅ Selected Objects (or) Visible Objects
  - ✅ Custom Properties
  - ✅ Punctual Lights (if using)
- **Transform:**
  - ✅ +Y Up (matches Three.js coordinate system)
- **Geometry:**
  - ✅ Apply Modifiers
  - ✅ UVs
  - ✅ Normals
  - ✅ Vertex Colors (if using)
- **Compression:**
  - ✅ Draco mesh compression (optional, for smaller files)

**Export Location:**
```
/webapp/public/models/city.glb
```

### File Size Optimization

For optimal performance:
- Use **Draco compression** in export settings
- Keep polygon count reasonable (< 100k faces for mobile)
- Optimize textures (use compressed formats like .webp)
- Bake lighting if possible instead of real-time lights

## Generating TypeScript Component

After exporting, use **gltfjsx** to auto-generate a typed React component.

### Install gltfjsx (one-time)

```bash
npm install -g @gltfjsx/cli
```

### Generate Component

```bash
cd webapp
npx gltfjsx@6.5.3 public/models/city.glb \
  --output src/components/CityModelGenerated.tsx \
  --types \
  --keepgroups
```

**Flags explained:**
- `--output`: Where to save the generated component
- `--types`: Generate TypeScript types for the model
- `--keepgroups`: Preserve Blender collections as groups

### Post-processing (Optional)

After generation, you may need to update import paths:

```bash
sed -i "s|'/city.glb'|'/models/city.glb'|g" src/components/CityModelGenerated.tsx
```

## Extracting Path Nodes

### Method 1: Manual Extraction from Generated Component

The generated component includes all Empty objects. You can extract them:

```typescript
// components/CityModelGenerated.tsx (auto-generated)
import { useGLTF } from '@react-three/drei'

export function CityModel(props) {
  const { nodes, materials } = useGLTF('/models/city.glb')

  // nodes contains all objects including Empties
  console.log(nodes)

  return (
    <group {...props}>
      {/* Your city geometry */}
      <mesh geometry={nodes.Building001.geometry} material={materials.BuildingMat} />
      {/* Empty objects are also in nodes */}
    </group>
  )
}
```

### Method 2: Runtime Extraction

Create a helper to extract path nodes:

```typescript
// lib/extractPathNodes.ts
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'
import type { RoadNode } from '@/types/game'

export function extractPathNodesFromGLTF(gltf: GLTF): RoadNode[] {
  const nodes: RoadNode[] = []

  gltf.scene.traverse((object) => {
    // Find all objects whose names start with "PathNode_"
    if (object.name.startsWith('PathNode_')) {
      nodes.push({
        id: object.name,
        position: new THREE.Vector3(
          object.position.x,
          object.position.y,
          object.position.z
        ),
        next: [] // Will be populated based on node order or custom properties
      })
    }
  })

  // Sort by name to maintain order
  nodes.sort((a, b) => a.id.localeCompare(b.id))

  return nodes
}
```

### Method 3: Using Custom Properties (Advanced)

In Blender, you can add **Custom Properties** to Empties to define connections:

**In Blender:**
1. Select PathNode Empty
2. Object Properties → Custom Properties → Add
3. Add property: `next_nodes` = `"PathNode_002,PathNode_003"`

**In Code:**
```typescript
export function extractPathNodesWithConnections(gltf: GLTF): RoadNode[] {
  const nodes: RoadNode[] = []

  gltf.scene.traverse((object) => {
    if (object.name.startsWith('PathNode_')) {
      const nextNodes = object.userData.next_nodes
        ? object.userData.next_nodes.split(',')
        : []

      nodes.push({
        id: object.name,
        position: new THREE.Vector3().copy(object.position),
        next: nextNodes
      })
    }
  })

  return nodes
}
```

## Integrating with Game System

### Update CityModel Component

```typescript
// components/CityModel.tsx
'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import { extractPathNodesFromGLTF } from '@/lib/extractPathNodes'
import { updateRoadNetwork } from '@/data/roads'

export default function CityModel() {
  const gltf = useGLTF('/models/city.glb')

  useEffect(() => {
    // Extract path nodes and update road network
    const pathNodes = extractPathNodesFromGLTF(gltf)
    updateRoadNetwork(pathNodes)

    console.log(`Loaded ${pathNodes.length} path nodes from city model`)
  }, [gltf])

  return <primitive object={gltf.scene} />
}

// Preload the model
useGLTF.preload('/models/city.glb')
```

### Update Road Network Data

Modify `data/roads.ts` to accept runtime updates:

```typescript
// data/roads.ts
import type { RoadNode, RoadPath } from '@/types/game'

let roadNetwork = {
  nodes: [] as RoadNode[],
  paths: [] as RoadPath[]
}

export function updateRoadNetwork(nodes: RoadNode[]) {
  roadNetwork.nodes = nodes
  roadNetwork.paths = generatePathsFromNodes(nodes)
}

export function getRoadNetwork() {
  return roadNetwork
}

function generatePathsFromNodes(nodes: RoadNode[]): RoadPath[] {
  const paths: RoadPath[] = []

  // Generate paths by connecting sequential nodes
  for (let i = 0; i < nodes.length - 1; i++) {
    const start = nodes[i]
    const end = nodes[i + 1]

    paths.push({
      id: `path_${i}`,
      points: [start.position, end.position],
      length: start.position.distanceTo(end.position)
    })
  }

  return paths
}
```

## Workflow Summary

**In Blender:**
1. Model your city (buildings, roads)
2. Add Empty objects for path nodes (`PathNode_001`, etc.)
3. Organize in collections
4. Export as `.glb` to `/webapp/public/models/`

**In Terminal:**
```bash
# Generate typed component
npx gltfjsx public/models/city.glb --output components/CityModelGenerated.tsx --types
```

**In Code:**
1. Load model with `useGLTF`
2. Extract path nodes from Empty objects
3. Generate RoadPath objects connecting nodes
4. Update game's road network

**Result:**
- City renders in 3D
- Taxis follow paths defined by your Blender nodes
- Easy to iterate: update Blender → re-export → automatic reload

## Debugging Tips

### Visualizing Nodes in Three.js

Add debug spheres to see where your path nodes are:

```typescript
{pathNodes.map(node => (
  <mesh key={node.id} position={node.position}>
    <sphereGeometry args={[0.5, 8, 8]} />
    <meshBasicMaterial color="red" />
  </mesh>
))}
```

### Common Issues

**Nodes not found:**
- Check naming convention matches filter (`PathNode_` prefix)
- Verify Empties were included in export
- Check console for `nodes` object contents

**Wrong positions:**
- Ensure Blender export uses **+Y Up** transform
- Check if you need to apply transforms in Blender before export
- Verify Empty positions are at ground level

**Model too large/small:**
- Check scale in Blender (1 unit = 1 meter recommended)
- Apply scale before export (`Ctrl+A` → Scale)
- Adjust camera distance if needed

## Example: Complete Integration

```typescript
// components/CityModel.tsx
'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import * as THREE from 'three'

export default function CityModel() {
  const { scene } = useGLTF('/models/city.glb')

  useEffect(() => {
    const pathNodes: Array<{ id: string; position: THREE.Vector3 }> = []

    // Extract path nodes
    scene.traverse((object) => {
      if (object.name.startsWith('PathNode_')) {
        pathNodes.push({
          id: object.name,
          position: object.position.clone()
        })
      }
    })

    console.log('Path nodes:', pathNodes)

    // TODO: Update global road network with these nodes
  }, [scene])

  return <primitive object={scene} />
}

useGLTF.preload('/models/city.glb')
```

## Next Steps

1. Export your city model with path nodes
2. Generate the TypeScript component
3. Extract path nodes in the CityModel component
4. Update the road network system to use extracted nodes
5. Verify taxis follow the new paths
6. Iterate on node placement for smooth movement

---

**Related Files:**
- `/webapp/components/CityModel.tsx` - Model loader
- `/webapp/data/roads.ts` - Road network data
- `/webapp/lib/movement.ts` - Movement system
- `/webapp/types/game.ts` - Type definitions
