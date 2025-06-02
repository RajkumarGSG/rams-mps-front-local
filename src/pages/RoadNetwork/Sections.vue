<!--
File: Sections.vue
Description: show list of road sections entered in the DB.
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
      <div :class="getSize(15)"><regions-dropdown v-model="selectedRegion" /></div>
      <div :class="getSize(10)"><DepsDropdown v-model="selectedDeu" :regionId="selectedRegion" :disabled="!selectedRegion" /></div>
      <div :class="getSize(20)"><RoadsDropdown v-model="selectedRoad" :items="roadsList" :disabled="!selectedRegion" /></div>
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
            :btnExtraAllowed="true"
            :extraButtonClass="'md-just-icon md-success md-simple'"
            :btnExtraAsIcon="true"
            :extraButtonIcon="'preview'"
            :btnExtraStyle="true"
            :extraButtonLabel="$t('buttons.details')"
            @extraButtonClicked="showDetails(item.section_id)"

            :btnEditAllowed="isBtnAllowed('EditButton')"
            :btnDeleteAllowed="isBtnAllowed('DeleteButton')"
            @edit="viewItem(item[idFieldName])"
            @delete="deleteItem(item[idFieldName], item.section_description)" 
          />
        </template>
      </base-table>
    </template>

    <template #editing-dialog>
      <SectionDetails
        v-if="showSectionDetailsDlg"
        :sectionId="currentId"
        @close="showSectionDetailsDlg = false"
      />

      <EditForm
        v-if="showDetailsDlg"
        :itemId="currentId"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { BaseDataTable, BaseTable, RegionsDropdown, DepsDropdown, RoadsDropdown, SearchInput, TableActions } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin';
// TODO: re-implement with EditForms, ticket #99
import EditForm from './SectionEditForm.vue';
//import SectionDetails from './SectionEditOverview.vue';
import SectionDetails from './SectionDetails.vue';

export default {
  name: 'sections-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'Sections',
      idFieldName: 'section_id',

      showSectionDetailsDlg: false,
      selectedDeu: null,
      selectedRoad: null,

      currentSort: 'deu',
      propsToSearch: ['deu', 'road', 'section_description'],
      historyMapping: {
        selectedRegion: 0,
        selectedDeu: 0,
        selectedRoad: 0,
        currentSort: 'deu',
        currentSortOrder: 'asc',
        pagination: this.pagination,
      }
    }
  },

  components: {
    BaseDataTable,
    BaseTable,
    SearchInput,
    TableActions,
    RegionsDropdown,
    DepsDropdown,
    RoadsDropdown,
    EditForm,
    SectionDetails
  },

  methods: {
    ...mapActions({
      clearList: 'CLEAR_SECTION_LIST',  // Called from the BaseTableMixin's mount()
      loadList: 'LOAD_SECTION_LIST',
      delete: 'DELETE_SECTION',
    }),

    showDetails(id) {
      this.currentId = id;
      this.showSectionDetailsDlg = true;
    },
  },

  computed: {
    ...mapGetters(['roadsListFiltered', 'sectionsWithPrefix', 'closePath']),

    tableData() {
      return this.customSort(this.sectionsWithPrefix(this.$t('road_network.dep')), 'start_distance_m');
    },

    roadsList() {
      return this.roadsListFiltered(this.selectedDeu);
    },

    headers() {
      return [
        { header: this.$t('road_network.dep'), key: 'deu', sortable: true, width: 5 },
        { header: this.$t('road_network.road_key'), key: 'road_key', sortable: true, width: 10, },
        { header: this.$t('stdCols.name'), key: 'section_description', sortable: true, width: 40 },
        { header: this.$t('inventory.start_distance_m'), key: 'start_distance_m', sortable: true, width: 10, num: true, digits: 0 },
        { header: this.$t('inventory.end_distance_m'), key: 'end_distance_m', sortable: true, width: 10, num: true, digits: 0 },
      ];
    },
  },

  watch: {
    async selectedRegion(newVal) {
      this.payload = { region_id: newVal };
      this.selectedDeu = null;
      if (!this.loadingHistory) await this.reloadData();
    },

    async selectedDeu(newVal) {
      this.payload.deu_id = newVal;
      this.selectedRoad = null;
      if (!this.loadingHistory) await this.reloadData();
    },

    async selectedRoad(newVal) {
      this.payload.road_id = newVal;
      if (!this.loadingHistory) await this.reloadData();
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>