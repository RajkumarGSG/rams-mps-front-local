<!--
File: PrintTitleList.vue
Description: form for generating printed version of the Titlelist.
-->
<template>
  <div>
    <md-card v-if="eligible && !showSummarySheet">
      <md-card-header class="md-card-header-icon md-card-header-green">
        <div class="md-layout" style="align-items: center; justify-content: flex-start; width: auto;">
          <div class="md-layout-item md-small-size-20 md-size-10">
            <YearsDropdown v-model="selectedWorklist" :items="yearsInWorkList" @input="onWorklistChange" />
          </div>
          <div class="md-layout-item md-small-size-100 md-size-20">
            <RegionsDropdown v-model="selectedRegion" @input="onRegionChange" />
          </div>
          <div v-if="selectedWorklist" class="md-layout-item btn-row md-small-size-100 md-size-15">
            <AmountsDropdown v-model="showAmounts" @input="onAmountChange" />
          </div>
          <div v-if="selectedWorklist && isBtnAllowed('ShowSummaryButton')"
            class="md-layout-item btn-row md-small-size-100">
            <md-button class="md-raised md-success" @click="toggleSummarySheet(true)">
              {{ $t('buttons.summary_sheet') }}
            </md-button>
          </div>
          <div v-if='showPrintButton' class="md-layout-item btn-row md-small-size-100">
            <md-button v-if="isBtnAllowed('PrintButton')" class="md-raised md-success" @click="print">
              {{ $t('buttons.print') }}
            </md-button>
            <md-button v-if="isBtnAllowed('ExportButton')" class="md-raised md-success" @click="exportToExcel">
              {{ $t('buttons.excel_export') }}
            </md-button>
          </div>
        </div>
      </md-card-header>

      <md-card-content>
        <md-progress-spinner v-show="showSpinner == true" :md-diameter="70" md-mode="indeterminate" />
        <div v-if="dataIsLoaded && total > 0" class="scroll-container">
          <table class="paginated-table table-striped table-hover">
            <thead v-html="getTableHeaders"></thead>
            <tbody v-html="getTableRows"></tbody>
          </table>
        </div>
      </md-card-content>
      <md-card-actions>
      </md-card-actions>
    </md-card>

    <SummarySheet v-if="showSummarySheet" :style="{ width: '100%', height: '100%' }"
      :selectedWorklist='selectedWorklist' @close="toggleSummarySheet(false)" />
  </div>
</template>

<script>
import { RegionsDropdown, YearsDropdown, AmountsDropdown } from '@/pages/Components'
import { mapState, mapGetters, mapActions } from 'vuex'
import { numFormat } from "@/store/helpers/format_helpers"
import permissions from "@/mixins/permissionsMixin"
import printReport from '@/mixins/printMixin'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // Для сохранения файла на клиенте
import SummarySheet from './SummarySheet.vue'

export default {
  name: 'PrintTitleList',
  mixins: [permissions, printReport],

  data() {
    return {
      formName: 'PrintTitleList',
      eligible: false,

      showSpinner: true,
      selectedWorklist: null,
      selectedRegion: null,
      selectedYear: null,
      selectedPlanForAssignment: null,
      selectedPlan: null,
      selectedBudget: null,
      dataIsLoaded: false,

      showAmounts: 1000,
      amountLabel: '',
      regionDescr: null,
      showSummarySheet: false,
    }
  },

  props: {
    step: { default: 'first', type: String },
  },

  components: {
    RegionsDropdown,
    AmountsDropdown,
    YearsDropdown,
    SummarySheet
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      this.onClose()
      return
    };

    this.toggleSpinner(true)
    this.onAmountChange(this.showAmounts, '', this.$t("label.short_thousands"));

    // Reset the lists in the store if they were filled previouly
    await this.resetWorkLists()
    await this.resetTreatments()

    await this.reloadWorksLists();
    await this.loadWorkCategories({});
  },

  methods: {
    ...mapActions({
      loadWorkCategories: 'ReferenceData/LOAD_WORK_CATEGORY_LIST',
      resetWorkLists: 'RESET_WORK_LISTS',
      resetTreatments: 'RESET_TREATMENTS',
      loadWorkLists: 'LOAD_WORKS_LISTS',
      loadAllWorks: 'LOAD_ALL_WORKS',

      loadRMPlans: 'Planning/LOAD_RM_PLAN_LIST',
    }),

    toggleSpinner(state) {
      this.showSpinner = state
    },

    toggleSummarySheet(state) {
      this.showSummarySheet = state
      if (!state) this.reloadTreatmentsList(this.selectedWorklist, this.selectedRegion)
    },

    async reloadWorksLists() {
      this.toggleSpinner(true)
      const params = {
        is_approved: 1
      }
      try {
        await this.loadWorkLists({})
      } catch (err) {
      } finally {
        this.toggleSpinner(false)
      }
    },

    onWorklistChange(worklist, year) {
      this.selectedYear = year
      this.reloadTreatmentsList(worklist, this.selectedRegion);
    },

    onRegionChange(region_id, regionDescr) {
      // get Region description needed for showing in the printed form
      this.regionDescr = regionDescr
      this.reloadTreatmentsList(this.selectedWorklist, region_id)
    },

    onAmountChange(value, long_desc, desc) {
      this.costLabel = `${this.$t('stdCols.cost')} ${desc}`
    },

    async reloadTreatmentsList(worklist, region_id) {
      if (!region_id || !worklist) {
        await this.resetTreatments()
        return
      }

      this.toggleSpinner(true)
      this.dataIsLoaded = false
      const params = {
        work_list_id: worklist,
        region_id,
        is_budget_assigned: 1
      };

      try {
        await this.loadAllWorks(params);
        await this.loadRMPlans({ region_id });
        this.dataIsLoaded = true;
      } finally {
        this.toggleSpinner(false);
      };
      console.log('rmPlansForTitleList', this.rmPlansForTitleList(this.selectedYear))  //(this.selectedYear))
    },

    print() {
      this.showSpinner = true
      this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
      this.showSpinner = false
    },

    fillTreatments(worksheet, category_id) {
      // Fill the table with treatments except Routine Maintenance
      const totalCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }// yellow

      for (const [groupName, group] of Object.entries(this.groupedData)) {
        if (group.length > 0 && group[0].fk_work_category == category_id) {

          let row = worksheet.addRow(['', groupName]);
          row.font = { bold: true };

          group.forEach(item => {
            worksheet.addRow(item);
          })

          // Subtotals for group
          row = worksheet.addRow(this.getWorksheetColumns.map(col => {
            if (col.group) {
              return this.$t('label.total');
            }
            if (col.totals) {
              return this.groupTotals[groupName][col.totals];
            }
            return '';
          }))
          row.font = { bold: true };
          row.eachCell({ includeEmpty: true }, (cell) => { cell.fill = totalCellFill });
        }
      }
    },

    fillRMTreatments(worksheet) {
      for (const [name, item] of Object.entries(this.groupTotalsRM)) {
        worksheet.addRow(['', this.$t('label.including')]);
        worksheet.addRow(this.getWorksheetColumns.map(col => {
          if (col.group) {
            return item.name;
          }
          if (col.work_area_unit_description) {
            return item.unit_description;
          }
          if (col.totals) {
            return item[col.totals];
          }
          return '';
        }));
      };
    },
    //console.log('rmPlansForTitleList', this.rmPlansForTitleList(this.selectedYear))  //(this.selectedYear))

    fillRegularMaintenanceTreatments(worksheet) {
      worksheet.addRow(['', this.$t('label.including')]);
      worksheet.addRow(['', this.$t('label.winter_maintenance'), '', '', '', 0, '', '', 0]);
      worksheet.addRow(['', this.$t('label.summer_maintenance'), '', '', '', 0, '', '', 0]);
    },

    fillWorkSheet(workbook, regionDesc) {
      const today = new Date().toLocaleDateString()
      const subtitle = `${this.$t('route.title_list')} ${this.$t('label.as_on')} ${today}, ${this.$t('label.from_region', { name: this.regionDescr })}`;
      const worksheet = this.generateWorkSheet(
        workbook,
        regionDesc,
        subtitle,
        [], // Данные добавим вручную
        null, // Нет итоговой строки на этом этапе
        null, // Нет colSpan
        true // Используем заголовок отчёта
      );

      this.insertAdditionalHeader(worksheet, 'before', this.$t('label.coating_type'), 7, 2)

      // Применение числового форматирования к колонкам
      this.getWorksheetColumns.forEach(item => {
        if (item.num) worksheet.getColumn(item.key).numFmt = '#,##0.00';
      });

      // Обработка категорий работ и заполнение данными
      const categoryCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC800' } };

      this.workCategoriesList.forEach(category => {
        if (category.description && category.id !== 10) {
          // Добавляем строку с названием категории
          let row = worksheet.addRow(['', category.description, '', '', '', '', '', '', '', '', '', '']);
          row.font = { bold: true };
          row.eachCell({ includeEmpty: true }, (cell) => { cell.fill = categoryCellFill });

          // Вызов нужного метода заполнения данных
          if (category.id === 4) {
            this.fillRMTreatments(worksheet);
          } else if (category.id === 8) {
            this.fillRegularMaintenanceTreatments(worksheet);
          } else {
            this.fillTreatments(worksheet, category.id);
          }
        }
      });

      // Добавление итоговой строки
      const totalRow = worksheet.addRow([this.$t('label.total'), '', '', '', '', '', '', '', this.overallTotal]);
      const rowIndex = totalRow.number;
      worksheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
      totalRow.font = { bold: true, size: 14 };
    },

    async exportToExcel() {
      // Create new Excel file
      const workbook = new ExcelJS.Workbook();
      const regionDesc = this.treatmentsList[0].region_description
      this.fillWorkSheet(workbook, regionDesc)

      // Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${this.$t('label.titlelist')}-${regionDesc}.xlsx`);
    },

    getMaintenanceRows(category_id) {
      const columns = this.getWorksheetColumns
      let tableRows = ''
      for (const [groupName, group] of Object.entries(this.groupedData)) {
        if (group.length > 0 && group[0].fk_work_category == category_id) {
          // Row with group name
          tableRows += `<tr style="background-color: rgb(255, 255, 0);">
              <td colspan='12'><strong>${groupName}</strong></td>
            </tr>`

          // Rows
          group.forEach((row) => {
            const oneRow = columns.map(col => col.num
              ? `<td ${this.getCellStyle}>${numFormat(row[col.key], col.digits)}</td>`
              : `<td>${row[col.key]}</td>`
            ).join('')
            tableRows += `<tr>${oneRow}</tr>`;
          });

          // Group total row
          const totalRow = columns.map(col => {
            if (col.totals) {
              return `<td ${this.getCellStyle}>${numFormat(this.groupTotals[groupName][col.totals])}</td>`;
            }
            return `<td>${col.group ? this.$t('label.total') : '&nbsp;'}</td>`;
          }).join('')
          tableRows += `<tr style="background-color: rgb(204, 221, 255);">${totalRow}</tr>`;
        }
      }
      return tableRows
    },
  },

  computed: {
    ...mapState({
      treatments: (state) => state.TitleList.treatmentsList,
      workCategoriesList: (state) => state.ReferenceData.work_category_list,
      rmPlanList: (state) => state.Planning.rm_plan_list,
      //regionsList: (state) => state.Dropdowns.regions,
    }),

    ...mapGetters(['yearsInWorkList']),
    ...mapGetters('Planning', ['rmPlansForTitleList']),

    treatmentsList() {
      // TODO: remove it after Andrey implements issue #129
      return this.treatments.map(item => {
        const newUnuts = item.work_area_unit_description === "km" || item.work_area_unit_description === "км"
          ? item.length_m / 1000
          : item.units
        return {
          ...item,
          units: newUnuts
        }
      })
    },

    total() {
      return this.treatmentsList.length
    },

    showPrintButton() {
      return this.total > 0
    },

    // Группировка данных по полю 'group'
    groupedData() {
      const groupedProducts = this.treatmentsList
        .filter(el => el.is_budget_approved == 1)
        .reduce((accumulator, product) => {
          // If the category doesn't exist in the accumulator, create it
          if (!accumulator[product.fk_work_category]) {
            accumulator[product.fk_work_category] = [];
          }
          // Push the product into the corresponding category array
          accumulator[product.fk_work_category].push(product);
          return accumulator;
        }, {}); // Initial value is an empty object

      console.log('groupedProducts', groupedProducts);
      /*
            // Create a new array with indexed products
            const indexedProducts = Object.entries(groupedProducts).flatMap(([category, items]) => {
              // Sort items by name
         //     items.sort((a, b) => a.work_category_description.localeCompare(b.work_category_description));
      
              // Map items to include a new index field
              return items.map((item, index) => ({
                ...item,
                index: index + 1, // Add index starting from 1
                category: category // Include the category in the new object
              }));
            });
      
            console.log(indexedProducts);
      */

      let index = 0;
      console.log('treatmentsList', this.treatmentsList.filter(el => el.fk_work_category == 5))
      
      let res = this.treatmentsList
        // change to counting by number of treatments later
        .filter(el => el.fk_work_category != 8 && el.fk_work_category != 10 && el.is_budget_approved == 1)
        .sort((a, b) => {
          const descA = a.treatment_type_description || ''
          const descB = b.treatment_type_description || ''
          return descA.localeCompare(descB, undefined, { sensitivity: 'base' });
        })

        .reduce((groups, row) => {
          const group = row.treatment_type_description
          if (!groups[group]) {
            groups[group] = [];
            index = 0
          }
          index++
          groups[group].push({
            id: index,
            ...row,
            cost: row.cost / this.showAmounts,
          });
          return groups;
        }, {})
      return res  //
    },

    groupedDataRM() {
      let res = this.treatmentsList
        //.filter(el => // change to fk_work_category later
        //['Patching', 'Local repair', 'Crack sealing', 'Местный ремонт', 'Заливка трещин', 'Ямочный ремонт']
        //.includes(el.treatment_type_description))
        .filter(el => (!el.fk_work_category  || el.fk_work_category == 10) && el.is_budget_approved == 1)
        .reduce((groups, row) => {
          const group = row.treatment_type_description  //'Routine Maintenance'
          if (!groups[group]) {
            groups[group] = [];
          }
          groups[group].push({
            ...row,
            cost: row.cost / this.showAmounts,
          });
          return groups;
        }, {});

        console.log('groupedDataRM', res)
      return res  //
    },

    // Подсчет итогов для каждой группы
    groupTotals() {
      return Object.keys(this.groupedData).reduce((totals, groupName) => {
        totals[groupName] = {
          totalCost: this.groupedData[groupName].reduce((sum, row) => sum + row.cost, 0),
          totalUnits: this.groupedData[groupName].reduce((sum, row) => sum + row.units, 0)
        }
        return totals
      }, {});
    },

    groupTotalsRM() {
      return Object.keys(this.groupedDataRM).reduce((totals, groupName) => {
        totals[groupName] = {
          name: groupName,
          unit_description: this.groupedDataRM[groupName][0].unit_description,
          totalUnits: this.groupedDataRM[groupName].reduce((sum, row) => sum + row.units, 0),
          totalCost: this.groupedDataRM[groupName].reduce((sum, row) => sum + row.cost, 0),
        }
        return totals
      }, {});
    },

    // Подсчет общего итога по всей таблице
    overallTotal() {
      return this.treatmentsList.reduce((sum, row) => sum + row.cost, 0) / this.showAmounts;
    },

    getWorksheetColumns() {
      return [
        { header: this.$t('stdCols.id'), key: 'id', width: 5 },
        { header: this.$t('label.object_name'), key: 'section_description', width: 60, group: true },
        { header: this.$t('inventory.start_distance_m'), key: 'start_m', width: 10, num: true, digits: 0 },
        { header: this.$t('inventory.end_distance_m'), key: 'end_m', width: 10, num: true, digits: 0 },
        { header: this.$t('label.units'), key: 'work_area_unit_description', width: 10 },
        { header: this.$t('label.quantity'), key: 'units', width: 10, num: true, digits: 2, totals: 'totalUnits' },
        { header: this.$t('label.before'), key: 'before', width: 10 },
        { header: this.$t('label.after'), key: 'expected_outcome', width: 15 },
        { header: this.amountLabel, key: 'cost', width: 20, num: true, digits: 2, totals: 'totalCost', grand_total: 'overallTotal' },
        { header: this.$t('road_network.dep'), key: 'deu_description', width: 5 },
        { header: this.$t('label.reason'), key: 'work_category_reason', width: 30 },
        { header: this.$t('label.district'), key: 'district_description', width: 20 },
      ]
    },

    getTableHeaders() {
      const cells = this.getWorksheetColumns
        .map(col => `<th ${col.colspan ? '' : 'rowspan=2'}>${col.header}</th>`)
        .join('')
      return `<tr><th colspan=6>&nbsp;</th><th colspan=2>${this.$t('label.coating_type')}</th><th colspan=5></th></tr>
                          <tr>${cells}</tr>`
    },

    getCellStyle() {
      return "style='text-align: right; padding-right: 10px;'"
    },

    getPatchingRows() {
      let tableRows = ''
      for (const row of Object.values(this.groupTotalsRM)) {
        tableRows += `<tr><td>&nbsp;</td><td colspan=12><strong>${this.$t('label.including')}</strong></td></tr>`
        const totalRow = this.getWorksheetColumns.map(col => {
          if (col.group) {
            return `<td>${row.name}</td>`;
          }
          if (col.work_area_unit_description) {
            return `<td>${row.unit_description}</td>`;
          }
          if (col.totals) {
            return `<td ${this.getCellStyle}>${numFormat(row[col.totals])}</td>`;
          }
          return '<td>&nbsp;</td>';
        }).join('');

        tableRows += `<tr>${totalRow}</tr>`;
      }
      return tableRows
    },

    getRoutineMaintenanceRows() {
      let tableRows = `<tr style="background-color: rgb(255, 200, 0);">
            <td colspan='12'><strong>${this.$t('route.routine_maintenance')}</strong></td></tr>
            <tr><td>&nbsp;</td><td colspan=11><strong>${this.$t('label.including')}</strong></td></tr>`
      for (const [key, value] of Object.entries(this.rmPlansForTitleList(this.selectedYear))) {
        tableRows += `<tr><td>&nbsp;</td><td colspan=7><strong>${key}</strong></td><td ${this.getCellStyle}>
          <strong>${numFormat(value, 2)}</strong></td><td colspan=3></td></tr>`;
      };
      return tableRows;
    },

    getOverallTotalRow() {
      const totalRow = this.getWorksheetColumns.map(col => {
        if (col.key === 'id') {
          return '';
        }
        if (col.group) {
          return `<td colspan="2">${this.$t('traffic.aadt_total')}</td>`;
        }
        if (col.grand_total) {
          return `<td ${this.getCellStyle}>${numFormat(this[col.grand_total])}</td>`;
        }
        return '<td>&nbsp;</td>';
      }).join('');
      return `<tr style="background-color: rgb(204, 221, 255);">${totalRow}</tr>`
    },

    getTableRows() {
      let tableRows = '';

      console.log('workCategoriesList', this.workCategoriesList)
      const theList = this.workCategoriesList.sort((a, b) => a.description.localeCompare(b.description, undefined, { sensitivity: 'base' }));

      this.workCategoriesList.forEach(category => {
        if (category.description && category.is_routine == 0) {
          // Row with category name
          tableRows += `<tr style="background-color: rgb(255, 200, 0);">
            <td colspan='12'><strong>${category.description}</strong></td></tr>`

          if (category.work_category_id == 10) {
            tableRows += this.getPatchingRows
          } else {
            tableRows += this.getMaintenanceRows(category.work_category_id)
          }
        }
      })
      // Add routine maintenance
      tableRows += this.getRoutineMaintenanceRows
      tableRows += this.getOverallTotalRow
      return tableRows;
    },

    getPrintHeader() {
      const today = new Date().toLocaleDateString()
      const approvedHeader = this.getApprovedHeader
        .map(row => `<tr>${row.map(cell => `<td style="border:0">${cell}</td>`).join('')}</tr>`)
        .join('')

      return `<table width="100%" style="text-align:center">${approvedHeader}</table>
              <h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
              <h4 style='text-align:center'>${this.$t('route.title_list')}
              ${this.$t('label.as_on')} ${today},&nbsp;${this.$t('label.from_region', { name: this.regionDescr })}</h4>`
    },
  },

  watch: {
    step(newValue, oldValue) {
      if (newValue !== oldValue && this.step === 'fourth') {
        this.selectedRegion = null
        this.reloadTreatmentsList(this.selectedWorklist, null)
      }
    }
  }
};
</script>
<style scoped>
.md-card {
  margin: 0px 0;
  height: 100%;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.paginated-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  text-align: left;
}

.scroll-container {
  max-height: 450px;
  overflow-y: auto;
}

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}
</style>