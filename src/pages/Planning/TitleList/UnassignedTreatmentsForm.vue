<!--
File: UnassignedTreatmentsForm.vue
Description: show list of treatments with the assigned budget.
-->
<template>
  <md-dialog :md-active.sync="showDialog" :md-click-outside-to-close="false" class="fixed-dialog">
    <md-dialog-title>{{ $t('label.assigned_treatments') }}
      <md-button class='md-simple md-just-icon md-round modal-default-button' @click='onModalClose'>
        <md-icon>clear</md-icon>
      </md-button>
    </md-dialog-title>

    <md-dialog-content>
      <md-table class="paginated-table table-striped table-hover" :value="tableData" md-fixed-header
        :md-selected-value.sync='selectedItems'>
        <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.nothing_to_select')" />
        <md-table-row slot="md-table-row" slot-scope="{item}" md-selectable="multiple" md-auto-select
          :md-disabled="(availableForSelection < 0) && !selectedItems.includes(item)">
          <md-table-cell :md-label="$t('stdCols.name')" style="width: 250px;">
            {{ item.section_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('treatment.treatment_description')" style="width: 250px;">
            {{ item.treatment_type_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('stdCols.cost')" style="width: 50px;" md-numeric>
            {{ item.cost / showAmounts | numFormat }}
          </md-table-cell>
        </md-table-row>
      </md-table>
    </md-dialog-content>

    <md-dialog-actions>
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-40">
          <span>
            {{ $t('budget.limit') }} {{ budgetLimit | numFormat }} <br>
            {{ $t('selections.selected') }}: {{ totalSelected | numFormat }} <br>
            {{ $t('selections.maybeselected') }} {{ availableForSelection | numFormat }}
          </span>
        </div>
        <div class="md-layout-item md-small-size-100 md-size-30">
          <span>
            {{ $t('budget.works_count') }}: {{ totalRecords | numFormat(0) }}<br>
            {{ $t('budget.total_cost') }}: {{ totalSum | numFormat }}
          </span>
        </div>
        <div class="md-layout-item btn-row md-small-size-100 md-size-15">
          <md-button class="md-raised md-danger" @click="assignSelected" :disabled="saveBtnDisabled">
            {{ $t('buttons.add') }}
          </md-button>
        </div>
        <div class="md-layout-item btn-row  md-small-size-100 md-size-15">
          <md-button class="md-success" @click.stop.prevent="onModalClose">
            {{ $t('buttons.close') }}
          </md-button>
        </div>
      </div>
    </md-dialog-actions>
  </md-dialog>
</template>
<script>
  import { onModalClose } from '@/mixins/onCloseMixin'
  import messagesMixin from '@/mixins/messagesMixin'

  export default {
    name: 'assigned-treatments-form',
    mixins: [messagesMixin],

    data() {
      return {
        selectedItems: [],
        unassignedList: [],
        showAmounts: 1000,
      }
    },

    props: {
      workList: { default: 0, type: Number },
      region: { default: null, type: Number },
      budget: { default: {}, type: Object },
      budget_assigned: { default: 0, type: Number },
      showDialog: false
    },

    components: {
    },

    mounted() {
      console.log('props', this.budget, this.workList, this.region, this.budget_assigned)
      this.loadUnassignedTreatments()
    },

    methods: {
      onModalClose,

      async loadUnassignedTreatments() {
        if (!this.budget || !this.workList) {
          return
        }
        const params = {
          work_list_id: this.workList,
          region_id: this.region,
          is_plan_assigned: 1,
          is_budget_assigned: 0,
          //      is_approved: 0,
          asList: true
        }
        this.unassignedList = await this.$store.dispatch('LOAD_ALL_WORKS', params)
        console.log(this.tableData)
      },

      async assignSelected() {
        const count = this.selectedItems.length
        if (count == 0) return;

        this.showSpinner = true
        const payload = {
          data: [{
            treatment_id: this.selectedItems.map((work) => work.treatment_id),
            budget_id: this.budget.budget_id
          }]
        }
        this.selectedItems = []
        //console.log('assignSelected', payload)
        try {
          await this.$store.dispatch('ASSIGN_BUDGET', payload)
        } catch (error) {
          console.error('Error while assigning treatments:', error)
        }
        this.showSpinner = false
        this.assignedMessage(1, count)  // 1 - to show that the works were assigned
        this.loadUnassignedTreatments()
      }
    },

    computed: {
      /*    ...mapState({
          }),
          ...mapGetters([]),
    */
      tableData() {
        return this.unassignedList.filter(el =>
          el.fk_work_category === this.budget.fk_work_category //&&
          //el.cost <= this.budgetLimit
        )
      },

      totalRecords() {
        return this.tableData.length
      },

      totalSum() {
        return this.tableData.reduce((sum, work) => sum + work.cost, 0) / this.showAmounts
      },

      budgetLimit() {
        const res = this.budget.amount_kgs - this.budget_assigned
        //console.log('budgetLimit', res)
        return res / this.showAmounts
      },

      totalSelected() {
        //console.log('selectedItems', this.selectedItems)
        if (this.selectedItems.length == 0) return 0
        return this.selectedItems.reduce((sum, work) => sum + work.cost, 0) / this.showAmounts
      },

      availableForSelection() {
        return this.budgetLimit - this.totalSelected
      },

      saveBtnDisabled() {
        return (this.selectedItems.length == 0) || (this.availableForSelection < 0)
      }
    },

    watch: {
    }
  }
</script>
<style lang="scss" scoped>
.md-table-cell-container {
  padding: 10px 10px 10px 0px !important;
}

.paginated-table table>tbody>tr>td .paginated-table table>tbody>tr>th {
  padding: 10px 10px 10px 0px !important;
  max-width: 250px;
  width: 150px;
}

.paginated-table .md-table-row-select {
  width: 40px !important;
}

.md-table .md-table-row-select .md-checkbox {
  margin: 0 auto !important;
}

.fixed-dialog {
  width: 1500px;
  height: 600px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>