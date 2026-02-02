# Note: Claude should ignore this file


commond button layouts css for mobile corners


rework part of the deliverySystem.ts

we want the webapp/components/PickupIndicator.tsx and to also know about the packages score multiplier
- this will determine what type of new package will be displayed
- 4 new box .glb's : webapp/public/models/box_small box_large box_long and box_wide


## MVP in One Day

1. Cumulative Counter
   1. cash pile in room - several sizes
2. Unlockables in Room
3. Interactive Timer with unlocks
4. Fix tutorial
5. "How To Play" Pizza fix


## TODO

Identify the fun

1. Map Size
   1. the tutorial level size allows for chase mode and more casual gameplay...more fun?
   2. could have a set of puzzles then instead of zooming and camera shit
   3. current City could become "Medium Map"
2. PowerUps? Progression? A Story?


### Progression and PowerUps

- Car Types
- Engine Upgrades / Boost Uses?
- 

### Game Modes

- Small Maps Single Taxi Chase Cam with swivel

### IntroScene Visuals

1. Fade in from black -> white -> 0% opacity
   1. while raising camera to position
   2. free look around
2. panels
   1. select map on outside world 'unloads and reloads'
   2. large start button
      1. open first then push
   3. high score
   4. unlocked achievements
      1. timer

## Wishlist Ideas

- Alerts on the street that you **have to be in ride-along mode to get**
  - run over ducks OR
  - if in ride-along have a pop-up modal that says 'stopped for ducks! $100 bucks!' and they disappear
- boost intersections

Need improve the camera transitions in: /home/narfa/_git/wayne_mo/webapp/hooks/useTaxiFollowCamera.ts

on scene.tsx load the starting scene camera position is great.
- we need a Play button in the middle of the screen
- on click transition to the ResetButton position (we are now calling this 'Atlas View')

we need to lerp the position from chase camera to the Atlas View
and the lerp the position from Atlas View to chase camera view


PATH_01_E_TO_02_<toDir>


Unity GameObject Structure

The Intersection "Rule" that is can be set during Runtime will determine Passthru, Clockwise, or CounterClockwise, the Taxi needs to determine which path to take based on its incoming direction

- StreetLogic
  - Intersections
    - INT_01 (IntersectionNode.cs with optional N,E,S,W set in inspector)
      - N
        - P0 (path nodes from intersection to next intersection going N)
        - P1
      - E
        - P0
      - S
        - P0
      - W
        - P0



## Fixes




Revert back to Selected...the price field (Free, $5k, $25k) should say 'Owned' once it has been purchased.


every round over 500 score you roll a license plate
can reroll a letter
unlocks enable more letter rerolls


---

## Application Flow

### Overlay Architecture

The system operates as a **read-only, out-of-process observer**.  
It never connects to, injects into, or modifies the game. All state is inferred from screen pixels.

When the overlay is toggled on, a **session** is recorded.

---

## Debug Dashboard

A companion **web-based debug dashboard** is used to inspect overlay behavior, model decisions, and performance over time.

### Purpose

- Visualize gamestate transitions
- Inspect YOLO detections and confidence
- Review overlay decisions
- Debug false positives / negatives
- Replay sessions post-run

---

### Dashboard Layout

| Left Panel (Sessions)               | Vertical Flow Timeline              | Node Type | Node Details                                     |
| ----------------------------------- | ----------------------------------- | --------- | ------------------------------------------------ |
| Session #1 (timestamp) *(selected)* | Connected to game window            | Large     | Screenshot of detected game window               |
| Session #2 (timestamp)              | YOLO recognized "Arc Raiders Lobby" | Large     | YOLO class + confidence metrics                  |
| Session #3 (timestamp)              | Gamestate recognized: Lobby         | Large     | Suggested tip: Generic                           |
| Session #4 (timestamp)              | Gamestate unchanged                 | Small     | Very low-resolution screenshot                   |
| Session #5 (timestamp)              | Gamestate unchanged                 | Small     | Very low-resolution screenshot                   |
| Session #6 (timestamp)              | Gamestate unchanged                 | Small     | Very low-resolution screenshot                   |
|                                     | Gamestate changed                   | Large     | Downscaled screenshot triggering escalation      |
|                                     | YOLO recognized "Loading Screen"    | Large     | YOLO stats                                       |
|                                     | Gamestate recognized: Map           | Large     | Screenshot with highlighted regions + confidence |
|                                     | Gamestate unchanged                 | Small     | Very low-resolution screenshot                   |
|                                     | Session ended                       | Large     | Session summary (duration, tips shown)           |

---

### Sessions

Each session records a **vertical flow diagram** of observed states.

- **Large nodes**
  - State changes
  - High-resolution captures
  - ML inference results
  - Overlay decisions

- **Small nodes**
  - Passive low-cost samples
  - Downscaled screenshots
  - No inference

This allows fast visual inspection of *why* the system reacted.

---

## Runtime Overlay Flow

---

### 1. Screen Observation

1. Identify the target display region (monitor or window bounds)
2. Begin continuous screen capture using a **low-cost sampling pass**
   - Reduced resolution
   - Reduced frequency
   - No ML inference

This phase exists solely to detect **potential gamestate transitions**.

---

### 2. Gamestate Classification

On each sampling frame, infer the current **Gamestate**.

**Supported Gamestates:**
- Menu
- Map
- Inventory
- Action / Combat
- Other (loading, transition, unknown)

Classification is performed using:
1. Lightweight pixel heuristics (color blocks, UI layout signatures)
2. Optional ML classification (YOLO) for higher confidence when needed

If the gamestate is unchanged, the system remains in low-cost mode.

If a **state change is detected**, the system escalates.

---

### 3. Full Analysis (On State Change)

When a new Gamestate is detected, the system performs a **high-resolution capture** and deeper analysis.

#### Menu
- Provide generic contextual tips
- Highlight relevant UI elements
- No persistent overlay

#### Map
- Image match known map regions
- Identify quest-relevant locations
- Overlay icons or markers for:
  - Objectives
  - Loot
  - Points of interest

#### Inventory
- Detect item icons and slots
- Cross-reference items against active quests
- Highlight relevant or required items
- De-emphasize irrelevant inventory

#### Action / Combat
- Detect enemies or UI nameplates via image matching
- Identify enemy type or class
- Display combat tips or counters
- Optionally display cooldown or positioning hints

---

### 4. Overlay Rendering

1. Convert analysis results into **overlay primitives**
   - Bounding boxes
   - Icons
   - Images
   - Text labels
2. Render primitives using a transparent, click-through overlay window
3. All visuals are:
   - Non-interactive
   - Ephemeral
   - Context-aware

The overlay never captures focus or blocks input.

---

### 5. Feedback Loop

After rendering:

1. Return to **low-cost capture mode**
2. Continue monitoring for gamestate changes
3. Re-enter full analysis only when necessary

This creates a tight performance loop:

```

Low-cost scan
↓
Gamestate stable → continue
↓
Gamestate changed
↓
High-cost analysis + overlay update
↓
Return to low-cost scan

```

---

## Key Design Properties

- Pixel-only observation
- No process attachment
- No memory access
- No input interception
- Adaptive performance based on context
- Overlay content driven entirely by inferred state

---

## Why This Matters

This architecture:

- Minimizes CPU and GPU usage
- Scales across different games and UI layouts
- Avoids brittle per-frame inference
- Keeps overlays subtle and non-intrusive
- Cleanly separates detection, analysis, and rendering

---

## Next Steps

- Turn this into a **formal state machine diagram**
- Define the **gamestate confidence model**
- Specify **fallback behavior** for ambiguous classification


