<!--
File: SearchInput.vue
Description: reusable component for searching.
-->
<template>
  <md-field>
    <md-input 
      type="search" 
      class="mb-3" 
      clearable 
      style="width: 200px" 
      :placeholder="$t('label.search_records')"
      :value="value"
      @input="$emit('input', $event)"
    />
  </md-field>
</template>

<script>
export default {
  name: 'SearchInput',
  props: {
    value: String
  }
}
</script>