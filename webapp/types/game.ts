import * as THREE from 'three'

export type NodeId = string

export interface RoadNode {
  id: NodeId
  position: THREE.Vector3
  next: NodeId[]
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
