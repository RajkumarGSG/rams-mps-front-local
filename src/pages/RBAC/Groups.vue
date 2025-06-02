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
      <div :class="getSize(15)"><base-dropdown :label="$t('selections.select_region')" v-model="selectedRegion"
          :items="groupRegions" :displayField="displayField" /></div>
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
        :actionBase="'group'"
        :moduleName="'ReferenceData'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('users.group')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { BaseTable, BaseDataTable, TableActions, BaseDropdown, SearchInput, EditForm } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'
import { getLang } from '@/api'

export default {
  name: 'groups-list-form',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'Groups',
      idFieldName: 'id',

      propsToSearch: ['name', 'region_description', 'access_level'],
      currentSort: 'name',
      groupRegions: [],

      accessLevelList: [],

      historyMapping: {
        selectedRegion: 0,
        currentSort: 'name',
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
    BaseDropdown,
    EditForm
  },

  async mounted() {
    this.accessLevelList = await this.loadAccLevels()
    this.groupRegions = await this.loadRegionsList()
    //await this.reloadData()
  },

  methods: {
    ...mapActions({
      clearList: 'ReferenceData/CLEAR_GROUP_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'ReferenceData/LOAD_GROUP_LIST',
      loadRegionsList: 'ReferenceData/LOAD_GROUPS_REGION_LIST',
      loadAccLevels: 'ReferenceData/LOAD_ACC_LEVEL_LIST',
      delete: 'ReferenceData/DELETE_GROUP',
    }),

    getRegion(regionId) {
      return this.groupRegions.find(item => item.id === regionId)?.[this.displayField]
    },

    getAccLevel(accLevel) {
      const res = this.accessLevels.find(item => item.id === accLevel)?.description
      return res
    },
  },

  computed: {
    ...mapState({
      groupsList: (state) => state.ReferenceData.group_list,
    }),

    displayField() {
      return `name_${getLang()}`;
    },

    headers() {
      return [
        { header: "stdCols.name", key: "name", sortable: true },
        { header: "road_network.region", key: "region_description", sortable: true },
        { header: "label.access_level", key: "access_level", sortable: true },
      ]
    },

    fields() {
      return [
        { name: 'name_en', label: 'stdCols.name_en', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'name_ru', label: 'stdCols.name_ru', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'name_kg', label: 'stdCols.name_kg', type: 'text', class: 'md-layout-item md-size-100' },
        {
          name: 'region_id', label: 'road_network.region', type: 'custom', component: 'BaseDropdown',
          class: 'md-layout-item md-size-50', props: { items: this.groupRegions, displayField: this.displayField, isRequired: true }
        },
        {
          name: 'access_level', label: 'label.access_level', type: 'custom', component: 'BaseDropdown',
          class: 'md-layout-item md-size-50', props: { items: this.accessLevels, isRequired: true }
        },
      ];
    },

    validations() {
      return {
        name_en: { required: true, min: 3 },
        name_ru: { required: true, min: 3 },
        name_kg: { required: true, min: 3 },
        region_id: { required: true, numeric: true, min_value: 0 },
        access_level: { required: true, numeric: true, min_value: 0 },
      }
    },

    accessLevels() {
      return this.accessLevelList.map(item => ({
        id: item.id,
        description: item[this.displayField],
      }))
    },

    tableData() {
      const res = this.groupsList.filter(item => (!this.selectedRegion || item.region_id == this.selectedRegion))
        .map(item => ({
          id: item.id,
          name: item[this.displayField],
          region_description: this.getRegion(item.region_id),
          access_level: this.getAccLevel(item.access_level)
        }))
      return this.customSort(res)
    },
  },

  watch: {
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>