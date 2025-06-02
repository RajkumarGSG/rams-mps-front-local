<!--
File: Roads.vue
Description: show list of roads entered in the DB.
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
    :showCloseBtn="!!closePath"
    @add-item="viewItem()">

    <template #header-filters>
      <div :class="getSize(15)"><road-classes-dropdown v-model="selectedRoadClass" /></div>
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
            @delete="deleteItem(item[idFieldName], item.road_description)" 
          />
        </template>
      </base-table>
    </template>

    <template #editing-dialog>
      <EditForm
        v-if="showDetailsDlg"
        :itemId="currentId"
        :actionBase="'road'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('road_network.road')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { RoadClassesDropdown, BaseTable, BaseDataTable, SearchInput, TableActions, EditForm } from "@/pages/Components"
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'roads-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'Roads',
      idFieldName: 'road_id',
      propsToSearch: ['road_description', 'road_class', 'road_number', 'length_m'],
      currentSort: 'road_number',

      selectedRoadClass: null,
      selectedRoad: null, // for showing sections belonging to the road

      historyMapping: {
        selectedRoadClass: null,
        currentSort: 'road_number',
        currentSortOrder: 'asc',
        pagination: {},
        searchQuery: ''
      }
    }
  },

  components: {
    BaseDataTable,
    BaseTable,
    SearchInput,
    TableActions,
    RoadClassesDropdown,
    EditForm,
  },

  methods: {
    ...mapActions({
      clearList: 'CLEAR_ROAD_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'LOAD_ROAD_LIST',
      delete: 'DELETE_ROAD',
    }),

    handleSectionsClick(item) {
      this.selectedRoad = item;
      this.saveHistory2(['selectedRoad'], 'Sections');
      this.$router.push('/inventory_data/sections');
    },
  },

  computed: {
    ...mapState({
      tableData: (state) => state.RoadNetwork.road_list,
    }),

    ...mapGetters(['closePath']),

    headers() {
      return [
        { header: "road_network.road_class", key: "road_class", sortable: true },
        { header: "road_network.road_number", key: "road_number", sortable: true },
        { header: "stdCols.name", key: "road_description", sortable: true },
        { header: "road_network.length", key: "length_m", sortable: true, num: true, digits: 0 },
        {
          header: "road_network.section_count", key: "section_count", sortable: true, onClick: this.handleSectionsClick,
          clickCondition: (item) => item.section_count > 0, clickField: 'road_id', num: true
        },
      ]
    },

    fields() {
      return [
        { name: 'fk_rn', label: 'road_network.rn_key', type: 'hidden', default: 1 },
        { name: 'road_class', type: 'custom', component: 'RoadClassesDropdown', class: 'md-layout-item md-size-50' },
        { name: 'road_number', label: 'road_network.road_number', type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'road_key', label: 'road_network.road_key', type: 'text', class: 'md-layout-item md-size-50' },
        { name: 'length_m', label: 'road_network.length', type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'road_description', label: 'stdCols.name_ru', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'road_description_en', label: 'stdCols.name_en', type: 'text', class: 'md-layout-item md-size-100' },
      ];
    },

    validations() {
      return {
        road_class: { required: true, min: 1 },
        road_number: { required: true, numeric: true, min_value: 1 },
        road_key: { required: true, min: 3 },
        length_m: { required: true, numeric: true, min_value: 1 },
        road_description: { required: true, min: 3 },
        road_description_en: { required: true, min: 3 },
        // road_description_kg: { required: true, min: 3 }
      };
    }
  },

  watch: {
    selectedRoadClass(newVal) {
      this.payload = { road_class: newVal };
      this.reloadData();
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>