# MVP Development Plan

This document outlines the implementation roadmap for the Crazy Taxi Management MVP, following the strict 10-feature scope.

## MVP Goals

Create a playable vertical slice with:
- One taxi operating on a simple road network
- Basic STOP/GO timing mechanic
- Visual feedback for success/failure
- Second taxi unlock
- One automation upgrade option
- Local save/load

## Development Phases

### Phase 1: Foundation (3D Scene & Movement)
**Goal:** Get a taxi moving along a predefined path in a 3D scene

#### Tasks:
1. **Set up Three.js scene**
   - Create basic scene with camera, lighting
   - Add 8x8 grid ground plane for visual reference
   - Implement basic camera controls (orbit around city)

2. **Create simple road network**
   - Define test road graph with 3-4 connected paths
   - Implement path data structures in `webapp/data/roads.ts`
   - Visualize paths with debug lines

3. **Add taxi visualization**
   - Create simple taxi geometry (box or low-poly car)
   - Add visual state indicators (color coding for states)
   - Position taxi on path

4. **Implement movement system**
   - Integrate `updateTaxi()` into game loop
   - Apply `samplePath()` to mesh position
   - Add smooth rotation to face movement direction
   - Verify deterministic path following

**Deliverable:** Taxi drives along predefined path continuously

---

### Phase 2: Interaction Mechanics (STOP/GO)
**Goal:** Implement core timing interaction with visual feedback

#### Tasks:
1. **Create interaction zones**
   - Define pickup and dropoff zones in `webapp/data/zones.ts`
   - Visualize zones with colored markers/highlights
   - Implement zone detection logic

2. **Add STOP/GO UI**
   - Create contextual button component
   - Show "STOP" when taxi is moving
   - Show "GO" when taxi is stopped
   - Position button in UI overlay
   - Wire up keyboard input (spacebar)

3. **Implement timing windows**
   - Detect when taxi enters interaction window
   - Trigger visual highlight on taxi
   - Handle success: stop taxi, show success feedback
   - Handle failure: continue driving, show miss feedback

4. **Add failure loop mechanic**
   - Create "block loop" path for missed pickups
   - Transition taxi to loop path on failure
   - Return to main route after loop completes

**Deliverable:** Player can STOP taxi in timing windows with visual feedback

---

### Phase 3: Focus & Time Scaling
**Goal:** Implement slow-motion focus when approaching interaction zones

#### Tasks:
1. **Implement time scaling**
   - Apply global `timeScale` to delta time in game loop
   - Test at 1.0 (normal) and 0.25 (focus)

2. **Trigger focus on zone entry**
   - Detect when taxi enters interaction window
   - Set `timeScale = 0.25`
   - Add visual cue (vignette, highlight, camera zoom)

3. **Exit focus on zone exit**
   - Reset `timeScale = 1.0` when taxi leaves window
   - Smooth transition between time scales

4. **Handle multiple taxis (prep for Phase 4)**
   - Ensure only one taxi in focus at a time
   - Last taxi entering zone wins

**Deliverable:** Time slows to 0.25x when taxi approaches pickup/dropoff

---

### Phase 4: Job System & Economy
**Goal:** Full pickup/dropoff loop with money rewards

#### Tasks:
1. **Implement taxi state machine**
   - Add state transitions: idle → driving_to_pickup → stopped → driving_to_pickup → stopped → idle
   - Handle state-specific behavior
   - Visual state indicators

2. **Create job assignment**
   - Generate random pickup/dropoff pairs on road network
   - Assign job to idle taxi
   - Set path from current position → pickup → dropoff

3. **Add rewards**
   - Award money for successful pickups (tip bonus)
   - Award money for successful dropoffs (fare)
   - Display current money in UI
   - No penalty for missed timing (time cost only)

4. **Job loop**
   - Auto-assign new job when taxi completes dropoff
   - Return to idle if no jobs available

**Deliverable:** Complete job loop with money rewards

---

### Phase 5: Second Taxi & City Visual
**Goal:** Unlock second taxi and basic city environment

#### Tasks:
1. **Create 8x8 city grid**
   - Add simple block buildings (boxes with different heights)
   - Add roads between blocks
   - Low-poly cartoon aesthetic
   - Keep high visual readability

2. **Implement second taxi unlock**
   - Check money threshold (e.g., $100)
   - Show unlock notification
   - Spawn second taxi
   - Both taxis operate independently

3. **Multi-taxi management**
   - Player can select taxis (click/tap on taxi)
   - STOP/GO applies to selected taxi only
   - Visual indicator for selected taxi
   - Both taxis can have jobs simultaneously

4. **Focus priority**
   - If both taxis enter zones simultaneously
   - Most recent event takes priority
   - No time scale stacking

**Deliverable:** Two taxis operating independently with basic city visuals

---

### Phase 6: Automation & Progression
**Goal:** Implement one automation upgrade option

#### Tasks:
1. **Choose automation type**
   - Decision: Wider timing window OR auto-resume after stop
   - Recommend: Wider timing window (easier to implement and test)

2. **Implement automation unlock**
   - Set unlock cost (e.g., $200)
   - Show upgrade available in UI
   - Purchase button/interaction

3. **Apply automation effect**
   - If wider timing window: expand `startT` and `endT` for zones by 20-30%
   - Visual feedback that automation is active
   - Test that it reduces difficulty meaningfully

4. **Automation state persistence**
   - Include in save data
   - Persist across sessions

**Deliverable:** One automation upgrade purchasable and functional

---

### Phase 7: Save/Load & Polish
**Goal:** Local save, basic polish, and MVP completion

#### Tasks:
1. **Implement save/load**
   - Save: money, automationUnlocked, secondTaxiUnlocked
   - Save on state changes (debounced)
   - Load on game start
   - Clear save option (for testing)

2. **UI polish**
   - Money display
   - Upgrade status
   - Job count/active jobs indicator
   - Clean button styling

3. **Visual polish**
   - Taxi state colors (idle=yellow, en route=green, stopped=red)
   - Pickup/dropoff zone colors (blue/orange)
   - Success particle effect or flash
   - Failure visual feedback

4. **Audio hooks (optional if time permits)**
   - Add placeholder audio system
   - Hook up sound effect triggers (no actual sounds needed for MVP)

5. **Testing & balance**
   - Test full gameplay loop: start → earn money → unlock taxi 2 → unlock automation
   - Balance timing windows (should be challenging but fair)
   - Balance money rewards
   - Test save/load persistence

**Deliverable:** Playable MVP with all 10 features complete

---

## Implementation Order (Recommended)

**Week 1:**
- Phase 1: Foundation (3D Scene & Movement)
- Phase 2: Interaction Mechanics (STOP/GO)

**Week 2:**
- Phase 3: Focus & Time Scaling
- Phase 4: Job System & Economy

**Week 3:**
- Phase 5: Second Taxi & City Visual
- Phase 6: Automation & Progression

**Week 4:**
- Phase 7: Save/Load & Polish
- Testing and bug fixes

## Technical Decisions

### Scene Setup
- Use `@react-three/fiber` Canvas component
- OrbitControls for camera (limited to overhead view)
- Fixed lighting setup

### State Management
- React Context for global game state
- Local state in components where appropriate
- No Redux/Zustand needed for MVP

### Data Format
- Roads: Array of `RoadPath` objects exported from `data/roads.ts`
- Start with 4-6 manually defined paths forming simple loops
- Can export from Blender later if needed

### Performance
- Target: 60fps with 2 taxis
- Keep geometry simple (low poly count)
- No shadows initially (add if performance allows)

## Out of Scope for MVP

These are explicitly excluded per the 10-feature limit:
- Pedestrians
- Traffic simulation
- Service jobs
- More than 2 taxis
- Procedural generation
- Weather/day-night cycle
- Multiple cities/levels
- Multiplayer
- Mobile controls (desktop first)
- Achievements/stats tracking

## Success Metrics

MVP is complete when:
1. ✅ Player can control one taxi with STOP/GO
2. ✅ Timing windows work with slow-motion focus
3. ✅ Jobs generate money through pickup/dropoff
4. ✅ Second taxi unlocks at money threshold
5. ✅ Both taxis operate independently
6. ✅ One automation upgrade is purchasable and functional
7. ✅ Game state persists via localStorage
8. ✅ 8x8 city grid is visually present
9. ✅ Failure causes block loop (time penalty)
10. ✅ Game is playable for 5-10 minute sessions

## Next Steps

Start with **Phase 1, Task 1**: Set up Three.js scene with basic 8x8 grid ground plane.
