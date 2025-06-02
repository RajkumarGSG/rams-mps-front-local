<!--
File: Units.vue
Description: show list of measurement units entered in the DB.
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
      <div :class="getSize(15)"><search-input v-model="searchQuery" /></div>
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
            @delete="deleteItem(item[idFieldName], item.description)" 
          />
        </template>
      </base-table>
    </template>

    <template #editing-dialog>
      <EditForm
        v-if="showDetailsDlg"
        :itemId="currentId"
        :actionBase="'unit'"
        :moduleName="'ReferenceData'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('label.units')"
        @close="showDetailsDlg = false" />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { BaseTable, BaseDataTable, TableActions, SearchInput, EditForm } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'units-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'Units',
      idFieldName: 'id',
      propsToSearch: ['description'],
      currentSort: 'description',

      historyMapping: {
        currentSort: 'description',
        currentSortOrder: 'asc',
        pagination: this.pagination,
        searchQuery: ''
      }
    }
  },

  components: {
    BaseDataTable,
    BaseTable,
    SearchInput,
    TableActions,
    EditForm
  },

  methods: {
    ...mapActions({
      clearList: 'ReferenceData/CLEAR_UNIT_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'ReferenceData/LOAD_UNIT_LIST',
      delete: 'ReferenceData/DELETE_UNIT',
    }),

  },

  computed: {
    ...mapState({
      tableData: (state) => state.ReferenceData.unit_list,
    }),

    headers() {
      return [
        { header: "stdCols.name", key: "description", sortable: true },
      ]
    },

    fields() {
      return [
        { name: 'description_en', label: 'stdCols.name_en', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'description_ru', label: 'stdCols.name_ru', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'description_kg', label: 'stdCols.name_kg', type: 'text', class: 'md-layout-item md-size-100' },
      ];
    },

    validations() {
      return {
        description_en: { required: true, min: 1 },
        description_ru: { required: true, min: 1 },
        description_kg: { required: true, min: 1 },
      }
    },
  },

  watch: {
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>