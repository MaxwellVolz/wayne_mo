'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, X, Home, Monitor, Check, Lock } from 'lucide-react'
import {
  getAvailableBalance,
  getApartmentsWithStatus,
  getDesksWithStatus,
  purchaseApartment,
  purchaseDesk,
  setCurrentApartment,
  setCurrentDesk,
  type ApartmentId,
  type DeskId,
} from '@/lib/progressionSystem'
import buttonStyles from '@/styles/components/buttons.module.css'
import positionStyles from '@/styles/utilities/positioning.module.css'
import styles from '@/styles/pages/ProgressionShop.module.css'

interface ProgressionShopProps {
  onApartmentChange?: () => void
  className?: string
}

export function ProgressionShop({ onApartmentChange, className }: ProgressionShopProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [balance, setBalance] = useState(0)
  const [apartments, setApartments] = useState(getApartmentsWithStatus())
  const [desks, setDesks] = useState(getDesksWithStatus())
  const [activeTab, setActiveTab] = useState<'apartments' | 'desks'>('apartments')

  // Refresh data when opening
  useEffect(() => {
    if (isOpen) {
      setBalance(getAvailableBalance())
      setApartments(getApartmentsWithStatus())
      setDesks(getDesksWithStatus())
    }
  }, [isOpen])

  const handlePurchaseApartment = (id: ApartmentId) => {
    if (purchaseApartment(id)) {
      setBalance(getAvailableBalance())
      setApartments(getApartmentsWithStatus())
      onApartmentChange?.()
    }
  }

  const handleSelectApartment = (id: ApartmentId) => {
    if (setCurrentApartment(id)) {
      setApartments(getApartmentsWithStatus())
      onApartmentChange?.()
    }
  }

  const handlePurchaseDesk = (id: DeskId) => {
    if (purchaseDesk(id)) {
      setBalance(getAvailableBalance())
      setDesks(getDesksWithStatus())
    }
  }

  const handleSelectDesk = (id: DeskId) => {
    if (setCurrentDesk(id)) {
      setDesks(getDesksWithStatus())
    }
  }

  const formatCost = (cost: number) => {
    if (cost >= 1000) {
      return `$${(cost / 1000).toFixed(0)}k`
    }
    return `$${cost}`
  }

  return (
    <>
      {/* Toggle button */}
      <button
        className={`${buttonStyles.icon} ${className || ''}`}
        onClick={() => setIsOpen(true)}
        title="Upgrades Shop"
        aria-label="Upgrades Shop"
      >
        <ShoppingBag size={24} />
      </button>

      {/* Shop modal */}
      {isOpen && (
        <div className={positionStyles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className={styles.header}>
              <h3 className={styles.title}>UPGRADES</h3>
              <div className={styles.balance}>
                <span className={styles.balanceLabel}>Balance:</span>
                <span className={styles.balanceValue}>${balance.toLocaleString()}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'apartments' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('apartments')}
              >
                <Home size={16} />
                Apartments
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'desks' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('desks')}
              >
                <Monitor size={16} />
                Desks
              </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
              {activeTab === 'apartments' && (
                <div className={styles.grid}>
                  {apartments.map(apt => (
                    <div
                      key={apt.id}
                      className={`${styles.item} ${apt.current ? styles.itemCurrent : ''} ${apt.unlocked ? styles.itemUnlocked : ''}`}
                    >
                      <div className={styles.itemInfo}>
                        <div className={styles.itemHeader}>
                          <span className={styles.itemName}>{apt.name}</span>
                          {apt.current && <Check size={16} className={styles.checkIcon} />}
                          {!apt.unlocked && <Lock size={14} className={styles.lockIcon} />}
                        </div>
                        <div className={styles.itemCost}>
                          {apt.unlocked ? 'Owned' : (apt.cost === 0 ? 'Free' : formatCost(apt.cost))}
                        </div>
                      </div>
                      <div className={styles.itemActions}>
                        {apt.unlocked ? (
                          <button
                            className={`${styles.actionButton} ${apt.current ? styles.actionButtonActive : ''}`}
                            onClick={() => handleSelectApartment(apt.id)}
                            disabled={apt.current}
                          >
                            {apt.current ? 'Selected' : 'Select'}
                          </button>
                        ) : (
                          <button
                            className={`${styles.actionButton} ${styles.actionButtonBuy}`}
                            onClick={() => handlePurchaseApartment(apt.id)}
                            disabled={!apt.canAfford}
                          >
                            {apt.canAfford ? 'Buy' : 'Locked'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'desks' && (
                <div className={styles.grid}>
                  {desks.map(desk => (
                    <div
                      key={desk.id}
                      className={`${styles.item} ${desk.current ? styles.itemCurrent : ''} ${desk.unlocked ? styles.itemUnlocked : ''}`}
                    >
                      <div className={styles.itemInfo}>
                        <div className={styles.itemHeader}>
                          <span className={styles.itemName}>{desk.name}</span>
                          {desk.current && <Check size={16} className={styles.checkIcon} />}
                          {!desk.unlocked && <Lock size={14} className={styles.lockIcon} />}
                        </div>
                        <div className={styles.itemCost}>
                          {desk.unlocked ? 'Owned' : (desk.cost === 0 ? 'Free' : formatCost(desk.cost))}
                        </div>
                      </div>
                      <div className={styles.itemActions}>
                        {desk.unlocked ? (
                          <button
                            className={`${styles.actionButton} ${desk.current ? styles.actionButtonActive : ''}`}
                            onClick={() => handleSelectDesk(desk.id)}
                            disabled={desk.current}
                          >
                            {desk.current ? 'Selected' : 'Select'}
                          </button>
                        ) : (
                          <button
                            className={`${styles.actionButton} ${styles.actionButtonBuy}`}
                            onClick={() => handlePurchaseDesk(desk.id)}
                            disabled={!desk.canAfford}
                          >
                            {desk.canAfford ? 'Buy' : 'Locked'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
