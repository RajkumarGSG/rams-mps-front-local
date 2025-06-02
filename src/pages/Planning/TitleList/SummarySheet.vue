<!--
File: SummarySheet.vue
Description: shows the Summary Sheet using the vue-pivot-table Component.
-->
<template>
  <md-card>
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout" style="align-items: center; ">
        <div class="md-layout-item md-small-size-100 md-size-20">
          <md-button class="md-primary md-simple" @click='onModalClose'>
            <md-icon>arrow_back</md-icon>{{ $t('buttons.back') }}
          </md-button>
        </div>
        <AmountsDropdown class="md-layout-item md-small-size-100 md-size-15" v-model="showAmounts"
          @input="onAmountChange" />
        <div class="md-layout-item btn-row md-small-size-100">
          <md-button v-if="isBtnAllowed('PrintButton')" class="md-success" @click="print">
            {{ $t('buttons.print') }}
          </md-button>
          <md-button v-if="isBtnAllowed('ExportButton')" class="md-success" @click="exportSummary">
            {{ $t('buttons.excel_export') }}
          </md-button>
        </div>
      </div>
    </md-card-header>
    <md-card-content>
      <md-progress-spinner v-show="showSpinner" :md-diameter="100" :md-stroke="10" md-mode="indeterminate" />
      <md-table class="paginated-table table-striped table-hover" :value="queriedData" md-fixed-header>
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <template v-for="(cell, index) in getWorksheetColumns">
            <md-table-cell :md-label="cell.header" v-bind="cell.num ? { 'md-numeric': 'md-numeric' } : {}">
              <span v-if="cell.num">{{ item[cell.key] | numFormat }}</span>
              <span v-else>{{ item[cell.key] }}</span>
            </md-table-cell>
          </template>
        </md-table-row>
      </md-table>
    </md-card-content>
  </md-card>
</template>
<script>
import { mapGetters } from 'vuex'
import { onModalClose } from '@/mixins/onCloseMixin'
import { numFormat } from "@/store/helpers/format_helpers"
import permissions from "@/mixins/permissionsMixin"
import printReport from '@/mixins/printMixin'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import {AmountsDropdown} from '@/pages/Components'

export default {
  name: 'summary-sheet',
  mixins: [permissions, printReport],

  data() {
    return {
      formName: 'SummarySheet',

      showSpinner: false,
      showAmounts: 1000,
    }
  },

  props: {
    selectedWorklist: null,
  },

  components: {
    AmountsDropdown,
  },

  async mounted() {
    // Check if we are eligible to view the form
    if (!this.checkIfScreenAllowed()) {
      this.onClose()
      return
    };

    this.onAmountChange(this.showAmounts, '', this.$t("label.short_thousands"));
    await this.reloadData()
  },

  methods: {
    onModalClose,
    async reloadData() {
      this.showSpinner = true
      await this.$store.dispatch('GET_TITLE_LIST_SUMMARY', this.selectedWorklist)
      //console.log(this.queriedData)
      this.showSpinner = false
    },

    onAmountChange(value, long_desc, desc) {
      this.amountLabel = desc
    },

    async print() {
      this.showSpinner = true
      this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
      this.showSpinner = false
    },

    formatRow(row, header = false, center = false) {
      // Apply formatting to the table header/footer
      const headerCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } } // Blue
      const totalCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } } // yellow

      row.eachCell({ includeEmpty: true }, (cell) => { cell.fill = header ? headerCellFill : totalCellFill })
      row.font = { bold: true, color: { argb: header ? 'FFFFFFFF' : '00000000' } } // White text
      row.alignment = center ? { vertical: 'middle', horizontal: 'center' } : {}
    },

    fillWorkSheet(workbook, workbookName) {
      const worksheet = workbook.addWorksheet(workbookName)

      // Set and format the table headers
      worksheet.columns = this.getWorksheetColumns
      this.formatRow(worksheet.getRow(1), true, true)

      // Number formatting for the columns
      this.getWorksheetColumns.forEach(item => {
        if (item.num) worksheet.getColumn(item.key).numFmt = '#,##0.00'
      })

      let curRow = 1
      this.queriedData.forEach(item => {
        worksheet.addRow(item);
        curRow++
      })

      // Format total row
      this.formatRow(worksheet.getRow(curRow))
      this.formatRow(worksheet.getRow(curRow - 1))
    },

    async exportSummary() {
      this.showSpinner = true

      // Create new Excel file
      const workbook = new ExcelJS.Workbook();
      this.fillWorkSheet(workbook, this.$t('buttons.summary_sheet'))

      // Генерация Excel файла и сохранение
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${this.$t('buttons.summary_sheet')}.xlsx`);
      this.showSpinner = false
    }
  },

  computed: {
    ...mapGetters(['summaryListRegions', 'summaryListRows', 'summaryListTotals']),

    getWorksheetColumns() {
      const regions = this.summaryListRegions
      let res = [
        { header: this.$t('label.category'), key: 'cat', width: 40 },
        { header: this.$t('label.units'), key: 'units', width: 10 },
        { header: this.$t('label.total_rmd'), key: 'total', width: 15, num: true }
      ]
      regions.forEach((region, index) => {
        res.push({ header: region, key: index.toLocaleString(), width: 15, num: true })
      })
      return res
    },

    queriedData() {
      return this.summaryListRows(this.amountLabel, this.showAmounts, this.$t('label.total'))
    },

    total() {
      return this.queriedData.length
    },

    getPrintHeader() {
      const today = new Date().toLocaleDateString()
      return `<h4 style='text-align:center'>${this.$t('label.summary_sheet_title')}<br>
        ${this.$t('label.summary_sheet_subheader')}<br>
        ${this.$t('label.as_on')} ${today}</h4>`;
    },

    getTableRows() {
      const columns = this.getWorksheetColumns
      let tableRows = '';

      // render rows
      this.queriedData.forEach((row, index) => {
        // the last 2 rows are for total, that's why th instead of td
        const cellType = index >= this.total - 2 ? 'th' : 'td'
        tableRows += `<tr>${columns.map(col => col.num
          ? `<${cellType} class='numCell'>${numFormat(row[col.key])}</${cellType}>`
          : `<${cellType}>${row[col.key]}</${cellType}>`).join('')}
          </tr>`;
      });
      return tableRows;
    },
  }
}
</script>
<style lang="scss">
.md-card {
  margin: 0px 0;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.paginated-table .md-table-head-label {
  overflow: visible !important;
  white-space: normal !important;
  text-align: center !important;
  word-wrap: break-word !important;
}

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}
</style>