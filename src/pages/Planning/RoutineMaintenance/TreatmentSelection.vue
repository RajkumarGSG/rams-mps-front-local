<!--
File: TreatmentSelection.vue
Description: shows list of treatments for selection in the Routine Maintenance Plans.
-->
<template>
  <md-card>
    <md-card-content>
      <div class="md-layout">
        <BaseTable
          class="md-layout-item md-size-40"
          v-model="selectedRoads"
          :items="roadsList"
          :headers="roadsHeaders"
          :loading="showSpinner"
          :showActions=false
          :isSelectable="!planApproved && selectedWorkCategory != -1"
        />

        <BaseTable
          class="md-layout-item md-size-60"
          v-model="selectedTreatments"
          :items="treatmentsList"
          :headers="treatmentsHeaders"
          :loading="showSpinner"
          :showActions=false
          :isSelectable="!planApproved"
        />
      </div>
    </md-card-content>

    <md-card-actions class="md-layout">
      <div v-if="showSelectedLabel" class="md-layout md-small-size-100 md-size-50">
        <span> {{ $t('selections.selected') }}: </span>
        <span v-if="showSelectedTreatmentsLabel">
          {{ selectedTreatments.length }} {{ $t('label.entries') }},
        </span>
        <span v-if="showSelectedRoadsLabel">
          {{ selectedRoads.length }} {{ $t('roads') }}
        </span>
      </div>
    </md-card-actions>
  </md-card>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import permissions from "@/mixins/permissionsMixin"
import BaseTable from "@/pages/Components/BaseTable.vue"
import { errorMessage, successMessage } from '@/mixins/messagesMixin'

export default {
  name: 'test-rm-treatment-selection',
  mixins: [permissions],

  components: {
    BaseTable,
  },

  data() {
    return {
      formName: 'TreatmentSelection',
      showSpinner: false,

      currentSort: 'description',

      //thisYear: null,
      selectedYear: null,
      selectedRegion: null,
      selectedDeu: -1,
      selectedWorkCategory: -1,

      selectedRoads: [],
      selectedTreatments: [],
    }
  },

  props: {
    step: { default: '', type: String },
    filterParams: { default: {}, type: Object },
  },

  methods: {
    ...mapActions({
      clearTreatmentsList: 'ReferenceData/CLEAR_TREATMENT_TYPE_LIST',
      loadTreatments: 'ReferenceData/LOAD_TREATMENT_TYPE_LIST',
      clearSectionsList: 'CLEAR_SECTION_LIST',
      loadSections: 'LOAD_SECTION_LIST',
      loadPlans: 'Planning/LOAD_RM_PLAN_LIST',
      addNewPlan: 'Planning/ADD_NEW_RM_PLAN',
      addPlanDetails: 'Planning/SAVE_BATCH',
    }),

    toggleSpinner(state) {
      this.showSpinner = state
    },

    async clearLists() {
      await this.clearSectionsList();
      await this.clearTreatmentsList();
      this.selectedRoads = [];
      this.selectedTreatments = [];
    },

    async parseFilterParams() {
      this.toggleSpinner(true);
      await this.clearLists();

      this.selectedYear = this.filterParams?.year || -1; //this.thisYear;
      this.selectedRegion = this.filterParams?.fk_region || -1;
      this.selectedDeu = this.filterParams?.fk_deu || -1; // assign -1 in order not to select other plans
      this.selectedWorkCategory = this.filterParams?.fk_work_category || -1; // assign -1 in order not to select other plans

      if (this.selectedDeu) {
        await this.loadSections({ deu_id: this.selectedDeu });
      };
      if (this.selectedWorkCategory) {
        await this.loadTreatments({ routine: 1, work_category_id: this.selectedWorkCategory });
      };
      this.toggleSpinner(false);
    },

    async addPlan() { // Add new plan
      this.toggleSpinner(true);
      const theItem = {
        year: this.selectedYear,// || this.thisYear,
        fk_region: this.selectedRegion,
        fk_deu: this.selectedDeu,
        fk_work_category: this.selectedWorkCategory
      };
      let newPlanId = -1;
      let errDesc = '';
      try {
        const res = await this.addNewPlan(theItem);
        newPlanId = res?.id;
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error');
        await errorMessage(errDesc);
      } finally {
        this.toggleSpinner(false);
      };
      return newPlanId;
    },

    async assignTreatments() { // Assign selected treatments
      let newPlanId = 0;
      
      if (this.currentPlan(this.selectedYear).status == 0) { // Plan does not exist, create it first
        newPlanId = await this.addPlan();

        // Reload plans list
        this.payload = {
          year: this.selectedYear,
          region_id: this.selectedRegion,
          deu_id: this.selectedDeu,
          work_category_id: this.selectedWorkCategory
        };
        await this.loadPlans(payload);
      }
      if (newPlanId == -1) return; // Error occured by creating new plan

      // Assign the treatment to the plan
      this.toggleSpinner(true);
      const payload = [];
      this.selectedTreatments.forEach((treatment) => {
        this.selectedRoads.forEach(road => {
          payload.push({
            fk_routine_plan: this.curPlan,
            fk_treatment_type: treatment.treatment_type_id,
            fk_road: road.id,
            fk_unit: treatment.fk_unit,
            start_m: 0,
            end_m: 0,   // TODO: find the end
            volume: 0,  // TODO: calculate
            cycle_ratio: 1,
            cost: treatment.rate || 0,
          });
        });
      });
      let errDesc;
      try {
        errDesc = await this.addPlanDetails({payload});
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error');
        //await errorMessage(errDesc);
      } finally {
        this.toggleSpinner(false);
      };
      const message = `${newPlanId > 0 ? this.$t('messages.plan_added') : ''}\n${errDesc?.record_count} ${this.$t('messages.entries_added')}`;
      await successMessage(this.$t('messages.populated'), message);
      await this.parseFilterParams();
    },
  },

  computed: {
    ...mapState({
      treatmentsList: (state) => state.ReferenceData.treatment_type_list,
    }),
    ...mapGetters('Planning', ['rmPlanDetailTreatmentsInList', 'currentPlan']),
    ...mapGetters(['roadsListFiltered']),

    planApproved() {
      return this.currentPlan(this.selectedYear).status == 2;
    },

    curPlan() {
      return this.currentPlan(this.selectedYear).id;
    },

    roadsList() {
      return this.roadsListFiltered(this.selectedDeu, false);
    },

    showSelectedRoadsLabel() {
      return this.selectedRoads.length > 0;
    },

    showSelectedTreatmentsLabel() {
      return this.selectedTreatments.length > 0;
    },

    showSelectedLabel() {
      const res = this.showSelectedRoadsLabel && this.showSelectedTreatmentsLabel && !this.planApproved;
      this.$emit('changeAddButtonStatus', 'selectionForm', res);

      return this.showSelectedRoadsLabel || this.showSelectedTreatmentsLabel;
    },

    treatmentsHeaders() {
      return [
        { header: "stdCols.key", key: "key", sortable: true },
        { header: "stdCols.description", key: "treatment_type_description", sortable: true },
        { header: "label.units", key: "unit_description", sortable: true },
        { header: "label.rate", key: "rate", sortable: true, num: true, digits: 2 },
      ]
    },

    roadsHeaders() {
      return [
        { header: "stdCols.description", key: "description", sortable: true },
      ]
    }
  },

  watch: {
    async step(newValue, oldValue) {
      if (newValue !== oldValue && newValue === 'first') this.parseFilterParams();
    },

    filterParams: {
      async handler(value, oldValue) {
        if (this.step !== 'first') return;
        await this.parseFilterParams();
      },
      deep: true
    },
  }
}
</script>
<style lang="scss" scoped>
.md-card {
  margin: 0px 0;
}
</style>