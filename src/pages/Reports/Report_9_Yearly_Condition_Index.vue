<!--
File: Report_9_Yearly_Condition_Index.vue
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
          <RoadsDropdown v-model="selectedRoad" :region_id="selectedRegion" :disabled='!selectedRegion'
            @input='onRoadChange' />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-15">
          <YearsDropdown :label="$t('label.from_year')" v-model="startYear" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-15">
          <YearsDropdown :label="$t('label.to_year')" v-model="endYear" />
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

    <div class='md-layout-item md-size-50 md-small-size-100 md-medium-size-50'>
      <canvas v-if="!emptyData" ref="myChart" id="conditionIndexChart" width="200" height="100"></canvas>
    </div>

    <md-card-content>
      <md-progress-spinner v-show="showSpinner" class="md-progress-spinner" :md-diameter="70" md-mode="indeterminate" />
      <md-table class="paginated-table table-striped table-hover" :value="report" md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')"
          :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell v-if="!selectedRegion" :md-label="$t('road_network.region')" md-sort-by="region_description">
            {{ item.region_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('label.survey_year')">
            {{ item.survey_year }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.total_km')" md-numeric>
            {{ item.total_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.total_surveyed_km')" md-numeric>
            {{ item.total_surveyed_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.condition_index')" md-numeric>
            {{ item.condition_index | numFormat }}
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
import { onClose } from '@/mixins/onCloseMixin'
import permissions from "@/mixins/permissionsMixin"
import printReport from '@/mixins/printMixin'
import Chart from 'chart.js';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const baseColumns = [
  { header: 'label.survey_year', key: 'survey_year', width: 20 },
  { header: 'road_network.total_km', key: 'total_km', width: 20, num: true, digits: 3 },
  { header: 'road_network.total_surveyed_km', key: 'total_surveyed_km', width: 20, num: true, digits: 3 },
  { header: 'condition.condition_index', key: 'condition_index', width: 20, num: true, digits: 2 },
];

export default {
  name: 'report-yearly-condition-index',
  mixins: [permissions, printReport],
  data() {
    return {
      formName: 'Report_9',
      eligible: false,

      selectedRegion: null,
      selectedRoad: null,
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
      btnDisabled: true,

      showSpinner: false,
      regionDescr: null,
      roadDescr: null,
      chart: null,
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

    await this.clearReport(9);
    await this.reloadData()
  },

  beforeDestroy() {
    if (this.chart) this.chart.destroy();
  },

  methods: {
    ...mapActions({
      clearReport: 'CLEAR_REPORT',
      loadReportData: 'REPORT_9_YEARLY_CONDITION_INDEX',
    }),

    onClose,
    async reloadData() {
      this.showSpinner = true
      this.btnDisabled = true
      const report_params = {
        region_id: this.selectedRegion,
        road_id: this.selectedRoad,
        survey_date_from: this.startYear,
        survey_date_to: this.endYear
      }
      try {
        await this.loadReportData(report_params);
        await this.reloadChart();
      } finally {
        this.showSpinner = false;
        this.btnDisabled = false;
      }
    },

    async reloadChart() {
      if (this.emptyData) return

      let years = { 0: {}, 1: {}, 2: {}, 3: {} }
      let yearsLabels = []

      const yearsSet = new Set(yearsLabels);

      this.report.forEach((item) => {
        if (!yearsSet.has(item.survey_year)) {
          yearsLabels.push(item.survey_year);
          yearsSet.add(item.survey_year); // Добавляем год в Set
        }

        // Используем оператор нулевого слияния для более краткой проверки и установки
        years[0][item.survey_year] ??= item.condition_index;
        // Если нужно сложить значения для года, раскомментируйте следующую строку
        // years[0][item.survey_year] += item.condition_index;
      });

      let data_series = Object.values(years).map(yearObj => Object.values(yearObj));

      if (this.chart) this.chart.destroy(); // Уничтожаем предыдущий график перед созданием нового
      const ctx = document.getElementById('conditionIndexChart').getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: yearsLabels,
          datasets: [{
            barThickness: 40,
            maxBarThickness: 50,
            label: this.$t('condition.condition_index'),
            data: data_series[0],
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            borderColor: 'rgba(0, 255, 0, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            xAxes: [{ ticks: { beginAtZero: true } }],
            yAxes: [{ ticks: { beginAtZero: true } }]
          },
        }
      });
    },

    async print() {
      this.showSpinner = true
      const canvas = await html2canvas(this.$refs.myChart)
      const chartImage = canvas.toDataURL('image/png')
      const printHeader = `${this.getPrintHeader}<img src="${chartImage}" style="width:100%;max-width:600px;">`;

      this.printReport(printHeader, this.getTableHeaders, this.getTableRows)
      this.showSpinner = false
    },

    fillWorkSheet(workbook, workbookName) {
      const subtitle = `${this.$t('reports.report9_title')} ${this.startYear} - ${this.endYear}`;
      this.generateWorkSheet(workbook, workbookName, subtitle, this.report);
    },

    async exportToExcel() {
      // Create new Excel file
      const workbook = new ExcelJS.Workbook();
      const wbName = this.$t('reports.report9_title')
      this.fillWorkSheet(workbook, wbName)

      // Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${wbName}.xlsx`);
    },

    onRoadChange(road_id, roadDescr) {
      this.roadDescr = roadDescr
      this.reloadData()
    },
  },

  computed: {
    ...mapState({
      report: (state) => state.Reports.report_9_data,
    }),
    ...mapGetters([]),

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

      if (!this.selectedRegion) {
        res.unshift({ header: this.$t('road_network.region'), key: 'region_description', width: 30 });
      }
      return res
    },

    headerTitles() {
      const titleFiltersArray = [
        { condition: this.selectedRegion, column: this.$t('label.from_region', { name: this.report[0].region_description }) },
        { condition: this.selectedRoad, column: `${this.$t('road_network.road')}: ${this.roadDescr}` },
      ].filter(item => item.condition).map(item => item.column);

      return titleFiltersArray;
    },

    getPrintHeader() {
      const titleFilters = this.headerTitles.length > 0 ? `<br>(${this.headerTitles.join(', &nbsp;')})` : '';

      return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
        <h4 style='text-align:center'>
          ${this.$t('reports.report9_title')}
          ${this.startYear} - ${this.endYear}
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
    startYear(value) {
      this.reloadData()
    },
    endYear(value) {
      this.reloadData()
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