<!--
File: RoadsDropdown.vue
Description: show the dropdown combo with the roads list.
-->
<template>
  <base-dropdown
    v-model="selectedValue"
    :label="label || $t('selections.select_road')"
    :items="roadsList"
    :isRequired="isRequired"
    :disabled="disabled || isLoading"
    :loading="isLoading"
    :dropdownId="'roadsDropdown'"
    @input="onChange"
  />
</template>

<script>
  import { mapState, mapActions } from 'vuex'
  import BaseDropdown from './BaseDropdown.vue'

  export default {
    name: 'roads-dropdown',

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
        listLoaded: false,
        isLoading: false
      }
    },

    methods: {
      ...mapActions({
        getList: 'GET_ROADS_DROPDOWN'
      }),

      onChange(value, description) {
        this.$emit('input', value, description)
      },

      async reloadData(regionId) {
        this.selectedValue = null
        if (!this.itemsProvided && regionId) {
          try {
            this.isLoading = true
            const res = await this.getList(regionId)
            if (res === 'success') {
              this.listLoaded = true
              if (this.value && !this.selectedValue) {
                this.selectedValue = this.value
              }
            }
          } catch (error) {
            this.$emit('error', error)
          } finally {
            this.isLoading = false
          }
        } else {
          this.listLoaded = true
       }
      }
    },

    computed: {
      ...mapState({
        roads: state => state.Dropdowns.roads
      }),

      itemsProvided() {
        return this.items.length > 0
      },

      roadsList() {
        return this.itemsProvided ? this.items : this.roads
      }
    },

    watch: {
      async regionId(newValue) {
        this.listLoaded = false
        await this.reloadData(newValue)
      },

      value(newValue) {
        if (newValue !== this.selectedValue) {
          this.selectedValue = newValue;
        }
      }
    }
  }
</script>