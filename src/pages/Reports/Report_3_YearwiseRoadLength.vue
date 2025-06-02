<!--
File: Report_3_YearwiseRoadLength.vue
Description: produces the pivot with the yearwise length of the roads for printing.
-->
<template>
  <md-card v-if="eligible">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-20">
          <RegionsDropdown v-model="selectedRegion" @input='reloadData' />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-20">
          <DepsDropdown v-model="selectedDeu" :regionId="selectedRegion" :disabled='!selectedRegion'
            @input='reloadData' />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-15">
          <YearsDropdown :label="$t('label.from_year')" v-model="startYear" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-15">
          <YearsDropdown :label="$t('label.to_year')" v-model="endYear" />
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
      <md-progress-spinner v-if="showSpinner == true" class="md-progress-spinner" :md-diameter="70"
        md-mode="indeterminate" />

      <div class='md-layout-item md-size-50 md-small-size-100 md-medium-size-50'>
        <canvas v-if="!emptyData" ref="myChart" id="YearwiseLengthChart" height="100px"></canvas>
      </div>

      <md-table class="paginated-table table-striped table-hover" :value="report" md-fixed-header height="50%">
        <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell v-if="!selectedRegion" style="max-width: 250px;" :md-label="$t('road_network.region')">
            {{ item.region_description }}
          </md-table-cell>
          <md-table-cell v-if="!selectedDeu" :md-label="$t('road_network.dep')">
            {{ item.deu_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('stdCols.year')">
            {{ item.year }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.length_km_road_class_em')" md-numeric>
            {{ item.length_km_road_class_em | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.length_km_road_class_m')" md-numeric>
            {{ item.length_km_road_class_m | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.length_km_road_class_zh')" md-numeric>
            {{ item.length_km_road_class_zh | numFormat(3) }}
          </md-table-cell>
          <!--md-table-cell :md-label="$t('road_network.road_class_none')" md-numeric>
            {{ item.length_km_road_class_none | numFormat }}
          </md-table-cell-->
          <md-table-cell :md-label="$t('road_network.total_km')" md-numeric>
            {{ item.total_length_km | numFormat(3) }}
          </md-table-cell>
        </md-table-row>
      </md-table>
      <!--div class="md-layout">
        <div>{{ $t('total_regions: ') }}: {{ total_regions }}&nbsp; </div>
          <div>{{ $t('total_deu: ') }}: {{ total_deu }}&nbsp; </div>>
      </div-->
    </md-card-content>
  </md-card>
</template>
<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { RegionsDropdown, DepsDropdown, YearsDropdown } from '@/pages/Components'
  import permissions from "@/mixins/permissionsMixin"
  import Chart from 'chart.js';
  import html2canvas from 'html2canvas';
  import { numFormat } from "@/store/helpers/format_helpers"
  import { customSortMixin } from '@/mixins/customSortMixin'
  import { onClose } from '@/mixins/onCloseMixin'
  import printReport from '@/mixins/printMixin'
  import ExcelJS from 'exceljs';
  import { saveAs } from 'file-saver';

  export default {
    name: 'roads-yearwise-length',
    mixins: [permissions, customSortMixin, printReport],
    data() {
      return {
        formName: 'Report_3',
        eligible: false,

        selectedRegion: null,
        selectedDeu: 0,
        startYear: new Date().getFullYear(),
        endYear: new Date().getFullYear(),
        selected_road_class: '',
        btnDisabled: true,

        showSpinner: false,
        currentSort: 'region_description',
        currentSortOrder: 'asc',
        chart: null,
      }
    },

    components: {
      RegionsDropdown,
      DepsDropdown,
      YearsDropdown,
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };

      await this.clearReport(3);
      await this.reloadData();
    },

    beforeDestroy() {
      if (this.chart) this.chart.destroy();
    },

    methods: {
      ...mapActions({
        clearReport: 'CLEAR_REPORT',
        loadReportData: 'REPORT_3_YEARWISE_LENGTH',
      }),

      onClose,
      checkYears() {
        const newStartYear = Math.min(this.startYear, this.endYear);
        if (newStartYear !== this.startYear) {
          this.$nextTick(() => {
            this.startYear = newStartYear;
            this.reloadData();
          });
        }
      },

      async reloadData() {
        if (!this.startYear || !this.endYear) { return }

        this.showSpinner = true
        this.btnDisabled = true
        const reportParams = {
          start_year: this.startYear,
          end_year: this.endYear,
          region_id: this.selectedRegion,
          road_class: this.selected_road_class,
          deu_id: this.selectedDeu
        }
        await this.loadReportData(reportParams)
        this.reloadChart()
        this.btnDisabled = false
        this.showSpinner = false
      },

      async reloadChart() {
        if (this.emptyData) return

        let years = { 0: {}, 1: {}, 2: {}, 3: {} }
        let years1 = []

        const classes = [
          'length_km_road_class_m',
          'length_km_road_class_em',
          'length_km_road_class_zh',
          'length_km_road_class_none'
        ];
        this.report.forEach((item) => {
          const ind1 = years1.findIndex((element) => element == item.year)
          if (ind1 < 0) { years1.push(item.year) }

          classes.forEach((roadClass, index) => {
            if (!years[index].hasOwnProperty(item.year)) {
              years[index][item.year] = item[roadClass];
            } else {
              years[index][item.year] += item[roadClass];
            }
          });
        })

        let data_series = []
        for (let cl in years) {
          const dim2 = []
          for (let y in years[cl]) {
            dim2.push(years[cl][y])
          }
          data_series.push(dim2)
        }

        if (this.chart) this.chart.destroy() // Уничтожаем предыдущий график перед созданием нового
        const ctx = document.getElementById('YearwiseLengthChart').getContext('2d');
        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: years1,
            datasets: [{
              barThickness: 40,
              maxBarThickness: 50,
              label: this.$t('road_network.length_km_road_class_em'),
              data: data_series[0],
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              borderColor: 'rgba(0, 255, 0, 1)',
              borderWidth: 1
            }, {
              barThickness: 40,
              maxBarThickness: 50,
              label: this.$t('road_network.length_km_road_class_m'),
              data: data_series[1],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }, {
              barThickness: 40,
              maxBarThickness: 50,
              label: this.$t('road_network.length_km_road_class_zh'),
              data: data_series[2],
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              xAxes: [{ stacked: true, ticks: { beginAtZero: true } }],
              yAxes: [{ stacked: true, ticks: { beginAtZero: true } }]
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
        const subtitle = `${this.$t('reports.report3_title')} ${this.startYear} - ${this.endYear}`;
        this.generateWorkSheet( workbook, workbookName, subtitle, this.report);
      },

      async exportToExcel() {
        // Create new Excel file
        const workbook = new ExcelJS.Workbook();
        const wbName = this.$t('route.report_yearwise_road_length')
        this.fillWorkSheet(workbook, wbName)

        // Save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${wbName}.xlsx`);
      },
    },

    computed: {
      ...mapState({
        report_3_data: (state) => state.Reports.report_3_data,
      }),

      ...mapGetters([]),

      report() {
        return this.customSort(this.report_3_data
          .map(item => { return { ...item, deu_description: `${this.$t('road_network.dep')}-${item.deu_description}` } }),
          'deu_description')
      },

      emptyData() {
        return this.report.length == 0
      },

      getWorksheetColumns() {
        let res = [
          { header: this.$t('stdCols.year'), key: 'year', width: 10, num: true },
          { header: this.$t('road_network.length_km_road_class_em'), key: 'length_km_road_class_em', width: 15, num: true, digits: 3 },
          { header: this.$t('road_network.length_km_road_class_m'), key: 'length_km_road_class_m', width: 15, num: true, digits: 3 },
          { header: this.$t('road_network.length_km_road_class_zh'), key: 'length_km_road_class_zh', width: 15, num: true, digits: 3 },
          { header: this.$t('road_network.total_km'), key: 'total_length_km', width: 15, num: true, digits: 3 },
        ];

        if (!this.selectedDeu) {
          res.unshift({ header: this.$t('road_network.dep'), key: 'deu_description', width: 10 });
        }

        if (!this.selectedRegion) {
          res.unshift({ header: this.$t('road_network.region'), key: 'region_description', width: 30 });
        }
        return res
      },

      headerTitles() {
        const titleFiltersArray = []

        if (this.selectedRegion) {
          titleFiltersArray.push(this.$t('label.from_region', { name: this.report[0].region_description }));
        }

        if (this.selectedDeu) {
          titleFiltersArray.push(`${this.$t('road_network.dep')}: ${this.report[0].deu_description}`);
        }
        return titleFiltersArray
      },

      getPrintHeader() {
        const titleFilters = this.headerTitles.length > 0 ? `<br>(${this.headerTitles.join(', &nbsp;')})` : '';

        return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
                    <h4 style='text-align:center'>
                      ${this.$t('reports.report3_title')}
                      ${this.startYear} - ${this.endYear}
                      ${titleFilters}
        </h4>`;
      },

      getTableRows() {
        const columns = this.getWorksheetColumns

        return this.report.map(item => {
          return `<tr>${columns.map(col => col.num
            ? `<td class='numCell'>${numFormat(item[col.key], 3)}</td>`
            : `<td>${item[col.key]}</td>`).join('')}
        </tr>`;
        }).join('');
      },

    },

    watch: {
      startYear(value) {
        this.checkYears()
      },
      endYear(value) {
        this.checkYears()
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