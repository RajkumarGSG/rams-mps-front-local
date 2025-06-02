<!--
File: AmountsDropdown.vue
Description: show the dropdown combo with the amounts to select for showing.
-->
<template>
  <base-dropdown
    v-model="selectedValue"
    :label="label || $t('label.show_as')"
    :items="amountsList"
    :hiddenField="'shortName'"
    :isRequired="isRequired"
    :disabled="disabled"
    :dropdownId="'amountsDropdown'"
    @input="onChange"
  />
</template>

<script>
  import { mapState, mapActions } from 'vuex'
  import BaseDropdown from './BaseDropdown.vue'

  export default {
    name: 'amounts-dropdown',

    components: {
      BaseDropdown,
    },

    props: {
      label: { type: String, default: null },
      value: { type: Number, default: null },
      items: { type: Array, default: () => [] },
      isRequired: { type: Boolean, default: false },
      regionId: { type: Number, default: null },
      disabled: { type: Boolean, default: false }
    },

    data() {
      return {
        selectedValue: this.value || null,
      }
    },

    async mounted() {
      this.reloadData()
    },

    methods: {
      ...mapActions({
        getList: 'GET_AMOUNTS_DROPDOWN'
      }),

      async reloadData() {
        const res = await this.getList()
        if (res === 'success') {
          this.listLoaded = true;
          if (this.value && !this.selectedValue) this.selectedValue = this.value;
        }
      },

      onChange(value, description, shortName) {
        this.$emit('input', value, description, shortName)
      },
    },

    computed: {
      ...mapState({
        amounts: (state) => state.Dropdowns.amounts
      }),

      amountsList() {
        return this.amounts.map(item => ({
          id: item.id,
          description: this.$t(item.name),
          shortName: this.$t(item.shortName)
        }))
      }
    },

    watch: {
      value(newValue) {
        if (newValue !== this.selectedValue) {
          this.selectedValue = newValue;
        }
      },
    }
  }
</script>