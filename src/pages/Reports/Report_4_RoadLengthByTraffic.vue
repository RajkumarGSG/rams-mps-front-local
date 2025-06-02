<!--
File: Report_4_RoadLengthByTraffic.vue
Description: produces the report for printing.
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
        <!--div class="md-layout-item md-small-size-100 md-size-20">
          <RoadClassesDropdown v-model="selectedRoadClass" @input='onRoadClassChange' />
        </div-->
        <div class="md-layout-item md-small-size-100 md-size-10">
          <md-field>
            <md-input type="number" class="mb-3" clearable style="width: 100px" :placeholder="$t('label.startYear')"
              v-model="startYear" />
          </md-field>
        </div>
        <div class="md-layout-item md-small-size-100 md-size-10">
          <md-field>
            <md-input type="number" class="mb-3" clearable style="width: 100px" :placeholder="$t('label.endYear')"
              v-model="endYear" />
          </md-field>
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
      <md-progress-spinner v-if="showSpinner == true" :md-diameter="100" md-mode="indeterminate" />
      <md-table class="paginated-table table-striped table-hover" :value="report" :md-sort.sync="currentSort"
        :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell :md-label="$t('stdCols.year')">
            {{ item.survey_year }}
          </md-table-cell>
          <md-table-cell style="min-width: 200px" v-if="!selectedRegion" :md-label="$t('road_network.region')">
            {{ item.region_description }}
          </md-table-cell>
          <md-table-cell v-if="!selectedDeu" :md-label="$t('road_network.dep')">
            {{ item.deu_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.very_very_high')" md-numeric>
            {{ item.length_km_above_24000 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.very_high')" md-numeric>
            {{ item.length_km_between_12001_and_24000 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.high')" md-numeric>
            {{ item.length_km_between_7001_and_12000 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.medium')" md-numeric>
            {{ item.length_km_between_3001_and_7000 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.low')" md-numeric>
            {{ item.length_km_between_1001_and_3000 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.very_low')" md-numeric>
            {{ item.length_km_between_251_and_1000 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('criteria.very_very_low')" md-numeric>
            {{ item.length_km_below_250 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.total_km')" md-numeric>
            {{ item.total_km | numFormat(3) }}
          </md-table-cell>
        </md-table-row>
      </md-table>
      <div class="md-layout">
        <!--<div>{{ $t('total_regions: ') }}: {{ total_regions }}&nbsp; </div>
            <div>{{ $t('total_deu: ') }}: {{ total_deu }}&nbsp; </div>-->
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { RegionsDropdown, DepsDropdown } from '@/pages/Components'
  import { numFormat } from "@/store/helpers/format_helpers"
  import { customSortMixin } from '@/mixins/customSortMixin'
  import { onClose } from '@/mixins/onCloseMixin'
  import permissions from "@/mixins/permissionsMixin"
  import printReport from '@/mixins/printMixin'
  import ExcelJS from 'exceljs';
  import { saveAs } from 'file-saver';

  export default {
    name: 'report-road-length-by-traffic',
    mixins: [permissions, customSortMixin, printReport],

    data() {
      return {
        formName: 'Report_4',
        eligible: false,

        selectedRegion: 0,
        selectedDeu: 0,
        startYear: new Date().getFullYear() - 5,
        endYear: new Date().getFullYear(),       // 2024,
        selectedRoadClass: '',
        btnDisabled: true,

        showSpinner: false,
        currentSort: 'region_description',
        currentSortOrder: 'asc',
      }
    },

    components: {
      RegionsDropdown,
      DepsDropdown,
      //RoadClassesDropdown,
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };

      // Empty the data
      await this.clearReport(3);
      //this.startYear = new Date().getFullYear() - 5
      await this.reloadData()
    },

    methods: {
      ...mapActions({
        clearReport: 'CLEAR_REPORT',
        loadReportData: 'REPORT_4_LENGTH_BY_TRAFFIC',
        saveHistory: 'SAVE_HISTORY'
      }),

      onClose,
      async reloadData() {
        this.showSpinner = true
        this.btnDisabled = true
        const report_filters = {
          survey_year_from: this.startYear,
          survey_year_to: this.endYear,
          region_id: this.selectedRegion,
          road_class: this.selectedRoadClass,
          deu_id: this.selectedDeu
        }
        try {
          await this.loadReportData(report_filters)
        } finally {
          this.btnDisabled = false
          this.showSpinner = false
        }
      },

      print() {
        this.showSpinner = true
        this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
        this.showSpinner = false
      },

      fillWorkSheet(workbook, workbookName) {
        const subtitle = `${this.$t('reports.report4_title')} ${this.startYear} - ${this.endYear}`;
        this.generateWorkSheet( workbook, workbookName, subtitle, this.report);
      },

      async exportToExcel() {
        // Create new Excel file
        const workbook = new ExcelJS.Workbook();
        const wbName = this.$t('route.report_length_by_intensity')
        this.fillWorkSheet(workbook, wbName)

        // Save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${wbName}.xlsx`);
      },
    },

    computed: {
      ...mapState({
        report_4_data: (state) => state.Reports.report_4_data,
      }),

      ...mapGetters([]),

      report() {
        const res = this.report_4_data.map(item => {
          return { ...item, deu_description: `${this.$t('road_network.dep')}-${item.deu_description}` }
        })
        return this.customSort(res, 'deu_description')
      },

      getWorksheetColumns() {
        let res = [
          { header: this.$t('stdCols.year'), key: 'survey_year', width: 10 },
          { header: this.$t('criteria.very_very_high'), key: 'length_km_above_24000', width: 15, num: true, digits: 3 },
          { header: this.$t('criteria.high'), key: 'length_km_between_12001_and_24000', width: 15, num: true, digits: 3 },
          { header: this.$t('criteria.medium'), key: 'length_km_between_7001_and_12000', width: 15, num: true, digits: 3 },
          { header: this.$t('criteria.low'), key: 'length_km_between_3001_and_7000', width: 15, num: true, digits: 3 },
          { header: this.$t('criteria.very_low'), key: 'length_km_between_1001_and_3000', width: 15, num: true, digits: 3 },
          { header: this.$t('criteria.very_high'), key: 'length_km_between_251_and_1000', width: 15, num: true, digits: 3 },
          { header: this.$t('criteria.very_very_low'), key: 'length_km_below_250', width: 15, num: true, digits: 3 },
          { header: this.$t('road_network.total_km'), key: 'total_km', width: 15, num: true, digits: 3 },
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
                ${this.$t('reports.report4_title')}
                ${this.startYear} - ${this.endYear}
                ${titleFilters}
        </h4>`;
      },

      getTableHeaders() {
        const columns = this.getWorksheetColumns
        return `<tr>${columns.map(col => `<th>${col.header}</th>`).join('')}</tr>`
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
        if (!value) this.startYear = new Date().getFullYear() - 5
        this.reloadData()
      },

      endYear(value) {
        if (!value) this.endYear = new Date().getFullYear()
        this.reloadData()
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
  font-size: 14px !important;
  text-align: center !important;
  overflow: visible !important;
  white-space: normal !important;
  padding-right: unset !important;
}

.md-table-cell.md-numeric {
  padding: 0px !important;
  padding-right: 18px !important;
}

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}
</style>