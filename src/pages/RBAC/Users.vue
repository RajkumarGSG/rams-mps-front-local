<!--
File: Users.vue
Description: show list of users in the DB.
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
        <BaseDropdown :label="$t('selections.select_group')" v-model="selectedGroup" :items="groups" :displayField="displayField"/>
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
        :actionBase="'user'"
        :moduleName="'ReferenceData'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="userName"
        @close="showDetailsDlg = false">

        <template #footer>
          <md-button v-if="showPassResetBtn" class="md-danger" native-type="submit" @click.native.prevent="passwordReset">
            {{ $t('buttons.password_reset') }}
          </md-button>
          <span> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; </span>
        </template>
      </EditForm>
  </template>
  </base-data-table>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { BaseTable, BaseDataTable, TableActions, SearchInput, BaseDropdown, EditForm } from '@/pages/Components';
import { getLang } from '@/api'
import { successMessage, errorMessage } from '@/mixins/messagesMixin'
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'users-list-form',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'Users',
      idFieldName: 'id',

      selectedGroup: null,
      propsToSearch: ['email', 'name', 'group'],
      currentSort: 'name',

      historyMapping: {
        selectedGroup: null,
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
    TableActions,
    BaseDropdown,
    EditForm
  },

  async mounted() {
    await this.loadGroups({})
  },

  methods: {
    ...mapActions({
      clearList: 'ReferenceData/CLEAR_USER_LIST', // Called from the BaseTableMixin's mount()
      loadGroups: 'ReferenceData/LOAD_GROUP_LIST',
      loadList: 'ReferenceData/LOAD_USER_LIST',
      delete: 'ReferenceData/DELETE_USER',
      passRecovery: 'PASSWORD_RECOVERY',
    }),

    async passwordReset() {
      if (!this.email) return;

      try {
        await this.passRecovery(this.email)
        await successMessage('', this.$t('messages.recovery_mail_was_sent'))
      } catch (err) {
        await errorMessage(`${this.$t('messages.recovery_mail_was_not_sent')} ${err}`)
      }
      this.$emit('close')
    },

    groupById(id) {
      return this.groups.find(item => item.id === id)?.[this.displayField]
    },
  },

  computed: {
    ...mapState({
      usersList: (state) => state.ReferenceData.user_list,
      groups: (state) => state.ReferenceData.group_list,
    }),

    headers() {
      return [
        { header: "users.email", key: "email", sortable: true },
        { header: "users.user", key: "name", sortable: true },
        { header: "users.group", key: "group", sortable: true },
        //{ header: "users.role", key: "role", sortable: true },
      ]
    },

    fields() {
      return [
        { name: 'email', label: 'users.email', type: 'text', class: 'md-layout-item md-size-60' },
        {
          name: 'group_id', label: 'users.group', type: 'custom', component: 'BaseDropdown',
          class: 'md-layout-item md-size-40', props: { items: this.groups, displayField: this.displayField }
        },
        { name: 'first_name', label: 'users.first_name', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'last_name', label: 'users.last_name', type: 'text', class: 'md-layout-item md-size-100' },
      ];
    },

    validations() {
      return {
        email: { required: true, email: true },
        first_name: { required: true, min: 3 },
        last_name: { required: true, min: 3 },
        group_id: { required: true, numeric: true, min_value: 1 },
      }
    },

    tableData() {
      const res = this.usersList.filter(item => (!this.selectedGroup || item.group_id == this.selectedGroup))
        .map(item => ({
          id: item.id,
          email: item.email,
          name: `${item.first_name} ${item.last_name}`,
          group: this.groupById(item.group_id),
          role: item.role
        }))
      return this.customSort(res, 'description')
    },

    currentItem() {
      return this.tableData.find(item => item.id == this.currentId);
    },

    email() {
      return this.currentItem?.email;
    },

    userName(){
      return this.currentItem?.name;
    },

    displayField() {
      return `name_${getLang()}`;
    },

    showPassResetBtn() {
      return this.currentId && this.isBtnAllowed('PassResetButton') && !this.errors.items.some(item => item.field === 'email');
    }
 },

  watch: {
  },
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>