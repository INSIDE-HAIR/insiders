// Type definitions for dashboard routes JSON
declare module '@/src/routes/dashboard-routes.json' {
  import { DashboardRoutes } from '@/src/types/dashboard-routes'
  const value: DashboardRoutes
  export default value
}

declare module '*.json' {
  const value: any
  export default value
}