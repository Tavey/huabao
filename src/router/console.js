import {ACTIONS} from "@/consts";

export default [{
    path: '/console',
    component: () => import('@/pages/Console/Index'),
    // meta: {
    //     // pageName: '管理控制台',
    //     // languageTag: 'console'
    // },
}, {
    path: '/console/devices',
    component: () => import('@/pages/Console/Device/List'),
    // meta: {
    //     // pageName: '设备列表',
    //     // authIdentifier: ACTIONS.DeviceList,
    //     // languageTag: 'devices'
    // },
}, {
    path: '/console/fences',
    component: () => import('@/pages/Console/Fence/List'),
    // meta: {
    //     // pageName: '电子围栏',
    //     // authIdentifier: ACTIONS.FenceList,
    //     // languageTag: 'fences'
    // },
}, {
    path: '/console/logs',
    component: () => import('@/pages/Console/Log/List'),
    // meta: {
    //     // pageName: '数据日志',
    //     // authIdentifier: ACTIONS.LogList,
    //     // languageTag: 'logs',
    //     // rootOnly: true
    // },
}, {
    path: '/console/vehicles',
    component: () => import('@/pages/Console/Vehicle/List'),
    // meta: {
    //     // pageName: '车辆列表',
    //     // authIdentifier: ACTIONS.VehicleList,
    //     // languageTag: 'vehicles'
    // },
}, {
    path: '/console/approval',
    component: () => import('@/pages/Console/Approval/List'),
    // meta: {
    //     // pageName: '审核列表',
    //     // languageTag: 'approvalList'
    // }
}, {
    path: '/console/users',
    component: () => import('@/pages/Console/User/List'),
    // meta: {
    //     // pageName: '账号列表',
    //     // authIdentifier: ACTIONS.AccountList,
    //     // languageTag: "users"
    // },
}, {
    path: '/console/companies',
    component: () => import('@/pages/Console/Company/List'),
    // meta: {
    //     // pageName: '公司列表',
    //     // authIdentifier: ACTIONS.CompanyList,
    //     // languageTag: 'companies'
    // },
}, {
    path: '/console/roles',
    component: () => import('@/pages/Console/Role/List'),
    // meta: {
    //     // pageName: '角色列表',
    //     // authIdentifier: ACTIONS.RoleList,
    //     // languageTag: 'roles'
    // },
}]

// {
//     path: '/console/vehicles/:vehicle_id/trips',
//     component: () => import('@/pages/Public/Trip/List'),
//     meta: {
//         pageName: '行程列表',
//         activeAside: '/console/vehicles',
//         authIdentifier: ACTIONS.TripList,
//         languageTag: 'trips'
//     },
// },
// {
//     path: '/console/trips/:trip_id',
//     component: () => import('@/pages/Public/Trip/DetailPage'),
//     meta: {
//         pageName: '行程详情',
//         activeAside: '/console/vehicles',
//         authIdentifier: ACTIONS.TripDetail,
//         languageTag: "vehiclesTrips"
//     },
// },
