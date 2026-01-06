/**
 * High score management using localStorage
 */

const HIGH_SCORE_KEY = 'wayne_mo_high_score'

/**
 * Get the current high score from localStorage
 */
export function getHighScore(): number {
  if (typeof window === 'undefined') return 0

  try {
    const stored = localStorage.getItem(HIGH_SCORE_KEY)
    return stored ? parseInt(stored, 10) : 0
  } catch (error) {
    console.error('Failed to read high score:', error)
    return 0
  }
}

/**
 * Save a new high score if it's higher than the current one
 * Returns true if a new high score was set
 */
export function saveHighScore(score: number): boolean {
  if (typeof window === 'undefined') return false

  try {
    const currentHighScore = getHighScore()

    if (score > currentHighScore) {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString())
      console.log(`🏆 NEW HIGH SCORE: $${score} (previous: $${currentHighScore})`)
      return true
    }

    return false
  } catch (error) {
    console.error('Failed to save high score:', error)
    return false
  }
}
