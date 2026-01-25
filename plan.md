# Wayne Mo - Release Plan

## Current Status: Alpha Complete ✅

The core game loop is fully functional:
- Intersection-based routing control
- Autonomous taxi movement on rail paths
- Delivery pickup/dropoff system with multipliers
- 120-second timed sessions with Rush Hour
- High score persistence
- Intro scene, tutorial, main game modes
- Small City sandbox mode
- Mobile-responsive UI

---

## ✅ Sprint 1: Audio System (Complete)

**Goal:** Add sound effects to make the game feel alive.

### Tasks
- [x] Set up audio system infrastructure (AudioManager)
- [x] Volume controls / mute button in HUD
- [x] Persist audio settings in localStorage
- [x] Hook up sound triggers for all events:
  - [x] Pickup collected → `deliverySystem.ts:handlePickup()`
  - [x] Delivery completed → `deliverySystem.ts:handleDropoff()`
  - [x] Intersection click → `useIntersectionManager.ts:toggleIntersectionMode()`
  - [x] Taxi spawn → `Game.tsx:handleSpawnTaxi()`
  - [x] Rush Hour alarm → `GameHUD.tsx`
  - [x] Game over jingle → `GameHUD.tsx`
- [x] **Add sound files** (`/public/audio/`):
  - [x] `pickup.mp3` - bag grab
  - [x] `delivery.mp3` - cash register
  - [x] `click.mp3` - DJ rewind
  - [x] `spawn.mp3` - car horn
  - [x] `rush_hour.mp3` - alarm
  - [x] `game_over.mp3` - money counter
  - [x] `horn.mp3` - ambient horn
  - [ ] `music.mp3` - background loop (optional)
- [x] Ambient car horns (random 8-20s intervals during gameplay)
- [ ] Background music loop (optional)

**Resources:** https://itch.io/game-assets/free/tag-sound-effects

---

## ✅ Sprint 2: Visual & UX Polish (Complete)

**Goal:** Improve visual feedback and player guidance.

### Visual
- [x] Rush Hour banner - reduce size, move below timer
- [x] Timer - larger seconds with " symbol, smaller milliseconds
- [ ] Road line markings in Blender model (requires Blender)

### UX
- [x] Bouncing arrow pointing to pause button (3s fade out)
- [x] Whip sound on Play button click
- [x] Settings panel (audio controls - Master/SFX/Music volume sliders)
- [x] Keyboard shortcut hints (? key or keyboard icon)
- [ ] Onboarding tooltip for first-time players

---

## ✅ Sprint 3: Progression System (Complete)

**Goal:** Give players long-term goals and sense of ownership.

### Core System
- [x] Progression state management (localStorage persistence)
- [x] Available balance calculation (cumulative - spent)
- [x] Upgrades Shop UI (tabs for Apartments/Desks)
- [x] Modal styled like GameOverModal

### 2.1 Apartment Progression 🏠
- [x] Camera locations purchasable with earned cash
- [x] Dynamic camera position based on selected apartment
- Locations:
  1. **Garage/Basement** - Free (starting)
  2. **Above Taco Shop** - $5,000
  3. **Mid-City Apartment** - $25,000
  4. **Penthouse** - $100,000
  5. **Orbiting Satellite** - $500,000

### 2.2 Desk Upgrades 🖥️
- [x] Desk unlock/purchase system
- [ ] Visual desk models in intro scene (need 3D models)
- Upgrades:
  1. **CRT Monitor** - Free (starting)
  2. **Laptop** - $10,000
  3. **Multi-screen Setup** - $50,000
  4. **VR Headset** - $200,000

### 2.3 Garage System 🚗 (Future)
- [ ] Garage view to see owned taxis
- [ ] Equip different taxi skins before game
- [ ] Cosmetic city themes (day/night/rain)

---

## Phase 3: Social & Engagement

**Goal:** Encourage sharing and competition.

### 3.1 Leaderboards 🏆
- [ ] Global high scores
- [ ] Weekly leaderboard reset
- [ ] Friend leaderboards

### 3.2 Sharing 📱
- [ ] Screenshot button
- [ ] Share score to social media
- [ ] Replay system (watch your best run)

---

## Phase 4: Monetization (Optional)

- [ ] Remove ads tier
- [ ] Cosmetic packs
- [ ] Tip jar / support button

---

## ✅ Completed

- [x] Fix score not updating between games (stale closure)
- [x] Remove debug console.logs
- [x] Throttle DeliveryManager updates
- [x] Remove expensive pointLights
- [x] Static export (GitHub Pages/Netlify ready)

---

## 💡 Ideas Backlog

### Gameplay
- Traffic lights at intersections (adds timing element)
- Endless Mode (no timer, increasing difficulty)
- Challenge Mode (preset puzzles with par scores)
- Daily Challenge (seeded random map)

### Taxi Types 🚕
- Standard Taxi (current)
- Fast Taxi (1.5x speed, harder to control)
- Big Taxi (2 packages at once)
- Premium Taxi (2x payout multiplier)

### Visual
- Pedestrians (visual only, no collision)
- Weather effects (rain, snow)
- Day/night cycle

### Billboards 📺
- In-game billboards with rotating content
- Upload API for real-time billboard updates
- Community spotlight on billboards

### Platform
- Mobile app wrapper (Capacitor/TWA)
- Unity port for mobile performance (see docs/UNITY_CONVERSION_PLAN.md)

---

## Design Principles

- **Player sets routing rules, taxis are autonomous**
- **No micromanagement** - never add per-taxi controls
- **Keep it simple** - each feature should enhance, not complicate
- **Mobile-first** - all features must work on touch devices
