<!--
File: EditFields.vue
Description: Component returning formatted editing fields.
-->
<template>
  <div class="md-layout">
    <div v-for="field in resolvedFields" :key="field.name" :class="field.class" style="display: flex; align-items: center;">
      <span v-if="field.prefix">{{ field.prefix }}-</span>

      <div v-if="field.type === 'hidden'" style="display: none;"></div>
      <md-field v-else-if="field.type !== 'custom'" :class="getClass(field.name)">
        <label v-if="!isSwitch(field.type) && field.label" :for="field.name">{{ $t(field.label) }}</label>
        <component 
          :id="field.name" 
          :is="componentMap[field.type] || 'md-input'" 
          :type="numberInput[field.type] || null"
          v-model="localValues[field.name]" 
          :data-vv-name="field.name" 
          v-validate="validations[field.name]"
          v-bind="field.resolvedProps">
        <span v-if="isSwitch(field.type)"> {{ $t(field.label) }} </span>
        </component>
      </md-field>

      <!-- If the field is custom -->
      <component v-else 
        :class="getClass(field.name)" 
        :label="$t(field.label)" 
        v-model="localValues[field.name]"
        :data-vv-name="field.name" 
        v-validate="validations[field.name]" 
        v-bind="field.resolvedProps"
        :is="field.component"
        @input="(val) => updateValue(field.name, val)" 
      />
    </div>
  </div>
</template>

<script>
import { BaseDropdown, RegionsDropdown, DepsDropdown, RoadClassesDropdown, RoadsDropdown, 
  SectionsDropdown,  UnitsDropdown, WorkCategoriesDropdown, RdbLookupDropdown, TreatmentsDropdown } from '@/pages/Components';

export default {
  name: 'edit-fields',

  data() {
    return {
      componentMap: {
        text: "md-input",
        textarea: "md-textarea",
        select: "md-select",
        switch: "md-switch"
      },

      numberInput: {
        number: "number"
      },

      resolvedFields: []
    };
  },

  props: {
    fields: Array,
    value: Object,
    validations: Object
  },

  components: {
    BaseDropdown,
    RegionsDropdown,
    DepsDropdown,
    RoadClassesDropdown,
    RoadsDropdown,
    SectionsDropdown,
    UnitsDropdown, 
    WorkCategoriesDropdown,
    RdbLookupDropdown,
    TreatmentsDropdown
  },

  methods: {
    updateValue(fieldName, value) {
      this.$set(this.localValues, fieldName, value);
    },

    async validateForm() {
      const isValid = await this.$validator.validateAll();
      return isValid;
    },

    isSwitch(type) {
      return this.componentMap[type] === 'md-switch';
    },

    getClass(componentName, layoutItemSize = undefined) {
      const layoutItemClass = layoutItemSize ? `md-layout-item md-size-${layoutItemSize}` : '';
      const errorClass = this.errors.has(componentName) ? 'md-error' : 'md-valid';
      return `${layoutItemClass} ${errorClass}`
    },

    buildProps(field) {
      const result = { ...field.props };
      console.log('props', result, this.localValues, this.value)
        const convertVal = ['DepsDropdown'].includes(field.component);
        console.log('convertVal', convertVal)

      for (const [key, val] of Object.entries(result)) {
        //await this.$nextTick();
        console.log('key, val', key, val, this.value[val], val in this.value, field.component)
          if (typeof val === 'string' && convertVal) {  //val in this.value){
            result[key] = this.value[val];
          }
      };
      console.log('result', result)
      return result;
    }
  },

  computed: {
    localValues: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.$emit("input", newValue);
      }
    },

    /* TODO: finish with updating fields
    resolvedFields() {
      return this.fields.map(field => ({
          ...f,
          resolvedProps: f.props != undefined ? this.buildProps(f) : undefined
        }));
      f.props != undefined ? this.buildProps(f) : undefined
      }
      */
  },

  watch: {
    fields: {
      handler(newFields) {
        this.resolvedFields = newFields.map(f => ({
          ...f,
          resolvedProps: f.props != undefined ? this.buildProps(f) : undefined
        }));
      },
      immediate: true,
      deep: true
    },
  }
};
</script>