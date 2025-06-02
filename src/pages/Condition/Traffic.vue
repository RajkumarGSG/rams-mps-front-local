<!--
File: Traffic.vue
Description: form for showing the Traffic data.
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
        :actionBase="'traffic_installation'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('route.traffic_data')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { BaseDataTable, BaseTable, SearchInput, TableActions, EditForm } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin';
//import EditForm from './TrafficEditForm.vue';

export default {
  name: 'traffic-all',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'Traffic',
      idFieldName: 'traffic_install_id',

      currentSort: 'traffic_install_desc',
      propsToSearch: ['traffic_install_desc', 'fk_traffic_site', 'photo_filename'],
      historyMapping: {
        currentSort: 'traffic_install_id',
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
    EditForm
  },

  methods: {
    ...mapActions({
      clearList: 'CLEAR_TRAFFIC_INSTALLATION_LIST',  // Called from the BaseTableMixin's mount()
      loadList: 'LOAD_TRAFFIC_INSTALLATION_LIST',
      delete: 'DELETE_TRAFFIC_INSTALLATION',
    }),
  },

  computed: {
    ...mapState({
      tableData: (state) => state.RoadNetwork.traffic_installation_list,
    }),

    headers() {
      return [
        { header: this.$t('stdCols.id'), key: 'traffic_install_id', sortable: true, width: 5 },
        { header: this.$t('stdCols.description'), key: 'traffic_install_desc', sortable: true, width: 40 },
        { header: this.$t('traffic.site_id'), key: 'fk_traffic_site', sortable: true, width: 10, },
        { header: this.$t('traffic.photo_filename'), key: 'photo_filename', sortable: true, width: 10 },
      ]
    },

    fields() {
      return [
        { name: 'description', label: 'stdCols.description', type: 'text', class: 'md-layout-item md-size-70' },
        { name: 'traffic_site_id', label: 'traffic.site_id', type: 'number', class: 'md-layout-item md-size-30' },
        { name: 'photo_filename', label: 'traffic.photo_filename', type: 'text', class: 'md-layout-item md-size-100' },
      ];
    },

    validations() {
      return {
        description: { required: true, min: 3 },
        traffic_site_id: { required: true },           //, numeric: true         
        photo_filename: { min: 3 }
      }
    },
 },
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>
