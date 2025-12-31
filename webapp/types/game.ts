import * as THREE from 'three'

export type NodeId = string

/**
 * Topological direction slots for intersection neighbors
 * 0 = North, 1 = East, 2 = South, 3 = West
 * These are topological (consistent per intersection), not world directions
 */
export type Dir = 0 | 1 | 2 | 3

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
 *
 * For intersection nodes, use 'neighbors' instead of 'next'
 * For regular path nodes, use 'next'
 */
export interface RoadNode {
  id: NodeId
  position: THREE.Vector3
  next?: NodeId[] // Connected node IDs (for non-intersection nodes)
  neighbors?: (NodeId | null)[] // 4-slot array [N, E, S, W] (for intersection nodes)
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

/**
 * Intersection routing modes - player controls how taxis navigate
 * - pass_through: Continue straight (default)
 * - turn_left: Take leftmost available path
 * - turn_right: Take rightmost available path
 */
export type IntersectionMode = 'pass_through' | 'turn_left' | 'turn_right'

/**
 * Intersection state stores the player's routing decision
 */
export interface IntersectionState {
  nodeId: string // e.g., "PathNode_Intersection_Main_01"
  mode: IntersectionMode // Current routing rule
  availablePaths: string[] // All possible next paths from this node
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
  // Topological navigation state
  currentIntersectionId?: string // Current or last intersection node ID
  incomingDir?: Dir // Direction taxi entered current intersection (0-3)
  // Delivery state
  hasPackage: boolean // Is taxi carrying a package?
  currentDeliveryId?: string // ID of active delivery event
  money: number // Total money earned
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

/**
 * Delivery event represents an active pickup/dropoff task
 */
export interface DeliveryEvent {
  id: string
  pickupNodeId: string // Node where package spawns
  dropoffNodeId: string // Node where package must be delivered
  status: 'waiting_pickup' | 'in_transit' | 'completed'
  claimedByTaxiId?: string // Taxi that picked up the package
  spawnTime: number // Timestamp when event was created
  pickupTime?: number // Timestamp when package was picked up
  deliveryTime?: number // Timestamp when package was delivered
  payout: number // Money awarded on completion
  color: string // Unique color for this delivery (shared by pickup and dropoff)
}

export interface GameState {
  taxis: Taxi[]
  intersections: Map<string, IntersectionState> // Player-controlled intersection routing
  activeDeliveries: DeliveryEvent[] // Active delivery events
  deliverySpawnTimer: number // Time until next delivery spawns (ms)
  deliverySpawnInterval: number // How often deliveries spawn (ms)
  timeScale: number
  money: number
  automationUnlocked: boolean
  secondTaxiUnlocked: boolean
}
