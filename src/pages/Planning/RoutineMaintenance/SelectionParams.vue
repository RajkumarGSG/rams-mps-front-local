<!--
File: SelectionParams.vue
Description: Subcomponent for selection parameters used by the Routine Maintenance Module forms.
-->
<template>
  <md-card style="width: 100%; display: block;">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <div :class="getSize(10)">
          <YearsDropdown v-model="selectedYear" />
        </div>
        <div :class="getSize(15)">
          <RegionsDropdown v-model="selectedRegion" :disabled="!selectedYear"/>
        </div>
        <div :class="getSize(10)">
          <DepsDropdown v-model="selectedDeu" :regionId="selectedRegion" :disabled="!selectedRegion" />
        </div>
        <div :class="getSize(15)">
          <WorkCategoriesDropdown v-model="selectedCategory" :routine=1 :disabled="!selectedDeu" />
        </div>
        <div :class="getSize(15)">
          <RoadsDropdown v-if="step === 'second'" v-model="selectedRoad" :items="rmPlanDetailRoadsInList"
            :disabled="!selectedCategory" />
        </div>
        <div :class="getSize(15)">
          <BaseDropdown v-if="step === 'second'" v-model="selectedTreatmentType" :items="treatmentsList"
          :label="$t('selections.select_treatment')" :disabled="!selectedRoad" />
        </div>

        <span :class="getSize(10)" style="color: red;">{{ label }}</span>

        <div class="btn-row" :class="getSize(10)">
          <md-button v-if="btnAddShown" class="md-success" @click="$emit('add-item')">
            {{ $t('buttons.add') }}
          </md-button>
        </div>
      </div>
    </md-card-header>
  </md-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import { getSize } from '@/mixins/permissionsMixin';
import {
  BaseDropdown, YearsDropdown, RegionsDropdown, DepsDropdown, 
  RoadsDropdown, WorkCategoriesDropdown 
} from '@/pages/Components';

export default {
  name: 'selection-params',

  data() {
    return {
      selectedYear: null,
      selectedRegion: null,
      selectedDeu: null,
      selectedCategory: null,
      selectedRoad: null,
      selectedTreatmentType: null,
    }
  },

  props: {
    step: { default: 'first', type: String },
    btnAddShown: { default: true, type: Boolean },
  },

  components: {
    BaseDropdown,
    YearsDropdown,
    RegionsDropdown,
    DepsDropdown,
    RoadsDropdown,
    WorkCategoriesDropdown,
  },

  methods: {
    ...mapActions({
    }),
    getSize,
  },

  computed: {
    ...mapGetters('Planning', ['rmPlanDetailRoadsInList', 'rmPlanDetailTreatmentsInList', 'currentPlan']),

    treatmentsList() {
      return this.rmPlanDetailTreatmentsInList(this.selectedRoad);
    },

    label() {
      const labels = ['', 'label.plan_exists', 'label.plan_approved'];
      const index = this.currentPlan(this.selectedYear).status;
      return this.$t(labels[index]);
    }
  },

  watch: {
    async step(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.selectedRoad = null;
      };
    },

    async selectedYear(value) {
      this.selectedRegion = null;
      this.$emit('paramChanged', 'year', value);
    },

    async selectedRegion(value) {
      this.$emit('paramChanged', 'fk_region', value);
    },

    async selectedDeu(value) {
      this.selectedCategory = null;
      this.$emit('paramChanged', 'fk_deu', value);
    },

    async selectedCategory(value) {
      this.selectedRoad = null;
      this.$emit('paramChanged', 'fk_work_category', value);
    },

    selectedRoad(value) {
      this.selectedTreatmentType = null;
      this.$emit('paramChanged', 'fk_road', value);
    },

    selectedTreatmentType(value) {
      this.$emit('paramChanged', 'fk_treatment', value);
    },
  }
}
</script>
<style lang="scss" scoped>
.md-card {
  margin: 0px 0;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}
</style>