<!--
File: UserRoles.vue
Description: show list of roles assigned to users.
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
      <div :class="getSize(15)">
        <base-dropdown :label="$t('selections.select_role')" v-model="selectedRole" :items="rolesDropdownList" />
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

        <template #table-actions="{ item }">
          <table-actions
            :btnDeleteAllowed="isBtnAllowed('DeleteButton')"
            @delete="deleteItem(item[idFieldName], item.user_full_name)" 
          />
        </template>
      </base-table>
    </template>

    <template #editing-dialog>
      <EditForm
        v-if="showDetailsDlg"
        :itemId="currentId"
        :actionBase="'user_role'"
        :moduleName="'ReferenceData'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('messages.role_assigned')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { BaseTable, BaseDataTable, TableActions, BaseDropdown, SearchInput, EditForm } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'user-roles-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'UserRoles',
      idFieldName: 'user_role_id',

      selectedRole: null,
      propsToSearch: ['user_full_name', 'email', 'role_key', 'role_description'],
      currentSort: 'user_full_name',

      historyMapping: {
        currentSort: 'user_full_name',
        currentSortOrder: 'asc',
        pagination: this.pagination,
        searchQuery: ''
      },
    }
  },

  components: {
    BaseDataTable,
    BaseTable,
    TableActions,
    BaseDropdown,
    SearchInput,
    EditForm
  },

  async mounted() {
    await this.getRolesDropdown()
    await this.loadUsersList({})
    //await this.reloadData()
  },

  methods: {
    ...mapActions({
      clearList: 'ReferenceData/CLEAR_USER_ROLE_LIST',
      loadList: 'ReferenceData/LOAD_USER_ROLE_LIST',
      getRolesDropdown: 'GET_ROLES_DROPDOWN',
      loadUsersList: 'ReferenceData/LOAD_USER_LIST',
      addRole: 'ReferenceData/ADD_NEW_USER_ROLE',
      delete: 'ReferenceData/DELETE_USER_ROLE',
    }),
  },

  computed: {
    ...mapState({
      userRolesList: (state) => state.ReferenceData.user_role_list,
      usersList: (state) => state.ReferenceData.user_list,
      rolesDropdownList: (state) => state.Dropdowns.roles,
      highlightedRow: (state) => state.History.row
    }),

    usersDropdownList() {
      return this.usersList.map(item => ({
        id: item.id,
        description: `${item.first_name} ${item.last_name}`
      })).sort((a, b) => a.description.localeCompare(b.description, undefined, { sensitivity: 'base' }))
    },

    headers() {
      return [
        { header: "users.full_name", key: "user_full_name", sortable: true },
        { header: "users.email", key: "email", sortable: true },
        { header: "users.role", key: "role_key", sortable: true },
        { header: "users.role_description", key: "role_description", sortable: true },
      ]
    },

    fields() {
      return [
        {
          name: 'fk_user', label: 'selections.select_user', type: 'custom', component: 'BaseDropdown',
          class: 'md-layout-item md-size-100', props: { items: this.usersDropdownList, isRequired: true }
        },
        {
          name: 'fk_role', label: 'selections.select_role', type: 'custom', component: 'BaseDropdown',
          class: 'md-layout-item md-size-100', props: { items: this.rolesDropdownList, isRequired: true }
        },
      ];
    },

    validations() {
      return {
        fk_user: { required: true, numeric: true, min_value: 1 },
        fk_role: { required: true, numeric: true, min_value: 1 },
      }
    },

    tableData() {
      const res = this.userRolesList.filter(item => (!this.selectedRole || item.fk_role == this.selectedRole))
      return this.customSort(res, 'user_full_name')
    },
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>