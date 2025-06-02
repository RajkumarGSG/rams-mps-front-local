<!--
File: Report_7_RoadConditionData.vue
Description: produce report showin detailed condition data as per selected parameters.
-->
<template>
  <md-card v-if="eligible">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-15">
          <RegionsDropdown v-model="selectedRegion" @input='reloadData' />
        </div>
        <!--div class="md-layout-item md-small-size-100 md-size-20">
          <DepsDropdown v-model="selectedDeu" :regionId="selectedRegion" @input='onDeuChange' :disabled='!selectedRegion' />
        </div>-->
        <div class="md-layout-item md-small-size-100 md-size-15">
          <RoadsDropdown v-model="selectedRoad" :items="roadsInReport7" :disabled='!selectedRegion' @input="reloadData" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-15">
          <SectionsDropdown v-model="selectedSection" :regionId="selectedRegion" :roadId="selectedRoad"
            :disabled='!selectedRegion' @input='reloadData' />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-15">
          <md-datepicker v-model="startDate" md-immediately :md-open-on-focus="false">
            <label>{{ $t('label.start_date') }}</label>
          </md-datepicker>
        </div>
        <div class="md-layout-item md-small-size-100 md-size-15">
          <md-datepicker v-model="endDate" md-immediately :md-open-on-focus="false">
            <label>{{ $t('label.end_date') }}</label>
          </md-datepicker>
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
      <md-table id="printMe" class="paginated-table table-striped table-hover" :value="report" :md-sort.sync="currentSort"
        :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell v-if="!selectedRegion" :md-label="$t('road_network.region')">
            {{ item.region_description }}
          </md-table-cell>
          <md-table-cell v-if="!selectedDeu" :md-label="$t('road_network.dep')" md-sort-by="deu_description">
            {{ item.deu_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.section_description')" md-sort-by="section_description">
            {{ item.section_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.start_km')" md-sort-by="start_distance_km" md-numeric>
            {{ item.survey_start_distance_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.end_km')" md-sort-by="end_distance_km" md-numeric>
            {{ item.survey_end_distance_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.cracking_m2')" md-sort-by="total_cracking_m2" md-numeric>
            {{ item.total_cracking_m2 | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.potholes_no')" md-sort-by="total_potholes_no" md-numeric>
            {{ item.total_potholes_no | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.rutting')" md-sort-by="average_rutting" md-numeric>
            {{ item.average_rutting | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.repairs_m2')" md-sort-by="total_repairs_m2" md-numeric>
            {{ item.total_repairs_m2 | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.edge_break_m2')" md-sort-by="total_edge_break_m2" md-numeric>
            {{ item.total_edge_break_m2 | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.iri')" md-sort-by="average_iri" md-numeric>
            {{ item.average_iri | numFormat }}
          </md-table-cell>
          <!--md-table-cell :md-label="$t('road_network.length_km')" md-sort-by="distance" md-numeric>
            {{ item.distance | numFormat(3) }}
          </md-table-cell-->
          <md-table-cell :md-label="$t('condition.survey_date')" md-sort-by="survey_date">
            {{ item.survey_date }}
          </md-table-cell>
        </md-table-row>
      </md-table>
    </md-card-content>
    <!--md-card-actions md-alignment="space-between">
      <div> {{ $t('road_network.total_surveyed_km') }} </div>
      <div> {{ total_length }} </div>
    </md-card-actions-->
  </md-card>
</template>
<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { RegionsDropdown, RoadsDropdown, SectionsDropdown } from '@/pages/Components'
  import { numFormat } from "@/store/helpers/format_helpers"
  import { customSortMixin } from '@/mixins/customSortMixin'
  import { onClose } from '@/mixins/onCloseMixin'
  import permissions from "@/mixins/permissionsMixin"
  import printReport from '@/mixins/printMixin'
  import ExcelJS from 'exceljs';
  import { saveAs } from 'file-saver';

  export default {
    name: 'report-road-condition-data',
    mixins: [permissions, customSortMixin, printReport],
    data() {
      return {
        formName: 'Report_7',
        eligible: false,

        selectedRegion: null,
        selectedDeu: null,
        startDate: null,           //1950,
        endDate: new Date(),       // 2024,
        selectedSection: null,
        selectedRoad: null,

        dataIsLoaded: false,

        showSpinner: false,
        regionDescr: null,
        roadDescr: null,
        sectionDescr: null,
        currentSort: 'region_description',
        currentSortOrder: 'asc'
      }
    },
    components: {
      RegionsDropdown,
      RoadsDropdown,
      SectionsDropdown
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };

      // Empty the data
      await this.clearReport(7);
      this.startDate = this.getLastYear;
    },

    methods: {
      ...mapActions({
        clearReport: 'CLEAR_REPORT',
        loadReportData: 'REPORT_7_ROAD_CONDITION_DATA',
      }),

      onClose,
      async reloadData() {
        if (this.showSpinner || !this.startDate || !this.endDate) return; // Если уже выполняется, не выполнять повторно

        this.showSpinner = true
        this.dataIsLoaded = false
        const reportParams = {
          region_id: this.selectedRegion,
          deu_id: this.selectedDeu,
          road_id: this.selectedRoad,
          section_id: this.selectedSection,
          survey_date_from: this.startDate.toISOString().substring(0, 10),
          survey_date_to: this.endDate.toISOString().substring(0, 10)
        }
        try {
          await this.loadReportData(reportParams)
        } finally {
          this.dataIsLoaded = true
          this.showSpinner = false
        }
      },

      print() {
        this.showSpinner = true
        this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
        this.showSpinner = false
      },

      fillWorkSheet(workbook, workbookName) {
        const subtitle = `${this.$t('reports.report7_title')} ${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
        this.generateWorkSheet(workbook, workbookName, subtitle, this.report);
      },

      async exportToExcel() {
        // Create new Excel file
        const workbook = new ExcelJS.Workbook();
        const wbName = this.$t('reports.report7_title')
        this.fillWorkSheet(workbook, wbName)

        // Save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${wbName}.xlsx`);
      },
    },

    computed: {
      ...mapState({
        report_7_data: (state) => state.Reports.report_7_data,
      }),
      ...mapGetters(['report_7_total', 'roadsInReport7']),

      report() {
        const deu_label = this.$t('road_network.dep')
        return this.customSort(this.report_7_data
          .map(item => {
            return {
              ...item,
              deu_description: `${deu_label}-${item.deu_description}`
            }
          }), 'deu_description')
      },

      total_length() {
        return numFormat(this.report_7_total, 3)
      },

      btnDisabled() {
        return this.report_7_total == 0 || !this.dataIsLoaded
      },

      getWorksheetColumns() {
        const baseColumns = [
          { header: this.$t('road_network.dep'), key: 'deu_description', width: 10 },
          { header: this.$t('road_network.start_km'), key: 'survey_start_distance_km', width: 10, num: true, digits: 3 },
          { header: this.$t('road_network.end_km'), key: 'survey_end_distance_km', width: 10, num: true, digits: 3 },
          { header: this.$t('condition.cracking_m2'), key: 'total_cracking_m2', width: 10, num: true, digits: 2 },
          { header: this.$t('condition.potholes_no'), key: 'total_potholes_no', width: 10, num: true, digits: 2 },
          { header: this.$t('condition.rutting'), key: 'average_rutting', width: 10, num: true, digits: 2 },
          { header: this.$t('condition.repairs_m2'), key: 'total_repairs_m2', width: 10, num: true, digits: 2 },
          { header: this.$t('condition.edge_break_m2'), key: 'total_edge_break_m2', width: 10, num: true, digits: 2 },
          { header: this.$t('condition.iri'), key: 'average_iri', width: 10, num: true, digits: 2 },
          //{ header: this.$t('traffic.surveyed_distance'), key: 'distance', width: 10, num: true, digits: 3 },
          { header: this.$t('condition.survey_date'), key: 'survey_date', width: 15 },
        ];

        const conditionalColumns = [
          { condition: !this.selectedRegion, column: { header: this.$t('road_network.region'), key: 'region_description', width: 25 } },
          { condition: !this.selectedSection, column: { header: this.$t('road_network.section'), key: 'section_description', width: 40 } },
        ];

        return conditionalColumns.filter(item => item.condition).map(item => item.column).concat(baseColumns);
      },

      headerTitles() {
        const titleFiltersArray = [
          { condition: this.selectedRegion, column: this.$t('label.from_region', { name: this.report[0].region_description }) },
          { condition: this.selectedRoad, column: `${this.$t('road_network.road')}: ${this.report[0].road_description}` },
          { condition: this.selectedSection, column: `${this.$t('road_network.section')}: ${this.report[0].section_description}` },
        ].filter(item => item.condition).map(item => item.column);

        return titleFiltersArray;
      },

      getPrintHeader() {
        const titleFilters = this.headerTitles.length > 0 ? `<br>(${this.headerTitles.join(', &nbsp;')})` : '';

        return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
              <h4 style='text-align:center'>
                ${this.$t('reports.report7_title')}
                ${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}
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

      getLastYear() {
        const st = new Date()
        st.setFullYear(st.getFullYear() - 1)
        return st
      }
    },

    watch: {
      startDate(newValue) {
        if (!newValue) this.startDate = this.getLastYear
        else this.reloadData()
      },
      endDate(newValue) {
        if (!newValue) this.endDate = new Date()
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