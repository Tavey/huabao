import {ACTIONS} from "@/consts"

export default [{
    path: '/',
    component: () => import('@/pages/DataService/Index'),
    // meta: {
    //     // pageName: '数据服务',
    //     // languageTag: 'dataService'
    // },
}, {
    path: 'vehicles',
    component: () => import('@/pages/DataService/Vehicle/List'),
    // meta: {
    //     // pageName: '车辆列表',
    //     // authIdentifier: ACTIONS.VehicleList,
    //     // languageTag: 'vehicles'
    // },
}, {
    path: 'vehicles/:vehicle_id/trips',
    component: () => import('@/pages/Public/Trip/List'),
    // meta: {
    //     // pageName: '行程列表',
    //     // activeAside: '/vehicles',
    //     // authIdentifier: ACTIONS.TripList,
    //     // languageTag: "trips"
    // },
}, {
    path: 'vehicles/:vehicle_id/devices/:deviceId/position',
    component: () => import('@/pages/DataService/Vehicle/Positionlive'),
    // meta: {
    //     // pageName: '实时位置',
    //     // activeAside: '/vehicles',
    //     // languageTag: 'position'
    //     // authIdentifier: ACTIONS.TripList
    // },
}, {
    path: 'vehicles/:vehicle_id/trips/merge',
    component: () => import('@/pages/Public/Trip/Merge'),
    // meta: {
    //     // pageName: '行程详情',
    //     // activeAside: '/vehicles',
    //     // authIdentifier: ACTIONS.TripDetail,
    //     // languageTag: 'vehiclesTrips'
    // },
}, {
    path: 'vehicles/:vehicle_id/trips/:trip_id',
    component: () => import('@/pages/Public/Trip/DetailPage'),
    // meta: {
    //     // pageName: '行程详情',
    //     // activeAside: '/vehicles',
    //     // authIdentifier: ACTIONS.TripDetail,
    //     // languageTag: 'vehiclesTrips'
    // },
}, {
    path: 'events/type/normal',
    component: () => import('@/pages/DataService/Event/List'),
    // meta: {
    //     // pageName: '事件列表',
    //     // authIdentifier: ACTIONS.EventList,
    //     // languageTag: 'events'
    // },
}, {
    path: 'events/type/emergency',
    component: () => import('@/pages/DataService/Event/List'),
    // meta: {
    //     // pageName: '事件列表',
    //     // authIdentifier: ACTIONS.EventList,
    //     // languageTag: 'events'
    // },
}, {
    path: 'events/type/fence',
    component: () => import('@/pages/DataService/Fence/List'),
    // meta: {
    //     // pageName: '事件列表',
    //     // authIdentifier: ACTIONS.EventList,
    //     // languageTag: 'events'
    // },
}, {
    path: 'events/type/:type/:event_id',
    component: () => import('@/pages/DataService/Event/DetailPage'),
    // meta: {
    //     // pageName: '事件详情',
    //     // authIdentifier: ACTIONS.EventDetail,
    //     // languageTag: 'eventDetails'
    // },
}, {
    path: 'statistics/basic',
    component: () => import('@/pages/DataService/Statistics/Basic'),
    // meta: {
    //     // pageName: '基本统计',
    //     // authIdentifier: ACTIONS.StatisticsBasic,
    //     // languageTag: 'basic'
    // },
}, {
    path: 'statistics/device',
    component: () => import('@/pages/DataService/Statistics/Device'),
    // meta: {
    //     // pageName: '设备统计',
    //     // authIdentifier: ACTIONS.StatisticsDevice,
    //     // languageTag: 'device'
    // },
}]
