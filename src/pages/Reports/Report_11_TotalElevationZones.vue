<!--
File: Report_11_TotalElevationZones.vue
Description: produce report showing Region/DEU-wise Condition index.
-->
<template>
  <md-card v-if="eligible">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <div class="md-layout-item btn-row md-small-size-100">
          <md-button class="md-success" @click="print" :disabled="btnDisabled"> {{ $t('buttons.print') }} </md-button>
          <md-button v-if="isBtnAllowed('ExportButton')" class="md-raised md-success" @click="exportToExcel"
            :disabled="btnDisabled">
            {{ $t('buttons.excel_export') }}
          </md-button>
        </div>
      </div>
    </md-card-header>
    <md-card-content>
      <md-progress-spinner v-if="showSpinner" :md-diameter="70" md-mode="indeterminate" />
      <md-table class="paginated-table table-striped table-hover" :value="report" :md-sort.sync="currentSort"
        :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')"
          :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell style="max-width: 200px;" :md-label="$t('road_network.region')"
            md-sort-by="region_description">
            {{ item.region_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_1') + $t('label.hectares')" md-sort-by="zone_1" md-numeric>
            {{ item.zone_1 | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_2') + $t('label.hectares')" md-sort-by="zone_2" md-numeric>
            {{ item.zone_2 | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_3') + $t('label.hectares')" md-sort-by="zone_3" md-numeric>
            {{ item.zone_3 | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_4') + $t('label.hectares')" md-sort-by="zone_4" md-numeric>
            {{ item.zone_4 | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_5') + $t('label.hectares')" md-sort-by="zone_5" md-numeric>
            {{ item.zone_5 | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_6') + $t('label.hectares')" md-sort-by="zone_6" md-numeric>
            {{ item.zone_6 | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('label.total') + $t('label.hectares')" md-sort-by="total" md-numeric>
            {{ item.total | numFormat }}
          </md-table-cell>
        </md-table-row>
      </md-table>

      <md-table>
        <md-table-row>
          <md-table-head style="max-width: 200px;">{{ $t('label.total') }}</md-table-head>
          <md-table-head v-for="zone in Object.keys(report_11_total)" :key="zone" md-numeric>
            {{ report_11_total[zone] | numFormat }}
          </md-table-head>
        </md-table-row>
      </md-table>
    </md-card-content>
  </md-card>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { numFormat } from "@/store/helpers/format_helpers"
import { customSortMixin } from '@/mixins/customSortMixin'
import { onClose } from '@/mixins/onCloseMixin'
import permissions from "@/mixins/permissionsMixin"
import printReport from '@/mixins/printMixin'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const baseColumns = [
  { header: 'road_network.region', key: 'region_description', width: 30 },
  { header: 'reports.zone_1', key: 'zone_1', width: 15, num: true, digits: 2 },
  { header: 'reports.zone_2', key: 'zone_2', width: 15, num: true, digits: 2 },
  { header: 'reports.zone_3', key: 'zone_3', width: 15, num: true, digits: 2 },
  { header: 'reports.zone_4', key: 'zone_4', width: 15, num: true, digits: 2 },
  { header: 'reports.zone_5', key: 'zone_5', width: 15, num: true, digits: 2 },
  { header: 'reports.zone_6', key: 'zone_6', width: 15, num: true, digits: 2 },
  { header: 'label.total', key: 'total', width: 15, num: true, digits: 2 },
];

export default {
  name: 'report-total-elevation-zones',
  mixins: [permissions, customSortMixin, printReport],
  data() {
    return {
      formName: 'Report_11',
      eligible: false,

      btnDisabled: true,
      showSpinner: false,
      currentSort: 'region_description',
      currentSortOrder: 'asc',
    }
  },

  components: {
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      this.onClose()
      return
    };

    await this.clearReport(11);
    await this.reloadData();
  },

  methods: {
    ...mapActions({
      clearReport: 'CLEAR_REPORT',
      loadReportData: 'REPORT_11_TOTAL_ELEVATION_ZONES',
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
      const subtitle = this.$t('route.report_total_elevation_zones');
      this.generateWorkSheet(workbook, workbookName, subtitle, this.report, this.report_11_total);
    },

    async exportToExcel() {
      // Create new Excel file
      const workbook = new ExcelJS.Workbook();
      const wbName = this.$t('route.report_total_elevation_zones')
      this.fillWorkSheet(workbook, wbName)

      // Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${wbName}.xlsx`);
    },
  },

  computed: {
    ...mapState({
      report: (state) => state.Reports.report_11_data,
    }),
    ...mapGetters(['report_11_total']),

    getWorksheetColumns() {
      const res = baseColumns.map(item => {
        return {
          ...item,
          header: this.$t(item.header) + this.$t('label.hectares')
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

      return [];
    },

    getPrintHeader() {
      const titleFilters = this.headerTitles.length > 0 ? `<br>(${this.headerTitles.join(', &nbsp;')})` : '';

      return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
        <h4 style='text-align:center'>
          ${this.$t('route.report_total_elevation_zones')}
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

      // Add totals
      tableRowsArray.push(`<tr>
        ${baseColumns.map(
        zone => zone.key === 'region_description'
          ? `<th>${this.$t('label.total')}</th> `
          : `<td class='numCell'>${numFormat(this.report_11_total[zone.key])}</td>`
      ).join('')}</tr>`
      );

      return tableRowsArray.join('');
    },
  },
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
  font-size: 14px !important;
  overflow: visible !important;
  white-space: normal !important;
  text-align: center !important;
  word-wrap: break-word !important;
}

.paginated-table table>tbody>tr>td {
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