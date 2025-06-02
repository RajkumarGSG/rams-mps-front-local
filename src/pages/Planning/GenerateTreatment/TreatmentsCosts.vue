<!--
File: TreatmentsCosts.vue
Description: component of the Preparatory.vue almost same as WorkList component in TitleList.
-->
<template>
  <base-data-table
    v-if="eligible"
    :loading="showSpinner"
    :showPagination="false">

    <template #header-filters>
      <div :class="getSize(15)"><YearsDropdown v-model="selectedWorklist" :items="yearsInWorkList" /></div>
      <div :class="getSize(20)"><regions-dropdown v-model="selectedRegion"  @input="onRegionChange" /></div>
      <div :class="getSize(20)"><RoadsDropdown v-model="selectedRoad" :items="roadsInTreatmentsList" /></div>
      <div :class="getSize(15)"><AmountsDropdown v-model="showAmounts" @input="onAmountChange" /></div>
    </template>

    <template #header-buttons>
      <md-button v-if="isBtnAllowed('CreateButton')" class="md-success" @click="checkAndGenerate"> {{ $t('buttons.generate') }} </md-button>
      <md-button v-if="exportEnabled" class="md-raised md-success" @click="exportToExcel"> {{ $t('buttons.excel_export') }} </md-button>
    </template>

    <template #table-rows="{ item }">
      <base-table
        :items="tableData"
        :headers="headers"
        :sort="currentSort"
        :sortOrder="currentSortOrder"
        :showActions="false" />

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
  </base-data-table>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { BaseDataTable, BaseTable, RegionsDropdown, RoadsDropdown, YearsDropdown, AmountsDropdown } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'
import { errorMessage, dropdownInput, confirmation, successMessage } from '@/mixins/messagesMixin'
import { numFormat } from "@/store/helpers/format_helpers"

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver' // for saving excel file

export default {
  name: 'TreatmentsCosts',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'TreatmentsCosts',
      idFieldName: '',

      selectedWorklist: null,
      selectedRegion: null,
      selectedRegionDesc: null,
      selectedRoad: null,
      showAmounts: 1000,
      costLabel: "Cost",

      currentSort: 'priority_index',
      currentSortOrder: 'desc',

      historyMapping: { // necessary for the BaseTableMixin
        selectedRegion: 0,
        currentSort: 'priority_index',
        currentSortOrder: 'desc',
        pagination: this.pagination,
        searchQuery: ''
      }
    }
  },

  components: {
    RegionsDropdown,
    RoadsDropdown,
    YearsDropdown,
    AmountsDropdown,
    BaseDataTable,
    BaseTable,
  },

  async mounted() {
    this.onAmountChange(this.showAmounts, '', this.$t("label.short_thousands"));
  },

  methods: {
    ...mapActions({
      clearList: 'RESET_TREATMENTS',
      loadList: 'LOAD_WORKS_LISTS',
      delWorkList: 'DEL_WORK_LIST',
      generateWorks: 'GENERATE_WORKS',
      loadWorkList: 'LOAD_ALL_WORKS'
    }),

    onAmountChange(value, long_desc, desc) {
      this.costLabel = `${this.$t('stdCols.cost')} ${desc}`
    },

    async reloadTreatments() {
      this.toggleSpinner(true)
      const payload = {
        work_list_id: this.selectedWorklist,
        region_id: this.selectedRegion,
      }

      try {
        await this.loadWorkList(payload);
      } finally {
        this.toggleSpinner(false)
      }
    },

    async onRegionChange(region_id, regionDescr) {
      this.selectedRegionDesc = regionDescr;
      await this.reloadTreatments();
    },

    async checkAndGenerate() {
      // Check whether there are approved homo_sections
      if (Object.keys(this.approvedYearsInHSList).length === 0) {
        await errorMessage(this.$t('messages.no_approved_homosections'));
        return;
      };
      this.toggleSpinner(true);

      const { value: theYear } = await dropdownInput(
        this.$t('messages.treatment_generation_title'),
        this.$t('selections.select_year'),
        this.approvedYearsInHSList
      );
      if (!theYear) {
        this.toggleSpinner(false);
        return;
      };

      // Check if already generated for this year
      const worksExist = this.savedWorksList.find(el => el.year == theYear);
      if (worksExist) {
        // Treatment list for the selected year exist, ask user whether to delete it
        const { isConfirmed } = await confirmation(
          this.$t('messages.treatment_exists_title'),
          this.$t('messages.treatment_exists')
        );

        // Exit if user selects cancel
        if (!isConfirmed) {
          this.toggleSpinner(false);
          return;
        }

        try {
          await this.delWorkList(worksExist.work_list_id);
        } catch (err) {
          this.toggleSpinner(false);
          await errorMessage(this.$t('error.del_work_list'));
          return;
        }
      }

      // Generate the treatment works
      const res = await this.generateWorks(theYear);
      await this.loadList({});
      this.selectedWorklist = res.work_list_id;
      await successMessage(this.$t('messages.generated'), '');
      this.toggleSpinner(false)
    },

    formatRow(row, header = false, center = false) {
      // Apply formatting to the table header/footer
      const headerCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } } // Blue
      const totalCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } } // yellow

      row.eachCell({ includeEmpty: true }, (cell) => { cell.fill = header ? headerCellFill : totalCellFill })
      row.font = { bold: true, color: { argb: header ? 'FFFFFFFF' : '00000000' } } // White text
      row.alignment = center ? { vertical: 'middle', horizontal: 'center' } : {}
    },

    async exportToExcel() {
      // Create new Excel file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(this.selectedYear);

      // Set and format the table headers
      worksheet.columns = this.getWorksheetColumns
      this.formatRow(worksheet.getRow(1), true, true)

      // Number formatting for the columns
      this.getWorksheetColumns.forEach(item => {
        if (item.num) worksheet.getColumn(item.key).numFmt = item.digits == 2 ? '#,##0.00' : '#,##0.000'
      })

      // Заполняем данные из this.tableData
      this.tableData.forEach(item => {
        const newRow = { ...item };
        newRow.start_m /= 1000;
        newRow.end_m /= 1000;
        worksheet.addRow(newRow);
      });

      // Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${this.$t('tabs.treatment_costs')}-${this.selectedRegionDesc || ''}${this.selectedYear}.xlsx`);
    }
  },

  computed: {
    ...mapState({
      savedWorksList: (state) => state.TitleList.worksLists,
      treatmentsList: (state) => state.TitleList.treatmentsList,
    }),

    ...mapGetters(['treatmentsSummary', 'yearsInWorkList', 'approvedYearsInHSList', 'roadsInTreatmentsList', 'filteredTreatments']),

    selectedYear() {
      return this.yearsInWorkList.find(el => el.id == this.selectedWorklist)?.description.toString() || ''
    },

    footerTable() {
      const summary = this.treatmentsSummary(this.selectedRoad, this.showAmounts);
      return [
        this.$t('label.total'),
        `${this.$t('budget.works_count')}: ${numFormat(summary.totalRecords, 0)}`,
        `${this.$t('budget.total_cost')}: ${numFormat(summary.totalSum, 2)}`,
      ]
    },

    tableData() {
      return this.filteredTreatments(this.selectedRoad, this.showAmounts);
    },

    exportEnabled() {
      return this.tableData.length > 0
    },

    headers() {
      return [
        { header: this.$t('road_network.road'), key: 'road_key', width: 15, sortable: true },
        { header: this.$t('road_network.section_description'), key: 'section_description', width: 50, sortable: true },
        { header: this.$t('road_network.start_km'), key: 'start_m', width: 10, num: true, digits: 3, sortable: true },
        { header: this.$t('road_network.end_km'), key: 'end_m', width: 10, num: true, digits: 3, sortable: true },
        { header: this.$t('label.quantity'), key: 'units', width: 10, num: true, digits: 2, sortable: true },
        { header: this.$t('label.units'), key: 'unit_description', width: 10, sortable: true },
        { header: this.$t('treatment.treatment_desc'), key: 'treatment_type_description', width: 40, sortable: true },
        { header: this.$t('condition.priority_index'), key: 'priority_index', width: 10, sortable: true },
        { header: this.costLabel, key: 'cost', width: 15, num: true, digits: 2, sortable: true },
      ];
    },

    getWorksheetColumns() {
      const columns = [
        { header: this.$t('road_network.region'), key: 'region_description', width: 30 },
        { header: this.$t('road_network.dep'), key: 'deu_description', width: 10 },
      ];
      return columns.concat(this.headers)
    },

  },

  watch: {
    async selectedWorklist(value) {
      await this.reloadTreatments();
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>