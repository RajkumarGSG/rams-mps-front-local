<!--
File: Worklist.vue
Description: component of the TitleList.vue.
-->
<template>
  <md-card>
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout" style="align-items: center; ">
        <div class="md-layout-item md-small-size-20 md-size-15">
          <YearsDropdown v-model="selectedWorklist" :items="yearsInWorkList" @input="onYearChange" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-15">
          <RegionsDropdown v-model="selectedRegion" @input="handleSelectionChange" />
        </div>
        <div v-show="step === 'second'" class="md-layout-item md-small-size-100 md-size-15">
          <PlansDropdown v-model="selectedPlan" @input="onPlanChange" />
        </div>
        <div v-if="showAdditionalDropdowns" class="md-layout">
          <div class="md-layout-item md-small-size-100 md-size-20">
            <AmountsDropdown v-model="showAmounts" @input="onAmountChange" />
          </div>
          <span v-if="step === 'second' && isPlanApproved" style="color: red;">{{ $t('label.approved') }}</span>
          <div class="md-layout-item btn-row md-small-size-50">
            <md-button v-if="isBtnAllowed('ExportButton')" class="md-raised md-success" @click="exportToExcel">
              {{ $t('buttons.excel_export') }}
            </md-button>
          </div>
        </div>
      </div>
    </md-card-header>

    <md-card-content>
      <md-progress-spinner v-show="showSpinner" :md-diameter="100" :md-stroke="10" md-mode="indeterminate" />
      <md-table class="paginated-table table-striped table-hover" :value="tableData"
        :md-selected-value.sync='selectedItems' md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')"
          :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}"
          v-bind="!isPlanApproved ? { 'md-selectable': 'multiple' } : {}">
          <md-table-cell :md-label="$t('road_network.section_description')">
            {{ item.section_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('inventory.start_distance_m')" md-numeric>
            {{ item.start_m | numFormat(0) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('inventory.end_distance_m')" md-numeric>
            {{ item.end_m | numFormat(0) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.length_m')" md-numeric>
            {{ item.length_m | numFormat(0) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.number_units')" md-numeric>
            {{ item.units | numFormat(2) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('label.units')">
            {{ item.unit_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('treatment.treatment_description')">
            {{ item.treatment_type_description }}
          </md-table-cell>
          <md-table-cell :md-label="costLabel" md-numeric>
            {{ item.cost | numFormat }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.priority_index')" md-numeric>
            {{ item.priority_index | numFormat }}
          </md-table-cell>
        </md-table-row>
      </md-table>
    </md-card-content>
    <md-card-actions class="md-layout">
      <div v-if="selectedItems.length > 0" class="md-layout md-small-size-100 md-size-50">
        <span>
          {{ $t('selections.selected') }}: {{ selectedItems.length }} {{ $t('label.entries') }}
        </span>

        <div v-if="step === 'first' && isDropdownAllowed('AssignWorks')" class="md-layout ">
          <span class="md-layout-item md-small-size-100 md-size-25">{{ $t('label.assign_plan') }}</span>
          <BaseDropdown id="planAssign" class="md-layout-item md-small-size-100 md-size-40"
            :label="$t('selections.select_plan')" v-model="selectedPlanForAssignment" :displayField="'name'"
            :valueField="'id'" :items="planListForAssignment" @input="onPlanSelected()" />
        </div>

        <div v-if="step === 'second' && isBtnAllowed('UnassignButton')"
          class="md-layout-item md-small-size-100 md-size-40">
          <md-button class="md-raised md-danger" @click="toggleAssignment(-1)">
            {{ $t('label.unassign_plan') }}
          </md-button>
        </div>
      </div>

      <div v-if="total > 0" class="md-layout-item md-small-size-100 md-size-45">
        <span>{{ $t('label.total') }}
          {{ $t('label.entries') }}: {{ total | numFormat(0) }},
          {{ $t('road_network.length_m') }}: {{ summary.totalLength | numFormat(0) }},
          {{ costLabel }}: {{ summary.totalSum | numFormat }}
        </span>
      </div>
    </md-card-actions>
  </md-card>
</template>
<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { RegionsDropdown, PlansDropdown, BaseDropdown, YearsDropdown, AmountsDropdown } from '@/pages/Components'
import { customSortMixin } from '@/mixins/customSortMixin'
import permissions from "@/mixins/permissionsMixin"
import { textInput, savedMessage, errorMessage, assignedMessage } from '@/mixins/messagesMixin'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // Для сохранения файла на клиенте

export default {
  name: 'Worklist',
  mixins: [permissions, customSortMixin],

  data() {
    return {
      formName: 'Worklist',

      showSpinner: true,
      selectedWorklist: null,
      selectedYear: null,
      selectedRegion: null,
      selectedPlanForAssignment: null,
      selectedPlan: null,
      selectedItems: [],
      showAmounts: 1000,
      costLabel: "Cost",

      planDesc: null,

      currentSort: 'section_description',
      currentSortOrder: 'asc',
    }
  },

  props: {
    step: { default: 'first', type: String },
  },

  components: {
    RegionsDropdown,
    PlansDropdown,
    YearsDropdown,
    AmountsDropdown,
    BaseDropdown
  },

  async mounted() {
    // Check if we are eligible to view the form
    if (!this.checkIfScreenAllowed()) {
      this.onClose();
      return;
    };

    this.toggleSpinner(true);
    this.onAmountChange(this.showAmounts, '', this.$t("label.short_thousands"));

    await this.reloadWorksLists();
    // Reset the lists in the store if they were filled previouly
    await this.clearList();
    this.toggleSpinner(false);
  },

  methods: {
    ...mapActions({
      clearList: 'RESET_TREATMENTS', // Called from the BaseTableMixin's mount()
      loadList: 'LOAD_ALL_WORKS',

      loadWorksList: 'LOAD_WORKS_LISTS',
      delete: '',

      getPlansDropdown: 'GET_PLANS_DROPDOWN',
      addNewPlan: 'Planning/ADD_NEW_PLAN',
      assignPlan: 'ASSIGN_PLAN',
    }),

    toggleSpinner(state) {
      this.showSpinner = state
    },

    async onYearChange(value, desc) {
      this.selectedYear = desc;
      await this.handleSelectionChange();
    },

    onAmountChange(value, long_desc, desc) {
      this.costLabel = `${this.$t('stdCols.cost')} ${desc}`;
    },

    async reloadWorksLists() {
      await this.loadWorksList({ is_approved: 0 });
    },

    async reloadTreatmentsList() {
      this.toggleSpinner(true);

      let returnZeroRows = !this.selectedRegion || !this.selectedWorklist;
      //if (this.step === 'first' && !this.selectedWorklist) returnZeroRows = true
      if (this.step === 'second' && !this.selectedPlan) returnZeroRows = true;

      if (returnZeroRows) {
        await this.clearList();
        this.toggleSpinner(false);
        return;
      }

      this.selectedItems = [];
      const params = {
        work_list_id: this.selectedWorklist,
        region_id: this.selectedRegion,
        is_plan_assigned: this.step === 'first' ? 0 : 1,
        //is_approved: 0, //is_approved_plan_assigned??
        plan_id: this.step === 'second' ? this.selectedPlan : null,
      };
      try {
        await this.loadList(params);
      } finally {
        this.toggleSpinner(false)
      };
    },

    async reloadPlanList() {
      if (!this.selectedRegion || !this.selectedYear) {
        // TODO: Change to clear later
        this.$store.commit('SET_DR_LIST', { key: 'plans', data: [] });
        return;
      }
      const params = {
        region_id: this.selectedRegion,
        year: this.selectedYear
      };
      // TODO: Change to plan_dropdown
      await this.getPlansDropdown(params);
      this.selectedPlanForAssignment = null;
    },

    async onPlanSelected() {
      if (this.selectedPlanForAssignment == null) {
        // To catch if we cleared it when jumping between tabs
        return;
      }
      this.toggleSpinner(true);

      while (true) {  // Looping until user enters unique plan name
        if (this.selectedPlanForAssignment == 0) {
          const { value } = await textInput(this.$t('selections.create_plan'), this.$t('label.enter_name'));
          if (!value || value === '') { //User cancelled input
            this.selectedPlanForAssignment = null;
            this.toggleSpinner(false);
            return;
          }

          // TODO: check if exists and if it is unapproved add to the existing
          //const ex = this.findPlanByName(value)
          this.selectedPlanForAssignment = await this.createPlan(value);
          if (this.selectedPlanForAssignment < 0) { // error
            return
          } else if (this.selectedPlanForAssignment == 0) { // name exists
            await errorMessage(`${this.$t('messages.name_exists')}<br><br>${this.$t('messages.choose_another_name')}`);
            continue;
          } else {
            break;
          }
        } else {  // the name is unique from beginning
          break;
        }
      }
      await this.toggleAssignment(this.selectedPlanForAssignment);
      await this.reloadPlanList();
    },

    async createPlan(planName) {
      const plan = {
        name: planName,
        fk_region: this.selectedRegion,
        year: this.selectedYear
      };
      try {
        const newPlanId = await this.addNewPlan(plan);
        return newPlanId?.id;
      } catch (err) {
        //return err == 409 ? 0 : -1
        if (err?.message === 'DB Integrity Error') { // error occured
          return 0;
        }
        await savedMessage('error', this.$t('stdCols.plan_name'), planName);
        return -1;
      };
    },

    async toggleAssignment(id) {
      this.toggleSpinner(true);

      const items = this.selectedItems.map(el => el.treatment_id);
      const params = { data: [{ 'plan_id': id, treatment_id: items }] };

      await this.assignPlan(params);
      this.$emit('itemAssigned', 'plan', id);
      await assignedMessage(id, items.length);
      await this.reloadTreatmentsList();
      this.toggleSpinner(false);
    },

    async handleSelectionChange() {
      this.selectedItems = [];
      this.selectedPlan = null;
      await this.reloadPlanList();
      await this.reloadTreatmentsList();
    },

    async onPlanChange(value, desc) {
      this.planDesc = desc;
      this.selectedItems = [];
      await this.reloadTreatmentsList();
    },

    async exportToExcel() {
      if (this.total == 0) return // Nothing to export
      const headerCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } } // Blue

      // Create new Excel file and sheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(this.selectedYear.toString());

      // Set the table headers
      worksheet.columns = [
        { header: this.$t('road_network.section_description'), key: 'section_description', width: 60 },
        { header: this.$t('inventory.start_distance_m'), key: 'start_m', width: 10 },
        { header: this.$t('inventory.end_distance_m'), key: 'end_m', width: 10 },
        { header: this.$t('road_network.length_m'), key: 'length_m', width: 10 },
        { header: this.$t('condition.number_units'), key: 'units', width: 10 },
        { header: this.$t('label.units'), key: 'unit_description', width: 10 },
        { header: this.$t('treatment.treatment_description'), key: 'treatment_type_description', width: 60 },
        { header: this.costLabel, key: 'cost', width: 20 },
        { header: this.$t('condition.priority_index'), key: 'priority_index', width: 20 },
      ];

      // Fill rows from tableData
      this.tableData.forEach(item => {
        worksheet.addRow(item);
      });

      // Apply formatting to the table headers first  row
      let newRow = worksheet.getRow(1);
      newRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      newRow.fill = headerCellFill
      newRow.alignment = { vertical: 'middle', horizontal: 'center' }

      // Number formatting for the columns
      worksheet.getColumn('start_m').numFmt = '#,##0'
      worksheet.getColumn('end_m').numFmt = '#,##0'
      worksheet.getColumn('length_m').numFmt = '#,##0'
      worksheet.getColumn('units').numFmt = '#,##0.00'
      worksheet.getColumn('cost').numFmt = '#,##0.00'

      const regionDesc = this.tableData[0].region_description

      // Main title and font
      newRow = worksheet.insertRow(1, [
        this.$t('label.from_region', { name: regionDesc }),
        !this.planDesc ? this.$t('label.all_treatments') : this.$t('label.plan_name', { name: this.planDesc })
      ])
      newRow.font = { italic: true, size: 14 }

      // Генерация Excel файла и сохранение
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${this.$t('route.treatments')}-${regionDesc}-${this.selectedYear}.xlsx`);
    }
  },

  computed: {
    ...mapState({
      savedWorksList: (state) => state.TitleList.worksLists,
    }),
    ...mapGetters(['treatmentsSummary', 'yearsInWorkList', 'filteredTreatments']),
    ...mapGetters('Planning', ['plansNotApproved', 'planApproved', 'findPlanByName']),
    /*
        selectedYear() {
          return this.yearsInWorkList.find(el => el.id == this.selectedWorklist)?.description || '';
        },
    */
    tableData() {
      return this.filteredTreatments(null, this.showAmounts);
    },

    summary() {
      return this.treatmentsSummary(null, this.showAmounts);
    },

    total() {
      return this.summary.totalRecords;
    },

    showAdditionalDropdowns() {
      return this.total > 0
    },

    planListForAssignment() {
      const res = this.plansNotApproved(this.selectedRegion, this.selectedYear, false)
      res.unshift({ id: 0, name: this.$t('selections.create_plan') })
      return res
    },

    isPlanApproved() {
      return this.planApproved(this.selectedPlan)
    },
  },

  watch: {
    step(value) {
      this.selectedPlanForAssignment = null
      this.handleSelectionChange()
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

::v-deep .paginated-table .md-table-head-labell {
  font-size: 14px;
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