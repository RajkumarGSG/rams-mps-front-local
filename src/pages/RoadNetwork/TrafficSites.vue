<!--
File: TrafficSites.vue
Description: show list of traffic sites entered in the DB.
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
      <div :class="getSize(20)"><RoadsDropdown v-model="selectedRoad" :items="roadsInTrafficSitesList" /></div>
      <div :class="getSize(15)"><search-input v-model="searchQuery" /></div>
    </template>

    <template #table-rows>
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
            @delete="deleteItem(item[idFieldName], item.section_description)" 
          />
        </template>
      </base-table>
    </template>

    <template #editing-dialog>
      <EditForm
        v-if="showDetailsDlg"
        :itemId="currentId"
        :actionBase="'traffic_site'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('traffic.traffic_site')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { RoadsDropdown, BaseDataTable, BaseTable, SearchInput, TableActions } from "@/pages/Components"
import BaseTableMixin from '@/mixins/BaseTableMixin';
import EditForm from './TrafficSiteEditForm.vue';
//import { EditForm } from "@/pages/Components"

export default {
  name: 'traffic-sites-all',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'TrafficSites',
      idFieldName: 'traffic_site_id',
      propsToSearch: ['traffic_site_desc', 'sdr_road', 'section'],
      currentSort: 'traffic_site_desc',

      selectedRegion: 0,
      selectedRoad: 0,

      historyMapping: {
        selectedRegion: 0,
        selectedRoad: 0,
        currentSort: 'road_number',
        currentSortOrder: 'asc',
        pagination: {},
        searchQuery: ''
      }
    }
  },

  components: {
    RoadsDropdown,
    BaseDataTable,
    BaseTable,
    SearchInput,
    TableActions,
    EditForm
  },

  async mounted() {
  },

  methods: {
    ...mapActions({
      clearList: 'CLEAR_TRAFFIC_SITE_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'LOAD_TRAFFIC_SITE_LIST',
      delete: 'DELETE_TRAFFIC_SITE',
    }),
  },

  computed: {
    ...mapGetters(['trafficSitesFiltered', 'roadsInTrafficSitesList']),

    tableData() {
      return this.trafficSitesFiltered(this.selectedRoad)
    },

    headers() {
      return [
        { header: "road_network.road", key: "sdr_road", sortable: true },
        { header: "road_network.section", key: "section", sortable: true },
        { header: "stdCols.description", key: "traffic_site_desc", sortable: true },
        { header: "inventory.start_distance_m", key: "start_distance", sortable: true, num: true, digits: 0 },
        { header: "inventory.end_distance_m", key: "end_distance", sortable: true, num: true, digits: 0 },
        { header: "traffic.surveyed_distance", key: "surveyed_distance", sortable: true, num: true, digits: 0 },
        { header: "traffic.aadt_coef_set", key: "aadt_coef_set", sortable: true },
      ]
    },

    currentItem() {
      return this.tableData.find(item => item[this.idFieldName] == this.currentId);
    },

    currentRegion() {
      return this.currentItem?.fk_region;
    },

    currentRoad() {
      return this.currentItem?.fk_road;
    },

    currentSection() {
      return this.currentItem?.fk_section;
    },

    fields() {
        return [
        { name: 'fk_region', type: 'custom', component: 'RegionsDropdown', class: 'md-layout-item md-size-100', default: this.currentRegion },
        { 
          name: 'fk_road', type: 'custom', component: 'RoadsDropdown', class: 'md-layout-item md-size-100', props: { regionId: this.currentRegion }, 
          default: this.currentRoad 
        },        
        { name: 'fk_section', type: 'custom', component: 'SectionsDropdown', class: 'md-layout-item md-size-100', default: this.currentSection },
        { name: 'traffic_site_desc', label: 'stdCols.description', type: 'text', class: 'md-layout-item md-size-50' },
        { 
          name: 'fk_aadt_coef_set', label: 'traffic.aadt_coef_set', type: 'custom', component: 'RdbLookupDropdown', 
          class: 'md-layout-item md-size-50', props: { lookupType: 'aadt_coef_set' } 
        },
        { name: 'start_distance', label: 'road_network.start_distance', type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'end_distance', label: 'road_network.end_distance', type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'surveyed_distance', label: 'traffic.surveyed_distance', type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'sdr_distance', label: 'traffic.sdr_distance', type: 'number', class: 'md-layout-item md-size-50' },
        { name: 'fk_vclass_preset', label: 'fk_vclass_preset', type: 'hidden', default: 0 },
        { name: 'ts_guid', label: 'ts_guid', type: 'hidden', default: '11' },
        { name: 'geom', label: 'geom', type: 'hidden', default: '11' },
        ];
    },

   validations() {
      return {
        fk_road: { required: true, numeric: true, min_value: 1 },
        fk_section: { required: true, numeric: true, min_value: 1 },
        traffic_site_desc: { required: true, min: 3 },
        fk_aadt_coef_set: { required: true, numeric: true, min_value: 1 },
        start_distance: { required: true, numeric: true },
        end_distance: { required: true, numeric: true },
        surveyed_distance: { required: true, numeric: true },
        sdr_distance: { required: false, numeric: true },
      };
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>