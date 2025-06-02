<!--
File: TreatmentRates.vue
Description: show list of Rates entered in the DB.
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
            @edit="viewItem(item[idFieldName])" 
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
import { mapState, mapGetters, mapActions } from 'vuex';
import {
  BaseDataTable, BaseTable, RdbLookupDropdown, WorkCategoriesDropdown,
  SearchInput, TableActions
} from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin';
import EditForm from './TreatmentRateEditForm.vue'

export default {
  name: 'treatment-rates-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'TreatmentRates',
      idFieldName: 'treatment_rate_id',

      selectedMaintenanceType: 0,
      selectedCategory: null,

      currentSort: 'treatment_type_description',
      propsToSearch: ['treatment_type_description', 'treatment_type_key', 'unit_description', 'rate'],

      historyMapping: {
        selectedMaintenanceType: 0,
        selectedCategory: null,
        currentSort: 'treatment_type_description',
        currentSortOrder: 'asc',
        pagination: this.pagination,
      }
    }
  },

  components: {
    BaseDataTable,
    BaseTable,
    RdbLookupDropdown,
    WorkCategoriesDropdown,
    SearchInput,
    TableActions,
    EditForm
  },

  methods: {
    ...mapActions({
      clearList: 'ReferenceData/CLEAR_TREATMENT_RATE_LIST',  // Called from the BaseTableMixin's mount()
      loadList: 'ReferenceData/LOAD_TREATMENT_RATE_LIST',
      delete: '', //'DELETE_TREATMENT_RATE',
    }),

    toggleSpinner(state) {
      this.showSpinner = state
    },
  },

  computed: {
    ...mapState({
      tableData: (state) => state.ReferenceData.treatment_rate_list,
    }),
    
    headers() {
      const headers = [
        { header: this.$t('stdCols.description'), key: 'treatment_type_description', sortable: true, width: 40 },
        { header: this.$t('stdCols.key'), key: 'treatment_type_key', sortable: true, width: 5 },
        { header: this.$t('label.units'), key: 'unit_description', sortable: true, width: 10 },
        { header: this.$t('condition.number_units'), key: 'unit_quantity', sortable: true, width: 10, num: true, digits: 0 },
        { header: this.$t('label.rate'), key: 'rate', sortable: true, width: 10, num: true, digits: 2 },
      ];
      return headers;
    },
  },

  watch: {
    selectedMaintenanceType(value) {
      this.payload = { routine: value };
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