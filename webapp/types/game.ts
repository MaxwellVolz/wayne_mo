import * as THREE from 'three'

export type NodeId = string

/**
 * Path node types define the role/behavior of a node in the road network
 */
export type NodeType =
  | 'path'          // Regular path point (default)
  | 'intersection'  // Where paths branch/connect
  | 'pickup'        // Passenger pickup location
  | 'dropoff'       // Passenger dropoff location
  | 'red_light'     // Stop light that controls flow
  | 'service'       // Service station for taxi maintenance

/**
 * Road node with type information and optional metadata
 * Nodes can have multiple types (e.g., an intersection with a red light)
 */
export interface RoadNode {
  id: NodeId
  position: THREE.Vector3
  next: NodeId[] // Connected node IDs
  types: NodeType[] // Node can have multiple types
  metadata?: NodeMetadata // Optional type-specific data
}

/**
 * Type-specific metadata for nodes
 */
export interface NodeMetadata {
  // Red light properties
  redLightDuration?: number // Seconds light is red
  greenLightDuration?: number // Seconds light is green
  currentState?: 'red' | 'yellow' | 'green'

  // Pickup/Dropoff properties
  zoneName?: string // "Downtown Terminal", "Airport", etc.
  payoutMultiplier?: number // 1.5x for high-value zones

  // Service station properties
  repairRate?: number // Health restored per second
  serviceCost?: number // Cost to use service

  // Intersection properties
  branchProbabilities?: Record<NodeId, number> // Weighted path selection
}

export interface RoadPath {
  id: string
  points: THREE.Vector3[]
  length: number
}

export type TaxiState =
  | 'idle'
  | 'driving_to_pickup'
  | 'driving_to_dropoff'
  | 'stopped'
  | 'needs_service'
  | 'broken'

export interface Taxi {
  id: string
  state: TaxiState
  path: RoadPath | null
  t: number // normalized 0-1 along current path
  speed: number
  isFocused: boolean
}

export interface InteractionZone {
  pathId: string
  startT: number
  endT: number
  type: 'pickup' | 'dropoff'
}

export interface Gate {
  pathId: string
  t: number
  isOpen: boolean
}

export interface GameState {
  taxis: Taxi[]
  timeScale: number
  money: number
  automationUnlocked: boolean
  secondTaxiUnlocked: boolean
}
