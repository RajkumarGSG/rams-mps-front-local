<!--
File: WorkCategoriesDropdown.vue
Description: show the dropdown combo with the Work Categories list in the TreatmentsTypes.vue and TreatmentTypeEditForm.vue.
-->
<template>
  <base-dropdown
    v-model="selectedValue"
    :label="label || $t('label.category')"
    :items="listItems"
    :isRequired="isRequired"
    :disabled="disabled"
    :dropdownId="'workCategoryDropdown'"
    @input="onChange"
  />
</template>
<script>
import { mapActions } from 'vuex'
import BaseDropdown from './BaseDropdown.vue'

export default {
  name: 'work-categories-dropdown',

  props: {
    label: { default: null, type: String },
    value: { default: null, type: Number },
    isRequired: { default: false, type: Boolean },
    disabled: { default: false, type: Boolean },
    routine: { default: 0, type: Number }
  },

  data() {
    return {
      selectedValue: this.value || null,
      listLoaded: false,
      listItems: [],
    }
  },

  components: {
    BaseDropdown,
  },

  async mounted() {
    await this.reloadData();
  },

  methods: {
    ...mapActions({
      getList: 'GET_WORK_CATEGORIES_LIST'
    }),

    onChange(value, description) {
      this.$emit('input', value, description);
    },

    async reloadData() {
      this.listLoaded = false;
      try {
        this.selectedValue = null;
        this.listItems = await this.getList(this.routine);
        if (this.value != null && !this.selectedValue) this.selectedValue = this.value;
      } finally {
        this.listLoaded = true;
      }
    },
  },

  watch: {
    value(newValue) {
      if (newValue !== this.selectedValue) {
        this.selectedValue = newValue;
      }
    },

    routine: 'reloadData', // Watch for changes in routine
  }
}
</script>