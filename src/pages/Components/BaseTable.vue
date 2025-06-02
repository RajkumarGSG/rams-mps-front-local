<!--
File: BaseTable.vue
Description: base component for showing tables.
-->
<template>
  <div>
    <md-progress-spinner v-if="loading" :md-diameter="100" md-mode="indeterminate" />

    <md-table
      class="paginated-table table-striped table-hover"
      :value="items"
      :md-selected-value.sync="localValue"
      :md-sort.sync="currentSort"
      :md-sort-order.sync="currentSortOrder"
      :md-sort-fn="customSort"
      md-fixed-header>
      
      <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.select_another_criteria')" />

      <md-table-row
        slot="md-table-row"
        slot-scope="{item}"
        :class="{ blinking: item[idFieldName] === highlightedRow }"
        :id="item[idFieldName] === highlightedRow ? 'highlightedRow' : null"
        v-bind="isSelectable ? { 'md-selectable': 'multiple', } : {}"
        md-auto-select>

        <md-table-cell
          v-for="column in headers"
          :key="column.key"
          :md-label="$t(column.header)"
          :md-sort-by="column.sortable ? column.key : null"
          :md-numeric="column.num">

          <template v-if="!column.condition || (column.condition && column.condition(item))">
            <template v-if="(column.clickCondition && column.clickCondition(item)) || (!column.clickCondition && column.onClick)">
              <a href='' @click.stop.prevent="column.onClick ? column.onClick(column.clickField ? item[column.clickField] : item) : null"> {{ item[column.key] }} </a>
            </template>

            <template v-else>
              <span v-if="column.num">{{ item[column.key] | numFormat(column.digits) }}</span>
              <span v-else-if="column.date">{{ item[column.key] | dateFormat }}</span>
              <span v-else>{{ item[column.key] }}</span>
            </template>
          </template>
        </md-table-cell>

        <md-table-cell v-if="showActions" :md-label="$t('stdCols.actions')">
          <slot name="table-actions" :item="item"></slot>
        </md-table-cell>

        <md-table-cell v-if="headers.length <= 1" :md-label="''" />
      </md-table-row>
    </md-table>
    <slot name="table-footer"></slot>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { customSortMixin } from '@/mixins/customSortMixin';

export default {
  name: 'base-table',
  mixins: [customSortMixin],

  props: {
    label: { default: '', type: String },
    value: { default: () => [], type: Array },
    disabled: { default: false, type: Boolean },
    loading: { default: false, type: Boolean },
    isSelectable: { default: false, type: Boolean },
    items: { default: () => [], type: Array },
    headers: { default: () => [], type: Array },
    showActions: { default: true, type: Boolean },
    idFieldName: { default: '', type: String },
    sort: { default: '', type: String },
    sortOrder: { default: 'asc', type: String },
  },

  data() {
    return {
      currentSort: this.sort,
      currentSortOrder: this.sortOrder,
    }
  },

  computed: {
    ...mapState({
      highlightedRow: (state) => state.History.row
    }),

    localValue: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit("input", newVal); // Emit event for v-model
      },
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/mixins/BaseTable.scss';

.paginated-table table>tbody>tr>td {
  padding: 5px !important;
  outline: 0;
  max-width: 150px;
  width: auto;
  border-right: 0;
  border-bottom: 0;
}

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 25%;
  z-index: 20;
}
</style>