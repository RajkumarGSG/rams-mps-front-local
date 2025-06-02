<!--
File: HomoSectionsList.vue
Description: show list of road sections entered in the DB.
-->
<template>
  <div>
    <md-card v-show="!showHomoSections && eligible">
      <md-card-header class="md-card-header-icon md-card-header-green">
        <div class="md-layout">
          <div class="md-layout-item md-small-size-100 md-size-15">
            <YearsDropdown v-model="selectedYear" :items="yearsInHSList()" />
          </div>
          <div class="md-layout-item btn-row md-small-size-100">
            <md-button v-if="isBtnAllowed('GenerateButton')" class="md-success" @click="toggleInputParams(true)">
              {{ $t('buttons.generate') }}
            </md-button>
          </div>
        </div>
      </md-card-header>

      <md-card-content>
        <md-progress-spinner v-if="showSpinner == true" :md-diameter="100" md-mode="indeterminate" />
        <md-table class="paginated-table table-striped table-hover" :value="queriedData" :md-sort.sync="currentSort"
          :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort">
          <md-table-empty-state :md-label="$t('label.no_data')"
            :md-description="$t('messages.select_another_criteria')" />
          <md-table-row slot="md-table-row" slot-scope="{item}">
            <md-table-cell :md-label="$t('label.from_year')" md-sort-by="input_year_from">
              {{ item.input_year_from }}
            </md-table-cell>
            <md-table-cell :md-label="$t('label.to_year')" md-sort-by="input_year_to">
              {{ item.input_year_to }}
            </md-table-cell>
            <md-table-cell :md-label="$t('stdCols.range')" md-sort-by="input_condition_index_threshold" md-numeric>
              {{ item.input_condition_index_threshold | numFormat(0) }}
            </md-table-cell>
            <md-table-cell :md-label="$t('label.min_hs_length')" md-sort-by="input_min_hs_length" md-numeric>
              {{ item.input_min_hs_length | numFormat(0) }}
            </md-table-cell>
            <md-table-cell :md-label="$t('road_network.section_count')" md-sort-by="hs_count" md-numeric>
              {{ item.hs_count | numFormat(0) }}
            </md-table-cell>
            <md-table-cell :md-label="$t('stdCols.created_at')" md-sort-by="generated_on">
              {{ item.generated_on | dateFormat(true) }}
            </md-table-cell>
            <md-table-cell :md-label="$t('users.user')" md-sort-by="generated_by_user_name">
              {{ item.generated_by_user_name }}
            </md-table-cell>
            <md-table-cell :md-label="$t('label.approved')" md-sort-by="approved_on">
              {{ item.approved_on | dateFormat }}
            </md-table-cell>
            <md-table-cell :md-label="$t('stdCols.actions')">
              <div class="cell-actions">
                <md-button v-if="btnShowAllowed && item.hs_count > 0" class="md-just-icon md-success md-simple"
                  :title="$t('buttons.details')" @click="showDetails(item.homogeneous_section_list_id)">
                  <md-icon>preview</md-icon>
                </md-button>

                <md-button v-if="isBtnAllowed('DeleteButton') && !item.approved_by_user_id"
                  class="md-just-icon md-danger md-simple" :title="$t('buttons.delete')"
                  @click.stop.prevent="deleteItem(item.homogeneous_section_list_id, item.year)">
                  <md-icon>delete</md-icon>
                </md-button>

                <md-button v-if="isBtnAllowed('ApproveRevokeButton') && item.hs_count > 0"
                  :class="['md-raised', 'md-sm', item.approved_by_user_id ? 'md-primary' : 'md-success']"
                  @click="toggleListApproval(item, !item.approved_by_user_id)">
                  {{ item.approved_by_user_id ? $t('buttons.revoke') : $t('buttons.approve') }}
                </md-button>
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
        <div class="md-layout-item md-small-size-100 md-size-15">
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
      <HomoSectionInputForm v-if="showInputParams" @input='generate' @close="toggleInputParams(false)" />
    </md-card>

    <HomoSections v-show="showHomoSections" :hsId="selectedHSId" @close="showHomoSections = false" />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { Pagination } from '@/components'
import { YearsDropdown } from '@/pages/Components'
import permissions from "@/mixins/permissionsMixin"
import listView from '@/mixins/listViewMixin'
import { savedMessage, approvedListExistsMessage, approvedMessage } from '@/mixins/messagesMixin'
import HomoSections from './HomoSections.vue'
import HomoSectionInputForm from './HomoSectionInputForm.vue'

export default {
  name: 'HomoSectionsList',
  mixins: [permissions, listView],

  data() {
    return {
      formName: 'HomoSectionsList',
      eligible: false,

      selectedYear: null,
      selectedHSId: null,
      showHomoSections: false,
      showInputParams: false,
      showSpinner: false,

      searchQuery: null,    // Needed for compatibility with listViewMixin
      pagination: {
        perPage: 10,
        currentPage: 1,
        perPageOptions: [10, 20, 50],
        total: 0
      },
      currentSort: 'generated_on',
      currentSortOrder: 'desc',
    }
  },

  components: {
    Pagination,
    YearsDropdown,
    HomoSections,
    HomoSectionInputForm
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      return
    };

    this.toggleSpinner(true)
    await this.resetList();
    await this.reloadData();
  },

  methods: {
    ...mapActions({
      resetList: 'CLEAR_HOMO_SECTION_LIST',
      loadList: 'LOAD_HOMO_SECTION_LIST',
      generateHS: 'ADD_NEW_HOMO_SECTION',
      approve: 'APPROVE_HOMO_SECTION_LIST',
      cancelApproval: 'CANCEL_HOMO_SECTION_LIST',
      delete: 'DELETE_HOMO_SECTION'
    }),

    toggleSpinner(state) {
      this.showSpinner = state;
      document.body.style.cursor = state ? 'progress' : 'auto';
    },

    toggleInputParams(state) {
      this.showInputParams = state;
    },

    async reloadData() {
      this.toggleSpinner(true);
      try {
        await this.loadList({});
      } finally {
        this.toggleSpinner(false);
      };
    },

    showDetails(id) {
      this.selectedHSId = id
      this.showHomoSections = true
    },

    async generate(params) {
      this.toggleInputParams(false);

      this.toggleSpinner(true);
      let errDesc = '';
      let res;
      try {
        res = await this.generateHS(params);
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error');
      } finally {
        this.toggleSpinner(false);
      };
      await savedMessage(errDesc, this.$t('tabs.homo_sections'), params.year_to.toString())  //'list')

      await this.reloadData();
      if (!errDesc) this.showDetails(res.homogeneous_section_list_id);
    },

    async toggleListApproval(item, status) {
      // Check wheter there is already approved list
      const approvedHSListExists = this.approvedYearsInHSList[item.year];
      if (status && approvedHSListExists) {
        await approvedListExistsMessage();
        return;
      };

      this.toggleSpinner(true);
      const action = status ? this.approve : this.cancelApproval;
      try {
        await action(item.homogeneous_section_list_id);
        await this.reloadData();
        await approvedMessage(status, item.year.toString());
      } finally {
        this.toggleSpinner(false);
      }
    },

    save_history() { }    // Needed for compatibility with listViewMixin
  },

  computed: {
    ...mapGetters(['yearsInHSList', 'hsListByYear', 'approvedYearsInHSList']),

    tableData() {
      return this.customSort(this.hsListByYear(this.selectedYear));
    },

    btnShowAllowed() {
      return this.isAllowed(HomoSections.name, 'Screen', 'Form');
    }
  },

  watch: {
  }
}
</script>
<style lang="scss" scoped>
.md-card {
  margin: 0px 0;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.cell-actions {
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  align-items: flex-end;

  .md-button {
    margin: 3px 0;
    min-width: 80px;
  }

  .md-just-icon {
    margin: 3px 0;
    min-width: 10px;

  }
}

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}
</style>