<!--
File: Planning/RoutineMaintenance/Plans.vue
Description: show list of Routine Maintenance Plans.
-->
<template>
  <base-data-table
    v-if="eligible"
    :loading="showSpinner"
    :pagination="pagination"
    :from="from"
    :to="to"
    :total="total"
    :btnAddAllowed="false">

    <template #table-rows>
      <base-table
        :items="queriedData"
        :headers="headers"
        :idFieldName="idFieldName"
        :sort="currentSort"
        :sortOrder="currentSortOrder">

        <template #table-actions="{ item }">
          <table-actions
            :btnExtraAllowed="isBtnAllowed('ApproveRevokeButton') && step === 'third'"
            :extraButtonClass="['md-raised', 'md-sm', item.approved_by_user_id ? 'md-primary' : 'md-success']"
            :extraButtonLabel="item.approved_by_user_id ? $t('buttons.revoke') : $t('buttons.approve')"
            :extraButtonStyle="'width: 100px;'"
            @extraButtonClicked="togglePlanApproval(item[idFieldName], `${item.deu_description} ${item.work_category_description}`, !item.approved_by_user_id)"

            :btnEditAllowed="isBtnAllowed('EditButton') && !item.approved_by_user_id && step === 'third' && false"
            :btnDeleteAllowed="isBtnAllowed('DeleteButton') && !item.approved_by_user_id && step === 'third'"
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
        v-model="itemValues"
        :actionBase="'rm_plan'"
        :idFieldName="idFieldName"
        :moduleName="'Planning'"
        :itemId="currentId"
        @close="onEditFormClose">

        <template #fields_after>
          <div :class="getSize(40)"><DepsDropdown :class="getClass('fk_deu')" 
            v-model="itemValues.fk_deu" :regionId="itemValues.fk_region" />
          </div>
        </template>
      </EditForm>
    </template>
  </base-data-table>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import { BaseDataTable, BaseTable, TableActions, DepsDropdown } from "@/pages/Components";
import { approvedMessage } from '@/mixins/messagesMixin'
import { numFormat } from "@/store/helpers/format_helpers"
import BaseTableMixin from '@/mixins/BaseTableMixin';
import EditForm from './PlanEditForm.vue';

export default {
  name: 'routine-maintenance-plans-list',
  mixins: [BaseTableMixin],

  components: {
    BaseDataTable,
    BaseTable,
    TableActions,
    EditForm,
    DepsDropdown
  },

  data() {
    return {
      formName: 'Plans',
      eligible: true,
      idFieldName: 'routine_plan_id',
      propsToSearch: ['year', 'region_description', 'deu_description'],
      currentSort: 'year',

      selectedPlan: null,
      fk_region: null,

      historyMapping: {
        selectedRegion: 0,
        currentSort: 'description',
        currentSortOrder: 'asc',
        pagination: this.pagination,
        searchQuery: ''
      },
    }
  },

  props: {
    step: { default: 'first', type: String },
    filterParams: { default: {}, type: Object },
  },

  async mounted() {
  },

  methods: {
    ...mapActions({
      clearList: 'Planning/CLEAR_RM_PLAN_LIST',  // Called from the BaseTableMixin's mount()
      loadList: 'Planning/LOAD_RM_PLAN_LIST',
      delete: 'Planning/DELETE_RM_PLAN',
      approvePlan: 'Planning/APPROVE_RM_PLAN',
      cancelPlan: 'Planning/CANCEL_RM_PLAN',
    }),

    toggleSpinner(state) {
      this.showSpinner = state
    },

    async onEditFormClose() {
      this.showDetailsDlg = false;
      await this.reloadData();
      //console.log(JSON.stringify(this.tableData))
    },

    async togglePlanApproval(id, name, status) {
      if (this.step !== 'third') return;

      this.toggleSpinner(true);
      const action = status ? this.approvePlan : this.cancelPlan;

      try {
        await action(id);
      } finally {
        this.toggleSpinner(false);
      }
      await this.reloadData();
      await approvedMessage(status, name);

      this.highlightRow(id);
    },

  },

  computed: {
    ...mapGetters('Planning', ['rmPlansWithPrefix', 'rmPlansSummary']),

    tableData() {
      return this.rmPlansWithPrefix(this.filterParams?.year, this.$t('road_network.dep'), this.$t('buttons.no'));
    },

    headers() {
      return [
        { header: 'stdCols.year', key: 'year', sortable: true },
        { header: 'road_network.region', key: 'region_description', sortable: true },
        { header: 'road_network.dep', key: 'deu_description', sortable: true },
        { header: 'stdCols.type', key: 'work_category_description', sortable: true },
        { header: 'budget.total_cost', key: 'total_cost', sortable: true, num: true, digits: 2 },
        { header: 'budget.works_count', key: 'treatment_count', sortable: true, num: true, digits: 0 },
        { header: 'label.approved', key: 'approved_at', sortable: true, date: true },
      ]
    },

    itemValues() {
      const currItem = this.tableData.find(item => item.routine_plan_id == this.currentId);
      return {
        year: currItem.year,
        fk_region: currItem.fk_region,
        fk_deu: currItem.fk_deu,
        fk_work_category: currItem.fk_work_category,
      };
    },

    footerTable() {
      const total = this.rmPlansSummary(this.filterParams?.year);

      return [
        this.$t('label.total'),
        `${this.$t('budget.plans_count')}: ${numFormat(total.totalRecords, 0)}`,
        `${this.$t('budget.treatment_types_count')}: ${numFormat(total.totalTreatmentTypes, 0)}`,
        `${this.$t('budget.amount')}: ${numFormat(total.totalAmount)}`
      ];
    }
  },

  watch: {
    async step(newValue, oldValue) {
      if (newValue !== oldValue && newValue === 'third') {
        await this.reloadData();
      };
    },

    filterParams: {
      async handler(value) {
        this.payload = {
          year: value?.year,
          region_id: value?.fk_region  || 0,
          deu_id: value?.fk_deu || 0,
          work_category_id: value?.fk_work_category || 0,
        };
        await this.reloadData();
      },
      deep: true
    },
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>