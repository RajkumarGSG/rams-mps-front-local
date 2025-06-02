<!--
File: YearsDropdown.vue
Description: show the dropdown combo with the years list that are exist in the RDB.
-->
<template>
  <base-dropdown
    v-model="selectedValue"
    :label="label || $t('selections.select_year')"
    :items="yearsList"
    :isRequired="isRequired"
    :disabled="disabled"
    :dropdownId="'yearsDropdown'"
    @input="onChange"
  />
</template>
<script>
  import { mapState, mapActions } from 'vuex'
  import BaseDropdown from './BaseDropdown.vue'

  export default {
    name: 'years-dropdown',

    props: {
      label: { default: null, type: String },
      value: { default: null, type: Number },
      disabled: { default: false, type: Boolean },
      items: { default: () => [], type: Array },
      valueField: { default: "survey_year", type: String },
      isRequired: { default: false, type: Boolean },
    },

    data() {
      return {
        selectedValue: this.value || null,
        listLoaded: false
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
        getList: 'GET_YEARS_LIST'
      }),

      onChange(value, description) {
        this.$emit('input', value, description);
      },

      async reloadData() {
        if (this.itemsProvided) {
          this.listLoaded = true
        } else {
          this.listLoaded = false
          const res = await this.getList()
          if (res === 'success') {
            this.listLoaded = true;
            if (this.value && !this.selectedValue) this.selectedValue = this.value;
          }
        }
      },
    },

    computed: {
      ...mapState({
        years: (state) => state.Dropdowns.years
      }),

      itemsProvided() {
        return this.items.length > 0;
      },

      yearsList() {
        return this.itemsProvided ? this.items : this.years;
      },
    },

    watch: {
      value(newValue, oldValue) {
        if (newValue !== oldValue && this.listLoaded) {
          this.selectedValue = newValue;
        }
      },
    }
  }
</script>