<!--
File: TreatmentsDropdown.vue
Description: show the dropdown combo with the treatments list .
-->
<template>
  <base-dropdown
    v-model="selectedValue"
    :label="label || $t('selections.select_treatment')"
    :items="treatments"
    :isRequired="isRequired"
    :disabled="disabled"
    :dropdownId="'treatmentsDropdown'"
    @input="onChange"
  />
</template>
<script>
  import { mapState, mapActions } from 'vuex'
  import BaseDropdown from './BaseDropdown.vue'

  export default {
    name: 'treatments-dropdown',

    props: {
      label: { default: null, type: String },
      value: { default: null, type: Number },
      isRequired: { default: false, type: Boolean },
      routine: { default: 0, type: Number },
      workCategory: { default: null, type: Number },
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

    async mounted() {
      await this.reloadData();
    },

    methods: {
      ...mapActions({
        getList: 'GET_TREATMENT_TYPE_DROPDOWN'
      }),

      onChange(value, description) {
        this.$emit('input', value, description);
      },

      async reloadData() {
        this.listLoaded = false
        this.selectedValue = null
        const res = await this.getList({ routine: this.routine, workCategory: this.workCategory })
        if (res === 'success') {
          this.listLoaded = true;
          if (this.value && !this.selectedValue) this.selectedValue = this.value;
        }
      },
    },

  computed: {
    ...mapState({
      treatments: (state) => state.Dropdowns.treatmentTypes
    })
  },

  watch: {
    value(newValue, oldValue) {
      if (newValue !== oldValue && this.listLoaded) {
        this.selectedValue = newValue;
      }
    },

    routine(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.reloadData();
      };
    },

    workCategory(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.reloadData();
      };
    }
  }
  }
</script>