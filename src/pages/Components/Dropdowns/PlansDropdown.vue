<!--
File: PlansDropdown.vue
Description: show the dropdown combo with the plans list.
-->
<template>
  <base-dropdown
    v-model="selectedValue"
    :label="label || $t('label.plans')"
    :items="plansList"
    :disabled="disabled"
    :dropdownId="'plansDropdown'"
    @input="onChange"
  />
</template>
<script>
  import { mapState, mapActions } from 'vuex'
  import BaseDropdown from './BaseDropdown.vue'

  export default {
    name: 'plans-dropdown',

    props: {
      label: { default: null, type: String },
      value: { default: null, type: Number },
      addEmptyLine: { default: false, type: Boolean },
      showApproved: { default: undefined, type: Boolean },
      regionId: { default: null, type: Number },
      year: { default: null, type: Number },
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
        getList: 'GET_PLANS_DROPDOWN'
      }),

      onChange(value, description) {
        this.$emit('input', value, description);
      },

      async reloadData() {
        this.listLoaded = false
        this.selectedValue = null
        const params = {
          region_id: this.regionId,
          year: this.year
        }
        const res = await this.getList(params)
        if (res === 'success') {
          this.listLoaded = true;
          if (this.value && !this.selectedValue) this.selectedValue = this.value;
        }
      },
    },

    computed: {
      ...mapState({
        plansList: (state) => state.Dropdowns.plans
      })
    },

    watch: {
      regionId(value) {
        this.reloadData()
      },

      year(value) {
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
