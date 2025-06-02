<!--
File: Roles.vue
Description: show list of roles entered in the DB.
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
            @delete="deleteItem(item[idFieldName], item.name)" 
          />
        </template>
      </base-table>
    </template>

    <template #editing-dialog>
      <EditForm
        v-if="showDetailsDlg"
        :itemId="currentId"
        :actionBase="'role'"
        :moduleName="'ReferenceData'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="roleKey"
        @close="showDetailsDlg = false">
      </EditForm>
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { BaseTable, BaseDataTable, TableActions, SearchInput, EditForm } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'roles-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'Roles',
      idFieldName: 'role_id',

      propsToSearch: ['role_key', 'role_description'],
      currentSort: 'role_key',

      historyMapping: {
        currentSort: 'role_key',
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

  methods: {
    ...mapActions({
      clearList: 'ReferenceData/CLEAR_ROLE_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'ReferenceData/LOAD_ROLE_LIST',
      delete: 'ReferenceData/DELETE_ROLE',
    }),

    showPermissions(role) {
      const hist = {
        form: 'Permissions',
        use: true,
        data: {
          selectedRole: role,
          perPage: 10,
          currentPage: 1
        }
      }
      this.saveHistory(hist)
      this.$router.push('/settings/permissions')
    },
  },

  computed: {
    ...mapState({
      roleList: (state) => state.ReferenceData.role_list,
    }),

    tableData() {
      return this.roleList.map(item => ({
        ...item,
        active: item.active ? this.$t('buttons.yes') : this.$t('buttons.no')
      }));
    },

    headers() {
      return [
        { header: "stdCols.name", key: "role_key", sortable: true },
        { header: "stdCols.description", key: "description", sortable: true },
        { header: "road_network.active", key: "active", sortable: true },
        {
          header: "label.permissions_count", key: "permission_count", sortable: true, onClick: this.showPermissions,
          clickCondition: (item) => item.permission_count > 0, clickField: 'role_key'
        },
      ]
    },
    fields() {
      return [
        { name: 'role_key', label: 'stdCols.name', type: 'text', class: 'md-layout-item md-size-60' },
        { name: 'role_description_en', label: `${this.$t('stdCols.description')} (${this.$t('translate.en')})`, type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'role_description_ru', label: `${this.$t('stdCols.description')} (${this.$t('translate.ru')})`, type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'role_description_kg', label: `${this.$t('stdCols.description')} (${this.$t('translate.kg')})`, type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'active', label: 'road_network.active', type: 'switch', class: 'md-layout-item md-size-100' },
      ];
    },

    validations() {
      return {
        role_key: { required: true, min: 1, max: 100 },
        description_en: { required: true, min: 1, max: 255 },
        description_ru: { required: true, min: 1, max: 255 },
        description_kg: { required: true, min: 1, max: 255 }
      }
    },

    roleKey() {
      return this.tableData.find(item => item[this.idFieldName] == this.currentId)?.role_key;
    },
 },

  watch: {
  },
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>