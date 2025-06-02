<!--
File: BaseDataTable.vue
Description: base component for showing screens with tables.
-->
<template>
  <md-card>
    <!-- Шапка карточки -->
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <slot name="header-filters"></slot>
        <div class="md-layout-item btn-row md-small-size-100">
          <slot name="header-buttons"></slot>
          <md-button v-if="btnAddAllowed" class="md-success" @click="$emit('add-item')" :disabled="loading">
            {{ $t('buttons.add') }}
          </md-button>
          <md-button v-if="showCloseBtn" class="md-accent" @click.stop.prevent="onClose">
            {{ $t('buttons.close') }}
          </md-button>
        </div>
      </div>
    </md-card-header>

    <!-- Содержимое таблицы -->
    <md-card-content>
      <md-progress-spinner v-if="loading" :md-diameter="100" md-mode="indeterminate" />
      <slot name="table-rows"></slot>
    </md-card-content>

    <slot name="screen-actions"></slot>

    <!-- Пагинация -->
    <md-card-actions v-if="showPagination" md-alignment="space-between">
      <div>
        <p class="card-category">
          {{ $t('label.showing_from_to_of_entries', { from: to > 0 ? from + 1 : 0, to, total }) }}
        </p>
      </div>
      <div class="md-layout-item md-small-size-100 md-size-20">
        <md-field>
          <label for="pages">{{ $t('label.per_page') }}</label>
          <md-select v-model="pagination.perPage" name="pages">
            <md-option v-for="item in pagination.perPageOptions" :key="item" :value="item">
              {{ item }}
            </md-option>
          </md-select>
        </md-field>
      </div>
      <pagination class="pagination-no-border pagination-success" v-model="pagination.currentPage"
        :per-page="pagination.perPage" :total="total" />
    </md-card-actions>
    <slot name="editing-dialog"></slot>
  </md-card>
</template>

<script>
import { Pagination } from '@/components'
import { onClose } from '@/mixins/onCloseMixin'

export default {
  name: 'BaseDataTable',

  props: {
    loading: { default: false, type: Boolean },
    btnAddAllowed: { default: false, type: Boolean },
    showCloseBtn: { default: false, type: Boolean },
    pagination: {
      default: () => ({
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25],
      }),
      type: Object,
    },
    from: { default: 0, type: Number },
    to: { default: 0, type: Number },
    total: { default: 0, type: Number },
    showPagination: { default: true, type: Boolean },
  },

  components: {
    Pagination
  },

  methods: {
    onClose,
  },

  computed: {
  }
}
</script>

<style lang="scss" scoped>
.md-card {
  margin: 0px 0;
}

.md-card .md-card-actions {
  border: 0;
  margin-left: 20px;
  margin-right: 20px;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}
</style>