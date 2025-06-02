<!--
File: PlanDetails.vue
Description: show list of Routine Maintenance Plan details.
-->
<template>
  <base-data-table
    v-if="eligible"
    :loading="showSpinner"
    :pagination="pagination"
    :from="from"
    :to="to"
    :total="total"
    @add-item="viewItem()">

    <template #table-rows="{ item }">
      <base-table
        :items="queriedData"
        :headers="headers"
        :idFieldName="idFieldName"
        :sort="currentSort"
        :sortOrder="currentSortOrder">

        <template #table-actions="{ item }">
          <table-actions v-if="!planApproved"
            :btnExtraAllowed="true"
            :extraButtonClass="'md-just-icon md-success md-simple'"
            :btnExtraAsIcon="true"
            :extraButtonIcon="'content_copy'"
            :btnExtraStyle="true"
            :extraButtonLabel="$t('buttons.copy')"
            @extraButtonClicked="copyItem(item)"

            :btnEditAllowed="isBtnAllowed('EditButton')"
            :btnDeleteAllowed="isBtnAllowed('DeleteButton')"
            @edit="viewItem(item[idFieldName])"
            @delete="deleteItem(item[idFieldName], item.description)" 
          />
        </template>
      </base-table>

      <div class="footer-table md-table">
        <table>
          <tfoot>
            <tr>
              <th v-for="item in footerTable" :key="item" class="md-table-head">
                <div class="md-table-head-container md-ripple md-disabled">
                  <div class="md-table-head-label">{{ item }}</div>
                </div>
              </th>
            </tr>
          </tfoot>
        </table>
      </div>
    </template>

    <template #editing-dialog>
      <EditForm
        v-if="showDetailsDlg"
        ref="dynamicForm"
        :formName="formName"
        :actionBase="'rm_plan_detail'"
        :idFieldName="idFieldName"
        :moduleName="'Planning'"
        :itemId="currentId"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('tabs.plan_details')"
        @close="showDetailsDlg = false">
      </EditForm>
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { BaseDataTable, BaseTable, TableActions } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin';
import { numFormat } from "@/store/helpers/format_helpers"
import { savedMessage } from '@/mixins/messagesMixin';
import { EditForm } from '@/pages/Components'

export default {
  name: 'test-rm-plan-details',
  mixins: [BaseTableMixin],

  components: {
    BaseDataTable,
    BaseTable,
    TableActions,
    EditForm
  },

  data() {
    return {
      formName: 'PlanDetails',
      idFieldName: 'routine_plan_details_id',
      currentSort: 'treatment_type_description',

      payload: { fk_routine_plan: -1 },
      selectedYear: null,
      selectedRoad: -1,

      historyMapping: {
        selectedRegion: 0,
        currentSort: 'description',
        currentSortOrder: 'asc',
        pagination: this.pagination,
        searchQuery: ''
      }
    }
  },

  props: {
    step: { default: '', type: String },
    filterParams: { default: {}, type: Object },
  },

  async mounted() {
    this.payload.fk_work_category = -1;
    await this.loadPlans({});
  },

  methods: {
    ...mapActions({
      loadPlans: 'Planning/LOAD_RM_PLAN_LIST',
      clearList: 'Planning/CLEAR_RM_PLAN_DETAIL_LIST',
      loadList: 'Planning/LOAD_RM_PLAN_DETAIL_LIST',
      addItem: 'Planning/ADD_NEW_RM_PLAN_DETAIL',
      delete: 'Planning/DELETE_RM_PLAN_DETAIL',
      approvePlan: 'Planning/APPROVE_RM_PLAN',
      cancelPlan: 'Planning/CANCEL_RM_PLAN',
    }),

    async parseFilterParams() {
      await this.clearList();

      this.selectedYear = this.filterParams?.year || -1; //this.thisYear;
      if (!this.selectedYear || !this.filterParams?.fk_region || !this.filterParams?.fk_deu || !this.filterParams?.fk_work_category) { return; }
      const payload = {
        year: this.selectedYear,
        region_id: this.filterParams?.fk_region,
        deu_id: this.filterParams?.fk_deu,
        work_category_id: this.filterParams?.fk_work_category || -1,
      };
      await this.loadPlans(payload);

      this.payload = { routine_plan_id: this.curPlan };
      await this.reloadData();
    },

    async copyItem(item) {
      let errDesc = '';
      let newId;
      const newItem = {
        fk_routine_plan: item.fk_routine_plan,
        fk_road: item.fk_road,
        fk_treatment_type: item.fk_treatment_type,
        fk_unit: item.fk_unit,
        cost: item.cost || 0,

        start_m: item.start_m,
        end_m: item.end_m,
        volume: item.volume,
        cycle_ratio: item.cycle_ratio,
      };

      try {
        const res = await this.addItem(newItem);
        newId = res?.routine_plan_details_id;
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error');
      }
      await savedMessage(errDesc, this.$t('messages.treatment_copied'), item.treatment_description);
      await this.parseFilterParams();

      this.highlightRow(newId)
    },
  },

  computed: {
    ...mapState({
    }),

    ...mapGetters('Planning', ['rmPlansDetailsFiltered', 'rmPlanDetailSummary', 'currentPlan']),

    tableData() {
      // Do not show anything until user selects a road
      return this.rmPlansDetailsFiltered(this.filterParams?.fk_road || -1, this.filterParams?.fk_treatment);
    },

    headers() {
      return [
        { header: "stdCols.description", key: "treatment_type_description", sortable: true },
        { header: "inventory.start_distance_m", key: "start_m", sortable: true, num: true },
        { header: "inventory.end_distance_m", key: "end_m", sortable: true,num: true  },
        { header: "label.volume", key: "volume", sortable: true, num: true },
        { header: "label.units", key: "unit_description", sortable: true },
        { header: "label.rate", key: "cost", sortable: true, num: true, digits: 2 },
        { header: "label.cycle_ratio", key: "cycle_ratio", sortable: true, num: true, digits: 0 },
        { header: "budget.total_cost", key: "total_cost", sortable: true, num: true, digits: 2 },
      ]
    },

    planApproved() {
      return this.currentPlan(this.selectedYear).status == 2;
    },

    curPlan() {
      return this.currentPlan(this.selectedYear).id;
    },
 
    fields() {
      return [ 
        { name: 'fk_routine_plan', type: 'hidden', default: 'fk_routine_plan' },
        { name: 'fk_unit', type: 'hidden', default: 'fk_unit' },
        { name: 'fk_road', label: 'road_network.road', type: 'hidden', default: 'fk_road' },
        
        { name: 'fk_treatment_type', type: 'custom', component: 'TreatmentsDropdown', class: 'md-layout-item md-size-100', props: { routine: 1 } },
        { name: 'start_m', label: 'inventory.start_distance_m', type: 'number', class: 'md-layout-item md-size-40' },
        { name: 'end_m', label: 'inventory.end_distance_m', type: 'number', class: 'md-layout-item md-size-40' },
        { name: 'volume', label: 'volume', type: 'number', class: 'md-layout-item md-size-40' },
        { name: 'cost', label: 'stdCols.cost', type: 'number', class: 'md-layout-item md-size-40' },
        { name: 'cycle_ratio', label: 'cycle_ratio', type: 'number', class: 'md-layout-item md-size-40' },
      ]
    },

    validations() {
      return {
        fk_treatment: { required: true, numeric: true, min_value: 1 },
        start_m: { required: true, numeric: true },
        end_m: { required: true, numeric: true },
        volume: { required: true, decimal: true, min_value: 0.1 },
        cost: { required: true, decimal: true, min_value: 0.1 },
        cycle_ratio: { required: true, numeric: true },
      }
    },

    footerTable() {
      const total = this.rmPlanDetailSummary(this.filterParams?.fk_road || -1, this.filterParams?.fk_treatment);

      return [
        this.$t('label.total'),
        `${this.$t('budget.works_count')}: ${numFormat(total.totalRecords, 0)}`,
        `${this.$t('budget.amount')}: ${numFormat(total.totalAmount)}`
      ];
    }
  },

  watch: {
    async step(newValue, oldValue) {
      if (newValue !== oldValue && newValue === 'second') {
        await this.parseFilterParams();
      };
    },

    filterParams: {
      async handler(value) {
        await this.parseFilterParams();
      },
      deep: true
    },
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>