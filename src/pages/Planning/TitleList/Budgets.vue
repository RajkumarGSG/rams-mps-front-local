<!--
File: Budgets.vue
Description: show list of budgets entered in the DB.
-->
<template>
  <div>
    <md-card v-show="!showTreatmentsForm">
      <md-card-header class="md-card-header-icon md-card-header-green">
        <div class="md-layout" style="align-items: center; justify-content: flex-start; width: auto;">
          <div class="md-layout-item md-small-size-20 md-size-10">
            <YearsDropdown v-model="selectedWorklist" :items="yearsInWorkList" />
          </div>
          <div class="md-layout-item md-small-size-100 md-size-20">
            <RegionsDropdown v-model="selectedRegion" />
          </div>
          <div class="md-layout-item md-small-size-100 md-size-15">
            <BaseDropdown :label="$t('label.category')" v-model="selectedCategory" :items="categoriesList"
              :displayField="'description'" :valueField="'id'" />
          </div>
          <div v-show="total > 0" class="md-layout-item md-small-size-100 md-size-15">
            <AmountsDropdown v-model="showAmounts" @input="onAmountChange" />
          </div>

          <div class="md-layout-item btn-row md-small-size-50">
            <div v-if="approvedBudget">
              <span style="color: red;">{{ $t('label.approved') }}</span>
            </div>

            <div v-else>
              <md-button v-if="step === 'first' && isBtnAllowed('AddButton')" class="md-raised md-success"
                @click="editBudget(null)">
                {{ $t('buttons.add') }}
              </md-button>

              <template v-if="step === 'second' && total > 0">
                <md-button v-if="isBtnAllowed('PopulateButton')" class="md-success" @click="populate">
                  {{ $t('buttons.populate') }}
                </md-button>
                <md-button v-if="isBtnAllowed('ShowAllWorksButton')" class="md-success" @click="showAllTreatments()">
                  {{ $t('buttons.show_works') }}
                </md-button>
              </template>
            </div>
          </div>
        </div>
      </md-card-header>

      <md-card-content>
        <md-progress-spinner v-show="showSpinner" :md-diameter="100" :md-stroke="10" md-mode="indeterminate" />
        <md-table class='"paginated-table table-striped table-hover' :value="budgetList" md-fixed-header>
          <md-table-empty-state :md-label="$t('label.no_data')"
            :md-description="$t('messages.select_another_criteria')" />
          <md-table-row slot="md-table-row" slot-scope="{item}">
            <md-table-cell :md-label="$t('label.category')" md-sort-by="work_category">
              {{ item.work_category }}
            </md-table-cell>
            <md-table-cell :md-label="amountLabel" md-sort-by="amount_kgs" md-numeric>
              {{ item.amount_kgs / showAmounts | numFormat }}
            </md-table-cell>
            <md-table-cell v-if="step === 'second' || step === 'third'" :md-label="$t('budget.works_count')"
              md-sort-by="treatment_count" md-numeric>
              {{ item.treatment_count }}
            </md-table-cell>
            <md-table-cell v-if="step === 'third'" :md-label="$t('label.approved')" md-sort-by="approved_on">
              {{ item.approved_on | dateFormat }}
            </md-table-cell>

            <md-table-cell :md-label="$t('stdCols.actions')">
              <div class="cell-actions">
                <md-button v-for="(button, index) in buttonConfigs(item)" v-if="button.condition" :key="index"
                  :class="button.class" :title="button.title" @click.native="button.action(item)">
                  {{ !button.icon ? button.title : "" }}
                  <md-icon v-if="button.icon">{{ button.icon }}</md-icon>
                </md-button>
              </div>
            </md-table-cell>
          </md-table-row>
        </md-table>
        <div class="footer-table md-table">
          <table>
            <tfoot>
              <tr>
                <th v-for="item in footerTable" :key="item" class="md-table-head">
                  <div class="md-table-head-container md-ripple md-disabled">
                    <div class="md-table-head-label">{{ item }}</div>
                  </div>
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </md-card-content>
      <EditForm v-if="showEditForm" :budget="selectedBudget" @close="toggleEditForm(false)" @saved="onBudgetSave" />
    </md-card>

    <div v-show="showTreatmentsForm" :style="{ width: '100%', height: '100%' }">
      <AllTreatments :params="treatmentsFormParams" :budget="selectedBudget" @close="toggleTreatmentsForm(false)" />
    </div>
  </div>
</template>
<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { RegionsDropdown, BaseDropdown, YearsDropdown, AmountsDropdown } from '@/pages/Components'
  import { numFormat } from "@/store/helpers/format_helpers"
  import { customSortMixin } from '@/mixins/customSortMixin'
  import permissions from "@/mixins/permissionsMixin"
  import messages from '@/mixins/messagesMixin'
  import EditForm from './BudgetEditForm.vue'
  import AllTreatments from './AllTreatments'

  export default {
    name: 'Budgets',
    mixins: [permissions, customSortMixin, messages],

    data() {
      return {
        formName: 'Budgets',
        eligible: false,

        showSpinner: true,
        selectedWorklist: null,
        selectedRegion: null,
        selectedCategory: null,
        treatmentsFormParams: {},
        showEditForm: false,
        showTreatmentsForm: false,

        selectedBudget: null,
        showAmounts: 1000,
        amountLabel: '',

        currentSort: 'work_category',
        currentSortOrder: 'asc',
      }
    },

    props: {
      step: { default: 'first', type: String },
    },

    components: {
      RegionsDropdown,
      YearsDropdown,
      AmountsDropdown,
      BaseDropdown,
      EditForm,
      AllTreatments
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };

      this.toggleSpinner(true)
      this.onAmountChange(this.showAmounts, this.$t("label.short_thousands"))
      this.reset_treatments()
      this.get_work_categories_list()
      this.reloadBudgetList()
    },

    methods: {
      ...mapActions({
        get_work_categories_list: 'GET_WORK_CATEGORIES_LIST',
        load_budget_list: 'Planning/LOAD_BUDGET_LIST',
        approve_budget: 'Planning/APPROVE_BUDGET',
        revoke_budget: 'Planning/CANCEL_BUDGET_APPROVAL',
        clear_all_assignments: 'CLEAR_ALL_ASSIGNMENTS',
        reset_treatments: 'RESET_TREATMENTS',
        populate_treatments: 'POPULATE_TREATMENTS',
      }),

      async reloadBudgetList() {
        this.toggleSpinner(true)
        try {
          await this.load_budget_list({})
        } finally {
          this.toggleSpinner(false)
        }
      },

      toggleSpinner(state) {
        this.showSpinner = state
      },

      toggleEditForm(state) {
        this.showEditForm = state
      },

      toggleTreatmentsForm(state) {
        this.showTreatmentsForm = state
        this.toggleSpinner(false)
        if (!state) this.reloadBudgetList()
      },

      onAmountChange(value, desc) {
        this.amountLabel = `${this.$t('budget.amount')} ${desc}`
      },

      editBudget(item) {
        // check whether we are adding new or editing existing item
        this.selectedBudget = !item ? { // New item
          year: this.selectedYear,
          fk_region: this.selectedRegion,
          fk_work_category: this.selectedCategory,
        } : item
        this.toggleEditForm(true)
      },

      onBudgetSave() {
        this.toggleEditForm(false)
        this.reloadBudgetList()
      },

      showTreatments(params) {
        this.treatmentsFormParams = params
        this.toggleTreatmentsForm(true)
        //this.showTreatmentsForm = true
      },

      showAllTreatments() {
        this.selectedBudget = null
        this.showTreatments({ mode: 'all', work_list_id: this.selectedWorklist, region: this.selectedRegion, year: this.selectedYear })
      },

      showAssignedTreatments(item) {
        this.selectedBudget = item
        this.showTreatments({ mode: 'current', work_list_id: this.selectedWorklist, region: this.selectedRegion, year: this.selectedYear })
      },

      async populate() {
        let params = {
          work_list_id: this.selectedWorklist,
          region_id: this.selectedRegion,
          year: this.selectedYear
        }

        if (this.summaryInfo.totalTreatments > 0) {
          let message = this.$t('messages.assigned_treatments_exist')
          if (this.summaryInfo.totalApproved) message += `<br><br>(${this.$t('messages.approved_budgets_exist')})`
          const confirm = await this.confirmation(this.$t('messages.assigned_treatments_exist_title'), message, true)

          if (confirm.isDismissed) {  // User selected Cancel
            return
          } else if (confirm.isConfirmed) { // User selected to delete all assigned and re-fill
            this.toggleSpinner(true)
            await this.clear_all_assignments(params)
          }
        }

        this.toggleSpinner(true)
        let res
        try {
          await this.populate_treatments(params)
        } finally {
          this.toggleSpinner(false)
        }
        this.successMessage(this.$t('messages.populated'), `${res} ${this.$t('messages.entries_added')}`)
        await this.reloadBudgetList()
        if (res > 0) {
          params['mode'] = 'assigned'
          this.selectedBudget = null
          this.showTreatments(params)
        }
      },

      async toggleBudgetApproval(item) {
        this.toggleSpinner(true)
        //let count = 0
        //let errCount = 0
        let errDesc = ''
        const approveOrRevoke = !item.approved ? this.approve_budget : this.revoke_budget

        //this.budgetList.forEach(budget => {
        await approveOrRevoke(item.budget_id).then(
          () => { /*count++*/ },
          (err) => { errDesc = err.message || this.$t('errors.unknown_error') /*errCount++ */ }
        )
        //})

        if (!errDesc) {
          this.approvedMessage(!item.approved, item.work_category)
        } else {
          this.errorMessage(errDesc)
        }
        this.reloadBudgetList()
      },

      buttonConfigs(item) {
        return [
          {
            condition: this.step === 'first' && !item.approved && this.isBtnAllowed('EditButton'),
            title: this.$t('buttons.edit'),
            class: 'md-just-icon md-default md-simple',
            icon: 'edit',
            action: () => this.editBudget(item)
          },
          /*{
            condition: this.step === 'first' && !item.approved && this.isBtnAllowed('DeleteButton'),
            title: this.$t('buttons.delete'),
            class: 'md-just-icon md-danger md-simple',
            icon: 'delete',
            action: () => this.handleDelete(item)
          },*/
          {
            condition: this.step === 'second' && item.treatment_count > 0 && this.isBtnAllowed('ShowWorksButton'),
            title: this.$t('buttons.show_works'),
            class: 'md-just-icon md-success md-simple',
            icon: 'preview',
            action: () => this.showAssignedTreatments(item)
          },
          {
            condition: this.step === 'third' && (item.treatment_count > 0 || item.approved) && this.isBtnAllowed('ApproveRevokeButton'),
            title: item.approved ? this.$t('buttons.revoke') : this.$t('buttons.approve'),
            class: ['md-raised', 'md-sm', item.approved ? 'md-primary' : 'md-success'],
            action: () => this.toggleBudgetApproval(item)
          },
        ];
      },
    },

    computed: {
      ...mapState({
        //me: (state) => state.Login.me,
        //savedWorksList: (state) => state.TitleList.worksLists,
        //treatmentsList: (state) => state.TitleList.treatmentsList,
      }),

      ...mapGetters('Planning', ['budgetsByCategory', 'budgetSummary', 'categoriesInBudget']),
      ...mapGetters(['yearsInWorkList']),

      selectedYear() {
        return this.yearsInWorkList.find(el => el.id == this.selectedWorklist)?.description || ''
      },

      budgetList() {
        return this.budgetsByCategory(this.selectedRegion, this.selectedYear, this.selectedCategory)
      },

      total() {
        return this.budgetList.length
      },

      categoriesList() {
        return this.categoriesInBudget(this.selectedRegion, this.selectedYear)
      },

      summaryInfo() {
        return this.budgetSummary(this.selectedRegion, this.selectedYear)
      },

      approvedBudget() {
        return this.summaryInfo.approved
      },

      footerTable() {
        const footer = [
          this.$t('label.total'),
          `${this.$t('label.categories')}: ${numFormat(this.summaryInfo.totalRecords, 0)}`,
          `${this.$t('budget.amount')}: ${numFormat(this.summaryInfo.totalKGS / this.showAmounts)}`
        ]

        // Add elements depending on `this.step`
        if (['second', 'third'].includes(this.step)) {
          footer.splice(2, 0, `${this.$t('budget.works_count')}: ${numFormat(this.summaryInfo.totalTreatments, 0)}`);
        }
        if (this.step === 'third') {
          footer.push(`${this.$t('label.approved')}: ${numFormat(this.summaryInfo.totalApproved / this.showAmounts)}`);
        }
        return footer;
      },
    },

    watch: {
    }
  }
</script>
<style lang="scss">
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
  align-items: flex-end;

  .md-button {
    margin: 3px 0;
    min-width: 100px;
  }
}

.assigned-treatments-form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}
</style>