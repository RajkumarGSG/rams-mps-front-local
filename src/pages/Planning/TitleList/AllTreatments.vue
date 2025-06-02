<!--
File: AllTreatments.vue
Description: subcomponent of the Budgets.vue, shows all treatments for selected region and year.
-->
<template>
  <div>
    <md-card>
      <md-card-header class="md-card-header-icon md-card-header-green">
        <div class="md-layout">
          <div class="md-layout-item md-small-size-100 md-size-20">
            <md-button class="md-primary md-simple" @click='onModalClose'>
              <md-icon>arrow_back</md-icon>{{ $t('buttons.back') }}
            </md-button>
          </div>

          <div class="md-layout-item md-small-size-100 md-size-20">
            <PlansDropdown v-model="selectedPlan" :regionId="params.region" :year="params.year" :addEmptyLine="true"/>
          </div>
          <div class="md-layout-item md-small-size-100 md-size-20">
            <AmountsDropdown v-model="showAmounts" @input="onAmountChange" />
          </div>

          <div class="md-layout-item btn-row md-size-20">
            <span>{{ budgetAmount }}</span>&nbsp;
            <span v-if="budgetApproved" style="color: red;">{{ $t('label.approved') }}</span>
          </div>
          <div v-if="showAssignButton" class="md-layout-item btn-row md-size-20">
            <md-button class="md-success" @click="toggleUnassignedForm(true)">
              {{ $t('buttons.add') }}
            </md-button>
          </div>
        </div>
      </md-card-header>

      <md-card-content>
        <md-progress-spinner v-if="showSpinner" :md-diameter="100" :md-stroke="10" md-mode="indeterminate" />
        <md-table class="paginated-table table-striped table-hover" :value="tableData" :md-sort.sync="currentSort"
          :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-fixed-header
          :md-selected-value.sync='selectedItems'>
          <md-table-empty-state :md-label="$t('label.no_data')"
            :md-description="$t('messages.select_another_criteria')" />
          <md-table-row slot="md-table-row" slot-scope="{item}"
            v-bind="allowSelection ? { 'md-selectable': 'multiple' } : {}">
            <md-table-cell :md-label="$t('stdCols.plan_name')" md-sort-by="plan_description">
              {{ item.plan_description }}
            </md-table-cell>
            <md-table-cell :md-label="$t('road_network.section_description')" md-sort-by="section_description">
              {{ item.section_description }}
            </md-table-cell>
            <md-table-cell :md-label="$t('inventory.start_distance_m')" md-sort-by="start_distance_m" md-numeric>
              {{ item.start_m | numFormat(0) }}
            </md-table-cell>
            <md-table-cell :md-label="$t('inventory.end_distance_m')" md-sort-by="end_distance_m" md-numeric>
              {{ item.end_m | numFormat(0) }}
            </md-table-cell>
            <md-table-cell :md-label="$t('label.units')" md-sort-by="unit_description">
              {{ item.unit_description }}
            </md-table-cell>
            <md-table-cell :md-label="$t('condition.number_units')" md-sort-by="units" md-numeric>
              {{ item.units | numFormat(2) }}
            </md-table-cell>
            <md-table-cell :md-label="$t('treatment.treatment_description')" md-sort-by="treatment_type_description">
              {{ item.treatment_type_description }}
            </md-table-cell>
            <md-table-cell :md-label="costLabel" md-sort-by="cost" md-numeric>
              {{ item.cost / showAmounts | numFormat }}
            </md-table-cell>
            <md-table-cell :md-label="$t('condition.priority_index')" md-numeric>
              {{ item.priority_index | numFormat }}
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-card-content>
      <md-card-actions class="md-layout">
        <div v-if="showUnassignButton" class="md-layout md-small-size-100 md-size-50">
          <span>
            {{ $t('selections.selected') }}: {{ selectedItems.length }} {{ $t('label.entries') }}
          </span>
          <div class="md-layout-item md-small-size-100 md-size-40">
            <md-button v-if="isBtnAllowed('UnassignButton')" class="md-raised md-danger" @click="unassignSelected">
              {{ $t('buttons.unassign') }}
            </md-button>
          </div>
        </div>

        <div v-if="total > 0" class="md-layout-item md-small-size-100 md-size-45">
          <span>{{ $t('label.total') }}
            {{ $t('label.entries') }}: {{ total | numFormat(0) }},
            {{ $t('road_network.length') }}: {{ treatmentsSummary.totalLength | numFormat(0) }},
            {{ costLabel }}: {{ treatmentsSummary.totalSum / showAmounts | numFormat }}
          </span>
        </div>
      </md-card-actions>
    </md-card>

    <UnassignedTreatmentsForm v-if="showUnassignedForm" :showDialog="showUnassignedForm" :budget="budget"
      :workList="params.work_list_id" :region="params.region" :budget_assigned="treatmentsSummary.totalSum"
      @close="toggleUnassignedForm(false)" />
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import { numFormat } from "@/store/helpers/format_helpers"
import { onModalClose } from '@/mixins/onCloseMixin'
import { customSortMixin } from '@/mixins/customSortMixin'
import permissions from "@/mixins/permissionsMixin"
import messages from '@/mixins/messagesMixin'
import {AmountsDropdown, PlansDropdown} from '@/pages/Components'
import UnassignedTreatmentsForm from './UnassignedTreatmentsForm.vue'

export default {
  name: 'all-treatments-list',
  mixins: [permissions, customSortMixin, messages],

  data() {
    return {
      formName: 'AllTreatments',

      showSpinner: true,
      selectedPlan: null,
      selectedItems: [],
      showAmounts: 1000,
      costLabel: "Cost",

      showUnassignedForm: false,

      currentSort: 'section_description',
      currentSortOrder: 'asc',
    }
  },

  props: {
    params: {
      mode: { default: 'all', type: String },  // Possible values are: all, budget and assigned
      work_list_id: { default: null, type: Number },
      year: { default: null, type: Number },
      region: { default: null, type: Number },
    },
    budget: { default: {}, type: Object },
  },

  components: {
    AmountsDropdown,
    PlansDropdown,
    UnassignedTreatmentsForm
  },

  mounted() {
    // Check if we are eligible to view the form
    if (!this.checkIfScreenAllowed()) {
      this.onClose()
      return
    };

    this.toggleSpinner(true)
    this.selectedItems = []
    this.onAmountChange(this.showAmounts, this.$t("label.short_thousands"))
    this.toggleSpinner(false)
  },

  methods: {
    onModalClose,

    toggleSpinner(state) {
      this.showSpinner = state
    },

    toggleUnassignedForm(state) {
      this.toggleSpinner(false)
      this.showUnassignedForm = state
      if (!state) this.reload()
    },

    onAmountChange(value, desc) {
      this.costLabel = `${this.$t('stdCols.cost')} ${desc}`
    },

    reload() {
      this.toggleSpinner(true)
      this.selectedPlan = null
      this.reloadPlanList()
      this.reloadTreatmentsList()
    },

    reloadPlanList() {
      this.toggleSpinner(true)
      if (!this.params.region || !this.params.year) {
        // TODO: Change to clear
        this.$store.commit('SET_DR_LIST', { key: 'plans', data: [] });
        this.toggleSpinner(false)
        return
      }

      const params = {
        region_id: this.params.region,
        year: this.params.year,
        forDropdown: true
      }
        // TODO: Change to plan_dropdown
        this.$store.dispatch('Planning/LOAD_PLAN_LIST', params).then(() => {
        this.toggleSpinner(false)
      })
    },

    reloadTreatmentsList() {
      this.toggleSpinner(true)

      this.selectedItems = []
      const filter = {
        work_list_id: this.params.work_list_id,
        region_id: this.params.region,
        is_budget_assigned: this.params.mode === 'assigned' ? 1 : null,
        budget_id: this.params.mode === 'current' ? this.budget.budget_id : null,
      }
      this.$store.dispatch('LOAD_ALL_WORKS', filter).then(() => {
        this.toggleSpinner(false)
      })
    },

    async unassignSelected() {
      if (this.selectedItems.length == 0) return;

      this.toggleSpinner(true)
      const { value: notes } = await this.textInput(
        this.$t("messages.confirm_unassignment_title"),
        this.$t('messages.confirm_remark'),
        this.$t('messages.confirm_unassignment', { count: this.selectedItems.length })
      )
      const payload = {
        treatment_id: this.selectedItems.map((work) => work.treatment_id),
        note: notes
      }
      this.selectedItems = []

      // Exit if user selects cancel
      if (!notes) {
        this.toggleSpinner(false)
        return
      }

      try {
        this.$store.dispatch('UNASSIGN_BUDGET', payload)
      } catch (error) {
        console.error('Error while deleting treatments:', error)
      }
      this.toggleSpinner(false)
      this.assignedMessage(-1, payload.treatment_id.length)  // -1 - to show that the works were unassigned
      this.reload()
    },

  },

  computed: {
    ...mapState({
      //tableData: (state) => state.TitleList.treatmentsList,
      //plansList: (state) => state.Planning.dropdownList
    }),
    ...mapGetters(['treatmentsByPlanId', 'treatmentsSummaryByPlanId', 'plansApproved', 'getAssignedTreatments'
    ]),

    tableData() {
      return this.params.mode === 'all'
        ? this.treatmentsByPlanId(this.selectedPlan)
        : this.getAssignedTreatments(this.budget?.budget_id)
          .filter(row => row.units != 0)
          .sort((a, b) => b.priority_index - a.priority_index)
    },

    plansList() {
      const res = this.plansApproved(this.params.region, this.params.year)
      res.unshift({ id: 0, name: '' })
      return res
    },

    budgetAmount() {
      return this.budget ? `${this.$t('label.budget')}: ${numFormat(this.budget.amount_kgs / this.showAmounts)} ` : ' '
    },

    budgetApproved() {
      return this.budget?.approved
    },

    showAssignButton() {
      return this.params.mode === 'current' && !this.budgetApproved && this.isBtnAllowed('AssignButton')
    },

    treatmentsSummary() {
      return this.treatmentsSummaryByPlanId(this.selectedPlan)
    },

    total() {
      return this.treatmentsSummary.totalRecords
    },

    dropdownsDisabled() {
      return this.total == 0
    },

    showUnassignButton() {
      return this.selectedItems.length > 0 && this.params.mode !== 'all'
    },

    allowSelection() {
      return this.params.mode !== 'all' && !this.budgetApproved
    },
  },

  watch: {
    params(newValue, oldValue) {
      if (newValue) this.reload()
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

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}
</style>