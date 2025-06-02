<!--
File: Condition.vue
Description: show list of Condition data (IRI, rutting, etc.) entered in the Data100 table.
-->
<template>
  <base-data-table
    v-if="eligible"
    :loading="showSpinner"
    :pagination="pagination"
    :from="from"
    :to="to"
    :total="total"
    @add-item="viewItem()">

    <template #header-filters>
      <div :class="getSize(15)"><regions-dropdown v-model="selectedRegion" /></div>
      <div :class="getSize(20)"><RoadsDropdown v-model="selectedRoad" :regionId="selectedRegion" :disabled="!selectedRegion" /></div>
      <div :class="getSize(30)">
        <SectionsDropdown v-model="selectedSection" :regionId="selectedRegion" :roadId="selectedRoad" :disabled="!selectedRegion" />
      </div>
      <div :class="getSize(10)"><YearsDropdown v-model="selectedYear":items="yearsInConditionList" :disabled="!selectedRoad" /></div>
    </template>

    <template #header-buttons>
      <md-button v-if="total > 0" class="md-success" @click="excelExport">
        {{ $t('buttons.excel_export') }}
      </md-button>
    </template>

    <template #table-rows>
      <base-table
        :items="queriedData"
        :headers="getColumns"
        :idFieldName="idFieldName"
        :sort="currentSort"
        :sortOrder="currentSortOrder">

        <template #table-actions="{ item }">
          <table-actions
            :btnEditAllowed="isBtnAllowed('EditButton')"
            :btnDeleteAllowed="isBtnAllowed('DeleteButton')"
            @edit="viewItem(item[idFieldName])"
            @delete="deleteItem(item[idFieldName], )" 
          />
        </template>
      </base-table>
    </template>

    <template #editing-dialog>
      <EditForm
        v-if="showDetailsDlg"
        :itemId="currentId"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
  import { mapActions, mapGetters } from 'vuex'
  import { BaseDataTable, BaseTable, RegionsDropdown, RoadsDropdown, SectionsDropdown, YearsDropdown, TableActions } from '@/pages/Components'
  import BaseTableMixin from '@/mixins/BaseTableMixin'
  import EditForm from './ConditionEditForm.vue'
  import ExcelJS from 'exceljs'
  import { saveAs } from 'file-saver'

  export default {
    name: 'condition-list',
    mixins: [BaseTableMixin],

    data() {
      return {
        formName: 'Condition',
        idFieldName: 'data_id',

        selectedRoad: null,
        selectedSection: null,
        selectedYear: null,
        currentSort: 'start_distance',
        payload: { section_id: -1 },

        historyMapping: {
          selectedRegion: 0,
          selectedRoad: 0,
          selectedSection: 0,
          selectedYear: 0,
          currentSort: 'start_distance',
          currentSortOrder: 'asc',
          pagination: this.pagination,
        }
      }
    },

    components: {
      BaseDataTable,
      BaseTable,
      RegionsDropdown,
      YearsDropdown,
      RoadsDropdown,
      SectionsDropdown,
      TableActions,
      EditForm
    },

    methods: {
      ...mapActions({
        loadList: 'LOAD_CONDITION_LIST',
        delete: 'DELETE_CONDITION',
        clearList: 'CLEAR_CONDITION_LIST'
      }),

      fillWorkSheet(workbook, workbookName) {
        const headerCellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } } // Blue
        const worksheet = workbook.addWorksheet(workbookName);

        // Set the table headers
        worksheet.columns = this.getColumns

        // Apply formatting to the table headers
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell({ includeEmpty: true }, (cell) => { cell.fill = headerCellFill })
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Number formatting for the columns
        this.getColumns.forEach(item => {
          if (item.num) worksheet.getColumn(item.key).numFmt = item.digits == 2 ? '#,##0.00' : '#,##0.000'
        })

        // Fill rows from tableData
        this.tableData.forEach(item => {
          worksheet.addRow(item);
        });
      },

      async excelExport() {
        // Create new Excel file
        const workbook = new ExcelJS.Workbook();
        this.fillWorkSheet(workbook, this.$t('route.condition_data'))

        // Save
        const fileName = `${this.tableData[0].section}.xlsx`
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, fileName);
      },

      getDelMessage(item){
        return `${item.section}: ${item.start_distance}-${item.end_distance}`
      }
    },

    computed: {
      ...mapGetters(['conditionListFiltered', 'yearsInConditionList']),

      tableData() {
        return this.conditionListFiltered(this.selectedYear);
      },

      getColumns() {
        return [
          { header: this.$t('stdCols.year'), key: 'survey_year', sortable: true, width: 5 },
          { header: this.$t('inventory.start_distance_m'), key: 'start_distance', sortable: true, width: 10, num: true, digits: 0 },
          { header: this.$t('inventory.end_distance_m'), key: 'end_distance', sortable: true, width: 10, num: true, digits: 0 },
          { header: this.$t('condition.iri'), key: 'iri', sortable: true, width: 10, num: true, digits: 2 },
          { header: this.$t('condition.rut_left'), key: 'rut_left', sortable: true, width: 10, num: true, digits: 2 },
          { header: this.$t('condition.rut_right'), key: 'rut_right', sortable: true, width: 10, num: true, digits: 2 },
          { header: this.$t('condition.cracking_m2'), key: 'cracking_m2', sortable: true, width: 10, num: true, digits: 2 },
          { header: this.$t('condition.potholes_no'), key: 'potholes_no', sortable: true, width: 10, num: true, digits: 2 },
          { header: this.$t('condition.edge_break_m2'), key: 'edge_break_m2', sortable: true, width: 10, num: true, digits: 2 },
          { header: this.$t('condition.repairs_m2'), key: 'repairs_m2', sortable: true, width: 10, num: true, digits: 2 },
        ]
      },
    },

    watch: {
      async selectedSection(newVal) {
        if (!newVal) {
          await this.clearList();
          return;
        }
        this.payload = { section_id: newVal };
        this.reloadData();
      }
    }
  }
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>