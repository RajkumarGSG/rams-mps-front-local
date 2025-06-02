<!--
File: InventoryEvents.vue
Description: show list of Inventory events entered in the DB.
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
        :actionBase="'inventory_event'"
        :moduleName="'ReferenceData'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('label.inventory_event')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { BaseTable, BaseDataTable, TableActions, SearchInput, EditForm } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'inventory-events-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'InventoryEvents',

      idFieldName: 'inventory_type_event_id',
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
      clearList: 'ReferenceData/CLEAR_INVENTORY_EVENT_LIST',
      loadList: 'ReferenceData/LOAD_INVENTORY_EVENT_LIST',
      delete: 'ReferenceData/DELETE_INVENTORY_EVENT',
    }),
  },

  computed: {
    ...mapState({
      tableData: (state) => state.ReferenceData.inventory_event_list,
    }),

    headers() {
      return [
        { header: "stdCols.description", key: "description", sortable: true },
      ]
    },

    fields() {
      return [
        { name: 'description', label: 'stdCols.name_ru', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'description_en', label: 'stdCols.name_en', type: 'text', class: 'md-layout-item md-size-100' },
      ];
    },

    validations() {
      return {
        description: { required: true, min: 3 },
        description_en: { required: true, min: 3 }
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