<template>
  <div class="wrapper" :class="[{ 'nav-open': $sidebar.showSidebar }]">
    <side-bar :active-color="sidebarBackground" :background-image="sidebarBackgroundImage"
      :data-background-color="sidebarBackgroundColor">
      <h4 style="text-align: center; color: aliceblue;">
        <span>{{ userName }}</span>
      </h4>

      <template slot="links">
        <sidebar-item v-for="(item, index) in sidebarItems" :key="index" :link="item.link"
          v-if="!item.condition || (item.condition && item.condition())">
          <sidebar-item v-for="(subItem, subIndex) in item.children" :key="subIndex"
            v-if="!subItem.condition || (subItem.condition && subItem.condition())" :link="subItem.link" />
          <!--v-if="isScreenAllowed(subItem.name)" :link="subItem.link" /-->
        </sidebar-item>
      </template>
    </side-bar>

    <div class="main-panel">
      <top-navbar v-if="$route.name.toLowerCase() !== 'map'"></top-navbar>
      <div :class="{ content: !$route.meta.hideContent }" @click="toggleSidebar">
        <zoom-center-transition :duration="200" mode="out-in">
          <!-- your content here -->
          <router-view></router-view>
        </zoom-center-transition>
      </div>
      <content-footer v-if="$route.meta.showFooter"></content-footer>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-new */
import PerfectScrollbar from 'perfect-scrollbar'
import 'perfect-scrollbar/css/perfect-scrollbar.css'
import { mapGetters } from 'vuex'

function hasElement(className) {
  return document.getElementsByClassName(className).length > 0
}

function initScrollbar(className) {
  if (hasElement(className)) {
    return new PerfectScrollbar(`.${className}`)
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className)
    }, 100)
  }
}

import TopNavbar from './TopNavbar.vue'
import ContentFooter from './ContentFooter.vue'
//import UserMenu from './Extra/UserMenu.vue'
import { ZoomCenterTransition } from 'vue2-transitions'

export default {
  components: {
    TopNavbar,
    ContentFooter,
    //UserMenu,
    ZoomCenterTransition
  },
  data() {
    return {
      sidebarBackgroundColor: 'black',
      sidebarBackground: 'danger',
      sidebarBackgroundImage: './img/sidebar-2.jpg',
      sidebarMini: true,
      sidebarImg: true,

      sidebarItems: [
        { link: { name: 'Home', icon: 'home', path: '/home' } },
        {
          link: { name: 'Inventory', icon: 'admin_panel_settings' }, //condition: () => this.isScreenAllowed('Inventory'),
          children: [
            { link: { name: 'Regions', path: '/inventory_data/regions' }, condition: () => this.isScreenAllowed('Regions') },
            { link: { name: 'Districts', path: '/inventory_data/districts' }, condition: () => this.isScreenAllowed('Districts') },
            { link: { name: 'Deu', path: '/inventory_data/deu' }, condition: () => this.isScreenAllowed('Deu') },
            { link: { name: 'Roads', path: '/inventory_data/roads' }, condition: () => this.isScreenAllowed('Roads') },
            { link: { name: 'Sections', path: '/inventory_data/sections' }, condition: () => this.isScreenAllowed('Sections') },
            { link: { name: 'traffic_sites', path: '/inventory_data/traffic' }, condition: () => this.isScreenAllowed('TrafficSites') },
            { link: { name: 'Import', icon: 'upload', path: '/inventory_data/import' }, condition: () => this.isScreenAllowed('ImportForm') }
          ]
        },
        {
          link: { name: 'Survey', icon: 'query_stats' }, //condition: () => this.isScreenAllowed('Survey'),
          children: [
            { link: { name: 'Condition_Data', path: '/condition_data/condition' }, condition: () => this.isScreenAllowed('Condition') },
            { link: { name: 'Import', icon: 'upload', path: '/condition_data/upload' }, condition: () => this.isScreenAllowed('ConditionImportForm') },
          ]
        },
        {
          link: { name: 'planning', icon: 'money' }, //condition: () => this.isScreenAllowed('Planning'),
          children: [
            { link: { name: 'generate_treatment', path: '/planning/generate_treatment' }, condition: () => this.isScreenAllowed('GenerateTreatment') },
            { link: { name: 'prepare_plan', path: '/planning/prepare_plan' }, condition: () => this.isScreenAllowed('PreparePlan') },
            { link: { name: 'routine_maintenance', icon: 'money', path: '/planning/routine_maintenance' } }, //condition: () => this.isScreenAllowed('Planning'),        },
            { link: { name: 'title_List', path: '/planning/title_list' }, condition: () => this.isScreenAllowed('TitleList') }
          ]
        },
        { link: { name: 'bridges_and_tunnels', icon: 'terrain', path: '/bridges-tunnels-tables' }, condition: () => this.isScreenAllowed('BridgesAndTunnels') },
        { link: { name: 'Map', icon: 'location_on', path: '/map' }, class: "hide-sidebar-item", condition: () => this.isScreenAllowed('Map') },
        { link: { name: 'Reports', icon: 'print', path: '/reports_panel' }, condition: () => this.isScreenAllowed('ReportsPanel') },
        { link: { name: 'administrative_tasks', icon: 'settings', path: '/admin_panel' }, condition: () => this.isScreenAllowed('AdminPanel') },
      ]
    }
  },

  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false)
      }
    },

    minimizeSidebar() {
      if (this.$sidebar) {
        this.$sidebar.toggleMinimize()
      }
    }
  },

  async mounted() {
    let docClasses = document.body.classList
    let isWindows = navigator.platform.startsWith('Win')
    if (isWindows) {
      // if we are on windows OS we activate the perfectScrollbar function
      initScrollbar('sidebar')
      initScrollbar('sidebar-wrapper')
      initScrollbar('main-panel')

      docClasses.add('perfect-scrollbar-on')
    } else {
      docClasses.add('perfect-scrollbar-off')
    }
  },

  watch: {
    sidebarMini() {
      this.minimizeSidebar()
    }
  },

  computed: {
    ...mapGetters('ReferenceData', ['isScreenAllowed']),
    ...mapGetters(['userName']),
  }
}
</script>
<style lang="scss">
$scaleSize: 0.95;

@keyframes zoomIn95 {
  from {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }

  to {
    opacity: 1;
  }
}

.main-panel .zoomIn {
  animation-name: zoomIn95;
}

@keyframes zoomOut95 {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
}

.main-panel .zoomOut {
  animation-name: zoomOut95;
}

@media (max-width: 992px) {
  .hide-sidebar-item {
    display: none;
  }
}
</style>
