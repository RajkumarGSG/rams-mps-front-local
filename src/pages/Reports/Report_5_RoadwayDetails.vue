<!--
File:  Report_5_RoadwayDetails.vue
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
        <div class="md-layout-item md-small-size-100 md-size-20">
          <md-datepicker v-model="selectedDate" md-immediately :md-open-on-focus="false">
            <label>{{ $t('selections.select_date') }}</label>
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
      <md-table class="paginated-table table-striped table-hover" :value="report" :md-sort.sync="currentSort"
        :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell v-if="!selectedRegion" style="max-width: 200px" :md-label="$t('road_network.region')">
            {{ item.region_description }}
          </md-table-cell>
          <md-table-cell v-if="!selectedDeu" :md-label="$t('road_network.dep')">
            {{ item.deu_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.road_key')">
            {{ item.road_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('label.from_km')" md-numeric>
            {{ item.start_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('label.to_km')" md-numeric>
            {{ item.end_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.length')" md-numeric>
            {{ item.length_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.surface_type_desc')">
            {{ item.surface_type_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('label.width_m')" md-numeric>
            {{ item.width_m | numFormat }}
          </md-table-cell>
          <md-table-cell style="width:20%" :md-label="$t('condition.terrain_type_desc')">
            {{ item.terrain_type_description }}
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
    name: 'report-road-way-details',
    mixins: [permissions, customSortMixin, printReport],

    data() {
      return {
        formName: 'Report_5',
        eligible: false,

        selectedRegion: null,
        selectedDate: new Date(),
        selectedDeu: null,
        btnDisabled: true,

        showSpinner: false,
        currentSort: 'region_description',
        currentSortOrder: 'asc',
      }
    },

    components: {
      RegionsDropdown,
      DepsDropdown
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };

      // Empty the data
      await this.clearReport(5);
    },

    methods: {
      ...mapActions({
        clearReport: 'CLEAR_REPORT',
        loadReportData: 'REPORT_5_ROADWAY_DETAILS',
      }),

      onClose,
      async reloadData() {
        if (this.showSpinner || !this.selectedDate) return; // Если уже выполняется, не выполнять повторно

        this.showSpinner = true
        this.btnDisabled = true
        const report_filters = {
          region_id: this.selectedRegion,
          deu_id: this.selectedDeu,
          inserted_date: this.selectedDate.toISOString().substring(0, 10)
        }
        try {
          await this.loadReportData(report_filters);
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
        const subtitle = `${this.$t('route.report_road_way_details')} ${this.$t('label.as_on')} ${this.selectedDate.toLocaleDateString()}`;
        this.generateWorkSheet( workbook, workbookName, subtitle, this.report);
      },

      async exportToExcel() {
        // Create new Excel file
        const workbook = new ExcelJS.Workbook();
        const wbName = this.$t('route.report_road_way_details')
        this.fillWorkSheet(workbook, wbName)

        // Save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${wbName}.xlsx`);
      },
    },

    computed: {
      ...mapState({
        report_5_data: (state) => state.Reports.report_5_data,
      }),

      ...mapGetters([]),

      report() {
        return this.customSort(this.report_5_data
          .map(item => {
            return {
              ...item,
              length_km: item.end_km - item.start_km,
              deu_description: `${this.$t('road_network.dep')}-${item.deu_description}`
            }
          }), 'deu_description')
      },

      getWorksheetColumns() {
        let res = [
          { header: this.$t('road_network.road_key'), key: 'road_description', width: 50 },
          { header: this.$t('label.from_km'), key: 'start_km', width: 10, num: true, digits: 3 },
          { header: this.$t('label.to_km'), key: 'end_km', width: 10, num: true, digits: 3 },
          { header: this.$t('road_network.length'), key: 'length_km', width: 10, num: true, digits: 3 },
          { header: this.$t('condition.surface_type_desc'), key: 'surface_type_description', width: 15 },
          { header: this.$t('label.width_m'), key: 'width_m', width: 10, num: true, digits: 2 },
          { header: this.$t('condition.terrain_type_desc'), key: 'terrain_type_description', width: 25 },
        ];

        if (!this.selectedDeu) {
          res.unshift({ header: this.$t('road_network.dep'), key: 'deu_description', width: 10 });
        }

        if (!this.selectedRegion) {
          res.unshift({ header: this.$t('road_network.region'), key: 'region_description', width: 20 });
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

        return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}<br>
          ${this.$t('route.report_road_way_details')}
          ${this.$t('label.as_on')}${this.selectedDate.toLocaleDateString()}
          ${titleFilters}</h4>`;
      },

      getTableHeaders() {
        const columns = this.getWorksheetColumns
        return `<tr>${columns.map(col => `<th>${col.header}</th>`).join('')}</tr>`
      },

      getTableRows() {
        const columns = this.getWorksheetColumns

        return this.report.map(item => {
          return `<tr>${columns.map(col => col.num
            ? `<td class='numCell'>${numFormat(item[col.key], col.digits)}</td>`
            : `<td>${item[col.key]}</td>`).join('')}
        </tr>`;
        }).join('');
      },
    },

    watch: {
      async selectedDate(value) {
        if (!value) {
          this.selectedDate = new Date();
        } else {
          await this.reloadData();
        }
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