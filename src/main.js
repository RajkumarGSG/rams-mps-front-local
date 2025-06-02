// =========================================================
// * Vue Material Dashboard PRO - v1.3.1
// =========================================================
//
// * Product Page: https://www.creative-tim.com/product/vue-material-dashboard-pro
// * Copyright 2019 Creative Tim (https://www.creative-tim.com)
//
// * Coded by Creative Tim
//
// =========================================================
//
// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

import Vue from 'vue'
import VueRouter from 'vue-router'

import store from './store/'
import DashboardPlugin from './material-dashboard'

// Plugins
import App from './App.vue'
import Chartist from 'chartist'

// translate
import i18n from './i18n'

// router setup
import routes from './routes/routes'

import 'material-design-icons-iconfont/dist/material-design-icons.css'

import { numFormat, dateFormat } from '@/store/helpers/format_helpers'
Vue.filter('numFormat', numFormat)
Vue.filter('dateFormat', dateFormat)

import htmlToPaper from '@/components/htmlToPaper'
Vue.use(htmlToPaper)

//import 'vuelayers/lib/style.css' // needs css-loader

//import VueLayers from 'vuelayers'

//Vue.use(VueLayers)

// plugin setup
Vue.use(VueRouter)
Vue.use(DashboardPlugin)

// configure router
const router = new VueRouter({
  mode: 'history',
  routes, // short for routes: routes
  scrollBehavior() {
    return {x: 0, y: 0}
  },
  linkExactActiveClass: 'nav-item active'
})

// global library setup
Object.defineProperty(Vue.prototype, '$Chartist', {
  get() {
    return this.$root.Chartist
  }
})

Vue.prototype.$eventHub = new Vue()   // Global event bus

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  store,
  data: {
    Chartist: Chartist
  },
  mounted: function() {
    document.title = process.env.VUE_APP_TITLE
  },
  render: (h) => h(App)
})
