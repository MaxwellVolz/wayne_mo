# Design Conflict Analysis

## Current Situation

We have **two different game designs** documented:

### CLAUDE.md (Old Design - STOP/GO Timing Game)
- Player controls individual taxis with STOP/GO button
- Timing windows for pickup/dropoff
- Slow-motion focus mechanic (0.25x time scale)
- Success/failure based on timing accuracy
- 2 taxi maximum
- Automation reduces interrupts

**Genre:** Timing-based management with slow-motion focus

### game_concept.md (New Design - Intersection Routing Puzzle)
- Player controls **intersections**, not taxis
- Taxis are fully autonomous
- Intersections toggle: pass through / turn left / turn right
- Persistent routing decisions
- First-come-first-serve delivery claiming
- Collision = both taxis reverse
- Scales with more taxis and deliveries

**Genre:** Spatial routing puzzle / traffic flow optimization

## Key Differences

| Aspect              | STOP/GO Design             | Intersection Design       |
| ------------------- | -------------------------- | ------------------------- |
| **Player Controls** | Individual taxis           | Intersections             |
| **Core Mechanic**   | Timing button presses      | Setting persistent routes |
| **Taxi Behavior**   | React to player commands   | Fully autonomous          |
| **Interaction**     | STOP/GO button             | Tap intersection to cycle |
| **Time Scale**      | Slow-motion focus (0.25x)  | Can pause, no slow-mo     |
| **Failure**         | Missed timing → block loop | Poor routing → time loss  |
| **Taxi Count**      | Max 2                      | Scales up (difficulty)    |
| **Complexity**      | Per-taxi attention         | System-level thinking     |

## Current Implementation

What we've built so far:
- ✅ Path-based movement system
- ✅ Blender integration with path nodes
- ✅ Node type system (intersections, pickup, dropoff, etc.)
- ✅ Taxi visualization with state colors
- ✅ Path following with node connections
- ❌ No STOP/GO button yet
- ❌ No timing windows yet
- ❌ No intersection controls yet

## Compatibility Analysis

The good news: **Most of our current implementation is compatible with both designs!**

**Already built (works for either):**
- Path-based movement ✅
- Blender workflow ✅
- Node extraction ✅
- Intersection nodes in the graph ✅
- Multiple taxis support ✅

**Design-specific (not yet built):**
- STOP/GO: Timing windows, slow-motion, contextual button
- Intersection: Intersection state toggle, routing logic, delivery system

## Recommendation

**Implement the Intersection Design** (game_concept.md) because:

1. **Simpler to build**
   - No timing windows
   - No slow-motion system
   - No per-taxi UI
   - No failure loops

2. **More unique gameplay**
   - Most management games don't use intersection control
   - Natural automation through persistent decisions
   - Scales better (more taxis = more interesting)

3. **Already have the foundation**
   - Intersection nodes are already in the graph
   - Just need to add state (pass/left/right)
   - Taxi routing can use existing path system

4. **Clearer scope**
   - "No traffic AI, no pathfinding, no steering"
   - Everything hinges on intersections
   - Easier to scope features

## Migration Path

1. Update CLAUDE.md to match game_concept.md design
2. Remove timing/STOP/GO references from documentation
3. Add intersection state system
4. Implement intersection routing logic
5. Build delivery spawn system
6. Add collision detection (reverse on collision)

## Decision Needed

**Which design should we implement?**
- [X] Intersection Design (game_concept.md) ← RECOMMENDED
- [ ] STOP/GO Design (current CLAUDE.md)
- [ ] Hybrid (risky - feature creep)
