export default [
  // {
  //   path: '/risk',
  //   component: () => import('@/pages/RiskModel/Vehicles/Index'),
  // },
  {
    path: 'vehicles/:vehicle_id/risk',
    component: () => import('@/pages/RiskModel/Vehicles/Index'),
  },
]
