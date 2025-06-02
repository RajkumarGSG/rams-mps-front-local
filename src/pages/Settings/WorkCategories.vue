<!--
File: WorkCategories.vue
Description: show list of Work Categories entered in the DB.
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
        <RdbLookupDropdown v-model="selectedMaintenanceType" :lookupType="'maintenance_type'" :addEmptyLine="false" />
      </div>
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
        :actionBase="'work_category'"
        :moduleName="'ReferenceData'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('label.category')"
        @close="showDetailsDlg = false" />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { RdbLookupDropdown, BaseTable, BaseDataTable, TableActions, SearchInput, EditForm } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'work-categories-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'WorkCategories',
      selectedMaintenanceType: 0,

      idFieldName: 'work_category_id',
      propsToSearch: ['description, reason'],
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
    RdbLookupDropdown,
    BaseDataTable,
    BaseTable,
    SearchInput,
    TableActions,
    EditForm
  },

  methods: {
    ...mapActions({
      clearList: 'ReferenceData/CLEAR_WORK_CATEGORY_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'ReferenceData/LOAD_WORK_CATEGORY_LIST',
      delete: 'ReferenceData/DELETE_WORK_CATEGORY',
    }),
  },

  computed: {
    ...mapState({
      tableData: (state) => state.ReferenceData.work_category_list,
    }),

    headers() {
      return [
        { header: "stdCols.name", key: "description", sortable: true },
        { header: "label.reason", key: "reason", sortable: true },
      ]
    },

    fields() {
      return [
        { 
          name: 'is_routine', label: 'selections.select_type', type: 'custom', component: 'RdbLookupDropdown', 
          class: 'md-layout-item md-size-100', props: { lookupType: 'maintenance_type' } 
        },
        { name: 'description', label: `${ this.$t('stdCols.name') } (${this.$t('translate.ru')})`, type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'description_en', label: `${ this.$t('stdCols.name') } (${this.$t('translate.en')})`, type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'reason', label: `${ this.$t('label.reason') } (${this.$t('translate.ru')})`, type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'reason_en', label: `${ this.$t('label.reason') } (${this.$t('translate.en')})`, type: 'text', class: 'md-layout-item md-size-100' },
      ];
    },
    
    validations() {
      return {
        is_routine: { required: true, numeric: true, min_value: 0 },
        description: { required: true, min: 3 },
        description_en: { required: true, min: 3 },
        reason: { required: false, min: 3 },
        reason_en: { required: false, min: 3 },
      }
    },
 },

  watch: {
    async selectedMaintenanceType(newVal) {
      this.payload = { routine: newVal };
      await this.reloadData();
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>