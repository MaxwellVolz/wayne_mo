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

Path nodes are the vector points that define where taxis can travel and interact with the game world.

**Setup:**
1. In Blender, add Empty objects (`Shift+A` → Empty → Plain Axes)
2. Position them along your roads to create taxi paths
3. Name them using the **Node Type Naming Convention** (see below)

## Node Types and Naming Conventions

Path nodes can represent multiple types of locations. The node type is determined by keywords in the Empty object's name.

### Node Type Reference

| Node Type | Keyword | Purpose | Example Name |
|-----------|---------|---------|--------------|
| **Path** | (default) | Regular waypoint | `PathNode_001` |
| **Intersection** | `Intersection` | Where paths branch/connect | `PathNode_Intersection_001` |
| **Pickup** | `Pickup` | Passenger pickup location | `PathNode_Pickup_Downtown_001` |
| **Dropoff** | `Dropoff` | Passenger dropoff location | `PathNode_Dropoff_Airport_001` |
| **Red Light** | `RedLight` or `Red_Light` | Traffic light/stop point | `PathNode_RedLight_001` |
| **Service** | `Service` | Service station for repairs | `PathNode_Service_Main_001` |

### Combining Multiple Types

Nodes can have **multiple types** by including multiple keywords in the name:

```
PathNode_Intersection_RedLight_001
→ Types: ['intersection', 'red_light']

PathNode_Intersection_Pickup_Terminal_001
→ Types: ['intersection', 'pickup']

PathNode_Dropoff_Service_001
→ Types: ['dropoff', 'service']
```

### Naming Examples

**Regular Path:**
```
PathNode_001
PathNode_002
PathNode_Main_005
```
→ Creates sequential waypoints along roads

**Intersections:**
```
PathNode_Intersection_North_001
PathNode_Intersection_South_002
```
→ Where multiple paths meet; taxis choose next direction

**Pickup/Dropoff Zones:**
```
PathNode_Pickup_Downtown_001
PathNode_Dropoff_Airport_001
PathNode_Pickup_Dropoff_Terminal_001  (both types!)
```
→ Passenger interaction points

**Red Lights:**
```
PathNode_RedLight_001
PathNode_Intersection_RedLight_Main_001  (intersection + red light)
```
→ Taxis must stop/slow down

**Service Stations:**
```
PathNode_Service_001
PathNode_Intersection_Service_Garage_001
```
→ Taxi maintenance/repair locations

### Best Practices

**Positioning:**
- Place nodes at **ground level** (y=0 or road surface)
- **Intersections** at road junctions
- **Pickups/Dropoffs** along road edges (not in middle of path)
- **Red Lights** before intersections
- Space evenly (every 5-10 units for smooth movement)

**Organization:**
- Use **Collections** to organize by type:
  ```
  Collection: PathNodes_Regular
  Collection: PathNodes_Intersections
  Collection: PathNodes_Pickups
  Collection: PathNodes_Service
  ```
- Number sequentially for automatic connection: `001`, `002`, `003`
- Use descriptive names: `Downtown`, `Airport`, `Terminal`

### 3. Adding Custom Properties (Optional, Advanced)

You can add **Custom Properties** to Empty objects in Blender to define type-specific behavior.

**How to Add Custom Properties:**
1. Select your PathNode Empty object
2. Object Properties panel → Custom Properties
3. Click the **+** button to add a new property
4. Set the property name and value

### Custom Property Reference

**Red Light Nodes:**
```
redLightDuration = 3.0    (seconds light is red)
greenLightDuration = 5.0  (seconds light is green)
currentState = "green"    (initial state: red/yellow/green)
```

**Pickup/Dropoff Nodes:**
```
zoneName = "Downtown Terminal"
payoutMultiplier = 1.5    (1.5x earnings for this zone)
```

**Service Station Nodes:**
```
repairRate = 20.0         (health restored per second)
serviceCost = 50.0        (money cost to use)
```

**Intersection Nodes (Advanced):**
```
next_nodes = "PathNode_002,PathNode_005"  (manual path connections)
branchProbabilities = "PathNode_002:0.7,PathNode_005:0.3"  (weighted choices)
```

**Example in Blender:**

For a pickup location with bonus payout:
1. Name: `PathNode_Pickup_Airport_001`
2. Add custom properties:
   - `zoneName` → `"Airport Terminal"`
   - `payoutMultiplier` → `2.0`

These properties will be automatically extracted and available in `node.metadata`.

### 4. Scene Organization

```
Collection: City
├── Buildings (Mesh)
├── Ground (Mesh)
└── Roads (Mesh)

Collection: PathNodes_Main
├── PathNode_001 (Empty)
├── PathNode_002 (Empty)
└── ...

Collection: PathNodes_Intersections
├── PathNode_Intersection_001 (Empty)
├── PathNode_Intersection_RedLight_002 (Empty)
└── ...

Collection: PathNodes_Special
├── PathNode_Pickup_Downtown_001 (Empty)
├── PathNode_Dropoff_Airport_001 (Empty)
└── PathNode_Service_001 (Empty)
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

## Working with Node Types in Code

Once extracted, nodes are available with their types and metadata:

```typescript
import { extractPathNodesFromGLTF, getNodesByType } from '@/lib/extractPathNodes'

// Extract all nodes
const nodes = extractPathNodesFromGLTF(gltf)

// Filter by type
const pickupLocations = getNodesByType(nodes, 'pickup')
const redLights = getNodesByType(nodes, 'red_light')
const intersections = getNodesByType(nodes, 'intersection')

// Access node data
pickupLocations.forEach(node => {
  console.log(node.id)              // "PathNode_Pickup_Downtown_001"
  console.log(node.types)           // ['pickup']
  console.log(node.position)        // THREE.Vector3
  console.log(node.metadata?.zoneName)          // "Downtown Terminal"
  console.log(node.metadata?.payoutMultiplier)  // 1.5
})

// Check if a node has a specific type
import { nodeHasType } from '@/lib/extractPathNodes'

if (nodeHasType(currentNode, 'red_light')) {
  // Handle red light behavior
  const duration = currentNode.metadata?.redLightDuration ?? 3
  stopTaxi(duration)
}

if (nodeHasType(currentNode, 'pickup')) {
  // Trigger pickup interaction
  const payout = basePayout * (currentNode.metadata?.payoutMultiplier ?? 1.0)
  handlePickup(payout)
}
```

### Node Type System Benefits

1. **Single source of truth**: Design your game world in Blender
2. **Multi-type nodes**: One location can be both an intersection AND a red light
3. **Flexible metadata**: Add custom properties for zone-specific behavior
4. **Easy iteration**: Update Blender → re-export → instant changes
5. **Type safety**: TypeScript ensures correct property usage

## Complete Example

**In Blender:**
```
PathNode_Intersection_Pickup_Terminal_001
├── Position: (10, 0, 15)
└── Custom Properties:
    ├── zoneName = "Main Terminal"
    ├── payoutMultiplier = 1.8
    └── next_nodes = "PathNode_002,PathNode_005"
```

**Extracted in Code:**
```typescript
{
  id: "PathNode_Intersection_Pickup_Terminal_001",
  position: Vector3(10, 0, 15),
  types: ['intersection', 'pickup'],
  next: ['PathNode_002', 'PathNode_005'],
  metadata: {
    zoneName: "Main Terminal",
    payoutMultiplier: 1.8,
    next_nodes: "PathNode_002,PathNode_005"
  }
}
```

## Next Steps

1. Model your city in Blender
2. Add PathNode Empty objects using the naming conventions
3. Add custom properties for metadata (optional)
4. Export as `.glb` to `/public/models/city.glb`
5. Generate TypeScript component with `gltfjsx`
6. Extract nodes with `extractPathNodesFromGLTF()`
7. Implement game logic based on node types

---

**Related Files:**
- `/webapp/components/CityModel.tsx` - Model loader
- `/webapp/data/roads.ts` - Road network data
- `/webapp/lib/extractPathNodes.ts` - Node extraction utilities
- `/webapp/lib/movement.ts` - Movement system
- `/webapp/types/game.ts` - Type definitions (NodeType, NodeMetadata)
