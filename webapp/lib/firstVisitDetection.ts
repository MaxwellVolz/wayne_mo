const FIRST_VISIT_KEY = 'wayne_mo_first_visit_complete'

export function checkFirstVisit(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(FIRST_VISIT_KEY) === 'true'
}

export function markFirstVisitComplete(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(FIRST_VISIT_KEY, 'true')
}

export function resetFirstVisit(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(FIRST_VISIT_KEY)
}
