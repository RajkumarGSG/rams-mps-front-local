<!--
File: TitleList.vue
Description: form for generating Titlelist with the PrintTitleList component.
-->
<template>
  <VueTabs @tab-change="handleTabChange">
    <v-tab id="tab0" v-if="tab0Allowed" :title="$t('tabs.budget_allocation')">
    </v-tab>

    <v-tab id="tab1" v-if="tab0Allowed" :title="$t('tabs.project_selection')">
    </v-tab>

    <v-tab id="tab2" v-if="tab0Allowed" :title="$t('tabs.budget_approval')">
    </v-tab>

    <v-tab id="tab3" v-if="tab3Allowed" :title="$t('tabs.title_list')">
      <PrintTitleList :step="active" />
    </v-tab>

    <Budgets v-show="tab0Allowed && showBudget" :step="active" />
  </VueTabs>
</template>
<script>
import { VueTabs, VTab } from 'vue-nav-tabs'
import 'vue-nav-tabs/themes/vue-tabs.css'
import permissions from "@/mixins/permissionsMixin"
import PrintTitleList from './PrintTitleList'
import Budgets from './Budgets.vue'

export default {
  mixins: [permissions],
  name: 'title-list-creation',

  data: () => ({
    formName: 'TitleList',

    active: 'first',
    showBudget: true,
    stepNames: ['first', 'second', 'third', 'fourth'],
  }),

  components: {
    VueTabs,
    VTab,
    PrintTitleList,
    Budgets,
  },

  mounted() {
    // Check if we are eligible to view the form
    if (!this.checkIfScreenAllowed()) {
      this.onClose()
      return
    };
  },

  methods: {
    handleTabChange(tabIndex) {   //, newTab, oldTab) {
      this.active = this.stepNames[tabIndex]
      this.showBudget = tabIndex != 3
    },
  },

  computed: {
    tab0Allowed() {
      return this.isScreenAllowed(Budgets.name);
    },

    tab3Allowed() {
      return this.isScreenAllowed(PrintTitleList.name);
    }
  },

  watch: {
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

#p-tab3 {
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

.budgets,
.print-title-list {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>