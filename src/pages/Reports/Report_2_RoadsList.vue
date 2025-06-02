<!--
File: Report_2_RoadsList.vue
Description: show list of roads entered with filtering for printing.
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
          <RoadClassesDropdown v-model="selectedRoadClass" @input='reloadData' />
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
      <md-progress-spinner v-if="showSpinner" :md-diameter="70" md-mode="indeterminate" />
      <md-table class="paginated-table table-striped table-hover" :value="report" :md-sort.sync="currentSort"
        :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell v-if="!selectedRegion" style="max-width: 200px;" :md-label="$t('road_network.region')"
            md-sort-by="region_description">
            {{ item.region_description }}
          </md-table-cell>
          <md-table-cell v-if="!selectedDeu" :md-label="$t('road_network.dep')" md-sort-by="deu_description">
            {{ item.deu_description }}
          </md-table-cell>
          <md-table-cell v-if="!selectedRoadClass" :md-label="$t('road_network.road_class')" md-sort-by="road_class">
            {{ item.road_class }}
          </md-table-cell>
          <md-table-cell style="min-width: 35%;" :md-label="$t('road_network.road')" md-sort-by="road_description">
            <a href='#' @click.stop.prevent='showRoad(item)'> {{ item.road_description }}</a>
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.start_km')" md-sort-by="start_km" md-numeric>
            {{ item.start_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.end_km')" md-sort-by="end_km" md-numeric>
            {{ item.end_km | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.length_km')" md-sort-by="length_km" md-numeric>
            {{ item.length_km | numFormat(3) }}
          </md-table-cell>
        </md-table-row>
      </md-table>
    </md-card-content>
    <md-card-actions md-alignment="space-between">
      <div> {{ $t('road_network.total_length') }} </div>
      <div> {{ report_2_total | numFormat(3) }} </div>
    </md-card-actions>
  </md-card>
</template>
<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { RegionsDropdown, DepsDropdown, RoadClassesDropdown } from '@/pages/Components'
  import { numFormat } from "@/store/helpers/format_helpers"
  import { customSortMixin } from '@/mixins/customSortMixin'
  import { onClose } from '@/mixins/onCloseMixin'
  import permissions from "@/mixins/permissionsMixin"
  import printReport from '@/mixins/printMixin'
  import ExcelJS from 'exceljs';
  import { saveAs } from 'file-saver';

  export default {
    name: 'roads-list',
    mixins: [permissions, customSortMixin, printReport],
    data() {
      return {
        formName: 'Report_2',
        eligible: false,

        selectedRegion: null,
        selectedDeu: null,
        selectedRoadClass: null,
        selectedDate: new Date(),
        btnDisabled: true,

        showSpinner: false,
        currentSort: 'region_description',
        currentSortOrder: 'asc'
      }
    },
    components: {
      RegionsDropdown,
      DepsDropdown,
      RoadClassesDropdown
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };

      // Empty the data
      await this.clearReport(2)
    },

    methods: {
      ...mapActions({
        clearReport: 'CLEAR_REPORT',
        loadReportData: 'REPORT_2_ROAD_INFO',
        saveHistory: 'SAVE_HISTORY'
      }),

      onClose,
      reloadData() {
        this.showSpinner = true
        this.btnDisabled = true
        const params = {
          inserted_date: this.selectedDate.toISOString().substring(0, 10),
          region_id: this.selectedRegion,
          deu_id: this.selectedDeu,
          road_class: this.selectedRoadClass
        }
        this.loadReportData(params).then(() => {
          this.btnDisabled = false
          this.showSpinner = false
        })
      },

      print() {
        this.showSpinner = true
        this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
        this.showSpinner = false
      },

      fillWorkSheet(workbook, workbookName) {
        const subtitle = `${this.$t('route.list_of_roads')} ${this.$t('label.as_on')} ${this.selectedDate.toLocaleDateString()}`;
        this.generateWorkSheet(workbook, workbookName, subtitle, this.report, [this.report_2_total], this.col_span);
      },

      async exportToExcel() {
        // Create new Excel file
        const workbook = new ExcelJS.Workbook();
        const wbName = this.$t('route.report_roads_list')
        this.fillWorkSheet(workbook, wbName)

        // Save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${wbName}.xlsx`);
      },

      showRoad(item) {
        const hist = {
          form: 'Roads',
          data: {
            searchQuery: item.road_description.substring(0, 25),
            perPage: 10,
            currentPage: 1
          },
          use: true,
          closePath: window.location.pathname  // current URL path
        }
        this.saveHistory(hist)
        this.$router.push('/inventory_data/roads')
      },
    },

    computed: {
      ...mapState({
        report_2_data: (state) => state.Reports.report_2_data,
      }),

      ...mapGetters(['report_2_total']),

      report() {
        return this.customSort(this.report_2_data
          .map(item => { return { ...item, deu_description: `${this.$t('road_network.dep')}-${item.deu_description}` } }),
          'deu_description')
      },

      getWorksheetColumns() {
        let res = [
          { header: this.$t('road_network.road'), key: 'road_description', width: 40 },
          { header: this.$t('road_network.start_km'), key: 'start_km', width: 10, num: true, digits: 3 },
          { header: this.$t('road_network.end_km'), key: 'end_km', width: 10, num: true, digits: 3 },
          { header: this.$t('road_network.length_km'), key: 'length_km', width: 15, num: true, digits: 3 },
        ];

        if (!this.selectedRoadClass) {
          res.unshift({ header: this.$t('road_network.road_class'), key: 'road_class', width: 10 });
        }

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

        if (this.selectedRoadClass) {
          titleFiltersArray.push(`${this.$t('road_network.road_class')}: ${this.report[0].road_class}`);
        }
        return titleFiltersArray
      },

      getPrintHeader() {
        const titleFilters = this.headerTitles.length > 0 ? `<br>(${this.headerTitles.join(', &nbsp;')})` : '';

        return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}<br>
                ${this.$t('route.list_of_roads')}&nbsp;
                ${this.$t('label.as_on')} ${this.selectedDate.toLocaleDateString()}&nbsp;${titleFilters}</h4>`;
      },

      getTableRows() {
        const columns = this.getWorksheetColumns

        const tableRowsArray = this.report.map(item => {
          return `<tr>${columns.map(col => col.num
            ? `<td class='numCell'>${numFormat(item[col.key])}</td>`
            : `<td>${item[col.key]}</td>`).join('')}
        </tr>`;
        });

        // Добавляем итоговую строку
        tableRowsArray.push(`<tr>
          <th colspan=${this.col_span}>${this.$t('road_network.total_length')}</th>
                        <th class='numCell'>${numFormat(this.report_2_total, 3)}</th>
        </tr>`);

        // Преобразуем массив строк таблицы в строку
        return tableRowsArray.join('');
      },

      col_span() {
        return this.getWorksheetColumns.length - 1
      }
    },

    watch: {
      selectedDate(value) {
        if (!value) this.selectedDate = new Date()
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