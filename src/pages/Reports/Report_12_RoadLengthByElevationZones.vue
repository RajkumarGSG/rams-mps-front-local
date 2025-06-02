<!--
File: Report_12_RoadLengthByElevationZones.vue
Description: produce report showing Region/DEU-wise Condition index.
-->
<template>
  <md-card v-if="eligible">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-20">
          <RegionsDropdown v-model="selectedRegion" @input='reloadData' />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-20">
          <RoadClassesDropdown v-model="selectedRoadClass" @input='reloadData' />
        </div>
        <div class="md-layout-item btn-row md-small-size-100">
          <md-button v-if="isBtnAllowed('PrintButton')" class="md-success" @click="print" :disabled="btnDisabled">
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
        <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell v-if="!selectedRegion" style="max-width: 200px;" :md-label="$t('road_network.region')"
            md-sort-by="region_description">
            {{ item.region_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.road_class')" md-sort-by="road_class">
            {{ item.road_class }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_1') + $t('label.kilometers')" md-sort-by="zone_1" md-numeric>
            {{ item.zone_1 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_2') + $t('label.kilometers')" md-sort-by="zone_2" md-numeric>
            {{ item.zone_2 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_3') + $t('label.kilometers')" md-sort-by="zone_3" md-numeric>
            {{ item.zone_3 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_4') + $t('label.kilometers')" md-sort-by="zone_4" md-numeric>
            {{ item.zone_4 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_5') + $t('label.kilometers')" md-sort-by="zone_5" md-numeric>
            {{ item.zone_5 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('reports.zone_6') + $t('label.kilometers')" md-sort-by="zone_6" md-numeric>
            {{ item.zone_6 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('label.total') + $t('label.kilometers')" md-sort-by="total" md-numeric>
            {{ item.total | numFormat(3) }}
          </md-table-cell>
        </md-table-row>
      </md-table>
      <md-table v-if="col_span > 0">
        <md-table-row>
          <md-table-head colspan="col_span">{{ $t('label.total') }}</md-table-head>
          <md-table-head v-for="zone in Object.keys(totals)" :key="zone" md-numeric>
            {{ totals[zone] | numFormat(3) }}
          </md-table-head>
        </md-table-row>
      </md-table>
    </md-card-content>
  </md-card>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { RegionsDropdown, RoadClassesDropdown } from '@/pages/Components'
import { numFormat } from "@/store/helpers/format_helpers"
import { customSortMixin } from '@/mixins/customSortMixin'
import { onClose } from '@/mixins/onCloseMixin'
import permissions from "@/mixins/permissionsMixin"
import printReport from '@/mixins/printMixin'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const baseColumns = [
  { header: 'road_network.road_class', key: 'road_class', width: 15 },
  { header: 'reports.zone_1', key: 'zone_1', width: 15, num: true, digits: 3 },
  { header: 'reports.zone_2', key: 'zone_2', width: 15, num: true, digits: 3 },
  { header: 'reports.zone_3', key: 'zone_3', width: 15, num: true, digits: 3 },
  { header: 'reports.zone_4', key: 'zone_4', width: 15, num: true, digits: 3 },
  { header: 'reports.zone_5', key: 'zone_5', width: 15, num: true, digits: 3 },
  { header: 'reports.zone_6', key: 'zone_6', width: 15, num: true, digits: 3 },
  { header: 'label.total', key: 'total', width: 15, num: true, digits: 3 },
];

export default {
  name: 'report-road-length-by-elevation-zones',
  mixins: [permissions, customSortMixin, printReport],
  data() {
    return {
      formName: 'Report_12',
      eligible: false,

      selectedRegion: null,
      selectedRoadClass: null,
      btnDisabled: true,

      showSpinner: false,
      currentSort: 'region_description',
      currentSortOrder: 'asc',
    }
  },

  components: {
    RegionsDropdown,
    RoadClassesDropdown
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      this.onClose()
      return
    };

    await this.clearReport(12);
    await this.reloadData();
  },

  methods: {
    ...mapActions({
      clearReport: 'CLEAR_REPORT',
      loadReportData: 'REPORT_12_LENGTH_BY_ELEVATION_ZONES',
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
      let prtHtml = "<h4 style='text-align:center'>" + this.$t('route.report_road_length_in_elevation_zones') + '<br>'

      let titleFilters = ''
      let tableHeaders = '<tr>'
      if (this.selectedRegion) {
        titleFilters += this.$t('label.from_region', { name: this.report[0].region_description })
      } else {
        tableHeaders += `<th>${this.$t('road_network.region')}</th>`
      }
      if (this.selectedRoadClass) {
        if (titleFilters !== '') titleFilters += ', &nbsp;'
        titleFilters += this.$t('road_network.road_class') + ': ' + this.selectedRoadClass
      } else {
        tableHeaders += `<th>${this.$t('road_network.road_class')}</th>`
      }
      if (titleFilters !== '') prtHtml += '&nbsp;(' + titleFilters + ')'
      prtHtml += '</h4>'

      tableHeaders += `
          <th>${this.$t('reports.zone_1') + this.$t('label.kilometers')}</th>
          <th>${this.$t('reports.zone_2') + this.$t('label.kilometers')}</th>
          <th>${this.$t('reports.zone_3') + this.$t('label.kilometers')}</th>
          <th>${this.$t('reports.zone_4') + this.$t('label.kilometers')}</th>
          <th>${this.$t('reports.zone_5') + this.$t('label.kilometers')}</th>
          <th>${this.$t('reports.zone_6') + this.$t('label.kilometers')}</th>
          <th>${this.$t('label.total') + this.$t('label.kilometers')}</th>
        </tr>`

      let tableRows = ''
      this.report.forEach(item => {
        tableRows += '<tr>'
        if (!this.selectedRegion) tableRows += `<td>${item.region_description}</td>`
        if (!this.selectedRoadClass) tableRows += `<td>${item.road_class}</td>`
        tableRows += `
            <td class='numCell'>${numFormat(item.zone_1, 3)}</td>
            <td class='numCell'>${numFormat(item.zone_2, 3)}</td>
            <td class='numCell'>${numFormat(item.zone_3, 3)}</td>
            <td class='numCell'>${numFormat(item.zone_4, 3)}</td>
            <td class='numCell'>${numFormat(item.zone_5, 3)}</td>
            <td class='numCell'>${numFormat(item.zone_6, 3)}</td>
            <td class='numCell'>${numFormat(item.total, 3)}</td>
          </tr>`
      })

      if (this.col_span) {
        tableRows += `<tr><th colspan=${this.col_span}>${this.$t('label.total')}</th>
          <th class='numCell'>${numFormat(this.totals.zone_1, 3)}</th>
          <th class='numCell'>${numFormat(this.totals.zone_2, 3)}</th>
          <th class='numCell'>${numFormat(this.totals.zone_3, 3)}</th>
          <th class='numCell'>${numFormat(this.totals.zone_4, 3)}</th>
          <th class='numCell'>${numFormat(this.totals.zone_5, 3)}</th>
          <th class='numCell'>${numFormat(this.totals.zone_6, 3)}</th>
          <th class='numCell'>${numFormat(this.totals.total, 3)}</th>
        </tr>`
      }
      //this.printReport(prtHtml, tableHeaders, tableRows)
      this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
      this.showSpinner = false
    },

    setWorkSheetHeader(worksheet) {
    },

    fillWorkSheet(workbook, workbookName) {
      const subtitle = this.$t('route.report_road_length_in_elevation_zones');
      this.generateWorkSheet( workbook, workbookName, subtitle, this.report, this.totals, this.col_span);
    },

    async exportToExcel() {
      // Create new Excel file
      const workbook = new ExcelJS.Workbook();
      const wbName = this.$t('route.report_road_length_in_elevation_zones')
      this.fillWorkSheet(workbook, wbName)

      // Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${wbName}.xlsx`);
    },
  },

  computed: {
    ...mapGetters(['report12_filtered', 'report_12_total']),

    report() {
      return this.report12_filtered(this.selectedRegion, this.selectedRoadClass)
    },

    totals() {
      return this.report_12_total(this.selectedRegion, this.selectedRoadClass)
    },

    col_span() {
      let res = 2
      if (this.selectedRegion) res--
      return res
    },

    getWorksheetColumns() {
      const res = baseColumns.map(item => {
        return {
          ...item,
          header: this.$t(item.header) + this.$t('label.kilometers')
        }
      });

      if (!this.selectedRegion) {
        res.unshift({ header: this.$t('road_network.region'), key: 'region_description', width: 25 });
      }

      return res;
    },

    headerTitles() {
      const titleFiltersArray = [
        { condition: this.selectedRegion, column: this.$t('label.from_region', { name: this.report[0].region_description }) },
      ].filter(item => item.condition).map(item => item.column);

      return titleFiltersArray;
    },

    getPrintHeader() {
      const titleFilters = this.headerTitles.length > 0 ? `<br>(${this.headerTitles.join(', &nbsp;')})` : '';

      return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
        <h4 style='text-align:center'>
          ${this.$t('route.report_road_length_in_elevation_zones')}
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
      if (this.col_span > 0) {
        tableRowsArray.push(`<tr>
        ${baseColumns.map(
          zone => zone.key === 'region_description' || zone.key === 'road_class'
            ? `<th ${this.col_span ? `colspan=${this.col_span}` : ''}>${this.$t('label.total')}</th>`
            : `<td class='numCell'>${numFormat(this.totals[zone.key], 3)}</td>`
        ).join('')}</tr>`
        );
      }
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

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 12;
}

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}
</style>