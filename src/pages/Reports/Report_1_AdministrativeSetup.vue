<!--
File: Report_1_AdministrativeSetup.vue
Description: produce the list of DEUs, and Regions under RMD for printing.
-->
<template>
  <md-card v-if="eligible">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-20">
          <RegionsDropdown v-model="selectedRegion" @input="reloadData" />
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
      <md-table class='"paginated-table table-striped table-hover' :value="report" :md-sort.sync="currentSort"
        :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell style="width:20%" :md-label="$t('road_network.region')" md-sort-by="region_description">
            {{ item.region_description }}
          </md-table-cell>
          <md-table-cell style="width:10%" :md-label="$t('road_network.dep')" md-sort-by="deu_description">
            {{ item.deu_description }}
          </md-table-cell>
          <md-table-cell style="width:20%" :md-label="$t('road_network.length_km_road_class_em')"
            md-sort-by="length_km_road_class_em" md-numeric>
            {{ item.length_km_road_class_em | numFormat }}
          </md-table-cell>
          <md-table-cell style="width:20%" :md-label="$t('road_network.length_km_road_class_m')"
            md-sort-by="length_km_road_class_m" md-numeric>
            {{ item.length_km_road_class_m | numFormat }}
          </md-table-cell>
          <md-table-cell style="width:15%" :md-label="$t('road_network.length_km_road_class_zh')"
            md-sort-by="length_km_road_class_zh" md-numeric>
            {{ item.length_km_road_class_zh | numFormat }}
          </md-table-cell>
        </md-table-row>
      </md-table>

      <md-table>
        <md-table-row>
          <md-table-head style="width:20%">{{ $t('label.total') }}</md-table-head>
          <md-table-head style="width:10%">{{ report_1_total.total }}</md-table-head>
          <md-table-head style="width:20%" md-numeric>{{ report_1_total.length_km_road_class_em | numFormat
          }}</md-table-head>
          <md-table-head style="width:20%" md-numeric>{{ report_1_total.length_km_road_class_m | numFormat
          }}</md-table-head>
          <md-table-head style="width:15%" md-numeric>{{ report_1_total.length_km_road_class_zh | numFormat
          }}</md-table-head>
        </md-table-row>
      </md-table>
    </md-card-content>
  </md-card>
</template>
<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { RegionsDropdown } from '@/pages/Components'
  import { numFormat } from "@/store/helpers/format_helpers"
  import { customSortMixin } from '@/mixins/customSortMixin'
  import { onClose } from '@/mixins/onCloseMixin'
  import permissions from "@/mixins/permissionsMixin"
  import printReport from '@/mixins/printMixin'
  import ExcelJS from 'exceljs';
  import { saveAs } from 'file-saver'; // Для сохранения файла на клиенте

  export default {
    name: 'roads-administrative-setup',
    mixins: [permissions, customSortMixin, printReport],
    data() {
      return {
        formName: 'Report_1',
        eligible: false,

        selectedRegion: null,
        selectedDate: new Date(),
        btnDisabled: true,

        showSpinner: false,
        currentSort: 'region_description',
        currentSortOrder: 'asc',
      }
    },

    components: {
      RegionsDropdown
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };

      // Empty the data
      await this.clearReport(1)
    },

    methods: {
      ...mapActions({
        clearReport: 'CLEAR_REPORT',
        loadReportData: 'REPORT_1_ADMINISTRATIVE_SETUP',
        saveHistory: 'SAVE_HISTORY'
      }),

      onClose,
      async reloadData() {
        if (this.showSpinner || !this.selectedDate) return; // Если уже выполняется, не выполнять повторно
        this.showSpinner = true
        this.btnDisabled = true
        const params = { region_id: this.selectedRegion, inserted_date: this.selectedDate.toISOString().substring(0, 10) }
        try {
          await this.loadReportData(params);
        } finally {
          this.showSpinner = false;
          this.btnDisabled = false;
        }
      },

      print() {
        //this.showSpinner = true
        this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
        //this.showSpinner = false
      },

      fillWorkSheet(workbook, workbookName) {
        const today = new Date().toLocaleDateString();
        const subtitle = `${this.$t('reports.report1_title')} ${this.$t('label.as_on')} ${today}`;
        this.generateWorkSheet(
          workbook,
          workbookName,
          subtitle,
          this.report,
          [
            this.report_1_total.total,
            this.report_1_total.length_km_road_class_em,
            this.report_1_total.length_km_road_class_m,
            this.report_1_total.length_km_road_class_zh
          ]
        );
      },

      async exportToExcel() {
        // Create new Excel file
        const workbook = new ExcelJS.Workbook();
        const wbName = this.$t('route.report_roads_administrative_setup')
        this.fillWorkSheet(workbook, wbName)

        // Save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${wbName}.xlsx`);
      },
    },

    computed: {
      ...mapState({
        report_1_data: (state) => state.Reports.report_1_data,
      }),

      ...mapGetters(['report_1_total']),

      report() {
        return this.customSort(this.report_1_data
          .map(item => { return { ...item, deu_description: `${this.$t('road_network.dep')}-${item.deu_description}` } }),
          'deu_description')
      },

      total() {
        return this.report.length
      },

      getWorksheetColumns() {
        return [
          { header: this.$t('road_network.region'), key: 'region_description', width: 30, group: true },
          { header: this.$t('road_network.dep'), key: 'deu_description', width: 10 },
          { header: this.$t('road_network.length_km_road_class_em'), key: 'length_km_road_class_em', width: 10, num: true, digits: 3 },
          { header: this.$t('road_network.length_km_road_class_m'), key: 'length_km_road_class_m', width: 10, num: true, digits: 3 },
          { header: this.$t('road_network.length_km_road_class_zh'), key: 'length_km_road_class_zh', width: 10, num: true, digits: 3 },
        ];
      },

      headerTitles() {
        return this.selectedRegion ? `(${this.$t('label.from_region', { name: this.report[0].region_description })})` : ''
      },

      getPrintHeader() {
        const today = new Date().toLocaleDateString()
        const regionDesc = this.headerTitles

        return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}<br>
          ${this.$t('reports.report1_title')} ${this.$t('label.as_on')}${today} ${regionDesc}</h4>`;
      },

      getTableRows() {
        const columns = this.getWorksheetColumns

        const tableRowsArray = this.report.map(item => {
          return `<tr>${columns.map(col => col.num
            ? `<td class='numCell'>${numFormat(item[col.key])}</td>`
            : `<td>${item[col.key]}</td>`).join('')}
        </tr>`;
        });

        // Добавляем итоговую строку в массив строк        
        tableRowsArray.push(`<tr>
          <th>${this.$t('label.total')}</th>
          <th>${this.report_1_total.total}</th>
          <th class='numCell'>${numFormat(this.report_1_total.length_km_road_class_em)}</th>
          <th class='numCell'>${numFormat(this.report_1_total.length_km_road_class_m)}</th>
          <th class='numCell'>${numFormat(this.report_1_total.length_km_road_class_zh)}</th>
        </tr>`
        );

        // Преобразуем массив строк таблицы в строку
        return tableRowsArray.join('');
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
  overflow: visible !important;
  white-space: normal !important;
  text-align: center !important;
  word-wrap: break-word !important;
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

thead {
  display: table-header-group;
}

tfoot {
  display: table-footer-group;
}
</style>