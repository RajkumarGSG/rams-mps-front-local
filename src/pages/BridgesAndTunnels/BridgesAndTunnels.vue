<template>
  <VueTabs>
    <v-tab id="tab0" v-if="tab0Allowed" :title="$t('label.bridges')">
      <Bridges />
    </v-tab>

    <v-tab id="tab1" v-if="tab1Allowed" :title="$t('label.tunnels')">
      <Tunnels />
    </v-tab>
  </VueTabs>
</template>

<script>
  import { VueTabs, VTab } from 'vue-nav-tabs'
  import 'vue-nav-tabs/themes/vue-tabs.css'
  import permissions from "@/mixins/permissionsMixin"
  import Bridges from './BridgesTable'
  import Tunnels from './TunnelsTable'

  export default {
    name: 'bridges-tunnels-tables',
    mixins: [permissions],

    data() {
      return {
        formName: 'BridgesAndTunnels',

        //type: 'bridges',
        activeTab: "tab1"
      }
    },

    components: {
      VueTabs,
      VTab,
      Bridges,
      Tunnels
    },

    mounted() {
      // Check if we are eligible to view the form
      if (!this.checkIfScreenAllowed()) {
        this.onClose()
        return
      };
    },

    methods: {
    },

    computed: {
      tab0Allowed() {
        return this.isScreenAllowed(Bridges.name);
      },

      tab1Allowed() {
        return this.isScreenAllowed(Tunnels.name);
      }
    }
  }
</script>
<style lang="scss" scoped>
.vue-tabs {
  height: 100%;
}

.vue-tabs .tab-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

#p-tab0 {
  width: 100%;
}

#p-tab1 {
  width: 100%;
}

.vue-tabs .tab-content>div {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vue-tabs .nav-tabs>li.active>a,
.vue-tabs .nav-tabs>li.active>a:hover,
.vue-tabs .nav-tabs>li.active>a:focus {
  background-color: #4caf50;
}

.bridges,
.tunnels {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
