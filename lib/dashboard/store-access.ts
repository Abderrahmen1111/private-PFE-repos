/**
 * When a store is not yet approved (or was rejected), merchants must not use
 * dashboard tools or sub-routes until status changes.
 */
export function isStoreDashboardLocked(status: string | null | undefined): boolean {
  const s = (status || '').toUpperCase()
  return s === 'PENDING' || s === 'REJECTED'
}
