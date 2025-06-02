<!--
File: RdbLookupDropdown.vue
Description: show the dropdown combo with the dropdown list based on RdbLookup data.
-->
<template>
    <base-dropdown 
    v-model="selectedValue" 
    :label="label || $t('selections.select')" 
    :items="listItems"
    :hiddenField="hiddenField"
    :isRequired="isRequired" 
    :disabled="disabled" 
    :dropdownId="'rdbLookupDropdown'" 
    @input="onChange"
  />
</template>
<script>
import { mapActions } from 'vuex'
import BaseDropdown from './BaseDropdown.vue'

export default {
  name: 'rdb-lookup-dropdown',

  props: {
    label: { default: null, type: String },
    value: { default: null, type: Number },
    hiddenField: { default: "", type: String },
    isRequired: { default: false, type: Boolean },
    disabled: { default: false, type: Boolean },
    lookupType: { default: null, type: String },
    addEmptyLine: { default: true, type: Boolean },
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
      getList: 'ReferenceData/LOAD_RDB_LOOKUP',
    }),

    async reloadData() {
      if (!this.lookupType) {
        this.listItems = [];
        return;
      };

      this.listLoaded = false;
      try {
        this.listItems = await this.getList({ lookupType: this.lookupType, addEmptyLine: this.addEmptyLine }) || [];
        if (this.value != null && !this.selectedValue) this.selectedValue = this.value;
      } catch (error) {
        this.$emit('error', error)
      } finally {
        this.listLoaded = true;
      }
    },

    onChange(value, description, hiddenDescription) {
      this.$emit('input', value, description, hiddenDescription);
    }
  },

  watch: {
    value(newValue, oldValue) {
      if (newValue !== oldValue && this.listLoaded) {
        this.selectedValue = newValue;
      }
    }
  }
}
</script>