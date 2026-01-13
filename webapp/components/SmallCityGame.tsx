'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useGameLoop } from '@/hooks/useGameLoop'
import { GameHUD } from './GameHUD'
import { TaxiControls } from './TaxiControls'
import { getRoadNetwork } from '@/data/roads'
import type { Taxi } from '@/types/game'
import buttonStyles from '@/styles/components/buttons.module.css'
import positionStyles from '@/styles/utilities/positioning.module.css'

// Load Scene only on client side (Three.js doesn't work with SSR)
const SmallCitySceneCanvas = dynamic(() => import('./SmallCitySceneCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff'
    }}>
      Loading Small City...
    </div>
  ),
})

const INITIAL_TAXI_COST = 300
const TAXI_COST_INCREMENT = 100
const MAX_TAXIS = 3
const TAX_RATE = 0.75 // 75% tax on earnings

interface SmallCityGameProps {
  onExit?: () => void
}

/**
 * Small City game component
 * Full game integration for the small city map
 */
export default function SmallCityGame({ onExit }: SmallCityGameProps = {}) {
  const [gameKey, setGameKey] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [isRushHour, setIsRushHour] = useState(false)
  const [selectedTaxiId, setSelectedTaxiId] = useState<string | null>('taxi-1')
  const [nextTaxiCost, setNextTaxiCost] = useState(INITIAL_TAXI_COST)
  const [totalMoney, setTotalMoney] = useState(0)
  const [showClockOutModal, setShowClockOutModal] = useState(false)

  // Game state management
  const { taxisRef, deliveriesRef, pickupNodesRef, deliveryTimerRef, initialSpawnDoneRef } = useGameLoop()

  const handleRushHourChange = (rushHour: boolean) => {
    setIsRushHour(rushHour)
    console.log(`🚦 RUSH HOUR ${rushHour ? 'ACTIVATED' : 'ENDED'}`)
  }

  const handleExit = useCallback(() => {
    if (onExit) {
      onExit()
    }
  }, [onExit])

  const handleTogglePause = useCallback(() => {
    // Check if player can afford to pause (cost $10)
    const PAUSE_COST = 10
    const totalMoney = taxisRef.current.reduce((sum, taxi) => sum + taxi.money, 0)

    if (!isPaused && totalMoney < PAUSE_COST) {
      console.log(`❌ Not enough money to pause! Need $${PAUSE_COST}, have $${totalMoney}`)
      return
    }

    // Deduct pause cost when pausing
    if (!isPaused) {
      if (taxisRef.current.length > 0) {
        taxisRef.current[0].money -= PAUSE_COST
        console.log(`⏸️ Paused - Deducted $${PAUSE_COST}`)
      }
    }

    setIsPaused(!isPaused)
  }, [isPaused, taxisRef])

  const handleTaxiSelect = useCallback((taxiId: string) => {
    setSelectedTaxiId(prev => prev === taxiId ? null : taxiId)
  }, [])

  const handleResetCamera = useCallback(() => {
    setSelectedTaxiId(null)
  }, [])

  const handleClockOut = useCallback(() => {
    setShowClockOutModal(true)
  }, [])

  const confirmClockOut = useCallback(() => {
    const grossEarnings = totalMoney - 100 // Subtract initial $100
    const taxAmount = Math.floor(grossEarnings * TAX_RATE)
    const takeHomePay = grossEarnings - taxAmount

    console.log(`💰 Clock Out Summary:`)
    console.log(`   Gross Earnings: $${grossEarnings}`)
    console.log(`   Tax (75%): -$${taxAmount}`)
    console.log(`   Take Home: $${takeHomePay}`)

    // TODO: Could save take-home pay to cumulative earnings here
    // For now, just exit
    if (onExit) {
      onExit()
    }
  }, [totalMoney, onExit])

  const handleSpawnTaxi = useCallback(() => {
    // Check taxi limit
    if (taxisRef.current.length >= MAX_TAXIS) {
      console.log(`❌ Maximum ${MAX_TAXIS} taxis reached!`)
      return
    }

    if (totalMoney < nextTaxiCost) {
      console.log(`❌ Not enough money! Need $${nextTaxiCost}, have $${totalMoney}`)
      return
    }

    const network = getRoadNetwork()
    if (network.paths.length === 0) {
      console.warn('⚠️ No paths available to spawn taxi')
      return
    }

    const spawnPaths = network.paths.filter((p) =>
      p.id.startsWith('StarterNode_to_')
    )
    const startPath = spawnPaths.length > 0 ? spawnPaths[0] : network.paths[0]

    const newTaxi: Taxi = {
      id: `taxi-${taxisRef.current.length + 1}`,
      state: 'driving_to_pickup',
      path: startPath,
      t: 0,
      speed: 1.5,
      isFocused: false,
      currentIntersectionId: undefined,
      incomingDir: 0,
      previousNodeId: undefined,
      hasPackage: false,
      currentDeliveryId: undefined,
      money: -nextTaxiCost,
      isReversing: false,
      collisionCooldown: 0,
      isReady: true,
    }

    taxisRef.current.push(newTaxi)
    console.log(`🚕 Spawned ${newTaxi.id} on path ${startPath.id} for $${nextTaxiCost}`)

    setNextTaxiCost(prev => prev + TAXI_COST_INCREMENT)
  }, [totalMoney, nextTaxiCost, taxisRef])

  // Update total money periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const total = taxisRef.current.reduce((sum, taxi) => sum + taxi.money, 0)
      setTotalMoney(total)
    }, 100)
    return () => clearInterval(interval)
  }, [taxisRef])

  // Keyboard controls (matching main game)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        setDebugMode(prev => !prev)
      } else if (e.key === ' ') {
        e.preventDefault() // Prevent page scroll
        handleTogglePause()
      } else if (e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const keyNum = parseInt(e.key)

        if (keyNum === 1) {
          // '1' key = world/overview camera
          setSelectedTaxiId(null)
        } else {
          // '2' and up = taxi cameras
          const taxiIndex = keyNum - 2
          if (taxiIndex < taxisRef.current.length) {
            const taxiId = taxisRef.current[taxiIndex].id
            setSelectedTaxiId(taxiId)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleTogglePause, taxisRef])

  // Initialize taxi on mount
  useEffect(() => {
    const initTaxi = () => {
      const network = getRoadNetwork()
      if (network.paths.length === 0) {
        console.warn('⚠️ No paths available, waiting for network...')
        return
      }

      const spawnPaths = network.paths.filter((p) =>
        p.id.startsWith('StarterNode_to_')
      )
      const startPath = spawnPaths.length > 0 ? spawnPaths[0] : network.paths[0]

      taxisRef.current = [{
        id: 'taxi-1',
        state: 'driving_to_pickup',
        path: startPath,
        t: 0,
        speed: 1.5,
        isFocused: false,
        currentIntersectionId: undefined,
        incomingDir: 0,
        previousNodeId: undefined,
        hasPackage: false,
        currentDeliveryId: undefined,
        money: 100,
        isReversing: false,
        collisionCooldown: 0,
        isReady: true,
      }]

      deliveriesRef.current = []
      deliveryTimerRef.current = 10000
      initialSpawnDoneRef.current = false
    }

    // Wait a bit for road network to be extracted from model
    const timeout = setTimeout(initTaxi, 500)
    return () => clearTimeout(timeout)
  }, [taxisRef, deliveriesRef, deliveryTimerRef, initialSpawnDoneRef])

  const grossEarnings = totalMoney - 100
  const taxAmount = Math.floor(grossEarnings * TAX_RATE)
  const takeHomePay = grossEarnings - taxAmount
  const canSpawnTaxi = taxisRef.current.length < MAX_TAXIS && totalMoney >= nextTaxiCost

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <SmallCitySceneCanvas
        key={gameKey}
        taxisRef={taxisRef}
        deliveriesRef={deliveriesRef}
        pickupNodesRef={pickupNodesRef}
        deliveryTimerRef={deliveryTimerRef}
        isPaused={isPaused}
        debugMode={debugMode}
        isRushHour={isRushHour}
        followTaxiId={selectedTaxiId}
      />

      {/* UI Overlay */}
      <div className="ui-overlay" style={{ position: 'relative' }}>
        <GameHUD
          taxisRef={taxisRef}
          onGameOver={() => {}} // No game over in small city exploration mode
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onRushHourChange={handleRushHourChange}
          onReset={() => {}} // Disabled
          onExit={() => {}} // Disabled
        />

        {/* Hide the reset and exit buttons with CSS */}
        <style jsx global>{`
          .ui-overlay button[title="Reset Game"],
          .ui-overlay button[title="Exit to Menu"] {
            display: none !important;
          }
        `}</style>

        {/* Clock Out Button - Top Left */}
        <div className={positionStyles.topLeft}>
          <button
            className={buttonStyles.hero}
            onClick={handleClockOut}
            style={{
              fontSize: '1.2rem',
              padding: '15px 30px',
            }}
          >
            🕐 Clock Out
          </button>
        </div>

        {/* Taxi Controls - Bottom Left (matching main game) */}
        <TaxiControls
          taxisRef={taxisRef}
          onTaxiSelect={handleTaxiSelect}
          onResetCamera={handleResetCamera}
          selectedTaxiId={selectedTaxiId}
          onSpawnTaxi={taxisRef.current.length < MAX_TAXIS ? handleSpawnTaxi : undefined}
          nextTaxiCost={nextTaxiCost}
          canAffordTaxi={canSpawnTaxi}
        />

        {/* Max Taxis Message (when at limit) */}
        {taxisRef.current.length >= MAX_TAXIS && (
          <div className={positionStyles.bottomLeft} style={{ marginTop: '140px' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 0, 0.2)',
              border: '2px solid #ffff00',
              borderRadius: '8px',
              padding: '10px 15px',
              color: '#ffff00',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              Max Taxis: {MAX_TAXIS}/{MAX_TAXIS}
            </div>
          </div>
        )}
      </div>

      {/* Clock Out Modal */}
      {showClockOutModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '3px solid #ffff00',
              borderRadius: '10px',
              padding: '40px',
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: '#ffff00', fontSize: '2rem', marginBottom: '20px' }}>
              🕐 Clock Out
            </h2>

            <div style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '30px', lineHeight: '1.8' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Gross Earnings:</strong> <span style={{ color: '#00ff00' }}>${grossEarnings}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Tax (75%):</strong> <span style={{ color: '#ff0000' }}>-${taxAmount}</span>
              </div>
              <div style={{ borderTop: '2px solid #ffff00', paddingTop: '10px', marginTop: '10px' }}>
                <strong style={{ fontSize: '1.4rem' }}>Take Home Pay:</strong>{' '}
                <span style={{ color: '#ffff00', fontSize: '1.6rem' }}>${takeHomePay}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button
                className={buttonStyles.secondary}
                onClick={() => setShowClockOutModal(false)}
                style={{ fontSize: '1.1rem', padding: '12px 24px' }}
              >
                Cancel
              </button>
              <button
                className={buttonStyles.hero}
                onClick={confirmClockOut}
                style={{ fontSize: '1.1rem', padding: '12px 24px' }}
              >
                Confirm Clock Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
