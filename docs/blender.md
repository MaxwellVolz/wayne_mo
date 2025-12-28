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

⚠️ **IMPORTANT: Empty Objects Export Issue**

GLTF/GLB exporters often **strip out Empty objects** by default. Use one of these methods instead:

### Method 1: Use Small Mesh Markers (RECOMMENDED)

Instead of Empty objects, use tiny sphere meshes as path markers:

1. Add a UV Sphere (`Shift+A` → Mesh → UV Sphere)
2. Scale it down: `S` then `0.01` (very small, just visible)
3. Position it where you want a path node
4. Name it using the **Node Type Naming Convention** (e.g., `PathNode_001`)
5. Optional: Create a simple material so it's visible in viewport
6. Duplicate (`Shift+D`) and position for each path point

**Benefits:**
- ✅ Reliably exports to GLTF/GLB
- ✅ Visible in Blender viewport
- ✅ Can hide in game by setting visible=false or scale=0
- ✅ Works with all export settings

### Method 2: Export Empties (Advanced)

If you must use Empty objects, follow these steps carefully:

**In Blender:**
1. Add Empty objects (`Shift+A` → Empty → Plain Axes)
2. **CRITICAL:** Parent each Empty to a mesh object, OR add to a collection that contains mesh objects
3. Position them along your roads
4. Name them using the **Node Type Naming Convention** (see below)

**Why this is needed:** GLTF exporters skip "orphan" Empties that aren't part of an object hierarchy.

### Method 3: Use Vertex Groups (Alternative)

Use marked vertices on a hidden mesh:

1. Create a plane mesh
2. Add vertices at each path point position
3. Name the mesh `PathNodes`
4. Use vertex groups or vertex colors to mark node types
5. Extract vertex positions in code

**This method requires custom extraction code.**

## Node Types and Naming Conventions

Path nodes can represent multiple types of locations. The node type is determined by keywords in the Empty object's name.

### Node Type Reference

| Node Type        | Keyword                   | Purpose                     | Example Name                   |
| ---------------- | ------------------------- | --------------------------- | ------------------------------ |
| **Path**         | (default)                 | Regular waypoint            | `PathNode_001`                 |
| **Intersection** | `Intersection`            | Where paths branch/connect  | `PathNode_Intersection_001`    |
| **Pickup**       | `Pickup`                  | Passenger pickup location   | `PathNode_Pickup_Downtown_001` |
| **Dropoff**      | `Dropoff`                 | Passenger dropoff location  | `PathNode_Dropoff_Airport_001` |
| **Red Light**    | `RedLight` or `Red_Light` | Traffic light/stop point    | `PathNode_RedLight_001`        |
| **Service**      | `Service`                 | Service station for repairs | `PathNode_Service_Main_001`    |

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

### 3. Adding Custom Properties (REQUIRED for Path Connections)

You **must** add Custom Properties to define how nodes connect to each other.

**How to Add Custom Properties:**
1. Select your PathNode object (mesh marker or Empty)
2. Open the **Object Properties** panel (orange square icon)
3. Scroll down to **Custom Properties**
4. Click the **+** button to add a new property
5. Set the property name and value

## Connecting Nodes with next_nodes

**The `next_nodes` property is REQUIRED** to define which nodes a taxi can travel to next.

### Format

```
Property Name: next_nodes
Property Type: String
Value Format: [ "NodeName1", "NodeName2", ... ]
```

⚠️ **Important:** The value must be a **JSON array string** with square brackets and double quotes.

### Examples by Node Type

**Regular Path Node (Single Exit):**
```
Node: PathNode_01
next_nodes: [ "PathNode_02" ]
```
→ Taxi goes straight to PathNode_02

**Intersection (Multiple Exits):**
```
Node: PathNode_Intersection_Main
next_nodes: [ "PathNode_North_01", "PathNode_South_01", "PathNode_East_01" ]
```
→ Taxi can choose any of 3 directions

**Pickup/Dropoff (Continue on Path):**
```
Node: PathNode_Pickup_Terminal
next_nodes: [ "PathNode_03" ]
```
→ After pickup, taxi continues to PathNode_03

**Loop Endpoint (Return to Start):**
```
Node: PathNode_04
next_nodes: [ "PathNode_01" ]
```
→ Creates a circular loop

**Dead End / Service Station:**
```
Node: PathNode_Service_Garage
next_nodes: [ "PathNode_Intersection_Main" ]
```
→ Returns to main road after service

### Step-by-Step Guide

**1. Create Node in Blender**
- Add mesh marker (small sphere, scale 0.01)
- Name it: `PathNode_01`
- Position it on the road

**2. Add next_nodes Property**
- Select PathNode_01
- Object Properties → Custom Properties → **+**
- Name: `next_nodes`
- Type: **String**
- Value: `[ "PathNode_02" ]`

**3. Create Connected Node**
- Add another mesh marker
- Name it: `PathNode_02`
- Add its next_nodes: `[ "PathNode_03" ]`

**4. Form Complete Path**
- Continue creating nodes
- Last node connects back to first for a loop:
  ```
  PathNode_04:  next_nodes = [ "PathNode_01" ]
  ```

### Advanced: Weighted Branching (Optional)

For intersections where some paths should be more likely:

```
Node: PathNode_Intersection_Downtown
next_nodes: [ "PathNode_Highway", "PathNode_Local" ]
branchProbabilities: { "PathNode_Highway": 0.7, "PathNode_Local": 0.3 }
```
→ 70% chance to highway, 30% to local road

### Other Useful Custom Properties

**Red Light Nodes:**
```
redLightDuration: 3.0      (seconds light is red)
greenLightDuration: 5.0    (seconds light is green)
currentState: "green"      (initial state)
```

**Pickup/Dropoff Nodes:**
```
zoneName: "Downtown Terminal"
payoutMultiplier: 1.5      (1.5x earnings)
```

**Service Station Nodes:**
```
repairRate: 20.0           (health/second)
serviceCost: 50.0          (money cost)
```

### Complete Example

**Intersection with Traffic Light:**

1. Create mesh marker
2. Name: `PathNode_Intersection_RedLight_Main_01`
3. Add custom properties:
   ```
   next_nodes: [ "PathNode_North_02", "PathNode_East_02" ]
   redLightDuration: 4.0
   greenLightDuration: 6.0
   currentState: "green"
   ```

This creates an intersection where:
- Taxis can go North OR East
- There's a traffic light (4s red, 6s green)
- Currently shows green

### Testing Your Connections

After exporting, check the browser console for:
```
✅ Extracted N path nodes:
  - PathNode_01: next: ["PathNode_02"]
  - PathNode_02: next: ["PathNode_03"]
  - PathNode_Intersection_Main: next: ["PathNode_North", "PathNode_South"]
```

If you see `next: []` for a node, you forgot to add the `next_nodes` property!

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

### If Using Empty Objects for Path Nodes:

⚠️ **Additional settings needed to export Empties:**

In the GLTF Export panel, under **Data** section:
- ☑️ **Cameras** (even if you don't have cameras)
- ☑️ **Lights** (even if you don't have lights)

**Why:** Blender's GLTF exporter only includes Empty objects if certain "extra" data types are enabled. This is a known quirk.

**Alternative:** Use Method 1 (small mesh markers) to avoid this issue entirely.

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


npx gltfjsx@6.5.3 public/models/city_01.glb   --output components/CityModelGenerated.tsx   --types   --keepgroups   --keepnames --meta


npx gltfjsx@6.5.3 public/models/taxi.glb   --output components/Taxi.tsx   --types   --keepgroups   --keepnames --meta
```

**Flags explained:**
- `--output`: Where to save the generated component
- `--types`: Generate TypeScript types for the model
- `--keepgroups`: Preserve Blender collections as groups

### Post-processing (Required)

After generation, you **must** update the generated files:

**1. Fix Import Paths:**
```bash
sed -i "s|'/city_01.glb'|'/models/city_01.glb'|g" components/CityModelGenerated.tsx
sed -i "s|'/taxi.glb'|'/models/taxi.glb'|g" components/Taxi.tsx
```

**2. Fix Type Errors:**

The generator may add invalid types. Update these manually:

**Remove GLTFAction (if present):**
```typescript
// REMOVE this line if it exists:
animations: GLTFAction[]

// Type should end like this:
type GLTFResult = GLTF & {
  nodes: { ... }
  materials: { ... }
}  // No animations property
```

**Fix JSX namespace:**
```typescript
// CHANGE:
export function Model(props: JSX.IntrinsicElements['group']) {

// TO:
export function Model(props: React.ComponentProps<'group'>) {
```

**Fix type assertion:**
```typescript
// CHANGE:
const { nodes, materials } = useGLTF('/models/city_01.glb') as GLTFResult

// TO:
const { nodes, materials } = useGLTF('/models/city_01.glb') as unknown as GLTFResult
```

**3. Preserve Textures When Adding Logic:**

⚠️ **IMPORTANT:** When adding custom behavior (like movement), preserve the original materials to keep textures:

```typescript
// ❌ WRONG - Replaces material, loses textures:
<mesh geometry={nodes.taxi.geometry}>
  <meshStandardMaterial color={getColor()} />
</mesh>

// ✅ CORRECT - Spreads original material, keeps textures:
<mesh geometry={nodes.taxi.geometry} material={materials.colormap}>
  <meshStandardMaterial
    {...materials.colormap}
    emissive={getEmissiveColor()}
    emissiveIntensity={0.5}
  />
</mesh>
```

The spread operator `{...materials.colormap}` preserves:
- Base color and textures
- Metalness and roughness maps
- Normal maps
- Any other material properties from Blender

Then you can add custom properties like `emissive` for state indication without losing the original appearance.

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

**❌ Problem: Path nodes not found / "0 path nodes extracted"**

**Solution 1 (RECOMMENDED):** Use mesh markers instead of Empty objects
1. In Blender, add UV Sphere (`Shift+A` → Mesh → UV Sphere)
2. Scale it tiny: `S` then `0.01`
3. Name it `PathNode_001`
4. Duplicate for each path point
5. Re-export

**Solution 2:** Fix Empty export settings
1. In GLTF Export settings, enable **Cameras** and **Lights** under Data section
2. Make sure Empties are parented to mesh objects
3. Re-export

**Solution 3:** Check the console output
- Open browser dev tools (F12)
- Look for `🏙️ City model loaded` message
- Check the "All objects in scene" log
- Verify your PathNode objects are in the list

---

**Wrong positions:**
- Ensure Blender export uses **+Y Up** transform
- Apply all transforms before export (`Ctrl+A` → All Transforms)
- Verify node positions are at ground level (Z=0 in Blender)

**Model too large/small:**
- Check scale in Blender (1 unit = 1 meter recommended)
- Apply scale before export (`Ctrl+A` → Scale)
- Adjust camera distance if needed

**Mesh markers visible in game:**
- They should auto-hide (check CityModel.tsx)
- Alternatively, put them on a separate layer and don't export that layer
- Or scale them to 0.001 to make them nearly invisible

**Path nodes have wrong types:**
- Check naming: `PathNode_Intersection_001` not `Intersection_PathNode_001`
- Keywords are case-insensitive
- Multiple types: `PathNode_Pickup_Intersection_001` works

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
