# Quick Fix: Empty Objects Getting Stripped

## The Problem

When you export your Blender model as GLB, **Empty objects are getting stripped out**, so your PathNode markers aren't in the exported file.

## The Solution (3 Options)

### Option 1: Use Small Mesh Markers (RECOMMENDED ✅)

This is the most reliable method.

**In Blender:**

1. Delete your Empty objects
2. Add a UV Sphere: `Shift+A` → Mesh → UV Sphere
3. Scale it super small: Press `S` then type `0.01` and hit Enter
4. Name it `PathNode_001` (or whatever node type you want)
5. Position it where you want the path node
6. Duplicate it for each path point: `Shift+D`
7. Export as normal

**Why this works:** Mesh objects ALWAYS export to GLB, unlike Empty objects which are unreliable.

**In the game:** These tiny spheres will be automatically hidden by the code in `CityModel.tsx`

---

### Option 2: Fix Empty Export Settings

If you really want to use Empty objects:

**In Blender GLTF Export Dialog:**

1. Under the **Data** section, enable:
   - ☑️ **Cameras**
   - ☑️ **Lights**
2. Make sure each Empty is parented to a mesh object (select Empty, then Shift+select mesh, press `Ctrl+P` → Object)
3. Export

**Why this is needed:** Blender's GLTF exporter has a quirk where it only includes Empty objects if you enable certain other data types.

---

### Option 3: Use Vertices on Hidden Mesh

Advanced method - not recommended for now. See full docs if interested.

---

## Quick Test

After re-exporting:

1. Run `npm run dev` in the webapp folder
2. Open browser console (F12)
3. Look for: `✅ Extracted N path nodes`
4. If you see `⚠️ No path nodes found` - try Option 1

## Updated Files

The code has been updated to:
- ✅ Accept both mesh markers AND Empty objects
- ✅ Auto-hide mesh markers so they're invisible in game
- ✅ Use world position (handles parented objects correctly)
- ✅ Better console logging for debugging

## Next Steps

1. Go back to Blender
2. Use Option 1 (small mesh spheres) for path nodes
3. Re-export your GLB
4. Refresh the game
5. Check console - you should see your path nodes!

---

See `docs/blender.md` for complete documentation.
