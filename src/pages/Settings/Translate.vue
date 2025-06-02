<!--
File: Translate.vue
Description: add/edit translation of terms in the DB.
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
        <BaseDropdown :label="$t('label.categories')" v-model="selectedCategory" :items="getTranslationCategories"
          @input="reloadData" />
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
            @edit="viewItem(item[idFieldName])"
          />
        </template>
      </base-table>
    </template>

    <template #editing-dialog>
      <EditForm
        v-if="showDetailsDlg"
        :itemId="currentId"
        :actionBase="'translation'"
        :formName="formName"
        :idFieldName="idFieldName"
        :fields="fields"
        :validations="validations"
        :messageTitle="$t('route.translate')"
        @close="showDetailsDlg = false"
      />
    </template>
  </base-data-table>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { BaseTable, BaseDataTable, TableActions, SearchInput, BaseDropdown, EditForm } from '@/pages/Components';
import BaseTableMixin from '@/mixins/BaseTableMixin'

export default {
  name: 'translations-list',
  mixins: [BaseTableMixin],

  data() {
    return {
      formName: 'Translate',

      idFieldName: 'id',
      selectedCategory: null,

      propsToSearch: ['category', 'key', 'en', 'ru', 'kg'],
      currentSort: 'category',

      historyMapping: {
        selectedCategory: null,
        currentSort: 'category',
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

  methods: {
    ...mapActions({
      clearList: 'CLEAR_TRANSLATION_LIST', // Called from the BaseTableMixin's mount()
      loadList: 'LOAD_TRANSLATION_LIST',
      delete: '',
    }),

  },

  computed: {
    ...mapGetters(['getTranslationCategories', 'getFilteredTranslations']),

    tableData() {
      const res = this.getFilteredTranslations(this.selectedCategory);
      return this.customSort(res, 'key');
    },

    headers() {
      return [
        { header: "label.category", key: "category", sortable: true },
        { header: "translate.key", key: "key", sortable: true },
        { header: "translate.en", key: "en", sortable: true },
        { header: "translate.ru", key: "ru", sortable: true },
        { header: "translate.kg", key: "kg", sortable: true },
      ];
    },

    fields() {
      return [
        {
          name: 'category', label: 'label.category', type: 'custom', component: 'BaseDropdown',
          class: 'md-layout-item md-size-50', props: { items: this.getTranslationCategories }
        },
        { name: 'key', label: 'translate.key', type: 'text', class: 'md-layout-item md-size-50' },
        { name: 'en', label: 'translate.en', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'ru', label: 'translate.ru', type: 'text', class: 'md-layout-item md-size-100' },
        { name: 'kg', label: 'translate.kg', type: 'text', class: 'md-layout-item md-size-100' },
      ];
    },

    validations() {
      return {
        category: { required: true, min: 3 },
        key: { required: true, min: 3 },
        en: { required: true, min: 1 },
        ru: { required: true, min: 1 },
        kg: { required: true, min: 1 },
      };
    },
 },

  watch: {
  }
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';
</style>