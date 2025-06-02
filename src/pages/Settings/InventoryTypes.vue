<!--
File: InventoryTypes.vue
Description: show list of Inventory types entered in the DB.
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
        :actionBase="'inventory_type'"
        :moduleName="'ReferenceData'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('label.inventory_type')"
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
  name: 'inventory-types-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'InventoryTypes',

      idFieldName: 'inventory_type_id',
      propsToSearch: ['description', 'event'],
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

  async mounted() {
    await this.loadEvents({})
  },

  methods: {
    ...mapActions({
      loadEvents: 'ReferenceData/LOAD_INVENTORY_EVENT_LIST',
      clearList: 'ReferenceData/CLEAR_INVENTORY_TYPE_LIST',
      loadList: 'ReferenceData/LOAD_INVENTORY_TYPE_LIST',
      delete: 'ReferenceData/DELETE_INVENTORY_TYPE',
    }),
  },

  computed: {
    ...mapState({
      tableData: (state) => state.ReferenceData.inventory_type_list,
      inventoryEventList: (state) => state.ReferenceData.inventory_event_list,
    }),

    headers() {
      return [
        { header: "label.inventory_type", key: "description", sortable: true },
        { header: "label.inventory_event", key: "event", sortable: true },
      ]
    },

    fields() {
      return [
        { name: 'description', label: 'stdCols.name_ru', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'description_en', label: 'stdCols.name_en', type: 'text', class: 'md-layout-item md-size-100' },
        {
          name: 'fk_inventory_type_event', label: 'label.inventory_event', type: 'custom', component: 'BaseDropdown',
          class: 'md-layout-item md-size-40', props: { items: this.inventoryEventList, valueField: 'inventory_type_event_id' }
        },
      ];
    },

    validations() {
      return {
        description: { required: true, min: 3 },
        description_en: { required: true, min: 3 },
        fk_inventory_type_event: { required: true, numeric: true, min_value: 1 },
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