/**
 * Manual test script for intersection routing logic
 * Run this in the browser console to test intersection routing
 *
 * Usage:
 * 1. Import this in your app
 * 2. Call testIntersectionRouting() from browser console
 * 3. Check console output for routing decisions
 */

import * as THREE from 'three'
import type { RoadNode, RoadPath, IntersectionState } from '@/types/game'
import { updateRoadNetwork, getNextPath, getRoadNetwork } from '@/data/roads'
import { categorizePaths } from '@/lib/intersectionGeometry'

/**
 * Creates a test road network with a simple 4-way intersection
 */
function createTestNetwork() {
  // Create intersection node
  const intersection: RoadNode = {
    id: 'intersection_main',
    position: new THREE.Vector3(0, 0, 0),
    next: ['node_north', 'node_south', 'node_east', 'node_west'],
    types: ['intersection'],
    metadata: {}
  }

  // Create surrounding nodes
  const nodeNorth: RoadNode = {
    id: 'node_north',
    position: new THREE.Vector3(0, 0, 10),
    next: [],
    types: ['path']
  }

  const nodeSouth: RoadNode = {
    id: 'node_south',
    position: new THREE.Vector3(0, 0, -10),
    next: ['intersection_main'],
    types: ['path']
  }

  const nodeEast: RoadNode = {
    id: 'node_east',
    position: new THREE.Vector3(10, 0, 0),
    next: [],
    types: ['path']
  }

  const nodeWest: RoadNode = {
    id: 'node_west',
    position: new THREE.Vector3(-10, 0, 0),
    next: [],
    types: ['path']
  }

  const nodes = [intersection, nodeNorth, nodeSouth, nodeEast, nodeWest]

  // Update road network with test nodes
  updateRoadNetwork(nodes)

  console.log('✅ Test network created:')
  console.log('  - Intersection at origin')
  console.log('  - North path at (0, 0, 10)')
  console.log('  - South path at (0, 0, -10)')
  console.log('  - East path at (10, 0, 0)')
  console.log('  - West path at (10, 0, 0)')
}

/**
 * Tests path categorization (straight/left/right detection)
 */
function testPathCategorization() {
  console.log('\n🧪 Testing path categorization...\n')

  const network = getRoadNetwork()

  // Find the path coming from south (heading north to intersection)
  const incomingPath = network.paths.find((p: RoadPath) =>
    p.id === 'node_south_to_intersection_main'
  )

  if (!incomingPath) {
    console.error('❌ Could not find incoming path')
    return
  }

  const intersection = network.nodes.find((n: RoadNode) => n.id === 'intersection_main')
  if (!intersection) {
    console.error('❌ Could not find intersection')
    return
  }

  const categories = categorizePaths(incomingPath.id, intersection, network.paths)

  console.log('Path from South → Intersection:')
  console.log('  Straight (North):', categories.straight)
  console.log('  Left (West):', categories.left)
  console.log('  Right (East):', categories.right)
}

/**
 * Tests intersection mode routing
 */
function testIntersectionModes() {
  console.log('\n🧪 Testing intersection modes...\n')

  const incomingPathId = 'node_south_to_intersection_main'

  // Test 1: Pass through mode
  const intersections = new Map<string, IntersectionState>()
  intersections.set('intersection_main', {
    nodeId: 'intersection_main',
    mode: 'pass_through',
    availablePaths: []
  })

  console.log('Test 1: Pass Through Mode')
  const nextPath1 = getNextPath(incomingPathId, intersections)
  console.log(`  Result: ${nextPath1?.id}`)
  console.log(`  Expected: intersection_main_to_node_north (straight)`)

  // Test 2: Turn left mode
  intersections.set('intersection_main', {
    nodeId: 'intersection_main',
    mode: 'turn_left',
    availablePaths: []
  })

  console.log('\nTest 2: Turn Left Mode')
  const nextPath2 = getNextPath(incomingPathId, intersections)
  console.log(`  Result: ${nextPath2?.id}`)
  console.log(`  Expected: intersection_main_to_node_west (left)`)

  // Test 3: Turn right mode
  intersections.set('intersection_main', {
    nodeId: 'intersection_main',
    mode: 'turn_right',
    availablePaths: []
  })

  console.log('\nTest 3: Turn Right Mode')
  const nextPath3 = getNextPath(incomingPathId, intersections)
  console.log(`  Result: ${nextPath3?.id}`)
  console.log(`  Expected: intersection_main_to_node_east (right)`)
}

/**
 * Main test function
 */
export function testIntersectionRouting() {
  console.clear()
  console.log('🚦 Intersection Routing Test Suite\n')
  console.log('=' .repeat(50))

  try {
    createTestNetwork()
    testPathCategorization()
    testIntersectionModes()

    console.log('\n' + '='.repeat(50))
    console.log('✅ All tests completed! Check results above.')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).testIntersectionRouting = testIntersectionRouting
}
