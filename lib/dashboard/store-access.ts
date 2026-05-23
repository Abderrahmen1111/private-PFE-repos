/**
 * When a store is not yet approved (or was rejected), merchants must not use
 * dashboard tools or sub-routes until status changes.
 */
export function isStoreDashboardLocked(status: string | null | undefined): boolean {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  const s = (status || '').toUpperCase()
  return s === 'REJECTED'
}
