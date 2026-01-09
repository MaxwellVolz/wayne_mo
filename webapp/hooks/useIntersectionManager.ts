import { useState, useCallback, useEffect } from 'react'
import type { IntersectionState, RoadNode } from '@/types/game'
import { getNodesByType } from '@/lib/extractPathNodes'
import { getRoadNetwork, isRoadNetworkReady } from '@/data/roads'
import { setIntersections as setGlobalIntersections } from '@/lib/intersectionState'

/**
 * Hook for managing intersection states
 * Initializes all intersections to 'pass_through' mode
 * Provides methods to toggle modes and query current state
 */
export function useIntersectionManager() {
  const [intersections, setIntersections] = useState<Map<string, IntersectionState>>(
    new Map()
  )

  // Initialize intersections when road network loads or updates
  useEffect(() => {
    const initializeIntersections = () => {
      // Only initialize if real network is loaded (not test data)
      if (!isRoadNetworkReady()) {
        console.log('⏳ Waiting for real road network to load...')
        return
      }

      const network = getRoadNetwork()
      const intersectionNodes = getNodesByType(network.nodes, 'intersection')

      const initialStates = new Map<string, IntersectionState>()

      intersectionNodes.forEach(node => {
        // Find all outgoing paths from this intersection
        const availablePaths = network.paths
          .filter(p => p.id.startsWith(`${node.id}_to_`))
          .map(p => p.id)

        // Determine if this is a valid intersection
        let isValidIntersection = false

        // Check topological model (neighbors array)
        if (node.neighbors) {
          const connectionCount = node.neighbors.filter(n => n !== null).length
          isValidIntersection = connectionCount >= 2
          if (isValidIntersection) {
            console.log(`  📍 ${node.id} [TOPO]: ${connectionCount} neighbors → creating controls`)
          }
        }
        // Check path-based model (legacy)
        else if (availablePaths.length > 1) {
          isValidIntersection = true
          console.log(`  📍 ${node.id} [LEGACY]: ${availablePaths.length} paths → creating controls`)
        }

        // Only create state if node has multiple connections (true intersection)
        if (isValidIntersection) {
          initialStates.set(node.id, {
            nodeId: node.id,
            mode: 'pass_through', // Default mode
            availablePaths
          })
        } else {
          console.log(`  ⚠️ ${node.id}: Not enough connections for intersection controls`)
        }
      })

      setIntersections(initialStates)
      setGlobalIntersections(initialStates) // Update global state
      console.log(`🚦 Initialized ${initialStates.size} intersections with controllable routing`)

      // Debug: log each intersection
      initialStates.forEach((state, nodeId) => {
        console.log(`  📍 ${nodeId}: ${state.availablePaths.length} exits, mode: ${state.mode}`)
      })
    }

    // Initialize on mount
    initializeIntersections()

    // Re-initialize when road network updates (for tutorial scene)
    const handleNetworkUpdate = () => {
      console.log('🔄 Road network updated, re-initializing intersections...')
      initializeIntersections()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('roadNetworkUpdated', handleNetworkUpdate)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('roadNetworkUpdated', handleNetworkUpdate)
      }
    }
  }, [])

  /**
   * Toggle intersection mode through the cycle: pass → left → right → pass
   *
   * @param nodeId - The intersection node ID to toggle
   */
  const toggleIntersectionMode = useCallback((nodeId: string) => {
    setIntersections(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(nodeId)

      if (!current) {
        console.warn(`⚠️ No intersection state for ${nodeId}`)
        return prev
      }

      // Cycle through modes
      const nextMode =
        current.mode === 'pass_through' ? 'turn_left' :
        current.mode === 'turn_left' ? 'turn_right' :
        'pass_through'

      newMap.set(nodeId, {
        ...current,
        mode: nextMode
      })

      setGlobalIntersections(newMap) // Update global state
      console.log(`🚦 ${nodeId} mode changed: ${current.mode} → ${nextMode}`)
      return newMap
    })
  }, [])

  /**
   * Set a specific mode for an intersection
   *
   * @param nodeId - The intersection node ID
   * @param mode - The desired mode
   */
  const setIntersectionMode = useCallback((nodeId: string, mode: 'pass_through' | 'turn_left' | 'turn_right') => {
    setIntersections(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(nodeId)

      if (!current) {
        console.warn(`⚠️ No intersection state for ${nodeId}`)
        return prev
      }

      newMap.set(nodeId, {
        ...current,
        mode
      })

      setGlobalIntersections(newMap) // Update global state
      console.log(`🚦 ${nodeId} mode set to: ${mode}`)
      return newMap
    })
  }, [])

  /**
   * Get the current mode for a specific intersection
   *
   * @param nodeId - The intersection node ID
   * @returns The current mode, or 'pass_through' if not found
   */
  const getMode = useCallback((nodeId: string) => {
    return intersections.get(nodeId)?.mode || 'pass_through'
  }, [intersections])

  /**
   * Get all intersection states as an array
   * Useful for rendering UI or debugging
   */
  const getIntersectionList = useCallback(() => {
    return Array.from(intersections.entries()).map(([, state]) => ({
      ...state
    }))
  }, [intersections])

  return {
    intersections,
    toggleIntersectionMode,
    setIntersectionMode,
    getMode,
    getIntersectionList
  }
}
