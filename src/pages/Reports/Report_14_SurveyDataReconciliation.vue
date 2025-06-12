<!--
File: Report_14_SurveyDataReconciliation.vue
Description: produce report showing Region/DEU-wise Condition index.
-->
<template>
  <md-card v-if="eligible">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-15">
          <YearsDropdown :label="$t('label.survey_year')" v-model="selectedYear" :items="yearList" @input="onYearSelected" />
        </div>
        <div class="md-layout-item btn-row md-small-size-100">
          <md-button class="md-success" @click="print" 
            :disabled="btnDisabled || emptyData">
            <!-- v-if="isBtnAllowed('PrintButton')"  -->
            {{ $t('buttons.print') }}
          </md-button>
          <md-button class="md-raised md-success" @click="exportToExcel"
            :disabled="btnDisabled">
            <!-- v-if="isBtnAllowed('ExportButton')"  -->
            {{ $t('buttons.excel_export') }}
          </md-button>
        </div>
      </div>
    </md-card-header>

    <md-card-content>
      <md-progress-spinner v-if="showSpinner == true" :md-diameter="70" md-mode="indeterminate" />
      <md-table class="paginated-table table-striped table-hover" :value="report" :md-sort.sync="currentSort"
        :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')"
          :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell :md-label="$t('label.survey_year')" md-sort-by="survey_year" md-numeric>
            {{ item.survey_year | numFormat  }}
          </md-table-cell>

          <md-table-cell :md-label="$t('traffic.road_key')" md-sort-by="road_key">
            {{ item.road_key }}
          </md-table-cell>

          <md-table-cell :md-label="$t('traffic.section_id')" md-sort-by="section_id" md-numeric>
            {{ item.section_id | numFormat }}
          </md-table-cell>

          <md-table-cell :md-label="$t('traffic.section_description')" md-sort-by="section_description">
            {{ item.section_description }}
          </md-table-cell>

          <md-table-cell :md-label="$t('traffic.length_km')" md-sort-by="length_km" md-numeric>
            {{ item.length_km | numFormat }}
          </md-table-cell>

          <md-table-cell :md-label="$t('traffic.iri_length_km')" md-sort-by="iri_length_km" md-numeric>
            {{ item.iri_length_km | numFormat }}
          </md-table-cell>

          <md-table-cell :md-label="$t('traffic.rutting_length_km')" md-sort-by="rutting_length_km" md-numeric>
            {{ item.rutting_length_km | numFormat }}
          </md-table-cell>

          <md-table-cell :md-label="$t('traffic.distress_length_km')" md-sort-by="distress_length_km" md-numeric>
            {{ item.distress_length_km | numFormat }}
          </md-table-cell>
        </md-table-row>
      </md-table>
    </md-card-content>
  </md-card>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { YearsDropdown } from '@/pages/Components'
import { numFormat } from "@/store/helpers/format_helpers"
import { customSortMixin } from '@/mixins/customSortMixin'
import { onClose } from '@/mixins/onCloseMixin'
import permissions from "@/mixins/permissionsMixin"
import printReport from '@/mixins/printMixin'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const baseColumns = [
  { header: 'label.survey_year', key: 'survey_year', width: 10, num: true, digits: 0 },
  { header: 'traffic.road_key', key: 'road_key', width: 20 },
  { header: 'traffic.section_id', key: 'section_id', width: 10, num: true, digits: 0 },
  { header: 'traffic.section_description', key: 'section_description', width: 30 },
  { header: 'traffic.length_km', key: 'length_km', width: 10, num: true, digits: 0 },
  { header: 'traffic.iri_length_km', key: 'iri_length_km', width: 10, num: true, digits: 3 },
  { header: 'traffic.rutting_length_km', key: 'rutting_length_km', width: 10, num: true, digits: 3 },
  { header: 'traffic.distress_length_km', key: 'distress_length_km', width: 10, num: true, digits: 3 }
]


export default {
  name: 'report-survey_data_reconciliation',
  mixins: [permissions, customSortMixin, printReport],
  data() {
    return {
      formName: 'Report_14_SurveyDataReconciliation',
      eligible: false,

      selectedYear: null,
      btnDisabled: true,

      showSpinner: false,
      currentSort: 'road_key',
      currentSortOrder: 'asc',
      
      yearList: [],
    }
  },
  components: {
    YearsDropdown,
  },

  async mounted() {
    console.log('Report_14_SurveyDataReconciliation mounted');
   // this.clearReport(14); // Clear previous report data

    this.eligible = await this.checkIfScreenAllowed();
    this.eligible = true; // TODO: revert later

    console.log('Report_14_SurveyDataReconciliation.mounted() eligible:', this.eligible);
    
    if (!this.eligible) {
      this.onClose();
      return;
    }
    
    // console.log('loadSurveyYears() called to load survey years');
    // const response = await this.loadSurveyYears();
    // console.log('loadSurveyYears() response:', response.data);

    // // Defensive check
    // if (response && Array.isArray(response.data)) {
    //   this.yearList = response.data;
    // } else {
    //   this.yearList = [];  // fallback empty array
    // }

    console.log('mounted() Survey years loaded:', this.yearList);

    // if (this.selectedYear == null && this.yearList.length > 0) {
    //   this.selectedYear = this.yearList[0];
    // }
  },
  
  beforeDestroy() {
    console.log('Report_14_SurveyDataReconciliation beforeDestroy');
    // this.stopPolling()
    this.clearReport(14); // Clear report data on component destroy
    console.log('Report_14_SurveyDataReconciliation beforeDestroy: cleared report(14)');
  },

  methods: {
    ...mapActions({
      clearReport: 'CLEAR_REPORT',
      loadReportData: 'REPORT_14_SURVEY_DATA_RECONCILIATION',
      loadSurveyYears: 'LOAD_YEAR_LIST',
    }),
    onClose,

   async reloadData() {
      console.log('Report_14_SurveyDataReconciliation reloadData() called with selectedYear:', this.selectedYear);
      
      this.showSpinner = true;
      this.btnDisabled = true;

      const report_params = { survey_year: this.selectedYear };
      try {
        console.log('Report_14_SurveyDataReconciliation reloadData() report_params:', report_params);
        await this.loadReportData(report_params);
        console.log('Report_14_SurveyDataReconciliation reloadData() report loaded:', this.report);
      } finally {
        this.showSpinner = false;
        this.btnDisabled = false;
      }
    },

    print() {
      console.log('Report_14_SurveyDataReconciliation print() called');
      this.showSpinner = true
      this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
      this.showSpinner = false
      console.log('Report_14_SurveyDataReconciliation print() completed');
    },

    fillWorkSheet(workbook, workbookName) {
      console.log('Report_14_SurveyDataReconciliation fillWorkSheet() called');
      this.generateWorkSheet(workbook, workbookName, this.$t('reports.report14_title'), this.report);
      console.log('Report_14_SurveyDataReconciliation fillWorkSheet() completed');
    },

    async exportToExcel() {
      console.log('Report_14_SurveyDataReconciliation exportToExcel() called');

      // Create new Excel file
      const workbook = new ExcelJS.Workbook();
      const wbName = this.$t('reports.report14_title')
      this.fillWorkSheet(workbook, wbName)

      // Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${wbName}.xlsx`);

      console.log('Report_14_SurveyDataReconciliation exportToExcel() completed');
    },

    onYearSelected(value) {
      console.log('Report_14_SurveyDataReconciliation onYearSelected() called with value:', value);
      this.selectedYear = value;
      console.log('Report_14_SurveyDataReconciliation onYearSelected() selectedYear:', this.selectedYear);
    },

    async customSort(value, secondarySort, tertiarySort) {
      console.log('Report_14_SurveyDataReconciliation customSort() called with value:', value);
      this.showSpinner = true;

      // Let Vue update the DOM before sorting begins (so the loader appears)
      await this.$nextTick()

      // Call the mixin method manually
      const result = customSortMixin.methods.customSort.call(this, value, secondarySort, tertiarySort)

      // Optional: artificial delay if sort is too fast to see loading
      await new Promise(resolve => setTimeout(resolve, 100))

      this.showSpinner = false

      console.log('Report_14_SurveyDataReconciliation customSort() completed');
      return result
    }

  },

  computed: {
    ...mapGetters(['report14_filtered']),
// , 'yearsInReport14'

    report() {
      console.log('Report_14_SurveyDataReconciliation report computed property called. this.selectedYear:', this.selectedYear);
      return this.report14_filtered(this.selectedYear) 
      console.log('Report_14_SurveyDataReconciliation report computed property returning:', this.report);
    },


    // yearsList() {
    //   return this.yearsInReport14();
    // },

    emptyData() {
      console.log('Report_14_SurveyDataReconciliation emptyData computed property called. this.report.length:', this.report.length);
      return this.report.length == 0
    },

    getWorksheetColumns() {
      const res = baseColumns.map(item => {
        return {
          ...item,
          header: this.$t(item.header)
        }
      });
      return res
    },

    headerTitles() {
      const titleFiltersArray = [
        { condition: this.selectedYear, column: `${this.$t('label.as_on')} ${this.selectedYear}` },
      ].filter(item => item.condition).map(item => item.column);

      return titleFiltersArray;
    },

    getPrintHeader() {
      const titleFilters = this.headerTitles.length > 0 ? `<br>(${this.headerTitles.join(', &nbsp;')})` : '';

      return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
          <h4 style='text-align:center'>
            ${this.$t('reports.report14_title')}
            ${titleFilters}
        </h4>`;
    },

    getTableRows() {
      const columns = this.getWorksheetColumns

      const tableRowsArray = this.report.map(item => {
        return `<tr>${columns.map(col => col.num
          ? `<td class='numCell'>${numFormat(item[col.key], col.digits)}</td>`
          : `<td>${item[col.key]}</td>`).join('')}
        </tr>`;
      });

      return tableRowsArray.join('');
    },
  },

  watch: {
    selectedYear(newVal) {
      console.log('Report_14_SurveyDataReconciliation watch selectedYear called with newVal:', newVal);
      if (newVal) {
        console.log('Report_14_SurveyDataReconciliation watch selectedYear: calling reloadData');
        this.reloadData();
      }
    }
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

::v-deep .md-table-head-label {
  font-size: 13px !important;
  overflow: visible !important;
  white-space: normal !important;
  text-align: center !important;
  word-wrap: break-word !important;
}

.paginated-table table>tbody>tr>td {
  font-size: 12px !important;
  height: 36px;
  padding: 0px !important;
  padding-right: 24px !important;
}

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}
</style>