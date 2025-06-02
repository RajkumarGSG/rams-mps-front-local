<!--
File: Report_8_ConditionIndex.vue
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
          <YearsDropdown v-model="selectedYear" />
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

    <div class='md-layout-item md-size-50 md-small-size-100 md-medium-size-50'>
      <canvas v-if="!emptyData" ref="myChart" id="conditionIndexChart" width="200" height="100"></canvas>
    </div>

    <md-card-content>
      <md-progress-spinner v-if="showSpinner == true" :md-diameter="70" md-mode="indeterminate" />
      <md-table class="paginated-table table-striped table-hover" :value="report" :md-sort.sync="currentSort"
        :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')"
          :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell v-if="!selectedRegion" style="max-width: 250px;" :md-label="$t('road_network.region')"
            md-sort-by="region_description">
            {{ item.region_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.total_km')" md-sort-by="total_km" md-numeric>
            {{ item.total_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.total_surveyed_km')" md-sort-by="total_surveyed_km" md-numeric>
            {{ item.total_surveyed_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.very_good_km')" md-sort-by="very_good_km" md-numeric>
            {{ item.very_good_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.good_km')" md-sort-by="good_km" md-numeric>
            {{ item.good_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.fair_km')" md-sort-by="fair_km" md-numeric>
            {{ item.fair_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.poor_km')" md-sort-by="poor_km" md-numeric>
            {{ item.poor_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.very_poor_km')" md-sort-by="very_poor_km" md-numeric>
            {{ item.very_poor_km | numFormat(3) }}
          </md-table-cell>
        </md-table-row>
      </md-table>
      <!--<md-table id="printFooter">
          <md-table-row>
            <md-table-head colspan="6">{{ $t('road_network.total_length') }}</md-table-head>
            <md-table-head md-numeric>{{ total_length }}</md-table-head>
          </md-table-row>
        </md-table>-->
    </md-card-content>
  </md-card>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { RegionsDropdown, YearsDropdown } from '@/pages/Components'
import Chart from 'chart.js';
import { numFormat } from "@/store/helpers/format_helpers"
import { customSortMixin } from '@/mixins/customSortMixin'
import { onClose } from '@/mixins/onCloseMixin'
import permissions from "@/mixins/permissionsMixin"
import printReport from '@/mixins/printMixin'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default {
  name: 'report-condition-index',
  mixins: [permissions, customSortMixin, printReport],
  data() {
    return {
      formName: 'Report_8',
      eligible: false,

      selectedRegion: null,
      selectedYear: null,       // 2024,
      btnDisabled: true,
      showSpinner: false,
      currentSort: 'region_description',
      currentSortOrder: 'asc',
      chart: null,
    }
  },

  components: {
    RegionsDropdown,
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
    await this.clearReport(8);
    this.selectedYear = new Date().getFullYear()
  },

  beforeDestroy() {
    if (this.chart) this.chart.destroy();
  },

  methods: {
    ...mapActions({
      clearReport: 'CLEAR_REPORT',
      loadReportData: 'REPORT_8_ROAD_CONDITION_INDEX',
    }),

    onClose,
    async reloadData() {
      this.showSpinner = true
      this.btnDisabled = true
      const values = {
        region_id: this.selectedRegion,
        survey_year: this.selectedYear
      }

      try {
        await this.loadReportData(values);
        await this.reloadChart();
      } catch (err) {
        // Report 8 API return "Internal server error"
      } finally {
        this.showSpinner = false;
        this.btnDisabled = false;
      }
    },

    async reloadChart() {
      if (this.emptyData) return

      var labels = []
      var very_good = []
      var good = []
      var fair = []
      var poor = []
      var very_poor = []

      this.report.forEach((item) => {
        labels.push(item.region_description)
        very_good.push(item.very_good_km)
        good.push(item.good_km)
        fair.push(item.fair_km)
        poor.push(item.poor_km)
        very_poor.push(item.very_poor_km)
      })

      if (this.chart) this.chart.destroy(); // Уничтожаем предыдущий график перед созданием нового
      const ctx = document.getElementById('conditionIndexChart').getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
          labels: labels,
          datasets: [{
            label: this.$t('criteria.very_good_km'),
            data: very_good,
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            borderColor: 'rgba(0, 255, 0, 1)',
            borderWidth: 1
          }, {
            label: this.$t('criteria.good_km'),
            data: good,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }, {
            label: this.$t('criteria.fair_km'),
            data: fair,
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1
          }, {
            label: this.$t('criteria.poor_km'),
            data: poor,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }, {
            label: this.$t('criteria.very_poor_km'),
            data: very_poor,
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderColor: 'rgba(255, 0, 0, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            xAxes: [{
              stacked: true, // Включаем накопление для горизонтальной оси
              ticks: { beginAtZero: true }
            }],
            yAxes: [{
              stacked: true, // Включаем накопление для горизонтальной оси
              ticks: { beginAtZero: true }
            }]
          }
        }
      });
    },

    print() {
      this.showSpinner = true
      this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
      this.showSpinner = false
    },

    fillWorkSheet(workbook, workbookName) {
      const subtitle = `${this.$t('condition.condition_index')}${this.$t('label.as_on')} ${this.selectedYear}`;
      this.generateWorkSheet(workbook, workbookName, subtitle, this.report);
    },

    async exportToExcel() {
      // Create new Excel file
      const workbook = new ExcelJS.Workbook();
      const wbName = this.$t('condition.condition_index')
      this.fillWorkSheet(workbook, wbName)

      // Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${wbName}.xlsx`);
    },
  },

  computed: {
    ...mapState({
      report_8_data: (state) => state.Reports.report_8_data,
    }),
    ...mapGetters(['report_8_total']),

    report() {
      return this.customSort(this.report_8_data, 'deu_description')
    },

    total_length() {
      return this.report_8_total
    },

    emptyData() {
      return this.report.length == 0
    },

    getWorksheetColumns() {
      let res = [
        { header: this.$t('road_network.total_km'), key: 'total_km', width: 15, num: true, digits: 3 },
        { header: this.$t('road_network.total_surveyed_km'), key: 'total_surveyed_km', width: 15, num: true, digits: 3 },
        { header: this.$t('criteria.very_good_km'), key: 'very_good_km', width: 15, num: true, digits: 3 },
        { header: this.$t('criteria.good_km'), key: 'good_km', width: 15, num: true, digits: 3 },
        { header: this.$t('criteria.fair_km'), key: 'fair_km', width: 15, num: true, digits: 3 },
        { header: this.$t('criteria.poor_km'), key: 'poor_km', width: 15, num: true, digits: 3 },
        { header: this.$t('criteria.very_poor_km'), key: 'very_poor_km', width: 15, num: true, digits: 3 },
      ];

      if (!this.selectedRegion) {
        res.unshift({ header: this.$t('road_network.region'), key: 'region_description', width: 25 });
      }
      return res
    },

    headerTitles() {
      const titleFiltersArray = []

      if (this.selectedRegion) {
        titleFiltersArray.push(this.$t('label.from_region', { name: this.report[0].region_description }));
      }
      return titleFiltersArray
    },

    getPrintHeader() {
      const titleFilters = this.headerTitles.length > 0 ? `<br>(${this.headerTitles.join(', &nbsp;')})` : '';

      return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
        <h4 style='text-align:center'>
          ${this.$t('condition.condition_index')}
          ${this.$t('label.as_on')}${this.selectedYear}
          ${titleFilters}
        </h4>`;
    },

    getTableHeaders() {
      const columns = this.getWorksheetColumns
      return `<tr>${columns.map(col => `<th>${col.header}</th>`).join('')}</tr>`
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
    selectedYear(newValue) {
      if (!newValue) this.selectedYear = new Date().getFullYear()
      else this.reloadData()
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