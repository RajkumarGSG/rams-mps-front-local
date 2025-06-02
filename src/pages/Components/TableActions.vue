<!--
File: TableActions.vue
Description: reusable component for showing Edit and Delete buttons in tables.
-->
<template>
  <div class="cell-actions">
    <md-button
      v-if="btnExtraAllowed"
      :class="extraButtonClass" 
      :title="extraButtonLabel"
      :style="extraButtonStyle"
      @click="$emit('extraButtonClicked')">
      
      <md-icon v-if="btnExtraAsIcon">{{ extraButtonIcon }}</md-icon>
      <template v-else>{{ extraButtonLabel }}</template>
    </md-button>

    <md-button
      v-if="btnEditAllowed" 
      class="md-just-icon md-default md-simple" 
      :title="$t('buttons.edit')"
      @click="$emit('edit')">
      <md-icon>edit</md-icon>
    </md-button>
    
    <md-button
      v-if="btnDeleteAllowed" 
      class="md-just-icon md-danger md-simple" 
      :title="$t('buttons.delete')"
      @click="$emit('delete')">
      <md-icon>delete</md-icon>
    </md-button>
  </div>
</template>

<script>
export default {
  name: 'TableActions',

  props: {
    btnEditAllowed: Boolean,
    btnDeleteAllowed: Boolean,

    btnExtraAllowed: Boolean,
    btnExtraAsIcon: Boolean,
    extraButtonIcon: { type: String, default: null },
    extraButtonClass: { type: [String, Array], default: null },
    extraButtonLabel: { type: String, default: null },
    extraButtonStyle: { type: String, default: null },
  }
}
</script>
<style lang="scss">
.cell-actions {
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  //align-items: flex-end;
  align-items: baseline;
}

.md-button {
  margin: 3px 0;
  min-width: 100px;
}
</style>