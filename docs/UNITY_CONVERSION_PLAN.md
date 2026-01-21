# Unity Conversion Plan: Intersection & Road System

This document outlines the architecture for recreating the intersection-controlled taxi routing system in Unity, leveraging the **Unity Splines package** for path authoring.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Unity Splines Integration](#unity-splines-integration)
3. [GameObject Hierarchy](#gameobject-hierarchy)
4. [Core Components](#core-components)
5. [Data Structures](#data-structures)
6. [Intersection Routing Logic](#intersection-routing-logic)
7. [Taxi Movement System](#taxi-movement-system)
8. [Player Interaction](#player-interaction)
9. [Scene Authoring Workflow](#scene-authoring-workflow)
10. [Implementation Phases](#implementation-phases)

---

## 1. System Overview

### Current Web Architecture (Three.js/React)

```
Blender GLB → extractPathNodes() → RoadNetwork → IntersectionState → Taxi Movement
```

**Key Concepts:**
- **Topological routing**: 4-slot neighbor system (N/E/S/W)
- **Priority tables**: Explicit fallback order for each (incomingDir, mode) pair
- **Path-based movement**: Parametric interpolation (t=0-1), no physics
- **Persistent player rules**: Intersection modes survive until changed

### Unity Target Architecture

```
Spline Containers → RoadNetwork ScriptableObject → IntersectionController → TaxiAgent
```

**Mapping:**
| Web Concept | Unity Equivalent |
|-------------|------------------|
| RoadNode | `RoadNode` MonoBehaviour + Transform |
| RoadPath | `SplineContainer` segment |
| IntersectionState | `IntersectionController` component |
| Taxi movement | `SplineAnimate` or custom `TaxiAgent` |
| Global state | `RoadNetworkManager` singleton |

---

## 2. Unity Splines Integration

### Why Unity Splines?

The [Unity Splines package](https://docs.unity3d.com/Packages/com.unity.splines@2.0/manual/index.html) (com.unity.splines) provides:

- Visual spline editing in Scene view
- `SplineContainer` for storing path data
- `SplineAnimate` for parametric movement
- `SplineExtrude` for road mesh generation
- Knot/tangent manipulation for curved roads
- Native integration with Unity's transform system

### Spline-Based Road Segments

Each road segment between two nodes becomes a **SplineContainer**:

```
[Node A] ────────SplineContainer────────> [Node B]
           (Bezier curve with knots)
```

**SplineContainer Setup:**
```csharp
// Each road segment is a SplineContainer with 2+ knots
SplineContainer roadSegment;
roadSegment.Spline.Add(new BezierKnot(startPosition));
roadSegment.Spline.Add(new BezierKnot(endPosition));

// For curved roads, add intermediate knots or adjust tangents
```

### SplineAnimate vs Custom Movement

**Option A: SplineAnimate Component (Simple)**
- Built-in parametric movement
- Auto-handles position and rotation
- Limited control over path switching

**Option B: Custom TaxiAgent (Recommended)**
- Manual `Spline.EvaluatePosition(t)` calls
- Full control over path transitions at intersections
- Easier integration with intersection routing logic

```csharp
// Custom movement in Update()
float t = taxi.Progress; // 0-1 along current spline
Vector3 position = taxi.CurrentSpline.EvaluatePosition(t);
Vector3 tangent = taxi.CurrentSpline.EvaluateTangent(t);
transform.position = position;
transform.rotation = Quaternion.LookRotation(tangent);
```

---

## 3. GameObject Hierarchy

### Recommended Scene Structure

```
Scene
├── --- MANAGERS ---
│   ├── GameManager
│   │   └── [GameManager.cs]
│   ├── RoadNetworkManager
│   │   └── [RoadNetworkManager.cs]
│   └── DeliveryManager
│       └── [DeliveryManager.cs]
│
├── --- ROAD NETWORK ---
│   ├── RoadNetwork
│   │   ├── Nodes
│   │   │   ├── Node_001 [RoadNode.cs]
│   │   │   ├── Node_002 [RoadNode.cs]
│   │   │   ├── INT_Main_001 [RoadNode.cs, IntersectionController.cs]
│   │   │   ├── INT_Main_002 [RoadNode.cs, IntersectionController.cs]
│   │   │   ├── Pickup_Downtown_001 [RoadNode.cs, PickupZone.cs]
│   │   │   └── Dropoff_Airport_001 [RoadNode.cs, DropoffZone.cs]
│   │   │
│   │   └── Paths
│   │       ├── Path_Node001_to_INT001 [SplineContainer]
│   │       ├── Path_INT001_to_Node002 [SplineContainer]
│   │       ├── Path_INT001_to_INT002 [SplineContainer]
│   │       └── ... (one SplineContainer per directed edge)
│   │
│   └── IntersectionVisuals
│       ├── INT_Main_001_Visual [IntersectionVisual.cs]
│       └── INT_Main_002_Visual [IntersectionVisual.cs]
│
├── --- TAXIS ---
│   └── Taxis
│       ├── Taxi_001 [TaxiAgent.cs, TaxiVisual.cs]
│       ├── Taxi_002 [TaxiAgent.cs, TaxiVisual.cs]
│       └── ...
│
├── --- CITY VISUALS ---
│   └── CityModel
│       ├── Buildings
│       ├── Roads (mesh, separate from spline logic)
│       └── Props
│
└── --- UI ---
    ├── GameHUD
    ├── IntersectionUI (world-space Canvas per intersection)
    └── GameOverScreen
```

### Node Naming Convention

Consistent naming enables auto-detection of node types:

| Prefix | Node Type | Components |
|--------|-----------|------------|
| `Node_*` | Path node | `RoadNode` |
| `INT_*` | Intersection | `RoadNode`, `IntersectionController` |
| `Pickup_*` | Pickup zone | `RoadNode`, `PickupZone` |
| `Dropoff_*` | Dropoff zone | `RoadNode`, `DropoffZone` |

---

## 4. Core Components

### 4.1 RoadNode.cs

Represents a single point in the road network.

```csharp
using UnityEngine;
using UnityEngine.Splines;

public class RoadNode : MonoBehaviour
{
    [Header("Identification")]
    public string nodeId; // Auto-generated from GameObject name

    [Header("Node Type")]
    public NodeType[] types; // Path, Intersection, Pickup, Dropoff

    [Header("Topological Connections (4-slot: N/E/S/W)")]
    [Tooltip("Neighbor nodes in cardinal directions. Null = no connection.")]
    public RoadNode[] neighbors = new RoadNode[4]; // [0]=N, [1]=E, [2]=S, [3]=W

    [Header("Outgoing Paths")]
    [Tooltip("SplineContainers for paths leaving this node")]
    public SplineConnection[] outgoingPaths;

    [Header("Metadata")]
    public string zoneName;
    public float payoutMultiplier = 1f;

    void Awake()
    {
        if (string.IsNullOrEmpty(nodeId))
            nodeId = gameObject.name;
    }

    /// <summary>
    /// Get the SplineContainer leading to a specific neighbor direction
    /// </summary>
    public SplineContainer GetPathToDirection(Dir direction)
    {
        var connection = System.Array.Find(outgoingPaths,
            p => p.direction == direction);
        return connection?.spline;
    }
}

[System.Serializable]
public class SplineConnection
{
    public Dir direction;           // Which slot this path exits
    public SplineContainer spline;  // The actual spline path
    public RoadNode destination;    // Where this path leads
}

public enum NodeType
{
    Path,
    Intersection,
    Pickup,
    Dropoff,
    RedLight,
    Service
}

public enum Dir
{
    North = 0,
    East = 1,
    South = 2,
    West = 3
}
```

### 4.2 IntersectionController.cs

Manages player-controlled routing at intersections.

```csharp
using UnityEngine;
using UnityEngine.Events;

public class IntersectionController : MonoBehaviour
{
    [Header("State")]
    public IntersectionMode currentMode = IntersectionMode.PassThrough;

    [Header("References")]
    public RoadNode roadNode; // Auto-populated from sibling component

    [Header("Events")]
    public UnityEvent<IntersectionMode> OnModeChanged;

    void Awake()
    {
        roadNode = GetComponent<RoadNode>();
    }

    /// <summary>
    /// Cycle to next mode (called by player click)
    /// </summary>
    public void CycleMode()
    {
        currentMode = currentMode switch
        {
            IntersectionMode.PassThrough => IntersectionMode.TurnLeft,
            IntersectionMode.TurnLeft => IntersectionMode.TurnRight,
            IntersectionMode.TurnRight => IntersectionMode.PassThrough,
            _ => IntersectionMode.PassThrough
        };

        OnModeChanged?.Invoke(currentMode);
    }

    /// <summary>
    /// Get next direction based on incoming direction and current mode
    /// </summary>
    public Dir GetNextDirection(Dir incomingDir)
    {
        return IntersectionRouter.GetNextDirection(
            roadNode,
            incomingDir,
            currentMode
        );
    }
}

public enum IntersectionMode
{
    PassThrough,
    TurnLeft,
    TurnRight
}
```

### 4.3 TaxiAgent.cs

Handles taxi movement along splines with intersection routing.

```csharp
using UnityEngine;
using UnityEngine.Splines;

public class TaxiAgent : MonoBehaviour
{
    [Header("Movement")]
    public float speed = 5f;
    public float progress = 0f; // 0-1 along current spline

    [Header("Current Path")]
    public SplineContainer currentSpline;
    public RoadNode currentDestination;
    public Dir incomingDirection; // Which direction we'll enter next node from

    [Header("State")]
    public TaxiState state = TaxiState.Idle;
    public bool isReversing = false;

    [Header("Delivery")]
    public DeliveryData currentDelivery;

    void Update()
    {
        if (state == TaxiState.Idle || currentSpline == null) return;

        // Advance along spline
        float splineLength = currentSpline.CalculateLength();
        progress += (speed * Time.deltaTime) / splineLength;

        // Sample position and rotation
        float t = isReversing ? (1f - progress) : progress;
        Vector3 position = currentSpline.EvaluatePosition(t);
        Vector3 tangent = currentSpline.EvaluateTangent(t);

        transform.position = position;
        if (tangent != Vector3.zero)
        {
            Vector3 forward = isReversing ? -tangent : tangent;
            transform.rotation = Quaternion.LookRotation(forward);
        }

        // Check for path end
        if (progress >= 1f)
        {
            OnPathEnd();
        }
    }

    void OnPathEnd()
    {
        progress = 0f;

        if (currentDestination == null)
        {
            state = TaxiState.Idle;
            return;
        }

        // Get next path from intersection routing
        var nextPath = RoadNetworkManager.Instance.GetNextPath(
            currentDestination,
            incomingDirection
        );

        if (nextPath.spline != null)
        {
            currentSpline = nextPath.spline;
            currentDestination = nextPath.destination;
            incomingDirection = FlipDirection(nextPath.outgoingDirection);
        }
        else
        {
            state = TaxiState.Idle;
            currentSpline = null;
        }
    }

    Dir FlipDirection(Dir outgoing)
    {
        return (Dir)(((int)outgoing + 2) % 4);
    }
}

public enum TaxiState
{
    Idle,
    DrivingToPickup,
    DrivingToDropoff,
    Stopped,
    NeedsService
}
```

### 4.4 RoadNetworkManager.cs

Singleton managing the entire road network.

```csharp
using UnityEngine;
using System.Collections.Generic;

public class RoadNetworkManager : MonoBehaviour
{
    public static RoadNetworkManager Instance { get; private set; }

    [Header("Network Data")]
    public List<RoadNode> allNodes = new List<RoadNode>();
    public List<IntersectionController> intersections = new List<IntersectionController>();

    void Awake()
    {
        Instance = this;
        CollectNetworkData();
    }

    void CollectNetworkData()
    {
        allNodes.Clear();
        intersections.Clear();

        foreach (var node in FindObjectsOfType<RoadNode>())
        {
            allNodes.Add(node);

            var intersection = node.GetComponent<IntersectionController>();
            if (intersection != null)
            {
                intersections.Add(intersection);
            }
        }
    }

    /// <summary>
    /// Get next path from a node, respecting intersection routing rules
    /// </summary>
    public PathResult GetNextPath(RoadNode node, Dir incomingDir)
    {
        var intersection = node.GetComponent<IntersectionController>();

        if (intersection != null)
        {
            // Use intersection routing
            Dir nextDir = intersection.GetNextDirection(incomingDir);
            return GetPathFromDirection(node, nextDir);
        }
        else
        {
            // Simple node: use corner/dead-end logic
            return GetSimpleNextPath(node, incomingDir);
        }
    }

    PathResult GetPathFromDirection(RoadNode node, Dir direction)
    {
        var spline = node.GetPathToDirection(direction);
        var connection = System.Array.Find(node.outgoingPaths,
            p => p.direction == direction);

        return new PathResult
        {
            spline = spline,
            destination = connection?.destination,
            outgoingDirection = direction
        };
    }

    PathResult GetSimpleNextPath(RoadNode node, Dir incomingDir)
    {
        // For corners/dead-ends: pick first available non-incoming direction
        for (int i = 0; i < 4; i++)
        {
            Dir dir = (Dir)i;
            if (dir == incomingDir) continue; // Skip U-turn

            var connection = System.Array.Find(node.outgoingPaths,
                p => p.direction == dir);
            if (connection != null)
            {
                return new PathResult
                {
                    spline = connection.spline,
                    destination = connection.destination,
                    outgoingDirection = dir
                };
            }
        }

        return new PathResult(); // Dead end
    }
}

public struct PathResult
{
    public SplineContainer spline;
    public RoadNode destination;
    public Dir outgoingDirection;
}
```

---

## 5. Data Structures

### ScriptableObject for Network Persistence (Optional)

For complex networks or procedural generation:

```csharp
[CreateAssetMenu(fileName = "RoadNetwork", menuName = "Game/Road Network")]
public class RoadNetworkData : ScriptableObject
{
    public List<NodeData> nodes;
    public List<PathData> paths;
}

[System.Serializable]
public class NodeData
{
    public string id;
    public Vector3 position;
    public NodeType[] types;
    public string[] neighborIds; // 4-slot array
    public string zoneName;
    public float payoutMultiplier;
}

[System.Serializable]
public class PathData
{
    public string id; // "NodeA_to_NodeB"
    public string sourceNodeId;
    public string destNodeId;
    public Dir sourceDirection;
    public Vector3[] waypoints; // For reconstructing splines
}
```

---

## 6. Intersection Routing Logic

### Priority Tables (Direct Port from Web)

```csharp
public static class IntersectionRouter
{
    // Priority order for each (incomingDir, mode) combination
    // Format: [incomingDir][mode] = prioritized directions to try

    private static readonly Dir[,][] PriorityTables = new Dir[4, 3][]
    {
        // Incoming from NORTH (traveling south)
        {
            new Dir[] { Dir.South, Dir.West, Dir.North, Dir.East },  // PassThrough
            new Dir[] { Dir.East, Dir.North, Dir.West, Dir.South },  // TurnLeft (CCW)
            new Dir[] { Dir.West, Dir.North, Dir.East, Dir.South }   // TurnRight (CW)
        },
        // Incoming from EAST (traveling west)
        {
            new Dir[] { Dir.West, Dir.North, Dir.East, Dir.South },  // PassThrough
            new Dir[] { Dir.South, Dir.East, Dir.North, Dir.West },  // TurnLeft
            new Dir[] { Dir.North, Dir.East, Dir.South, Dir.West }   // TurnRight
        },
        // Incoming from SOUTH (traveling north)
        {
            new Dir[] { Dir.North, Dir.East, Dir.South, Dir.West },  // PassThrough
            new Dir[] { Dir.West, Dir.South, Dir.East, Dir.North },  // TurnLeft
            new Dir[] { Dir.East, Dir.South, Dir.West, Dir.North }   // TurnRight
        },
        // Incoming from WEST (traveling east)
        {
            new Dir[] { Dir.East, Dir.South, Dir.West, Dir.North },  // PassThrough
            new Dir[] { Dir.North, Dir.West, Dir.South, Dir.East },  // TurnLeft
            new Dir[] { Dir.South, Dir.West, Dir.North, Dir.East }   // TurnRight
        }
    };

    public static Dir GetNextDirection(RoadNode node, Dir incomingDir, IntersectionMode mode)
    {
        Dir[] priorities = PriorityTables[(int)incomingDir, (int)mode];

        // Find first available direction (skip incoming = no U-turns)
        foreach (Dir dir in priorities)
        {
            if (dir == incomingDir) continue; // No U-turns

            if (node.neighbors[(int)dir] != null)
            {
                return dir;
            }
        }

        // Fallback: U-turn if nothing else available (dead end)
        return incomingDir;
    }
}
```

---

## 7. Taxi Movement System

### Movement Options Comparison

| Approach | Pros | Cons |
|----------|------|------|
| **SplineAnimate** | Built-in, easy setup | Hard to switch paths mid-animation |
| **Custom Progress** | Full control, clean transitions | More code to write |
| **DOTween + Splines** | Smooth easing, familiar API | External dependency |

### Recommended: Custom Progress System

```csharp
public class TaxiMovement : MonoBehaviour
{
    [Header("Settings")]
    public float baseSpeed = 10f;

    [Header("State")]
    private SplineContainer _currentSpline;
    private float _progress;
    private float _splineLength;

    public void SetPath(SplineContainer spline)
    {
        _currentSpline = spline;
        _progress = 0f;
        _splineLength = spline.CalculateLength();
    }

    void Update()
    {
        if (_currentSpline == null) return;

        // Advance progress
        _progress += (baseSpeed * Time.deltaTime) / _splineLength;
        _progress = Mathf.Clamp01(_progress);

        // Evaluate spline
        Vector3 pos = _currentSpline.EvaluatePosition(_progress);
        Vector3 tan = _currentSpline.EvaluateTangent(_progress);

        transform.position = pos;
        if (tan.sqrMagnitude > 0.001f)
        {
            transform.rotation = Quaternion.LookRotation(tan.normalized);
        }

        // Path complete
        if (_progress >= 1f)
        {
            OnPathComplete?.Invoke();
        }
    }

    public event System.Action OnPathComplete;
}
```

---

## 8. Player Interaction

### Intersection Click Detection

```csharp
public class IntersectionClickHandler : MonoBehaviour
{
    public IntersectionController intersection;
    public Collider clickCollider; // Box or sphere collider

    void OnMouseDown()
    {
        intersection.CycleMode();
    }
}
```

### World-Space UI for Intersection Icons

```csharp
public class IntersectionVisual : MonoBehaviour
{
    [Header("References")]
    public IntersectionController controller;
    public SpriteRenderer iconRenderer;

    [Header("Icons")]
    public Sprite passThrough;  // Green arrow
    public Sprite turnLeft;     // Blue curved arrow
    public Sprite turnRight;    // Orange curved arrow

    [Header("Animation")]
    public float rotationSpeed = 90f; // degrees/second for turn modes

    void Start()
    {
        controller.OnModeChanged.AddListener(UpdateVisual);
        UpdateVisual(controller.currentMode);
    }

    void UpdateVisual(IntersectionMode mode)
    {
        iconRenderer.sprite = mode switch
        {
            IntersectionMode.PassThrough => passThrough,
            IntersectionMode.TurnLeft => turnLeft,
            IntersectionMode.TurnRight => turnRight,
            _ => passThrough
        };
    }

    void Update()
    {
        // Rotate icon for turn modes
        if (controller.currentMode != IntersectionMode.PassThrough)
        {
            float dir = controller.currentMode == IntersectionMode.TurnLeft ? 1f : -1f;
            iconRenderer.transform.Rotate(0, 0, rotationSpeed * dir * Time.deltaTime);
        }
    }
}
```

---

## 9. Scene Authoring Workflow

### Step 1: Create Node GameObjects

1. Create empty GameObject, name it `INT_Downtown_001`
2. Add `RoadNode` component
3. Add `IntersectionController` component (auto-detected by prefix)
4. Position at intersection location

### Step 2: Create Spline Paths

1. Create new GameObject `Path_INT001_to_INT002`
2. Add `SplineContainer` component
3. Edit spline in Scene view (add knots, adjust curves)
4. Connect source node's `outgoingPaths` array to this spline

### Step 3: Wire Connections

```
On RoadNode (INT_Downtown_001):
├── neighbors[0] (North) → INT_North_001
├── neighbors[1] (East) → Node_East_005
├── neighbors[2] (South) → null (no connection)
└── neighbors[3] (West) → INT_West_002

├── outgoingPaths[0]:
│   ├── direction: North
│   ├── spline: Path_INT001_to_INTNorth
│   └── destination: INT_North_001
└── outgoingPaths[1]:
    ├── direction: East
    ├── spline: Path_INT001_to_NodeEast
    └── destination: Node_East_005
```

### Editor Tooling (Future Enhancement)

Custom editor window to:
- Auto-generate paths between connected nodes
- Validate network connectivity
- Visualize routing in Scene view
- Export/import network data

---

## 10. Implementation Phases

### Phase 1: Foundation
- [ ] Install Unity Splines package
- [ ] Create `RoadNode` component
- [ ] Create `IntersectionController` component
- [ ] Create `TaxiAgent` with basic spline following
- [ ] Test single path movement

### Phase 2: Routing System
- [ ] Implement `IntersectionRouter` priority tables
- [ ] Add `RoadNetworkManager` singleton
- [ ] Wire path switching at nodes
- [ ] Test 4-way intersection routing

### Phase 3: Visual Feedback
- [ ] Create intersection icons (sprites or 3D)
- [ ] Add click detection
- [ ] Implement mode cycling animation
- [ ] Add taxi state visuals

### Phase 4: Game Loop
- [ ] Delivery system (pickup/dropoff zones)
- [ ] Timer and scoring
- [ ] Multiple taxis
- [ ] UI overlays

### Phase 5: Polish
- [ ] Spline mesh generation for road visuals
- [ ] Camera controls
- [ ] Sound effects
- [ ] Particle effects

---

## Appendix: Key Differences from Web Version

| Aspect | Web (Three.js) | Unity |
|--------|----------------|-------|
| Path authoring | Blender GLB export | Unity Splines in-editor |
| Path data | JSON arrays | SplineContainer assets |
| Movement | Manual lerp in useFrame | SplineAnimate or custom Update |
| State management | React hooks + global store | MonoBehaviour + Singleton |
| Click detection | Three.js raycasting | Unity Physics + OnMouseDown |
| UI | React/HTML overlays | Unity Canvas (world-space) |

---

## Appendix: Unity Splines Quick Reference

```csharp
using UnityEngine.Splines;

// Get spline from container
Spline spline = container.Spline;

// Evaluate position at t (0-1)
Vector3 pos = container.EvaluatePosition(t);

// Evaluate tangent (forward direction)
Vector3 tan = container.EvaluateTangent(t);

// Get total length
float length = container.CalculateLength();

// Add a knot
spline.Add(new BezierKnot(position, tangentIn, tangentOut));

// Iterate knots
foreach (var knot in spline.Knots) { }
```

---

*Document created for Unity conversion planning. Reference original web implementation in `webapp/lib/intersectionTopology.ts` for routing logic details.*
