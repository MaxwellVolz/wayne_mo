# Intersection Control System - Testing Guide

**Quick Reference:** How to test the intersection routing system

---

## Prerequisites

```bash
cd webapp
npm run dev
```

Open: http://localhost:3000

---

## Visual Checklist

### 1. Intersection Indicators Appear

Look for colored symbols at intersection nodes:
- **Green + (plus)** = Pass through mode
- **Blue )( sideways** = Turn left mode
- **Orange )( horizontal** = Turn right mode

**Expected:** Symbols pulse with emissive glow

### 2. Hover Feedback

Move mouse over intersection tile:
- **Expected:** Cursor changes to pointer
- **Expected:** Base circle visible (semi-transparent)

### 3. Click to Toggle

Click any intersection tile 3 times:

**Click 1:** Green + → Blue )( (sideways)
**Click 2:** Blue )( → Orange )( (horizontal)
**Click 3:** Orange )( → Green + (back to start)

**Expected:** Smooth visual transition between symbols

---

## Console Checks

Open browser console (F12) and look for:

### On Page Load:
```
🚦 Initialized N intersections with controllable routing
  📍 PathNode_Intersection_XXX: X exits, mode: pass_through
🚦 IntersectionManager: Rendering N intersection tiles
```

### On Click:
```
🚦 PathNode_Intersection_XXX mode changed: pass_through → turn_left
```

### When Taxi Reaches Intersection:
```
📍 Path categorization at PathNode_Intersection_XXX:
  incoming: PathNode_A_to_PathNode_B
  straight: PathNode_B_to_PathNode_C
  left: PathNode_B_to_PathNode_D
  right: PathNode_B_to_PathNode_E
🚦 Intersection PathNode_B: turn_left → PathNode_B_to_PathNode_D
🚕 Path transition: PathNode_A_to_PathNode_B → PathNode_B_to_PathNode_D
```

---

## Routing Test

### Test 1: Verify Straight Path (Default)

1. Find intersection with green + symbol
2. Watch taxi approach
3. **Expected:** Taxi continues straight through

### Test 2: Force Left Turn

1. Click intersection until it shows **blue )( sideways**
2. Watch taxi approach same intersection
3. **Expected:** Taxi turns left instead of going straight
4. **Console:** Shows `turn_left → PathNode_XXX_to_YYY`

### Test 3: Force Right Turn

1. Click intersection until it shows **orange )( horizontal**
2. Watch taxi approach
3. **Expected:** Taxi turns right
4. **Console:** Shows `turn_right → PathNode_XXX_to_ZZZ`

### Test 4: Cycle Back to Straight

1. Click until green + returns
2. Watch taxi approach
3. **Expected:** Taxi goes straight again

---

## Troubleshooting

### No Intersection Tiles Visible

**Check:**
1. Console shows "Initialized N intersections"?
   - If N = 0: No intersection nodes in Blender model
   - Solution: Add `PathNode_Intersection_XXX` in Blender

2. Console shows "IntersectionManager: Rendering N tiles"?
   - If no: IntersectionManager not in Scene
   - Solution: Check Scene.tsx has `<IntersectionManager />`

3. Camera can see intersections?
   - Solution: Use OrbitControls to pan around

### Clicks Not Working

**Check:**
1. Cursor changes to pointer on hover?
   - If no: Click detection not working
   - Try clicking center of tile

2. Console logs mode change?
   - If yes: Visual issue, not logic issue
   - If no: Event handler not firing

### Taxis Ignore Intersection Mode

**Check:**
1. Console shows path categorization?
   - If no: Taxi not reaching intersection
   - Solution: Wait longer

2. Console shows intersection mode being used?
   - If shows "🎲 Random path selection": Intersection state not passed
   - Solution: Check Taxi.tsx calls `getIntersections()`

3. Taxi goes wrong direction?
   - Check path categorization log
   - Verify left/right/straight assignments are correct

### Performance Issues

**Check:**
1. How many intersections?
   - Each tile = ~20 draw calls
   - 20+ may cause slowdown

2. Reduce symbol complexity:
   - Edit IntersectionTile.tsx
   - Use simpler geometry

---

## Browser Console Commands

Test intersection system directly:

```javascript
// Get current intersection states
window.testIntersectionRouting()

// Coming soon: manual controls
// window.setIntersectionMode('PathNode_Intersection_Main', 'turn_left')
```

---

## Expected Behavior Summary

| Action | Visual | Console | Taxi Behavior |
|--------|--------|---------|---------------|
| Page load | Green + at intersections | "Initialized N intersections" | Uses pass_through mode |
| Click once | Changes to Blue )( sideways | "mode changed: ... → turn_left" | Will turn left |
| Click twice | Changes to Orange )( | "mode changed: ... → turn_right" | Will turn right |
| Click thrice | Back to Green + | "mode changed: ... → pass_through" | Goes straight |
| Taxi approaches | Pulsing glow | "Path categorization..." | Follows current mode |
| Taxi reaches | No visual change | "Intersection: MODE → PATH" | Takes correct path |

---

## Success Criteria

✅ **Visual Working:**
- Intersection tiles render at all intersection nodes
- Symbols change when clicked
- Colors match modes (green/blue/orange)
- Pulsing animation is smooth

✅ **Interaction Working:**
- Clicks toggle through modes in order
- Cursor changes on hover
- Console logs mode changes

✅ **Routing Working:**
- Taxis follow intersection rules
- Changing mode changes taxi behavior
- Console logs show correct path selection

---

## Next Steps After Testing

If everything works:
- ✅ **Phase 1 & 2 complete!**
- Consider Phase 3 polish (save/load, keyboard shortcuts)
- Start implementing delivery system (Phase 2 of game_concept.md)

If issues found:
- Check console for errors
- Review /docs/PHASE1_COMPLETE.md and /docs/PHASE2_COMPLETE.md
- File issue or ask for help

---

**Ready to Test!** 🚀
