<!--
File: PreparePlan.vue
Description: shows tabs (add works, edit Works, approve Plan) for Plan preparation 
-->
<template>
  <VueTabs @tab-change="handleTabChange">
    <v-tab id="tab0" v-if="tab0Allowed" :title="$t('tabs.add_works')">
    </v-tab>

    <v-tab id="tab1" v-if="tab1Allowed" :title="$t('tabs.edit_works')">
    </v-tab>

    <v-tab id="tab2" v-if="tab2Allowed" :title="$t('tabs.approve_plan')">
      <Plans :step="active" />
    </v-tab>

    <Worklist v-show="showWorkList" @itemAssigned="itemAssigned" :step="active" />
  </VueTabs>
</template>
<script>
  import { VueTabs, VTab } from 'vue-nav-tabs'
  import 'vue-nav-tabs/themes/vue-tabs.css'
  import permissions from "@/mixins/permissionsMixin"
  import Worklist from './Worklist'
  import Plans from './Plans.vue'

  export default {
    mixins: [permissions],

    name: 'prepare-plan-form',
    data() {
      return {
        formName: 'PreparePlan',

        active: 'first',
        showWorkList: true,

        stepNames: ['first', 'second', 'third']
      }
    },

    components: {
      VueTabs,
      VTab,
      Worklist,
      Plans,
    },

    mounted() {
      // Check if we are eligible to view the form
      if (!this.checkIfScreenAllowed()) {
        this.onClose()
        return
      };
    },

    methods: {
      handleTabChange(tabIndex) { //, newTab, oldTab) {
        this.active = this.stepNames[tabIndex]
        this.showWorkList = tabIndex != 2
      },
      itemAssigned(type, itemId) {
        //console.log(`${type} ${itemId == -1 ? ' was un' : ' with the no itemId was '}assigned`)
      },
    },

    computed: {
      tab0Allowed() {
        return this.isScreenAllowed(Worklist.name);
      },

      tab1Allowed() {
        return this.isScreenAllowed(Worklist.name);
      },

      tab2Allowed() {
        return this.isScreenAllowed(Plans.name);
      }

    },
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

#p-tab2 {
  width: 100%;
}

.vue-tabs .tab-content > div {
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

.worklist, .plans {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>