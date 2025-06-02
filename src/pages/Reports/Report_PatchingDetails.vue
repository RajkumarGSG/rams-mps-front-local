<!--
File: Report_PatchingDetails.vue
Description: form for generating printed version of the Report with Patching Details.
-->
<template>
  <md-card v-if="eligible">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout" style="align-items: center; justify-content: flex-start; width: auto;">
        <div class="md-layout-item md-small-size-20 md-size-10">
          <YearsDropdown v-model="selectedWorklist" :items="yearsInWorkList"
            @input="onWorklistChange" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-20">
          <RegionsDropdown v-model="selectedRegion" @input="onRegionChange" />
        </div>
        <div v-show="selectedWorklist" class="md-layout-item md-small-size-100 md-size-15">
          <AmountsDropdown v-model="showAmounts" @input="onAmountChange" />
        </div>

        <div v-show='showPrintButton' class="md-layout-item btn-row md-small-size-100">
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
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { RegionsDropdown, YearsDropdown, AmountsDropdown } from '@/pages/Components'
  import { numFormat } from "@/store/helpers/format_helpers"
  import { onClose } from '@/mixins/onCloseMixin'
  import permissions from "@/mixins/permissionsMixin"
  import printReport from '@/mixins/printMixin'
  import ExcelJS from 'exceljs';
  import { saveAs } from 'file-saver';

  export default {
    name: 'report-patchig-details',
    mixins: [permissions, printReport],
    data() {
      return {
        formName: 'Report_PatchingDetails',
        eligible: false,

        showSpinner: true,
        btnDisabled: true,
        selectedWorklist: null,
        selectedRegion: null,
        selectedYear: null,
        selectedPlanForAssignment: null,
        selectedPlan: null,
        selectedBudget: null,
        selectedItems: [],
        dataIsLoaded: false,

        showAmounts: 1000,
        amountLabel: '',
        regionDescr: null,
      }
    },

    props: {
      step: { default: 'fourth', type: String },
    },

    components: {
      RegionsDropdown,
      AmountsDropdown,
      YearsDropdown,
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };

      this.toggleSpinner(true)
      this.onAmountChange(this.showAmounts, this.$t("label.short_thousands"))

      // Reset the lists in the store if they were filled previouly
      await this.resetWorkLists()
      await this.resetTreatments()

      await this.reloadWorksLists()
    },

    methods: {
      ...mapActions({
        resetWorkLists: 'RESET_WORK_LISTS',
        resetTreatments: 'RESET_TREATMENTS',
        loadWorkLists: 'LOAD_WORKS_LISTS',
        loadAllWorks: 'LOAD_ALL_WORKS',
      }),

      onClose,
      toggleSpinner(state) {
        this.showSpinner = state
      },

      async reloadWorksLists() {
        this.toggleSpinner(true)
        this.btnDisabled = true
        //const params = { is_approved: 1 }
        try {
          await this.loadWorkLists({})
        } catch (err) {
        } finally {
          this.toggleSpinner(false)
          this.btnDisabled = false
        }
      },

      onWorklistChange(worklist, year) {
        this.selectedYear = year
        this.reloadTreatmentsList(worklist, this.selectedRegion)
      },

      onRegionChange(region_id, regionDescr) {
        // get Region description needed for showing in the printed form
        this.regionDescr = regionDescr
        this.reloadTreatmentsList(this.selectedWorklist, region_id)
      },

      onAmountChange(value, desc) {
        this.amountLabel = `${this.$t('stdCols.cost')} ${desc}`
      },

      async reloadTreatmentsList(worklist, region_id) {
        if (!region_id || !worklist) {
          this.$store.dispatch('RESET_TREATMENTS')
          return
        }

        this.dataIsLoaded = false
        this.toggleSpinner(true)
        this.selectedItems = []
        //  await this.$store.dispatch('LOAD_SECTIONS_LIST', { region_id: region_id })
        const params = {
          work_list_id: worklist,
          region_id: region_id,
          //is_plan_assigned: this.step === 'first' ? 0 : 1,
          is_budget_assigned: 1,
          //is_approved: 0,
          //plan_id: this.step === 'second' ? this.selectedPlan : null,
          //budget_id: this.step === 'third' ? this.selectedBudget : null,
        }
        this.$store.dispatch('LOAD_ALL_WORKS', params).then(() => {
          this.dataIsLoaded = true
          this.toggleSpinner(false)
        })
      },

      print() {
        this.showSpinner = true
        this.printReport(this.getPrintHeader, this.getTableHeaders, this.getTableRows)
        this.showSpinner = false
      },

      setWorkSheetHeader(worksheet) {
      },

      fillTreatments(worksheet) {
        // Fill the table with treatments except Routine Maintenance
        const totalCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }// yellow
        for (const [groupName, group] of Object.entries(this.groupedData)) {
          let row = worksheet.addRow(['', groupName]);
          row.font = { bold: true };

          group.forEach(item => {
            worksheet.addRow(item);
          })

          // Subtotals for group
          row = worksheet.addRow(this.getWorksheetColumns.map(
            col => col.group ? this.$t('label.total') : col.totals ? this.groupTotals[groupName][col.totals] : '')
          )
          row.font = { bold: true };
          row.eachCell({ includeEmpty: true }, (cell) => { cell.fill = totalCellFill });
        }
      },

      fillWorkSheet(workbook, regionDesc) {
        const today = new Date().toLocaleDateString();
        const subtitle = `${this.$t('route.title_list')} ${this.$t('label.as_on')} ${today}, ${this.$t('label.from_region', { name: this.regionDescr })}`;

        const worksheet = this.generateWorkSheet(workbook, regionDesc, subtitle, []);

        this.insertAdditionalHeader(worksheet, 'before', this.$t('label.coating_type'), 3, 2)

        // Заполнение данных с кастомной функцией
        this.fillTreatments(worksheet);
      },

      async exportToExcel() {
        // Create new Excel file
        const workbook = new ExcelJS.Workbook();
        const regionDesc = this.treatmentsList[0].region_description
        this.fillWorkSheet(workbook, regionDesc)

        // Save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${this.$t('patching details')}-${regionDesc}.xlsx`);
      },
    },

    computed: {
      ...mapState({
        // savedWorksList: (state) => state.TitleList.worksLists,
        treatmentsList: (state) => state.TitleList.treatmentsList,
        //workCategoriesList: (state) => state.Dropdowns.work_categories,

        //        sectionsList: (state) => state.Sections.list,
        // regionsList: (state) => state.Dropdowns.regions,
      }),

      ...mapGetters(['yearsInWorkList']),

      total() {
        return this.treatmentsList.length
      },

      showPrintButton() {
        return this.total > 0
      },

      // Группировка данных по полю 'group'
      groupedData() {
        let index = 0
        let res = this.treatmentsList
          // change to counting by number of treatments later
          .filter(el => el.fk_work_category == 8 || el.fk_work_category == 10)
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

      // Подсчет общего итога по всей таблице
      overallTotal() {
        return this.treatmentsList.reduce((sum, row) => sum + row.cost, 0);
      },

      getWorksheetColumns() {
        return [
          { header: this.$t('stdCols.id'), key: 'id', width: 5 },
          { header: this.$t('label.object_name'), key: 'section_description', width: 60, group: true },
          // { header: this.$t('inventory.start_distance_m'), key: 'start_m', width: 10 },
          // { header: this.$t('inventory.end_distance_m'), key: 'end_m', width: 10 },
          { header: this.$t('label.units'), key: 'unit_description', width: 10 },
          { header: this.$t('label.quantity'), key: 'units', width: 10, num: true, digits: 2, totals: 'totalUnits' },
          { header: this.$t('label.before'), key: 'before', width: 10 },
          { header: this.$t('label.after'), key: 'expected_outcome', width: 15 },
          { header: this.amountLabel, key: 'cost', width: 20, num: true, digits: 2, totals: 'totalCost' },
          { header: this.$t('road_network.dep'), key: 'deu_description', width: 5 },
        ]
      },

      getTableHeaders() {
        const columns = this.getWorksheetColumns
        return `<tr>
            <th colspan=4>&nbsp;</th><th colspan=2>${this.$t('label.coating_type')}</th><th colspan=2></th><th>&nbsp;</th></tr>
                  <tr>${columns.map(col => `<th ${col.colspan ? '' : 'rowspan=2'}>${col.header}</th>`).join('')}
          </tr>`
      },

      getTableRows() {
        const columns = this.getWorksheetColumns
        const numFmt = "style='text-align: right; padding-right: 10px;'"
        let tableRows = '';

        for (const [groupName, group] of Object.entries(this.groupedData)) {
          // Row with group name
          tableRows += `<tr style="background-color: rgb(255, 255, 0);">
              ${columns.map(col => `<td>${col.group ? groupName : '&nbsp;'}</td>`).join('')}
            </tr>`

          // rows
          group.forEach((row) => {
            tableRows += `<tr>
                ${columns.map(col => col.num ? `<td ${numFmt}>${numFormat(row[col.key], col.digits)}</td>`
              : `<td>${row[col.key]}</td>`).join('')}
                </tr>`;
          });

          // Group total row
          tableRows += `<tr style="background-color: rgb(204, 221, 255);">
              ${columns.map(col => col.num
            ? `<td ${numFmt}>${numFormat(this.groupTotals[groupName][col.totals])}</td>`
            : `<td>${col.group ? this.$t('label.total') : '&nbsp;'}</td>`).join('')}
            </tr>`;
        }
        return tableRows;
      },

      getPrintHeader() {
        const today = new Date().toLocaleDateString()
        return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
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