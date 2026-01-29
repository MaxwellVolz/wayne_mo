/**
 * Progression System
 * Manages unlockable upgrades purchased with cumulative earnings
 */

const PROGRESSION_KEY = 'wayne_mo_progression'

// ==================== TYPES ====================

export type ApartmentId = 'garage' | 'taco_shop' | 'mid_city' | 'penthouse' | 'satellite'
export type DeskId = 'vr_headset' | 'laptop' | 'multi_screen' | 'bodysuit'

export interface ApartmentConfig {
  id: ApartmentId
  name: string
  cost: number
  cameraPosition: [number, number, number]
  cameraLookAt: [number, number, number]
  cameraFov: number
}

export interface DeskConfig {
  id: DeskId
  name: string
  cost: number
}

export interface ProgressionState {
  unlockedApartments: ApartmentId[]
  unlockedDesks: DeskId[]
  currentApartment: ApartmentId
  currentDesk: DeskId
  totalSpent: number
}

// ==================== CONFIGURATION ====================

export const APARTMENTS: ApartmentConfig[] = [
  {
    id: 'garage',
    name: 'Ground Floor',
    cost: 0,
    cameraPosition: [-3.55, 0.8, 11.2],
    cameraLookAt: [-3.5, 0.8, 11],  // Look forward into the van
    cameraFov: 120,
  },
  {
    id: 'taco_shop',
    name: 'Second Floor',
    cost: 5000,
    cameraPosition: [-3.55, 2.8, 11.2],
    cameraLookAt: [-3.55, 2.8, 11],  // Look toward city center
    cameraFov: 120,
  },
  {
    id: 'penthouse',
    name: 'Penthouse',
    cost: 25000,
    cameraPosition: [-3.55, 4.75, 11.2],
    cameraLookAt: [-3.55, 2.8, 11],  // Look down at city center
    cameraFov: 120,
  },
  {
    id: 'mid_city',
    name: 'Coming Soon!',
    cost: 1000000,
    cameraPosition: [-3.55, 2.6, 11.2],
    cameraLookAt: [0, 0, 0],  // Look straight down at city
    cameraFov: 60,
  },
  {
    id: 'satellite',
    name: 'Coming Soon!',
    cost: 5000000,
    cameraPosition: [.56, 0.31, -8.63],
    cameraLookAt: [0, 0, 0],  // Look down at Earth/city
    cameraFov: 45,
  },
]

export const DESKS: DeskConfig[] = [
  { id: 'vr_headset', name: 'VR Headset', cost: 0 },
  { id: 'laptop', name: 'Laptop', cost: 1000000 },
  { id: 'multi_screen', name: 'Multi-screen Setup', cost: 1000000 },
  { id: 'bodysuit', name: 'Bodysuit', cost: 1000000 },
]

// ==================== DEFAULT STATE ====================

const DEFAULT_STATE: ProgressionState = {
  unlockedApartments: ['garage'],
  unlockedDesks: ['vr_headset'],
  currentApartment: 'garage',
  currentDesk: 'vr_headset',
  totalSpent: 0,
}

// ==================== STATE MANAGEMENT ====================

/**
 * Get current progression state from localStorage
 */
export function getProgressionState(): ProgressionState {
  if (typeof window === 'undefined') return DEFAULT_STATE

  try {
    const stored = localStorage.getItem(PROGRESSION_KEY)
    if (stored) {
      return { ...DEFAULT_STATE, ...JSON.parse(stored) }
    }
    return DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

/**
 * Save progression state to localStorage
 */
function saveProgressionState(state: ProgressionState): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(PROGRESSION_KEY, JSON.stringify(state))
  } catch {
    console.error('Failed to save progression state')
  }
}

// ==================== WALLET ====================

/**
 * Get available balance (cumulative score minus total spent)
 */
export function getAvailableBalance(): number {
  if (typeof window === 'undefined') return 0

  try {
    const cumulativeKey = 'wayne_mo_cumulative_score'
    const cumulative = parseInt(localStorage.getItem(cumulativeKey) || '0', 10)
    const state = getProgressionState()
    return cumulative - state.totalSpent
  } catch {
    return 0
  }
}

// ==================== APARTMENTS ====================

/**
 * Check if an apartment is unlocked
 */
export function isApartmentUnlocked(id: ApartmentId): boolean {
  const state = getProgressionState()
  return state.unlockedApartments.includes(id)
}

/**
 * Get the current apartment config
 */
export function getCurrentApartment(): ApartmentConfig {
  const state = getProgressionState()
  return APARTMENTS.find(a => a.id === state.currentApartment) || APARTMENTS[0]
}

/**
 * Purchase an apartment (returns true if successful)
 */
export function purchaseApartment(id: ApartmentId): boolean {
  const apartment = APARTMENTS.find(a => a.id === id)
  if (!apartment) return false

  const state = getProgressionState()

  // Already unlocked
  if (state.unlockedApartments.includes(id)) return false

  // Check balance
  const balance = getAvailableBalance()
  if (balance < apartment.cost) return false

  // Purchase
  state.unlockedApartments.push(id)
  state.totalSpent += apartment.cost
  state.currentApartment = id
  saveProgressionState(state)

  console.log(`🏠 Purchased ${apartment.name} for $${apartment.cost}`)
  return true
}

/**
 * Set the current apartment (must be unlocked)
 */
export function setCurrentApartment(id: ApartmentId): boolean {
  const state = getProgressionState()

  if (!state.unlockedApartments.includes(id)) return false

  state.currentApartment = id
  saveProgressionState(state)
  return true
}

// ==================== DESKS ====================

/**
 * Check if a desk is unlocked
 */
export function isDeskUnlocked(id: DeskId): boolean {
  const state = getProgressionState()
  return state.unlockedDesks.includes(id)
}

/**
 * Get the current desk config
 */
export function getCurrentDesk(): DeskConfig {
  const state = getProgressionState()
  return DESKS.find(d => d.id === state.currentDesk) || DESKS[0]
}

/**
 * Purchase a desk (returns true if successful)
 */
export function purchaseDesk(id: DeskId): boolean {
  const desk = DESKS.find(d => d.id === id)
  if (!desk) return false

  const state = getProgressionState()

  // Already unlocked
  if (state.unlockedDesks.includes(id)) return false

  // Check balance
  const balance = getAvailableBalance()
  if (balance < desk.cost) return false

  // Purchase
  state.unlockedDesks.push(id)
  state.totalSpent += desk.cost
  state.currentDesk = id
  saveProgressionState(state)

  console.log(`🖥️ Purchased ${desk.name} for $${desk.cost}`)
  return true
}

/**
 * Set the current desk (must be unlocked)
 */
export function setCurrentDesk(id: DeskId): boolean {
  const state = getProgressionState()

  if (!state.unlockedDesks.includes(id)) return false

  state.currentDesk = id
  saveProgressionState(state)
  return true
}

// ==================== UTILITIES ====================

/**
 * Get all apartment configs with unlock status
 */
export function getApartmentsWithStatus() {
  const state = getProgressionState()
  const balance = getAvailableBalance()

  return APARTMENTS.map(apartment => ({
    ...apartment,
    unlocked: state.unlockedApartments.includes(apartment.id),
    current: state.currentApartment === apartment.id,
    canAfford: balance >= apartment.cost,
  }))
}

/**
 * Get all desk configs with unlock status
 */
export function getDesksWithStatus() {
  const state = getProgressionState()
  const balance = getAvailableBalance()

  return DESKS.map(desk => ({
    ...desk,
    unlocked: state.unlockedDesks.includes(desk.id),
    current: state.currentDesk === desk.id,
    canAfford: balance >= desk.cost,
  }))
}

/**
 * Reset all progression (for testing)
 */
export function resetProgression(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PROGRESSION_KEY)
  console.log('🔄 Progression reset')
}
