<!--
File: UnitsDropdown.vue
Description: show the dropdown combo with the units dropdown list .
-->
<template>
  <base-dropdown
    v-model="selectedValue"
    :label="label || $t('label.units')"
    :items="unitsList"
    :isRequired="isRequired"
    :disabled="disabled"
    :dropdownId="'unitsDropdown'"
    @input="onChange"
  />
</template>
<script>
  import { mapState, mapActions } from 'vuex'
  import BaseDropdown from './BaseDropdown.vue'

  export default {
    name: 'units-dropdown',

    props: {
      label: { default: null, type: String },
      value: { default: null, type: Number },
      isRequired: { default: false, type: Boolean },
      disabled: { default: false, type: Boolean }
    },

    data() {
      return {
        selectedValue: this.value || null,
        listLoaded: false,
      }
    },

    components: {
      BaseDropdown,
    },

    async mounted() {
      await this.reloadData()
    },

    methods: {
      ...mapActions({
        getList: 'GET_UNITS_DROPDOWN'
      }),

      async reloadData() {
        const res = await this.getList()
        if (res === 'success') {
          this.listLoaded = true;
          if (this.value && !this.selectedValue) this.selectedValue = this.value;
        }
      },

      onChange(value, description) {
        this.$emit('input', value, description);
      }
    },

    computed: {
      ...mapState({
        unitsList: (state) => state.Dropdowns.units
      })
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