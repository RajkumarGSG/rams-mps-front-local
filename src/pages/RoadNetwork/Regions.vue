<!--
File: Regions.vue
Description: show list of regions entered in the DB.
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
        :actionBase="'region'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('road_network.region')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { BaseDataTable, BaseTable, TableActions, SearchInput, EditForm } from "@/pages/Components";
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'regions-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'Regions',
      idFieldName: 'region_id',
      propsToSearch: ['region_description'],
      currentSort: 'region_description',

      historyMapping: {
        currentSort: 'description',
        currentSortOrder: 'asc',
        pagination: this.pagination,  // { perPage: 10, currentPage: 1 },
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
      clearList: 'CLEAR_REGION_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'LOAD_REGION_LIST',
      delete: 'DELETE_REGION',
    }),

    handleSectionsClick(item) {
      this.selectedRegion = item;
      this.saveHistory2(['selectedRegion'], 'Sections');
      this.$router.push('/inventory_data/sections');
    },
  },

  computed: {
    ...mapState({
      tableData: (state) => state.RoadNetwork.region_list,
    }),

    headers() {
      return [
        { header: "road_network.region", key: "region_description", sortable: true },
        { header: "road_network.region_key", key: "region_key", sortable: true },
        { header: "road_network.regional_office", key: "regional_dep", sortable: true },
        {
          header: "road_network.section_count", key: "section_count", sortable: true, onClick: this.handleSectionsClick,
          clickCondition: (item) => item.section_count > 0, clickField: 'region_id', num: true
        },
      ]
    },

    fields() {
      return [
        { name: 'fk_rn', label: 'road_network.rn_key', type: 'hidden', default: 1 },
        { name: 'region_key', label: 'road_network.region_key', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'region_description', label: 'stdCols.name_ru', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'region_description_en', label: 'stdCols.name_en', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'regional_dep', label: this.$t('road_network.regional_office') + ' (RU)', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'regional_dep_en', label: this.$t('road_network.regional_office') + ' (EN)', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'active', label: 'road_network.active', type: 'switch', class: 'md-layout-item md-size-100' },
      ];
    },

    validations() {
      return {
        region_key: { required: true, min: 3 },
        region_description: { required: true, min: 3 },
        region_description_en: { required: true, min: 3 },
        regional_dep_en: { required: true, min: 3 },
        regional_dep: { required: true, min: 3 },
      }
    },
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>
