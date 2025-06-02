<!--
File: ConditionIndexCriteria.vue
Description: show list/pivot of Condition Index Criteria.
-->
<template>
  <md-card v-if="eligible">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-20">
          <BaseDropdown :label="$t('selections.select_indicator')" v-model="selectedFilter" :items="dropDownList" />
        </div>
        <div class="md-layout-item btn-row md-small-size-100">
          <md-button v-if="isBtnAllowed('AddButton')" class="md-success" @click="viewItem()">
            {{ $t('buttons.add') }}
          </md-button>
        </div>
      </div>
    </md-card-header>

    <md-card-content>
      <md-progress-spinner v-if="showSpinner == true" :md-diameter="70" md-mode="indeterminate" />
      <md-table class="paginated-table table-striped table-hover" :value="queriedData" :md-sort.sync="currentSort"
        md-fixed-header :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort">
        <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.search_again')" />
        <md-table-row slot="md-table-row" slot-scope="{item}"
          :class="{ blinking: item.indicator_type === highlightedRow }"
          :id="item.indicator_type === highlightedRow ? 'highlightedRow' : null">
          <md-table-cell :md-label="$t('label.indicator_type')" md-sort-by="indicator_type">
            {{ $t(`condition.${item.indicator_type}`) }}
          </md-table-cell>
          <md-table-cell v-for="score in getScores" :key="score.val" :md-label="$t(`criteria.score_${score.val}`)">
            <div class="md-layout">
              <div class="md-layout-item md-size-50 md-table-cell">
                {{ item[`score_${score.val}`] }}
              </div>
              <div v-if="item[`score_${score.val}_id`]" class="md-layout-item md-size-30 btn-row">
                <md-button v-if="isBtnAllowed('EditButton')" :title="$t('buttons.edit')"
                  class="md-just-icon md-default md-simple" @click.native="viewItem(item[`score_${score.val}_id`])">
                  <md-icon>edit</md-icon>
                </md-button>
                <md-button v-if="isBtnAllowed('DeleteButton')" class="md-just-icon md-danger md-simple"
                  @click.stop.prevent="deleteItem(item[`score_${score.val}_id`],
                    $t(`condition.${item.indicator_type}`) + '-' + $t(`criteria.score_${score.val}`))">
                  <md-icon>delete</md-icon>
                </md-button>
              </div>
            </div>
          </md-table-cell>
        </md-table-row>
      </md-table>
    </md-card-content>

    <md-card-actions md-alignment="space-between">
      <div class>
        <p class="card-category">
          {{ $t('label.showing_from_to_of_entries', { from: to > 0 ? from + 1 : 0, to: to, total }) }}
        </p>
      </div>
      <div class="md-layout-item md-small-size-100 md-size-20">
        <md-field>
          <label for="pages">{{ $t('label.per_page') }}</label>
          <md-select v-model="pagination.perPage" name="pages">
            <md-option v-for="item in pagination.perPageOptions" :key="item" :label="item" :value="item">
              {{ item }}
            </md-option>
          </md-select>
        </md-field>
      </div>
      <pagination class="pagination-no-border pagination-success" v-model="pagination.currentPage"
        :per-page="pagination.perPage" :total="total"></pagination>
    </md-card-actions>
    <EditForm v-if="showDetailsDlg" :itemId="selectedItem" @close="showDetailsDlg = false" />
  </md-card>
</template>
<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { Pagination } from '@/components'
  import { BaseDropdown } from '@/pages/Components'
  import permissions from "@/mixins/permissionsMixin"
  import listView from '@/mixins/listViewMixin'
  import EditForm from './ConditionIndexCriteriaSingle.vue'

  export default {
    name: 'condition-index-criteria-list',
    mixins: [permissions, listView],

    data() {
      return {
        formName: 'ConditionIndexCriteria',
        eligible: false,
        showSpinner: false,
        showDetailsDlg: false,

        selectedFilter: null,
        selectedItem: null,
        pagination: {
          perPage: 20,
          currentPage: 1,
          perPageOptions: [10, 20, 50, 100],
          total: 0
        },
        searchQuery: '',
        fuseSearch: null,
        currentSort: 'indicator_type',
        currentSortOrder: 'asc',
      }
    },
    components: {
      Pagination,
      BaseDropdown,
      EditForm
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };

      this.toggleSpinner(true)
      const history = await this.loadHistory()
      if (history.form === 'condition_index' && history.use) {
        this.selectedFilter = history.selectedFilter
        this.currentSort = history.data.currentSort
        this.currentSortOrder = history.data.currentSortOrder
        this.pagination.perPage = history.data.perPage
        this.$nextTick(() => {
          //this.searchQuery = history.data.searchQuery
          this.pagination.currentPage = history.data.currentPage
        })
        this.clearHistory()
      }
      await this.reloadData()
    },

    methods: {
      ...mapActions({
        loadConditionIndices: 'ReferenceData/LOAD_CONDITION_INDEX_CRITERIA_PIVOT',
        delete: 'ReferenceData/DELETE_CONDITION_INDEX_CRITERIA',
      }),

      toggleSpinner(state) {
        this.showSpinner = state
      },

      async reloadData() {
        this.toggleSpinner(true)
        await this.loadConditionIndices()
        this.toggleSpinner(false)
      },

      viewItem(id) {
        this.selectedItem = id
        this.showDetailsDlg = true
      },

      save_history() {
        const hist = {
          form: 'condition_index',
          data: {
            selectedFilter: this.selectedFilter,
            //searchQuery: this.searchQuery,
            currentSort: this.currentSort,
            currentSortOrder: this.currentSortOrder,
            perPage: this.pagination.perPage,
            currentPage: this.pagination.currentPage
          }
        }
        this.saveHistory(hist)
      },
    },

    computed: {
      ...mapState({
        highlightedRow: (state) => state.History.row
      }),
      ...mapGetters('ReferenceData', ['getDropDownList', 'getScores', 'criteriaListFiltered']),

      dropDownList() {
        return this.getDropDownList.map(item => ({ ...item, description: this.$t(item.description) }))
      },

      tableData() {
        return this.criteriaListFiltered(this.selectedFilter)
      }
    },

    watch: {
      async highlightedRow(newVal) {
        if (newVal) {
          await this.reloadData();
          // calculate - which page edited item belongs to
          const ind = this.searchedData.findIndex(item => item.indicator_type === newVal)
          this.pagination.currentPage = Math.ceil(ind / this.pagination.perPage) || 1
          this.scrollToHighlightedRow();
          this.clearHistory();
        }
      },
    }
  }
</script>
<style lang="scss" scoped>
.md-table-head-label {
  padding-right: 0;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.md-card {
  margin: 0px 0;
}

.md-card .md-card-actions {
  border: 0;
  margin-left: 20px;
  margin-right: 20px;
}

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}

.blinking {
  animation: blink-animation 1s linear infinite;
}

@keyframes blink-animation {
  50% {
    background-color: pink;
  }
}
</style>