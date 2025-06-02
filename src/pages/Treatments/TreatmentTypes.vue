<!--
File: TreatmentsTypes.vue
Description: show list of treatment types entered in the DB.
-->
<template>
  <base-data-table
    v-if="eligible"
    :loading="showSpinner"
    :pagination="pagination"
    :from="from"
    :to="to"
    :total="total"
    :btnAddAllowed="isBtnAllowed('AddButton')"
    @add-item="viewItem()">

    <template #header-filters>
      <div :class="getSize(15)"><RdbLookupDropdown v-model="selectedMaintenanceType" :lookupType="'maintenance_type'" :addEmptyLine="false" /></div>
      <div :class="getSize(20)"><WorkCategoriesDropdown v-model="selectedCategory" :routine="selectedMaintenanceType" /></div>

      <div :class="getSize(10)"><UnitsDropdown v-model="selectedUnit" /></div>
      <div :class="getSize(15)"><search-input v-model="searchQuery" /></div>
    </template>

    <template #table-rows>
      <base-table
        :items="queriedData"
        :headers="headers"
        :idFieldName="idFieldName"
        :sort="currentSort"
        :sortOrder="currentSortOrder">

        <template #table-actions="{ item }">
          <table-actions
            :btnEditAllowed="isBtnAllowed('EditButton')"
            :btnDeleteAllowed="isBtnAllowed('DeleteButton')"
            @edit="viewItem(item[idFieldName])"
            @delete="deleteItem(item[idFieldName], item.treatment_type_description)" 
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
import { mapGetters, mapActions } from 'vuex';
import { BaseDataTable, BaseTable, RdbLookupDropdown, UnitsDropdown, 
  WorkCategoriesDropdown, SearchInput, TableActions } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin';
// TODO: review and reimplement with EditForms
//import EditForm from './TestRMTreatmentEditForm.vue'
import EditForm from './TreatmentTypeEditForm.vue';

export default {
  name: 'treatment-types-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'TreatmentTypes',
      idFieldName: 'treatment_type_id',

      selectedMaintenanceType: 0,
      selectedCategory: null,
      selectedUnit: null,

      currentSort: 'key',
      propsToSearch: ['key', 'treatment_type_description', 'expected_outcome'],

      historyMapping: {
        selectedMaintenanceType: 0,
        selectedUnit: null,
        selectedCategory: null,
        currentSort: 'key',
        currentSortOrder: 'asc',
        pagination: this.pagination,
      }
    }
  },

  components: {
    BaseDataTable,
    BaseTable,
    RdbLookupDropdown,
    UnitsDropdown,
    WorkCategoriesDropdown,
    SearchInput,
    TableActions,
    EditForm
  },

  methods: {
    ...mapActions({
      clearList: 'ReferenceData/CLEAR_TREATMENT_TYPE_LIST',  // Called from the BaseTableMixin's mount()
      loadList: 'ReferenceData/LOAD_TREATMENT_TYPE_LIST',
      delete: 'ReferenceData/DELETE_TREATMENT_TYPE',
    }),

    toggleSpinner(state) {
      this.showSpinner = state
    },
  },

  computed: {
    ...mapGetters('ReferenceData', ['treatmentTypesFiltered']),

    tableData() {
      return this.treatmentTypesFiltered(this.selectedUnit)
    },

    headers() {
      const headers = [
        { header: this.$t('stdCols.key'), key: 'key', sortable: true, width: 5 },
        { header: this.$t('stdCols.description'), key: 'treatment_type_description', sortable: true, width: 40 },
        { header: this.$t('label.category'), key: 'work_category_description', sortable: true, width: 10, },
        { header: this.$t('label.units'), key: 'unit_description', sortable: true, width: 10 },
      ];
      if (this.selectedMaintenanceType === 0) {
        const expectedOutcome = { header: this.$t('label.expected_outcome'), key: 'expected_outcome', sortable: true, width: 10 };
        headers.push(expectedOutcome);
      };
      return headers;
    },
  },

  watch: {
    selectedMaintenanceType(value) {
      this.payload = { routine: value};
      this.reloadData();
    },

    selectedCategory(value) {
      this.payload.work_category_id = value;
      this.reloadData();
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>