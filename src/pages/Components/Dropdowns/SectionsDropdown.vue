<!--
File: SectionsDropdown.vue
Description: show the dropdown combo with the road sections list.
-->
<template>
  <base-dropdown
    v-model="selectedValue"
    :label="label || $t('selections.select_section')"
    :items="sectionsList"
    :isRequired="isRequired"
    :disabled="disabled"
    :dropdownId="'sectionsDropdown'"
    @input="onChange"
  />
</template>
<script>
  import { mapState, mapActions } from 'vuex'
  import BaseDropdown from './BaseDropdown.vue'

  export default {
    name: 'sections-dropdown',

    props: {
      label: { default: null, type: String },
      value: { default: null, type: Number },
      isRequired: { default: false, type: Boolean }, 
      regionId: { default: null, type: Number },
      roadId: { default: null, type: Number },
      disabled: { default: false, type: Boolean }
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


    methods: {
      ...mapActions({
        getList: 'GET_SECTIONS_DROPDOWN'
      }),

      onChange(value, description) {
        this.$emit('input', value, description);
      },

      async reloadData() {
        this.listLoaded = false
        this.selectedValue = null
        const values = {
          region_id: this.regionId,
          road_id: this.roadId
        }
        const res = await this.getList(values)
        if (res === 'success') {
          this.listLoaded = true;
          if (this.value && !this.selectedValue) this.selectedValue = this.value;
        }
      },
    },

    computed: {
      ...mapState({
        sectionsList: (state) => state.Dropdowns.sections
      })
    },

    watch: {
      regionId(value) {
        this.reloadData()
      },

      roadId(value) {
        this.reloadData()
      },

      value(newValue, oldValue) {
        if (newValue !== oldValue && this.listLoaded) {
          this.selectedValue = newValue;
        }
      }
    }
  }
</script>
