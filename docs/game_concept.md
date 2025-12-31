Crazy Taxi AI Management Automation Game

---

One player commands a fleet of “AI” taxis operating in a downtown cartoon city.

The game focuses on observation, timing, and automation rather than direct control.


You do not control taxis.
You control the **city’s intersections**.

Taxis are autonomous agents reacting to persistent routing decisions.

---

## Visuals

Low-poly city composed of 8x8 blocks. AI taxis autonomously drive between pickup and dropoff locations.

Design priorities:

- Strong visual readability at a distance
- Instantly recognizable intersections states(tap through):
  - pass through
  - turn left
  - turn right
- Instantly recognizable taxi states:
  - Has package / En Route
  - Available
  - Needs Service
  - Broken

---

## World Rules

* The city runs continuously but can be paused
* Intersections are decision nodes
* Intersection decisions persist until changed
* Taxis follow intersection rules blindly

---

## Player Interaction

* Player taps an intersection to toggle between: pass through, turn left, turn right
* That direction becomes the default for all taxis
* Visual indicator shows the current routing

No per-taxi commands. Ever.

---

## Delivery System

* Deliveries spawn on the map
* Each delivery shows:

  * pickup point
  * dropoff point
  * a visible connecting ribbon
* No taxi is assigned manually
* First taxi to reach pickup claims the delivery
* Claimed taxi must be routed to dropoff

---

## Taxi Behavior

* Taxis move along fixed road paths
* If two taxis collide:
  * both reverse direction
  * lose time
  * no damage, no destruction
* Taxis never stop or crash permanently

---

## Failure and Consequences

No hard failure states.

Poor routing causes:

* missed pickups
* time loss
* reduced payout

The city always continues.

---

## Automation (Implicit)

* Persistent intersection decisions act as automation
* Mastery comes from shaping traffic flow

---

## Difficulty Scaling

Increase:

* taxi count
* delivery density
* overlapping routes
* shared intersections

Never increase speed or reaction demands.

---

## Genre Definition

* Turn-based decision strategy
* Spatial routing puzzle
* Automation management game

Not a simulator.
Not an RTS.

---

## This Is Buildable Fast

* No traffic AI
* No pathfinding
* No steering
* No NPC logic explosion

Everything hinges on:

* intersections
* persistence
* consequences

