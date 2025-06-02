<!--
File: BaseDropdown.vue
Description: base component for showing the dropdown combo to be inherited by other dropdowns.
-->
<template>
  <md-field>
    <label :for="dropdownId">{{ label }}</label>
    <md-select 
      v-model='selectedValue' 
      :id="dropdownId" 
      :disabled="disabled" 
      :required="isRequired"
      @md-selected='onChange' 
      :multiple="multiple"
    >
      <md-option v-for='(item, index) in items' :key='index' :value='item[valueField]'>
        <slot name="option" :item="item" :index="index">
          {{ item[displayField] }}
        </slot>
      </md-option>

      <slot name="no-options" v-if="Array.isArray(items) && items.length === 0">
        <span class="no-options">{{ $t('selections.empty_list') }}</span>
      </slot>

      <slot name="loading" v-if="!listLoaded">
        <span class="loading">{{ $t('selections.loading') }}</span>
      </slot>
    </md-select>
  </md-field>
</template>
<script>
export default {
  name: 'base-dropdown',

  props: {
    label: { default: null, type: String },
    value: { default: null, type: [String, Number, Array] },
    displayField: { default: "description", type: String },
    valueField: { default: "id", type: String },
    hiddenField: { default: "", type: String },
    isRequired: { default: false, type: Boolean },
    disabled: { default: false, type: Boolean },
    items: { default: () => [], type: Array },
    dropdownId: { default: 'dropdown', type: String },
    multiple: { default: false, type: Boolean },
  },

  data() {
    return {
      selectedValue: this.initializeSelectedValue(),
      listLoaded: false
    }
  },

  async mounted() {
    const res = await this.loadItems();
    if (res === 'success') {
      this.listLoaded = true;
      if (this.value && !this.selectedValue) this.selectedValue = this.value;
    };
  },

  methods: {
    initializeSelectedValue() {
      return this.multiple ? (this.value ?? []) : (this.value ?? null)
    },

    async loadItems() {
      try {
        return await Promise.resolve('success');
      } catch (error) {
        console.error('Error loading items:', error);
        return 'error';
      }
    },

    onChange() {
      const description = this.multiple
        ? this.getDescriptions
        : this.getDescription;

      const hiddenDescription = !this.hiddenField ? '' : this.hiddenItemsMap.get(this.selectedValue) || '';
      this.$emit('input', this.selectedValue, description, hiddenDescription);
    },
  },

  computed: {
    itemsMap() {
      return new Map(this.items.map(item => [item[this.valueField], item[this.displayField]]));
    },

    hiddenItemsMap() {
      return new Map(this.items.map(item => [item[this.valueField], item[this.hiddenField]]));
    },

    getDescription() {
      if (!this.selectedValue) return '';
      return this.itemsMap.get(this.selectedValue) || '';
    },

    getDescriptions() {
      if (!this.selectedValue || !Array.isArray(this.selectedValue)) return [];
      return this.selectedValue
        .map(value => this.itemsMap.get(value))
        .filter(Boolean);
    }
  },

  watch: {
    value(newValue) {
      if (newValue !== this.selectedValue) {
        this.selectedValue = newValue;
      }
    }
  }
}
</script>