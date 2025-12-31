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

| Node Type        | Keyword                   | Purpose                       | Example Name                   |
| ---------------- | ------------------------- | ----------------------------- | ------------------------------ |
| **Path**         | (default)                 | Regular waypoint              | `PathNode_001`                 |
| **Intersection** | `Intersection`            | **Player-controlled routing** | `PathNode_Intersection_001`    |
| **Pickup**       | `Pickup`                  | Passenger pickup location     | `PathNode_Pickup_Downtown_001` |
| **Dropoff**      | `Dropoff`                 | Passenger dropoff location    | `PathNode_Dropoff_Airport_001` |
| **Red Light**    | `RedLight` or `Red_Light` | Traffic light/stop point      | `PathNode_RedLight_001`        |
| **Service**      | `Service`                 | Service station for repairs   | `PathNode_Service_Main_001`    |

### ⚠️ CRITICAL: Intersection Nodes

**Intersections are the core game mechanic** - this is what the player controls!

**Requirements for Intersection Nodes:**
1. **Must have name keyword:** `Intersection` in the node name
2. **Must have 2+ connected neighbors:** At least 2 non-empty values in `neighbors` property
3. **Should have 3+ directions:** For maximum player control options

**How Intersections Work:**
- Player clicks intersection in-game to toggle routing mode:
  - **Green + (Pass Through)** - Taxis go straight
  - **Blue ↶ (Turn Left)** - Taxis turn left
  - **Orange ↷ (Turn Right)** - Taxis turn right
- ALL taxis follow the same rule at each intersection
- Turn direction is **relative to approach** - algebraic routing, no vector math
- Handles multi-directional traffic correctly

**Example Setup in Blender:**
```
INT_Main
├── Position: (0, 0, 0)
└── Custom Properties:
    └── neighbors = "INT_North,INT_East,INT_South,INT_West"

This creates a 4-way intersection where:
- Taxi approaching from any direction can go straight, turn left, or turn right
- Turn direction is relative to the taxi's approach direction
- Player controls the routing rule, taxis follow it automatically
```

**Best Practices:**
- **Name clearly:** `PathNode_Intersection_Downtown_Main`
- **3+ exits preferred:** Gives player more control
- **Space them out:** Don't place intersections too close together
- **Test in-game:** Click the intersection to verify all 3 modes work

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

**Intersections (Player-Controlled):**
```
PathNode_Intersection_North_001
PathNode_Intersection_South_002
PathNode_Intersection_Downtown_Main
```
→ **IMPORTANT:** Player controls routing at these nodes
→ Must have 2+ neighbors in `neighbors` property
→ Displays visual indicator in-game (Green +, Blue ↶, Orange ↷)

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
- **Intersections** at road junctions (🎮 **GAME MECHANIC** - these are clickable by player!)
  - Place where 3+ roads meet for maximum player control
  - Space intersections 20+ units apart for visibility
  - Consider creating a "main intersection" for central control
- **Pickups/Dropoffs** along road edges (not in middle of path)
- **Red Lights** before intersections
- Space regular nodes evenly (every 5-10 units for smooth movement)

**Organization:**
- Use **Collections** to organize by type:
  ```
  Collection: PathNodes_Regular
  Collection: PathNodes_Intersections  ⭐ IMPORTANT - These become player controls!
  Collection: PathNodes_Pickups
  Collection: PathNodes_Service
  ```
- Number sequentially for automatic connection: `001`, `002`, `003`
- Use descriptive names: `Downtown`, `Airport`, `Terminal`
- **Intersection naming:** Use location-based names for player clarity
  - Good: `PathNode_Intersection_Downtown_Main`
  - Bad: `PathNode_Intersection_001` (not descriptive)

### 3. Adding Custom Properties (REQUIRED for Path Connections)

You **must** add Custom Properties to define how nodes connect to each other.

**How to Add Custom Properties:**
1. Select your PathNode object (mesh marker or Empty)
2. Open the **Object Properties** panel (orange square icon)
3. Scroll down to **Custom Properties**
4. Click the **+** button to add a new property
5. Set the property name and value

---

## Connecting Intersections with `neighbors` (RECOMMENDED)

**⭐ NEW TOPOLOGICAL MODEL** - Use this for all intersections going forward.

### Why Use `neighbors` Instead of `next_nodes`?

The topological model is superior for intersections because:
- ✅ Handles multi-directional traffic correctly
- ✅ Turn direction is relative to approach (matches real-world intuition)
- ✅ No vector math guessing - pure algebraic routing
- ✅ Camera-independent and fully debuggable
- ✅ Works for 2-way, 3-way, and 4-way intersections uniformly

### Format (RECOMMENDED: Separate Properties)

Use **4 separate custom properties** - much clearer and less error-prone!

```
Property Name: north     Property Type: String    Value: "NodeID" (or leave empty)
Property Name: east      Property Type: String    Value: "NodeID" (or leave empty)
Property Name: south     Property Type: String    Value: "NodeID" (or leave empty)
Property Name: west      Property Type: String    Value: "NodeID" (or leave empty)
```

**Benefits:**
- ✅ Crystal clear - no confusion about order
- ✅ Easy to edit - just type node name or leave blank
- ✅ No formatting errors - no commas, brackets, or quotes to mess up
- ✅ Visual - you can see which directions are connected at a glance

**Example in Blender:**
```
Intersection: INT_Center
Custom Properties:
  north = "INT_North"
  east  = "INT_East"
  south = "INT_South"
  west  = "INT_West"
```

**For T-Intersections (missing connections):**
```
Intersection: INT_T_Junction
Custom Properties:
  north = "INT_North"
  east  = (leave empty - no property needed)
  south = "INT_South"
  west  = "INT_West"
```

### Alternative Format (Legacy)

You can also use a single `neighbors` property (not recommended):

```
Property Name: neighbors
Property Type: String
Value Format: "North,East,South,West"
```

Example: `neighbors = "INT_N,INT_E,,INT_W"` (empty between commas = no connection)

### Quick Reference Cheat Sheet

```
4-way intersection:  "INT_N,INT_E,INT_S,INT_W"
T-junction (no E):   "INT_N,,INT_S,INT_W"
T-junction (no W):   "INT_N,INT_E,INT_S,"
L-corner (E+S):      ",INT_E,INT_S,"
2-way (N+S only):    "INT_N,,INT_S,"
Dead end (N only):   "INT_N,,,"

Empty slots = empty string between commas
Always 4 values total (3 commas)
```

### Step-by-Step Guide: Creating a Topological Intersection

**Example: 4-Way Intersection**

**1. Create the Central Intersection Node**
```
Name: INT_Center
Position: (0, 0, 0)
```

**2. Create the 4 Surrounding Intersection Nodes**
```
Name: INT_North     Position: (0, 0, 10)
Name: INT_East      Position: (10, 0, 0)
Name: INT_South     Position: (0, 0, -10)
Name: INT_West      Position: (-10, 0, 0)
```

**3. Add Direction Properties to INT_Center**
- Select `INT_Center`
- Object Properties → Custom Properties → **+** (add 4 times)
- Add these properties:
  ```
  north = "INT_North"
  east  = "INT_East"
  south = "INT_South"
  west  = "INT_West"
  ```

**4. Add Direction Properties to Each Surrounding Node**

For `INT_North` (only connects back South to center):
- Select `INT_North`
- Add property: `south = "INT_Center"`
- (Don't add north, east, or west - they don't exist)

For `INT_East` (only connects back West to center):
- Select `INT_East`
- Add property: `west = "INT_Center"`

For `INT_South` (only connects back North to center):
- Select `INT_South`
- Add property: `north = "INT_Center"`

For `INT_West` (only connects back East to center):
- Select `INT_West`
- Add property: `east = "INT_Center"`

### Common Intersection Patterns

**4-Way Intersection:**
```
Node: INT_Main
Properties:
  north = "INT_North"
  east  = "INT_East"
  south = "INT_South"
  west  = "INT_West"
```

**T-Intersection (No Eastern Exit):**
```
Node: INT_T_Junction
Properties:
  north = "INT_North"
  south = "INT_South"
  west  = "INT_West"
  (no east property)
```

**L-Intersection (Corner):**
```
Node: INT_Corner
Properties:
  east  = "INT_East"
  south = "INT_South"
  (no north or west properties)
```

**2-Way (North-South Only):**
```
Node: INT_Straight
Properties:
  north = "INT_North"
  south = "INT_South"
  (no east or west properties)
```

### Establishing Your Direction Convention

**IMPORTANT:** Choose a consistent mapping for your entire level!

**Recommended Convention (Blender Top View):**
- Slot 0 (North) = +Z direction in Blender
- Slot 1 (East)  = +X direction in Blender
- Slot 2 (South) = -Z direction in Blender
- Slot 3 (West)  = -X direction in Blender

**Workflow Tip:**
1. View your intersection from top view in Blender (`Numpad 7`)
2. Identify which adjacent intersections are in which compass direction
3. Fill in `neighbors` based on your convention
4. Document your convention in a comment or text file

**Example Workflow:**
```
You're setting up INT_Downtown_Main at position (50, 0, 30)

Looking at top view:
- To the North (+Z): INT_Uptown at (50, 0, 40)
- To the East  (+X): INT_Harbor at (60, 0, 30)
- To the South (-Z): INT_Station at (50, 0, 20)
- To the West  (-X): (no road)

neighbors property: "INT_Uptown,INT_Harbor,INT_Station,"
                     [North]   [East]     [South]    [West=empty]
```

### How Runtime Routing Works

When a taxi approaches an intersection:

1. **Taxi supplies:** Incoming direction slot (0-3)
2. **Player sets:** Turn rule (Straight / Left / Right)
3. **System resolves:** Outgoing direction slot

**Turn Resolution (Algebraic):**
```
Straight: outgoing = incoming
Left:     outgoing = (incoming + 3) % 4  // counterclockwise
Right:    outgoing = (incoming + 1) % 4  // clockwise
```

**Example:**
```
Taxi arrives at INT_Center from slot 2 (South, coming from INT_South)
Player has set: "Turn Right"
Outgoing slot: (2 + 1) % 4 = 3 (West)
Next intersection: INT_West
```

### Visual Reference

```
         INT_North (slot 0)
               |
               ↓
INT_West ← INT_Center → INT_East
(slot 3)       ↑        (slot 1)
               |
          INT_South (slot 2)

neighbors = "INT_North,INT_East,INT_South,INT_West"
             [0]       [1]      [2]       [3]
```

---

## Additional Custom Properties (Optional)

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

### Complete Examples

**Example 1: Topological 4-Way Intersection (RECOMMENDED)**

1. Create mesh marker
2. Name: `INT_Downtown_Main`
3. Add custom properties:
   ```
   neighbors: INT_Uptown,INT_Harbor,INT_Station,INT_Park
   ```

This creates a 4-way intersection where:
- Taxis can approach from any of 4 directions
- Player controls turn behavior (straight/left/right)
- Turn direction is relative to approach angle
- Algebraic routing - no vector math

**Example 2: Topological T-Intersection with Red Light**

1. Create mesh marker
2. Name: `INT_RedLight_Junction`
3. Add custom properties:
   ```
   neighbors: INT_North,,INT_South,INT_West
   redLightDuration: 4.0
   greenLightDuration: 6.0
   currentState: "green"
   ```

This creates a T-intersection where:
- North, South, and West exits (no East road)
- Traffic light controls flow (4s red, 6s green)
- Player can still toggle routing modes

### Testing Your Connections

After exporting, check the browser console for:

```
✅ Extracted N path nodes:
  - INT_Center [TOPO] → N:INT_North, E:INT_East, S:INT_South, W:INT_West
  - INT_North [TOPO] → N:-, E:-, S:INT_Center, W:-
  - INT_T_Junction [TOPO] → N:INT_A, E:-, S:INT_B, W:INT_C
```

**Warning Signs:**
- Missing `[TOPO]` marker → You forgot to add the `neighbors` custom property!
- `[TOPO]` with only 1 neighbor → Intersections need 2+ connections
- Node IDs don't match → Check spelling in `neighbors` property

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

### Post-processing (Automatic)

The `npm run buildcity` and `npm run buildtaxi` commands **automatically fix all type errors** for you.

If you need to manually fix a generated file:

```bash
node scripts/fix-gltf-types.js components/YourModel.tsx
```

**What gets fixed automatically:**
- ✅ Removes `animations: GLTFAction[]` (invalid type)
- ✅ Replaces `JSX.IntrinsicElements['group']` with `React.ComponentProps<'group'>`
- ✅ Fixes type assertion: `as GLTFResult` → `as unknown as GLTFResult`
- ✅ Adds `import React from 'react'` if needed

**Path fixing:** gltfjsx generates correct paths (`/models/city_01.glb`) automatically when run with the correct input path.

### Preserving Textures When Adding Logic

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

### Method 3: Using Custom Properties (Recommended)

In Blender, add **Custom Properties** to define intersection connections:

**In Blender:**
1. Select Intersection node
2. Object Properties → Custom Properties → Add
3. Add property: `neighbors` = `"INT_North,INT_East,,INT_West"` (4 slots, empty for missing connections)

**In Code:**
```typescript
export function extractPathNodesFromGLTF(gltf: GLTF): RoadNode[] {
  const nodes: RoadNode[] = []

  gltf.scene.traverse((object) => {
    if (object.name.startsWith('PathNode_') || object.name.startsWith('INT_')) {
      const neighbors = object.userData.neighbors
        ? object.userData.neighbors.split(',').map(s => s.trim() || null)
        : undefined

      nodes.push({
        id: object.name,
        position: object.getWorldPosition(new THREE.Vector3()),
        neighbors,
        types: parseNodeTypes(object.name)
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
INT_Pickup_Terminal_Main
├── Position: (10, 0, 15)
└── Custom Properties:
    ├── zoneName = "Main Terminal"
    ├── payoutMultiplier = 1.8
    └── neighbors = "INT_North,,INT_Parking,INT_Downtown"
```

**Extracted in Code:**
```typescript
{
  id: "INT_Pickup_Terminal_Main",
  position: Vector3(10, 0, 15),
  types: ['intersection', 'pickup'],
  neighbors: ['INT_North', null, 'INT_Parking', 'INT_Downtown'],
  metadata: {
    zoneName: "Main Terminal",
    payoutMultiplier: 1.8,
    neighbors: "INT_North,,INT_Parking,INT_Downtown"
  }
}
```

## Next Steps

1. Model your city in Blender
2. Add intersection nodes using the naming convention (`INT_NodeName` or `PathNode_Intersection_Name`)
3. Add `neighbors` custom property to define topological connections
   - Format: `"North,East,South,West"` (4 comma-separated values)
   - Empty slots use empty string (e.g., `"INT_N,,INT_S,"` for T-junction)
4. Add optional custom properties for metadata (zone names, payout multipliers, etc.)
5. Export as `.glb` to `/public/models/city.glb`
6. Generate TypeScript component with `gltfjsx`
7. Extract nodes with `extractPathNodesFromGLTF()`
8. Test in-game - check browser console for `[TOPO]` markers

---

**Related Files:**
- `/webapp/components/CityModel.tsx` - Model loader
- `/webapp/data/roads.ts` - Road network data
- `/webapp/lib/extractPathNodes.ts` - Node extraction utilities
- `/webapp/lib/movement.ts` - Movement system
- `/webapp/lib/intersectionTopology.ts` - **NEW:** Topological routing logic
- `/webapp/types/game.ts` - Type definitions (NodeType, NodeMetadata, Dir)
