<!--
File: MultilanguageEditForm.vue
Description: Part of the EditForm.vue used for adding/editing description field in several languages.
-->
<template>
  <div class="md-layout">
    <template v-for="field in fields">
      <div v-if="field.class" :class="field.class">
        <md-field :class="getClass(field.name)">
          <label>{{ $t(field.label) }}</label>
          <md-input v-model="localValues[field.name]" type="text" :data-vv-name="field.name" required
            v-validate="validations[field.name]" />
        </md-field>
      </div>
      <md-field v-else :class="getClass(field.name)">
        <label>{{ $t(field.label) }}</label>
        <md-input v-model="localValues[field.name]" type="text" :data-vv-name="field.name" required
          v-validate="validations[field.name]" />
      </md-field>
    </template>
  </div>
</template>
<script>
  import permissions from "@/mixins/permissionsMixin"

  export default {
    name: 'multi-language-edit',
    mixins: [permissions],

    inject: ["$validator"], // ВАЖНО! Это делает `$validator` доступным внутри компонента
    
    props: {
      fields: {
        type: Array,
        required: true
      },
      value: {
        type: Object,
        required: true
      },
      validations: {
        type: Object,
        default: () => ({})
      }
    },

    methods: {
      async validateForm() {
        const isValid = await this.$validator.validateAll();
        return isValid;
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
      }
    },
  };
</script>  