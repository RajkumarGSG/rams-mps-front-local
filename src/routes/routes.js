/* 
File: routes.js
Description: main component, provides routes for accessing forms
*/
import store from '../store/'
//import i18n from '../i18n'
import InventoryDataMenu from './inventory'
import ConditionDataMenu from './condition'
import Planning from './planning'
import ReportsMenu from './reports'
import SettingsMenu from './settings'

const AuthLayout = () => import('@/pages/Dashboard/Pages/AuthLayout.vue')
const Login = () => import('@/pages/Dashboard/Pages/Login.vue')

const DashboardLayout = () => import('@/pages/Dashboard/Layout/DashboardLayout.vue')
// Dashboard pages

const Home = () => import('@/pages/Dashboard/Dashboard.vue')
const Maps = () => import('@/pages/Map/Map.vue')

const BridgesAndTunnelsTables = () => import('@/pages/BridgesAndTunnels/BridgesAndTunnels.vue')
const BridgeAndTunnelPassport = () => import('@/pages/BridgesAndTunnels/Passport.vue')

const ReportsPanel = () => import('@/pages/ReportsPanel.vue')
const AdminPanel = () => import('@/pages/AdminPanel.vue')

const checkAuthAndAccess = async (to, from, next) => {
  if (store.getters.hasToken) {
    store.commit('SET_HEADER_AUTH')
    try {
      if (!store.getters.profileLoaded) {
        await store.dispatch('GET_MY_PROFILE')
        //console.log('ifAuthenticated - ok')
      }

      //const locales = Object.keys(i18n.messages)
      const actLang = store.getters.locale_active
      if (!store.getters.isUiTranslateLoaded) {
        await store.dispatch('LOAD_UI_TRANSLATE', actLang)
        //console.log('ifAuthenticated - ok')
      }
      next()
    } catch {
      //console.log('ifAuthenticated - err')
      next('/login')
    }
  } else {
    next('/login')
  }
}

let authPages = {
  path: '/',
  component: AuthLayout,
  name: 'Authentication',
  children: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
}

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/inventory_data',
    component: DashboardLayout,
    children: InventoryDataMenu,
    beforeEnter: checkAuthAndAccess
  },
  {
    path: '/condition_data',
    component: DashboardLayout,
    children: ConditionDataMenu,
    beforeEnter: checkAuthAndAccess
  },

  {
    path: '/planning',
    component: DashboardLayout,
    children: Planning,
    beforeEnter: checkAuthAndAccess
  },
  {
    path: '/settings',
    component: DashboardLayout,
    children: SettingsMenu,
    beforeEnter: checkAuthAndAccess
  },
  {
    path: '/reports',
    component: DashboardLayout,
    children: ReportsMenu,
    beforeEnter: checkAuthAndAccess
  },
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: 'home',
        name: 'Home',
        component: Home,
        beforeEnter: checkAuthAndAccess
      },
      {
        path: 'map',
        name: 'Map',
        component: Maps,
        beforeEnter: checkAuthAndAccess
      },
      {
        path: 'bridges-tunnels-tables',
        name: 'BridgesAndTunnelsTables',
        components: { default: BridgesAndTunnelsTables },
        beforeEnter: checkAuthAndAccess
      },
      {
        path: 'bridges-passport/:uuid',
        name: 'BridgesPassport',
        component: BridgeAndTunnelPassport,
        beforeEnter: checkAuthAndAccess,
        props: (route) => ({ uuid: route.params.uuid, target: 'bridge' })
      },
      {
        path: 'tunnels-passport/:uuid',
        name: 'TunnelsPassport',
        component: BridgeAndTunnelPassport,
        beforeEnter: checkAuthAndAccess,
        props: (route) => ({ uuid: route.params.uuid, target: 'tunnel' })
      },

      /*
       Admin and Reports Panels
      */
      {
        path: 'reports_panel',
        name: 'Reports',
        component: ReportsPanel,
        beforeEnter: checkAuthAndAccess
      },
      {
        path: 'admin_panel',
        name: 'administrative_tasks',
        component: AdminPanel,
        beforeEnter: checkAuthAndAccess
      },
    ]
  },
  authPages,
  {
    path: '*',
    redirect: '/dashboard'
  }
]

export default routes
