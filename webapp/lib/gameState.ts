import type { GameState, Taxi } from '@/types/game'

/**
 * Initial game state
 * Starts with one taxi, money at 0, no automation unlocked
 */
export function createInitialGameState(): GameState {
  return {
    taxis: [],
    timeScale: 1,
    money: 0,
    automationUnlocked: false,
    secondTaxiUnlocked: false,
  }
}

/**
 * Global time scale for slow-motion focus mechanic
 * Normal: 1.0, Focus: 0.25
 */
let globalTimeScale = 1

export function getTimeScale(): number {
  return globalTimeScale
}

export function setTimeScale(scale: number): void {
  globalTimeScale = scale
}

/**
 * Updates focus state based on taxi interaction windows
 * Last taxi entering focus wins - no stacking
 */
export function updateFocus(taxi: Taxi, inWindow: boolean): void {
  if (inWindow) {
    setTimeScale(0.25)
    taxi.isFocused = true
  } else {
    setTimeScale(1)
    taxi.isFocused = false
  }
}

/**
 * Save game state to localStorage
 */
export function saveGame(state: GameState): void {
  const saveData = {
    money: state.money,
    automationUnlocked: state.automationUnlocked,
    secondTaxiUnlocked: state.secondTaxiUnlocked,
  }
  localStorage.setItem('crazy-taxi-save', JSON.stringify(saveData))
}

/**
 * Load game state from localStorage
 */
export function loadGame(): Partial<GameState> | null {
  const saved = localStorage.getItem('crazy-taxi-save')
  if (!saved) return null

  try {
    return JSON.parse(saved)
  } catch {
    return null
  }
}
