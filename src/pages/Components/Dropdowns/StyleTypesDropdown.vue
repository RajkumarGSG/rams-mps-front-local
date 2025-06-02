<!--
File: StyleTypesDropdown.vue
Description: show the dropdown combo with the style types llist (circe/line) for showing in the map.
-->
<template>
  <base-dropdown
    v-model="selectedValue"
    :label="label || $t('label.show_as')"
    :items="styleTypes"
    :displayField = "'value'"
    :valueField = "'key'"
    :isRequired="isRequired"
    :disabled="disabled"
    :dropdownId="'styleTypesDropdown'"
    @input="onChange"
  />
</template>
<script>
  import BaseDropdown from './BaseDropdown.vue'

  export default {
    name: 'style-types-dropdown',

    props: {
      label: { default: null, type: String },
      value: { default: null, type: String },
      isRequired: { default: false, type: Boolean },
      disabled: { default: false, type: Boolean }
    },

    data() {
      return {
        styleTypes: [{ key: 'line', value: "line" }, { key: 'point', value: "point" }],
        selectedValue: this.value || null,
        listLoaded: false,
      }
    },

    components: {
      BaseDropdown,
    },

    async mounted() {
      await this.reloadData();
    },

    methods: {
      onChange(value, description) {
        this.$emit('input', value, description);
      },

      async reloadData() {
        this.listLoaded = true;
        if (this.value && !this.selectedValue) this.selectedValue = this.value;
      },
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