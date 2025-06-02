<!--
File: Plans.vue
Description: Component of Preparatory.vue, shows list of plans
-->
<template>
  <base-data-table
    v-if="eligible"
    :loading="showSpinner"
    :pagination="pagination"
    :from="from"
    :to="to"
    :total="total"
    :btnAddAllowed="isBtnAllowed('AddButton')"
    @add-item="viewItem()">

    <template #header-filters>
      <div :class="getSize(20)"><regions-dropdown v-model="selectedRegion" /></div>
      <div :class="getSize(15)"><YearsDropdown v-model="selectedYear" :items="yearsInPlanList" /></div>
      <div :class="getSize(15)"><search-input v-model="searchQuery" /></div>
      <div :class="getSize(15)"><AmountsDropdown v-model="showAmounts" @input="onAmountChange" /></div>
    </template>

    <template #header-buttons>
      <md-button v-if="showPrintBtn" class="md-success" @click="print"> {{ $t('buttons.print') }} </md-button>
      <md-button v-if="isBtnAllowed('ExportButton')" class="md-success" @click="exportPlans"> {{ $t('buttons.excel_export') }} </md-button>
    </template>

    <template #table-rows="{ item }">
      <base-table
        :items="queriedData"
        :headers="headers"
        :idFieldName="idFieldName"
        :sort="currentSort"
        :sortOrder="currentSortOrder">

        <template #table-actions="{ item }">
          <table-actions
            :btnExtraAllowed="isBtnAllowed('ApproveRevokeButton') && (item.assigned_treatments > 0 || !!item.approved_by_user_id)"
            :extraButtonClass="['md-raised', 'md-sm', item.approved_by_user_id ? 'md-primary' : 'md-success']"
            :btnExtraAsIcon="false"
            :extraButtonLabel="item.approved_by_user_id ? $t('buttons.revoke') : $t('buttons.approve')"
            :extraButtonStyle="'width: 100px;'"
            @extraButtonClicked="togglePlanApproval(item.id, item.name, !item.approved_by_user_id)"

            :btnEditAllowed="isBtnAllowed('EditButton')"
            :btnDeleteAllowed="isBtnAllowed('DeleteButton') && item.assigned_treatments == 0"
            @edit="viewItem(item)"
            @delete="deleteItem(item[idFieldName], item.name)" 
          />
        </template>
      </base-table>
    </template>

    <template #editing-dialog>
      <EditForm v-if="showEditForm" :plan="selectedPlan" @close="showEditForm = false" @saved="onPlanSave" />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { RegionsDropdown, YearsDropdown, AmountsDropdown, BaseTable, BaseDataTable, TableActions, SearchInput } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'
import {approvedMessage} from '@/mixins/messagesMixin'
import printReport from '@/mixins/printMixin'
import EditForm from './PlanEditForm.vue'

import { numFormat, dateFormat } from "@/store/helpers/format_helpers"
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export default {
  name: 'Plans',
  mixins: [BaseTableMixin, printReport],

  data() {
    return {
      formName: 'Plans',
      idFieldName: 'id',

      selectedRegion: null,
      selectedYear: null,
      showEditForm: false,
      selectedPlan: null,
      propsToSearch: ['region_description', 'name', 'year'],
      currentSort: 'region_description',

      showAmounts: 1000,
      costLabel: "Cost",

      historyMapping: {
        selectedRegion: 0,
        currentSort: 'region_description',
        currentSortOrder: 'asc',
        pagination: this.pagination,
        searchQuery: ''
      }
    }
  },

  props: {
    step: { default: 'first', type: String },
  },

  components: {
    RegionsDropdown,
    AmountsDropdown,
    YearsDropdown,
    BaseDataTable,
    BaseTable,
    SearchInput,
    TableActions,
    EditForm
  },

  async mounted() {
    this.onAmountChange(this.showAmounts, '', this.$t("label.short_thousands"));
  },

  methods: {
    ...mapActions({
      clearList: 'Planning/CLEAR_PLAN_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'Planning/LOAD_PLAN_LIST',

      loadAllWorks: 'LOAD_ALL_WORKS',
      approvePlan: 'Planning/APPROVE_PLAN',
      cancelPlan: 'Planning/CANCEL_PLAN',
      delete: 'Planning/DELETE_PLAN',
    }),

    onAmountChange(value, long_desc, desc) {
      this.costLabel = `${this.$t('stdCols.cost')} ${desc}`
    },

    viewItem(item) {
      this.selectedPlan = item
      this.showEditForm = true
    },

    async onPlanSave() {
      this.showEditForm = false
      await this.reloadData()
    },

    async togglePlanApproval(id, name, status) {
      this.toggleSpinner(true)
      const action = status ? this.approvePlan : this.cancelPlan

      try {
        await action(id)
      } finally {
        this.toggleSpinner(false)
      }
      await this.reloadData()
      await approvedMessage(status, name)

      this.highlightRow(id)
    },

    async loadTreatmentsList() {
      const worklist = !this.savedWorksList ? null : this.savedWorksList.find(el => el.year == this.selectedYear)?.work_list_id
      if (!worklist) {
        return
      }

      this.toggleSpinner(true)
      const params = {
        work_list_id: worklist,
        region_id: this.selectedRegion,
        //     is_plan_assigned: 1,
        is_approved_plan_assigned: 1,
        //     is_budget_assigned: 0,
      }
      await this.loadAllWorks(params)
      this.toggleSpinner(false)
    },

    async print() {
      if (!this.selectedYear) return
      this.showSpinner = true

      await this.loadTreatmentsList()

      if (this.treatmentsGroupedByPlan.length == 0) {
        // noting to print
        this.showSpinner = false
        return
      }
      this.printReport('', this.getTableHeaders, this.getTableRows)
      this.showSpinner = false
    },

    fillWorkSheet(workbook, workbookName) {
      const headerCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } } // Blue
      const totalCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } } // yellow
      const worksheet = workbook.addWorksheet(workbookName)

      // Set the table headers
      worksheet.columns = this.getWorksheetColumns

      // Apply formatting to the table headers
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell({ includeEmpty: true }, (cell) => { cell.fill = headerCellFill })
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Number formatting for the columns
      worksheet.getColumn('units').numFmt = '#,##0.00'
      worksheet.getColumn('cost').numFmt = '#,##0.00'

      for (const [groupName, group] of Object.entries(this.treatmentsGroupedByPlan)) {
        let row = worksheet.addRow(['', groupName])
        row.font = { bold: true }

        group.forEach(item => {
          worksheet.addRow(item)
        })

        // Group total row
        row = worksheet.addRow(
          this.getWorksheetColumns.map(col => {
            if (col.group) {
              return this.$t('label.total');
            }
            if (col.totals) {
              return this.treatmentsGroupTotals[groupName][col.totals];
            }
            return '';
          })
        );
        row.font = { bold: true };
        row.eachCell({ includeEmpty: true }, (cell) => { cell.fill = totalCellFill });
      }
    },

    async exportPlans() {
      if (!this.selectedYear) return
      this.showSpinner = true

      await this.loadTreatmentsList()
      if (this.treatmentsGroupedByPlan.length == 0) {
        // nothing to print
        this.showSpinner = false
        return
      }

      const workbook = new ExcelJS.Workbook();
      this.fillWorkSheet(workbook, this.$t('label.plans'))

      // Генерация Excel файла и сохранение
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${this.$t('label.approved_plans')}-${this.selectedYear}.xlsx`);
    }
  },

  computed: {
    ...mapState({
      savedWorksList: (state) => state.TitleList.worksLists,
      treatmentsList: (state) => state.TitleList.treatmentsList,

      planList: (state) => state.Planning.plan_list
    }),
    ...mapGetters('Planning', ['planListByYear', 'yearsInPlanList', 'plansApproved']),

    tableData() {
      return this.planListByYear(this.selectedYear)
      .map(item => ({
        ...item,
        approved: !item.approved_by_user_id ? this.$t('buttons.no') : dateFormat(item.approved_on)
      }));
    },

    showPrintBtn() {
      return this.isBtnAllowed('PrintButton') && this.plansApproved(null, this.selectedYear, false).length > 0
    },

    treatmentsGroupedByPlan() {
      let index = 0
      let res = this.treatmentsList
        .sort((a, b) => {
          const planDescA = a.plan_description || ''
          const planDescB = b.plan_description || ''
          let sortRes = planDescA.localeCompare(planDescB, undefined, { sensitivity: 'base' })
          if (sortRes == 0) {
            const descA = a.section_description || ''
            const descB = b.section_description || ''
            sortRes = descA.localeCompare(descB, undefined, { sensitivity: 'base' });
          }
          if (sortRes == 0) { sortRes = a.start_m - b.start_m }
          return sortRes
        })

        .reduce((groups, row) => {
          const group = `${this.$t('label.from_region', { name: row.region_description })}, 
                                          ${this.$t('label.plan_name', { name: row.plan_description })}`
          if (!groups[group]) {
            groups[group] = [];
            index = 0
          }
          //index++
          groups[group].push({
            id: ++index,
            ...row,
            cost: row.cost / this.showAmounts,
          });
          return groups;
        }, {})
      return res
    },

    treatmentsGroupTotals() {
      return Object.keys(this.treatmentsGroupedByPlan).reduce((totals, groupName) => {
        totals[groupName] = {
          totalCost: this.treatmentsGroupedByPlan[groupName].reduce((sum, row) => sum + row.cost, 0),
          //totalUnits: this.treatmentsGroupedByPlan[groupName].reduce((sum, row) => sum + row.units, 0)
        }
        return totals
      }, {});
    },

    headers() {
      return [
        { header: this.$t('road_network.region'), key: 'region_description', width: 15, sortable: true },
        { header: this.$t('stdCols.name'), key: 'name', width: 50, sortable: true },
        { header: this.$t('stdCols.year'), key: 'year', width: 10, sortable: true },
        { header: this.$t('stdCols.created_at'), key: 'created_at', width: 10, date: true, sortable: true },
        { header: this.$t('budget.works_count'), key: 'assigned_treatments', width: 10, num: true, digits: 0, sortable: true },
        { header: this.$t('label.approved'), key: 'approved', width: 10, sortable: true },
      ];
    },

    getWorksheetColumns() {
      return [
        { header: this.$t('stdCols.id'), key: 'id', width: 5, num: true, digits: 0 },
        { header: this.$t('road_network.section'), key: 'section_description', width: 50, group: true },
        { header: this.$t('inventory.start_distance_m'), key: 'start_m', width: 10, num: true, digits: 0 },
        { header: this.$t('inventory.end_distance_m'), key: 'end_m', width: 10, num: true, digits: 0 },
        { header: this.$t('label.units'), key: 'unit_description', width: 10 },
        { header: this.$t('label.quantity'), key: 'units', width: 10, num: true, digits: 2 },
        { header: this.$t('treatment.treatment_desc'), key: 'treatment_type_description', width: 25 },
        { header: this.costLabel, key: 'cost', width: 20, num: true, digits: 2, totals: 'totalCost' },
      ];
    },

    getTableRows() {
      const columns = this.getWorksheetColumns
      let tableRows = '';

      for (const [groupName, group] of Object.entries(this.treatmentsGroupedByPlan)) {
        // Row with group name
        tableRows += `<tr style="background-color: rgb(255, 255, 0);">
            <td>&nbsp;</td><td colspan=7>${groupName}</td>
          </tr>`
        //          ${columns.map(col => `<td>${col.group ? groupName : '&nbsp;'}</td>`).join('')}

        // rows
        group.forEach((row) => {
          tableRows += `<tr>
              ${columns.map(col => col.num ? `<td class='numCell'>${numFormat(row[col.key], col.digits)}</td>`
            : `<td>${row[col.key]}</td>`).join('')}
              </tr>`;
        });

        // Group total row
        const cols = columns.map(col => {
          if (col.group) {
            return `<td>${this.$t('label.total')}</td>`;
          }

          if (col.totals) {
            return `<td class="numCell">${numFormat(this.treatmentsGroupTotals[groupName][col.totals])}</td>`;
          }

          return '<td>&nbsp;</td>';
        }).join('')
        tableRows += `<tr style="background-color: rgb(204, 221, 255);">${cols}</tr>`;
      }
      return tableRows;
    },
  },

  watch: {
    step(value) {
      if (value === 'third') this.reloadData()
    },

    selectedRegion(newVal) {
      this.payload = { region_id: newVal };
      this.reloadData();
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>