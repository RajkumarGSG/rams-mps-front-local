<!--
File: RoutineMaintenance.vue
Description: Screen form with tabs for Routine Maintenance.
-->
<template>
  <div class="container">
    <VueTabs @tab-change="handleTabChange" class="tabs">
      <v-tab id="tab0" v-if="isTabAllowed(0)" :title="$t('tabs.treatment_assignment')" />
      <v-tab id="tab1" v-if="isTabAllowed(1)" :title="$t('tabs.plan_details')" />
      <v-tab id="tab2" v-if="isTabAllowed(2)" :title="$t('tabs.approve_plan')" />
    </VueTabs>

    <selection-params 
      :step="activeTab" 
      :btnAddShown="btnAddShown" 
      @paramChanged="onParamChanged"
      @add-item="addItem" 
    />

    <TreatmentSelection 
      ref="selectionForm" 
      v-show="activeTab === 'first'" 
      :filterParams="filterParams" 
      :step="activeTab"
      @changeAddButtonStatus="onChangeAddButtonStatus" 
    />

    <DetailsForm 
      ref="detailsForm" 
      v-show="activeTab === 'second'" 
      :filterParams="filterParams" 
      :step="activeTab"
      @changeAddButtonStatus="onChangeAddButtonStatus" 
    />

    <Plans 
      ref="plansForm" 
      v-show="activeTab === 'third'" 
      :filterParams="filterParams" 
      :step="activeTab" 
    />
  </div>
</template>
<script>
import { VueTabs, VTab } from 'vue-nav-tabs';
import 'vue-nav-tabs/themes/vue-tabs.css';
import permissions from '@/mixins/permissionsMixin';
import SelectionParams from './SelectionParams.vue';
import TreatmentSelection from './TreatmentSelection.vue';
import Plans from './Plans';
import DetailsForm from './PlanDetails.vue';

export default {
  mixins: [permissions],
  name: 'PreparePlanForm',

  data() {
    return {
      activeTab: 'first',
      filterParams: {},
      currentForm: 'selectionForm',
      btnAddShown: false,
      selectedDeu: null,
      selectedRoad: null,
      selectedPlan: null,
    };
  },

  components: {
    VueTabs,
    VTab,
    Plans,
    DetailsForm,
    SelectionParams,
    TreatmentSelection,
  },

  mounted() {
    if (!this.checkIfScreenAllowed()) {
      this.onClose();
    }
  },

  methods: {
    handleTabChange(tabIndex) {
      this.label = '';
      this.activeTab = this.stepNames[tabIndex];
      this.currentForm = this.formNames[tabIndex];
    },

    onParamChanged(paramName, value) {
      this.$set(this.filterParams, paramName, value);
    },

    onChangeAddButtonStatus(form, value) {
      this.btnAddShown = value;
    },

    async addItem() {
      await this.$refs[this.currentForm].assignTreatments();
    },

    isTabAllowed(index) {
      const formNames = ['TreatmentSelection', 'PlanDetails', 'Plans'];
      return this.isAllowed(formNames[index], 'Screen', 'Form');
    },
  },

  computed: {
    stepNames() {
      return ['first', 'second', 'third'];
    },
  
    formNames() {
      return ['selectionForm', 'detailsForm', 'plansForm'];
    },
},
};
</script>
<style lang="scss" scoped>
.container {
  width: 100%;
  display: block;
  margin: 0px 0;
}

.tabs {
  margin: 0px 0;
  width: 100%;
}

.vue-tabs .tab-content {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.selection-params, .TreatmentSelection .DetailsForm .Plans {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>