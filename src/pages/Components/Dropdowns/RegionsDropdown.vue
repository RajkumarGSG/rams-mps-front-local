<!--
File: RegionsDropdown.vue
Description: show the dropdown combo with the regions list .
-->
<template>
  <base-dropdown 
    v-model="selectedValue" 
    :label="label || $t('selections.select_region')" 
    :items="regions"
    :isRequired="isRequired" 
    :disabled="disabled" 
    :dropdownId="'regionsDropdown'" 
    @input="onChange"
  />
</template>
<script>
  import { mapState, mapActions } from 'vuex'
  import BaseDropdown from './BaseDropdown.vue'

  export default {
    name: 'regions-dropdown',

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
        getList: 'GET_REGIONS_DROPDOWN'
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
        regions: (state) => state.Dropdowns.regions
      }),
    },

    watch: {
      value(newValue, oldValue) {
        if (newValue !== oldValue && this.listLoaded) {
          this.selectedValue = newValue;
        }
      }
    },
  }
</script>