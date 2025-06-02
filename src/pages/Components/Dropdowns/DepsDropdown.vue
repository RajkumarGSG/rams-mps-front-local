<!--
File: DepsDropdown.vue
Description: show the dropdown combo with the DEU list .
-->
<template>
  <base-dropdown
    v-model="selectedValue" 
    :label="label || $t('selections.select_deu')" 
    :items="deuList"
    :isRequired="isRequired" 
    :disabled="disabled" 
    :dropdownId="'deuDropdown'"
     @input="onChange"
  />
</template>
<script>
  import { mapState, mapActions } from 'vuex'
  import BaseDropdown from './BaseDropdown.vue'

  export default {
    name: 'deus-dropdown',

    props: {
      label: { default: null, type: String },
      value: { default: null, type: Number },
      isRequired: { default: false, type: Boolean },
      regionId: { default: null, type: Number },
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

    methods: {
      ...mapActions({
        getList: 'GET_DEUS_DROPDOWN'
      }),

      async reloadData(regionId) {
        this.selectedValue = null     // To reset
        const params = { region_id: regionId, prefix: this.$t('road_network.dep') }
        const res = await this.getList(params)
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
        deuList: (state) => state.Dropdowns.deus
      })
    },

    watch: {
      async regionId(newValue) {
        this.listLoaded = false
        await this.reloadData(newValue)
      },

      value(newValue, oldValue) {
        if (newValue !== oldValue && this.listLoaded) {
          this.selectedValue = newValue;
        }
      }
    },
  }
</script>