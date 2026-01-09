# Note: Claude should ignore this file


commond button layouts css for mobile corners


rework part of the deliverySystem.ts

we want the webapp/components/PickupIndicator.tsx and to also know about the packages score multiplier
- this will determine what type of new package will be displayed
- 4 new box .glb's : webapp/public/models/box_small box_large box_long and box_wide
- 


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