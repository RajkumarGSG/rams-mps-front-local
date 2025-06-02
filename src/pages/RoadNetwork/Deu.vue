<!--
File: Deu.vue
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
        :actionBase="'deu'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('road_network.dep')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { RegionsDropdown, BaseTable, BaseDataTable, TableActions, SearchInput, EditForm } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'deus-list',
  mixins: [BaseTableMixin],

  components: {
    RegionsDropdown,
    BaseDataTable,
    BaseTable,
    SearchInput,
    TableActions,
    EditForm
  },

  data() {
    return {
      formName: 'Deu',
      idFieldName: 'deu_id',
      propsToSearch: ['region', 'description', 'city', 'address1'],
      currentSort: 'region',

      historyMapping: {
        selectedRegion: 0,
        currentSort: 'region',
        currentSortOrder: 'asc',
        pagination: this.pagination,
        searchQuery: ''
      }
    }
  },

  methods: {
    ...mapActions({
      clearList: 'CLEAR_DEU_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'LOAD_DEU_LIST',
      delete: 'DELETE_DEU',
    }),
  },

  computed: {
    ...mapGetters(['deuWithPrefix']),

    tableData() {
      return this.customSort(this.deuWithPrefix(this.$t('road_network.dep')), 'description');
    },

    headers() {
      return [
        { header: "road_network.region", key: "region", sortable: true },
        { header: "road_network.dep", key: "description", sortable: true },
        { header: "stdCols.address", key: "address1", sortable: true },
        { header: "road_network.city", key: "city", sortable: true },
      ]
    },

    fields() {
      return [
        { name: 'fk_region', type: 'custom', component: 'RegionsDropdown', class: 'md-layout-item md-size-100' },
        { name: 'description', label: 'stdCols.name_ru', type: 'text', prefix: 'ДЭУ', class: 'md-layout-item md-size-50' },
        { name: 'description_en', label: 'stdCols.name_en', type: 'text', prefix: 'DEU', class: 'md-layout-item md-size-50' },
        { name: 'address1', label: `${this.$t('stdCols.address')} (1)`, type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'address2', label: `${this.$t('stdCols.address')} (2)`, type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'city', label: 'road_network.city', type: 'text', class: 'md-layout-item md-size-100' },
      ];
    },

    validations() {
      return {
        fk_region: { required: true, numeric: true, min_value: 1 },
        description: { required: true, min: 1 },
        description_en: { required: true, min: 1 },
        address1: { required: true, min: 3 },
        //address2: { required: false, min: 3 },
        city: { required: true, min: 3 },
      }
    },

  },

  watch: {
    selectedRegion(newVal) {
      this.payload = { region_id: newVal };
      this.reloadData();
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>