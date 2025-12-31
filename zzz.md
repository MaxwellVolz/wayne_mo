resolve the issues

the corners are broken
the car should not turn around when reaching a corner

the rotations are broken
they are not consistent with 'turning the car +/- 90degrees or more until a valid next node exists'


lets lock down the rotation

if the incoming direction is north:

passthrough -> priority: north, east, south, west
clockwise -> priority: east, south, west, north
counter-clockwise -> priority: east, south, west, north

if the incoming direction is south:

passthrough -> priority: south, west, north, east, 
clockwise -> priority: west, north, east, south, 
counter-clockwise -> priority: east, north, west, south
