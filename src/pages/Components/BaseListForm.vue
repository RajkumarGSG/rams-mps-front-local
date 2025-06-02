<!--
File: BaseListForm.vue
Description: base component for showing screens with tables.
-->
<template>
  <md-card>
    <!-- Шапка карточки -->
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <slot name="header-filters"></slot>
        <div class="md-layout-item btn-row md-small-size-100">
          <md-button v-if="btnAddAllowed" class="md-success" @click="$emit('add-item')" :disabled="loading">
            {{ $t('buttons.add') }}
          </md-button>
        </div>
      </div>
    </md-card-header>

    <!-- Содержимое таблицы -->
    <md-card-content>
      <md-progress-spinner v-if="loading" :md-diameter="100" md-mode="indeterminate" />
      <slot name="table-rows"></slot>
    </md-card-content>

    <!-- Пагинация -->
    <md-card-actions md-alignment="space-between">
      <Pagination v-if="!noPagination" v-model="pagination" :total="total" :perPage="25" @pageChanged="pageChanged"/>
    </md-card-actions>
    <slot name="editing-dialog"></slot>
  </md-card>
</template>

<script>
  import Pagination from '@/pages/Components/Pagination.vue'
  //import BaseDataTable from '@/pages/Components/BaseDataTable.vue'

  export default {
    name: 'BaseListForm',

    props: {
      loading: { default: false, type: Boolean },
      btnAddAllowed: { default: false, type: Boolean },
      noPagination: { default: false, type: Boolean },
      total: { default: 0, type: Number },
    },

    components: {
      Pagination,
      //BaseDataTable
    },

    data() {
      return {
        pagination: {},
      }
    },

    methods: {
      pageChanged(newVal) {
        console.log('pageChanged', newVal)
        this.$emit('pageChanged', newVal)
      }
    },

    computed: {
    },

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

.base-data-table {
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  overflow: auto;
  position: relative;

  ::v-deep .md-table {
    width: 100%;

    .md-table-fixed-header {
      height: 100%;
    }

    .md-table-toolbar {
      padding: 16px;
    }

    .md-table-head {
      background-color: white;
    }

    .md-table-content {
      height: calc(100% - 120px);
      overflow-x: auto;

      tbody {
        width: 100%;
      }
    }
  }
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