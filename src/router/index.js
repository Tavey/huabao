import Vue from 'vue'
import {ACTIONS} from "@/consts";
import Router from 'vue-router'

//Layout
import GlobalLayout from '@/layouts/Global'

//Global
// import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Error from '@/pages/Error'
import AccessDenied from '@/pages/AccessDenied'


import DataServiceRoute from './dataservice'
import ConsoleRoute from './console'
import RiskRoute from './risk'

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [{
        path: '/login',
        component: Login
    }, {
        path: '/',
        component: GlobalLayout,
        children: [
            ...DataServiceRoute,
            ...ConsoleRoute,
            ...RiskRoute,
            {
                path: '/error',
                component: Error
            }, {
                path: '/access-denied',
                component: AccessDenied
            }, {
                path: '*',
                component: NotFound
            }]
    }]
})

// {
//     path: '/',
//     // component: GlobalLayout,
//     // component: DataServiceLayout,
//     children: DataServiceRoute
// },
// {
//     path: '/console',
//     // component: GlobalLayout,
//     // component: ConsoleLayout,
//     children: ConsoleRoute
// },
// {
//     path: '/risk',
//     // component: GlobalLayout,
//     // component: RiskModelLayout,
//     children: RiskRoute
// },
