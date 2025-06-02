<!--
File: Districts.vue
Description: show list of DEU's entered in the DB.
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
      <div :class="getSize(15)"><regions-dropdown v-model="selectedRegion" /></div>
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
        :actionBase="'district'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('label.district')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { RegionsDropdown, BaseTable, BaseDataTable, TableActions, SearchInput } from "@/pages/Components";
import BaseTableMixin from '@/mixins/BaseTableMixin';
import EditForm from '@/pages/Components/EditForm.vue'

export default {
  name: 'districts-list',
  mixins: [BaseTableMixin],

  components: {
    RegionsDropdown,
    BaseDataTable,
    BaseTable,
    TableActions,
    SearchInput,
    EditForm
  },

  data() {
    return {
      formName: 'Districts',
      idFieldName: 'district_id',
      propsToSearch: ['region_description', 'description', 'type_description', 'notes'],
      currentSort: 'region_description',

      historyMapping: {
        currentSort: 'region_description',
        currentSortOrder: 'asc',
        pagination: this.pagination,
        searchQuery: ''
      }
    }
  },

  methods: {
    ...mapActions({
      clearList: 'CLEAR_DISTRICT_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'LOAD_DISTRICT_LIST',
      delete: 'DELETE_DISTRICT',
    }),
  },

  computed: {
    ...mapState({
      districtsList: (state) => state.RoadNetwork.district_list,
    }),

    tableData() {
      return this.customSort(this.districtsList, 'description')
    },

    headers() {
      return [
        { header: "road_network.region", key: "region_description", sortable: true },
        { header: "stdCols.name", key: "description", sortable: true },
        { header: "stdCols.type", key: "type_description", sortable: true },
        { header: "road_network.section_count", key: "sections", sortable: true, num: true, digits: 0 },
        { header: "stdCols.notes", key: "notes", sortable: false },
      ]
    },
    
    fields() {
      return [
        { name: 'fk_region', type: 'custom', component: 'RegionsDropdown', class: 'md-layout-item md-size-60' },
        { 
          name: 'type', label: 'selections.select_type', type: 'custom', component: 'RdbLookupDropdown', 
          class: 'md-layout-item md-size-40', props: { lookupType: 'district_type' } 
        },
        { name: 'description_en', label: 'stdCols.name_en', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'description_ru', label: 'stdCols.name_ru', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'description_kg', label: 'stdCols.name_kg', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'notes', label: 'stdCols.notes', type: 'text', class: 'md-layout-item md-size-100' },
      ];
    },

    validations() {
      return {
        fk_region: { required: true, numeric: true, min_value: 1 },
        type: { required: true, numeric: true, min_value: 1 },
        description_en: { required: true, min: 3 },
        description_ru: { required: true, min: 3 },
        description_kg: { required: true, min: 3 },
        //notes: { required: false },
      };
    },
  },

  watch: {
    selectedRegion(newVal) {
      this.payload = { region_id: newVal }
      this.reloadData()
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>