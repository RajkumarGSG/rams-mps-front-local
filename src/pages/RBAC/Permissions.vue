<!--
File: Permissions.vue
Description: show list of permissions entered in the DB.
-->
<template>
  <base-data-table
    v-if="eligible"
    :loading="showSpinner"
    :pagination="pagination"
    :from="from"
    :to="to"
    :total="total">

    <template #header-filters>
      <div :class="getSize(15)">
        <BaseDropdown :label="$t('select role')" v-model="selectedRole" :items="rolesList" :valueField="'description'" />
      </div>
      <div :class="getSize(15)">
        <BaseDropdown :label="$t('select type')" v-model="selectedType" :items="getPermissionTypes" />
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
      </base-table>
    </template>

  </base-data-table>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { BaseTable, BaseDataTable, SearchInput, BaseDropdown } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'permissions-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'Permissions',
      idFieldName: 'front_component_id',

      selectedRole: '',
      selectedType: null,
      propsToSearch: ['form_name', 'form_path', 'api_path'],
      currentSort: 'form_name',

      historyMapping: {
        selectedRole: '',
        selectedType: null,
        currentSort: 'name',
        currentSortOrder: 'asc',
        pagination: this.pagination,
        searchQuery: ''
      },
    }
  },

  components: {
    BaseDataTable,
    BaseTable,
    SearchInput,
    BaseDropdown,
  },

  async mounted() {
    await this.getRolesDropdown();
    if (this.rolesCount) this.selectedRole = this.rolesList[0].description;

    if (!this.permissionsCount) {
      await this.loadList();
    };
  },

  methods: {
    ...mapActions({
      clearList: '', // Called from the BaseTableMixin's mount()
      getRolesDropdown: 'GET_ROLES_DROPDOWN',
      loadList: 'ReferenceData/LOAD_USER_PERMISSIONS_PIVOT',
      delete: '',
    }),

  },

  computed: {
    ...mapState({
      // permissionsList: (state) => state.RBAC.userPermissionsList,
      rolesList: (state) => state.Dropdowns.roles,
    }),

    ...mapGetters('ReferenceData', ['getPermissionTypes', 'getPermissionsByType']),

    headers() {
      return [
        { header: "label.component_type", key: "component_type", sortable: true },
        { header: "stdCols.name", key: "component_name", sortable: true },
        { header: "form_name", key: "form_name", sortable: true },
        { header: "api_path", key: "api_path", sortable: true },
        {
          header: "selectedRole", key: 'selectedRole', sortable: true,
          condition: (item) => !!item.selectedRole
        },
      ]
    },

    rolesCount() {
      return this.rolesList.length;
    },

    tableData() {
      return this.getPermissionsByType(this.selectedType)
      .map(item => ({
          ...item,
          selectedRole: item[this.selectedRole] ? this.selectedRole : null,
        }));
    },

    permissionsCount() {
      return this.tableData.length
    },

  },

  watch: {
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>