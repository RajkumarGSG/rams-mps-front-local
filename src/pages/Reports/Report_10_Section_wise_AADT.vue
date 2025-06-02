<!--
File: Report_10_Section_wise_AADT.vue
Description: produce report showing Region/DEU-wise Condition index.
-->
<template>
  <md-card v-if="eligible">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-15">
          <RegionsDropdown v-model="selectedRegion" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-15">
          <RoadsDropdown v-model="selectedRoad" :items="roadsList" :disabled='!selectedRegion' />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-15">
          <YearsDropdown :label="$t('label.survey_year')" v-model="selectedYear" :items="yearsList" />
        </div>
        <div class="md-layout-item btn-row md-small-size-100">
          <md-button v-if="isBtnAllowed('PrintButton')" class="md-success" @click="print"
            :disabled="btnDisabled || emptyData">
            {{ $t('buttons.print') }}
          </md-button>
          <md-button v-if="isBtnAllowed('ExportButton')" class="md-raised md-success" @click="exportToExcel"
            :disabled="btnDisabled">
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
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell style="max-width: 200px;" :md-label="$t('road_network.section')"
            md-sort-by="section_description">
            {{ item.section_description }}
          </md-table-cell>
          <md-table-cell style="max-width: 200px;" :md-label="$t('label.survey_year')" md-sort-by="survey_year"
            md-numeric>
            {{ item.survey_year }}
          </md-table-cell>
          <md-table-cell :md-label="$t('traffic.aadt_a1_spc')" md-sort-by="aadt_a1_spc" md-numeric>
            {{ item.aadt_a1_spc | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('traffic.aadt_b1_mb')" md-sort-by="aadt_b1_mb" md-numeric>
            {{ item.aadt_b1_mb | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('traffic.aadt_b2_l2tr')" md-sort-by="aadt_b2_l2tr" md-numeric>
            {{ item.aadt_b2_l2tr | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('traffic.aadt_b3_tractors')" md-sort-by="aadt_b3_tractors" md-numeric>
            {{ item.aadt_b3_tractors | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('traffic.aadt_c1_m2tr')" md-sort-by="aadt_c1_m2tr" md-numeric>
            {{ item.aadt_c1_m2tr | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('traffic.aadt_c2_h3tr')" md-sort-by="aadt_c2_h3tr" md-numeric>
            {{ item.aadt_c2_h3tr | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('traffic.aadt_d1_buses')" md-sort-by="aadt_d1_buses" md-numeric>
            {{ item.aadt_d1_buses | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('traffic.aadt_d2_truck_tr')" md-sort-by="aadt_d2_truck_tr" md-numeric>
            {{ item.aadt_d2_truck_tr | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('traffic.aadt_d3_ar4tr_tr')" md-sort-by="aadt_d3_ar4tr_tr" md-numeric>
            {{ item.aadt_d3_ar4tr_tr | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('traffic.aadt_total')" md-sort-by="aadt_total" md-numeric>
            {{ item.aadt_total | numFormat }}
          </md-table-cell>
        </md-table-row>
      </md-table>
    </md-card-content>
  </md-card>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { RegionsDropdown, RoadsDropdown, YearsDropdown } from '@/pages/Components'
import { numFormat } from "@/store/helpers/format_helpers"
import { customSortMixin } from '@/mixins/customSortMixin'
import { onClose } from '@/mixins/onCloseMixin'
import permissions from "@/mixins/permissionsMixin"
import printReport from '@/mixins/printMixin'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const baseColumns = [
  { header: 'road_network.section', key: 'section_description', width: 40 },
  { header: 'label.survey_year', key: 'survey_year', width: 10, num: true, digits: 0 },
  { header: 'traffic.aadt_a1_spc', key: 'aadt_a1_spc', width: 10, num: true, digits: 2 },
  { header: 'traffic.aadt_b1_mb', key: 'aadt_b1_mb', width: 10, num: true, digits: 2 },
  { header: 'traffic.aadt_b2_l2tr', key: 'aadt_b2_l2tr', width: 10, num: true, digits: 2 },
  { header: 'traffic.aadt_b3_tractors', key: 'aadt_b3_tractors', width: 10, num: true, digits: 2 },
  { header: 'traffic.aadt_c1_m2tr', key: 'aadt_c1_m2tr', width: 10, num: true, digits: 2 },
  { header: 'traffic.aadt_c2_h3tr', key: 'aadt_c2_h3tr', width: 10, num: true, digits: 2 },
  { header: 'traffic.aadt_d1_buses', key: 'aadt_d1_buses', width: 10, num: true, digits: 2 },
  { header: 'traffic.aadt_d2_truck_tr', key: 'aadt_d2_truck_tr', width: 10, num: true, digits: 2 },
  { header: 'traffic.aadt_d3_ar4tr_tr', key: 'aadt_d3_ar4tr_tr', width: 10, num: true, digits: 2 },
  { header: 'traffic.aadt_total', key: 'aadt_total', width: 10, num: true, digits: 2 },
];

export default {
  name: 'report-section_wise_aadt',
  mixins: [permissions, customSortMixin, printReport],
  data() {
    return {
      formName: 'Report_10',
      eligible: false,

      selectedRegion: null,
      selectedRoad: null,
      selectedYear: null,
      btnDisabled: true,

      showSpinner: false,
      currentSort: 'section_description',
      currentSortOrder: 'asc',
    }
  },
  components: {
    RegionsDropdown,
    RoadsDropdown,
    YearsDropdown,
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      this.onClose()
      return
    };

    // Empty the data
    await this.clearReport(10);
    await this.reloadData()
  },

  methods: {
    ...mapActions({
      clearReport: 'CLEAR_REPORT',
      loadReportData: 'REPORT_10_SECTION_WISE_AADT',
    }),
    onClose,

    async reloadData() {
      this.showSpinner = true;
      this.btnDisabled = true;
      try {
        await this.loadReportData();
      } finally {
        this.showSpinner = false;
        this.btnDisabled = false;
      }
    },

    print() {
      this.showSpinner = true
      this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
      this.showSpinner = false
    },

    fillWorkSheet(workbook, workbookName) {
      this.generateWorkSheet(workbook, workbookName, this.$t('reports.report10_title'), this.report);
    },

    async exportToExcel() {
      // Create new Excel file
      const workbook = new ExcelJS.Workbook();
      const wbName = this.$t('reports.report10_title')
      this.fillWorkSheet(workbook, wbName)

      // Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${wbName}.xlsx`);
    },

  },

  computed: {
    ...mapGetters(['report10_filtered', 'roadsInReport10', 'yearsInReport10']),

    report() {
      return this.report10_filtered(this.selectedRegion, this.selectedRoad, this.selectedYear)
    },

    roadsList() {
      return this.roadsInReport10(this.selectedRegion);
    },

    yearsList() {
      return this.yearsInReport10(this.selectedRegion, this.selectedRoad);
    },

    emptyData() {
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
        { condition: this.selectedRegion, column: this.$t('label.from_region', { name: this.report[0].region_description }) },
        { condition: this.selectedRoad, column: `${this.$t('road_network.road')}: ${this.report[0].road_description}` },
        { condition: this.selectedYear, column: `${this.$t('label.as_on')} ${this.selectedYear}` },
      ].filter(item => item.condition).map(item => item.column);

      return titleFiltersArray;
    },

    getPrintHeader() {
      const titleFilters = this.headerTitles.length > 0 ? `<br>(${this.headerTitles.join(', &nbsp;')})` : '';

      return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
          <h4 style='text-align:center'>
            ${this.$t('reports.report10_title')}
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
    selectedRegion() {
      this.selectedRoad = null
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