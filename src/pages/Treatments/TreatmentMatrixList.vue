<!--
File: TreatmentMatrixList.vue
Description: shows the Treatment Matrix as the list.
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
      <div :class="getSize(15)">
        <BaseDropdown v-model="selectedTreatment" :label="$t('selections.select_treatment')" :items="treatmentKeys" />
      </div>
    </template>

    <template #table-rows="{ item }">
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
            @delete="deleteItem(item[idFieldName], item.description)" />
        </template>

      </base-table>
    </template>

    <template #editing-dialog>
      <EditForm
        v-if="showDetailsDlg"
        :itemId="currentId"
        :actionBase="'treatment_matrix'"
        :moduleName="'ReferenceData'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('route.treatment_matrix')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { BaseTable, BaseDataTable, TableActions, BaseDropdown, EditForm } from '@/pages/Components'
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'TreatmentMatrixList',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'TreatmentMatrixList',
      idFieldName: 'id',

      selectedTreatment: null,
      currentSort: 'description',

      historyMapping: {
        selectedTreatment: null,
        currentSort: 'description',
        currentSortOrder: 'asc',
        pagination: this.pagination,
        searchQuery: ''
      }
    }
  },

  components: {
    BaseTable,
    BaseDataTable,
    TableActions,
    BaseDropdown,
    EditForm
  },

  methods: {
    ...mapActions({
      clearList: 'ReferenceData/CLEAR_TREATMENT_MATRIX_LIST',  // Called from the BaseTableMixin's mount()
      loadList: 'ReferenceData/LOAD_TREATMENT_MATRIX_LIST',
    }),
  },

  computed: {
    ...mapGetters('ReferenceData', ['getTreatmentMatrixUniqueValues', 'matrixCombined']),

    tableData() {
      return this.matrixCombined(this.selectedTreatment);
    },

    headers() {
      return [
        { header: "stdCols.key", key: "key", sortable: true },
        { header: "stdCols.description", key: "description", sortable: true },
        { header: "condition.aadt", key: "aadt", sortable: true },
        { header: "condition.iri", key: "iri", sortable: true },
        { header: "condition.rutting", key: "rutting", sortable: true },
        { header: "condition.cracking", key: "cracking", sortable: true },
        { header: "label.potholes", key: "potholes", sortable: true },
        { header: "label.expected_outcome", key: "expected_outcome", sortable: true },
      ]
    },

    fields() {
      return [
        { name: 'fk_treatment_type', type: 'custom', component: 'TreatmentsDropdown', class: 'md-layout-item md-size-100' },
        { name: 'iri_from', label: `${this.$t('condition.iri')}, ${this.$t('label.value_from')}`, type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'iri_to', label: `${this.$t('condition.iri')}, ${this.$t('label.value_to')}`, type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'rutting_from', label: `${this.$t('condition.rutting')}, ${this.$t('label.value_from')}`, type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'rutting_to', label: `${this.$t('condition.rutting')}, ${this.$t('label.value_to')}`, type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'cracking_from', label: `${this.$t('condition.cracking')}, ${this.$t('label.value_from')}`, type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'cracking_to', label: `${this.$t('condition.cracking')}, ${this.$t('label.value_to')}`, type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'potholes_from', label: `${this.$t('label.potholes')}, ${this.$t('label.value_from')}`, type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'potholes_to', label: `${this.$t('label.potholes')}, ${this.$t('label.value_to')}`, type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'aadt_from', label: `${this.$t('condition.aadt')}, ${this.$t('label.value_from')}`, type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'aadt_to', label: `${this.$t('condition.aadt')}, ${this.$t('label.value_to')}`, type: 'number', class: 'md-layout-item md-size-50' },
      ];
    },

    validations() {
      return {
        fk_treatment_type: { required: true, numeric: true, min_value: 1 },
        iri_from: { required: true, numeric: true, min_value: 0 },
        iri_to: { required: true, numeric: true, min_value: 0 },
        rutting_from: { required: true, numeric: true, min_value: 0 },
        rutting_to: { required: true, numeric: true, min_value: 0 },
        cracking_from: { required: true, numeric: true, min_value: 0 },
        cracking_to: { required: true, numeric: true, min_value: 0 },
        potholes_from: { required: true, numeric: true, min_value: 0 },
        potholes_to: { required: true, numeric: true, min_value: 0 },
        aadt_from: { required: true, numeric: true, min_value: 0 },
        aadt_to: { required: true, numeric: true, min_value: 0 },
      };
    },

    treatmentKeys() {
      return this.getTreatmentMatrixUniqueValues('key', 'fk_treatment_type');
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>