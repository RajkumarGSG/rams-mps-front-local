<!--
File: BudgetEditForm.vue
Description: form for adding/editing a single budget line.
-->
<template>
  <modal v-if="eligible" :title="screenTitle" :form="formName" :errCount="errors.count()"
    :hasUnsavedChanges="hasUnsavedChanges" @close="$emit('close')" @save="validate">

    <template slot='body'>
      <div class="md-layout">
        <div class="md-layout-item md-size-100">
          <RegionsDropdown :class="getClass('fk_region')" :label="$t('road_network.region')" v-model="fk_region"
            data-vv-name="fk_region" v-validate="modelValidations.fk_region" :isRequired="true" required
            :disabled="approved == 1" />

          <BaseDropdown :class="getClass('fk_work_category')" :label="$t('label.category')" v-model="fk_work_category"
            :items="filteredCategories" data-vv-name="fk_work_category" v-validate="modelValidations.fk_work_category"
            required :disabled="approved == 1" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-40">
          <md-field :class="getClass('year')">
            <label for="year">{{ $t('stdCols.year') }}</label>
            <md-input id="year" v-model="year" type="number" data-vv-name="year" v-validate="modelValidations.year"
              :min="modelValidations.year.min_value" :max="modelValidations.year.max_value" required />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100 md-size-60">
          <FloatInput :class="getClass('amount_kgs')" :label="$t('budget.amount')" v-model="amount_kgs"
            data-vv-name="amount_kgs" v-validate="modelValidations.amount_kgs"
            :min="modelValidations.amount_kgs.min_value" required :disabled="approved == 1" />
        </div>
      </div>
    </template>
  </modal>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { Modal, RegionsDropdown, BaseDropdown, FloatInput } from '@/pages/Components'
import permissions from "@/mixins/permissionsMixin"
import messages from '@/mixins/messagesMixin'

export default {
  name: 'budget-edit-form',
  mixins: [permissions, messages],

  data() {
    return {
      formName: 'BudgetEditForm',
      eligible: false,

      fk_region: 0,
      year: new Date().getFullYear(),
      fk_work_category: null,

      exchange_rate: 89,
      amount_kgs: 1000,
      amount_usd: 0,
      version: 0,
      approved: 0,

      initialFormState: null,

      modelValidations: {
        fk_region: { required: true, numeric: true, min_value: 1 },
        year: { required: true, numeric: true, min_value: 2021, max_value: 2045 },
        fk_work_category: { required: true, numeric: true, min_value: 1 },
        amount_kgs: { required: true, numeric: true, min_value: 1000 },
      }
    }
  },

  props: {
    budget: { default: {}, type: Object },
  },

  components: {
    Modal,
    RegionsDropdown,
    BaseDropdown,
    FloatInput
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      this.$emit('close')
      return
    };

    if (this.budget) {
      this.fk_region = this.budget.fk_region;
      this.year = Number(this.budget.year);
      this.fk_work_category = !this.budget.budget_id ? 0 : this.budget.fk_work_category;
      this.amount_kgs = this.budget.amount_kgs;
      this.amount_usd = this.budget.amount_usd;
      this.version = this.budget.version || 0;
      this.approved = this.budget.approved || 0;
    };
    this.$nextTick(async () => {
      this.initialFormState = this.getCurrentState;
      await this.$validator.validateAll();
    });
  },

  methods: {
    ...mapActions({
      addItem: 'Planning/ADD_NEW_BUDGET',
      updItem: 'Planning/UPDATE_BUDGET',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    async validate() {
      const isValid = await this.$validator.validateAll();
      if (!isValid) return;

      const theItem = this.getCurrentState;
      theItem.version = this.version + 1;

      let errDesc = '';
      let newId;
      const action = !this.budget.budget_id ? this.addItem : this.updItem;
      const payload = !this.budget.budget_id ? theItem : { id: this.budget.budget_id, theItem };
      try {
        const res = await action(payload);
        newId = res?.budget_id;
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error');
      }
      this.$nextTick(() => this.$validator.reset());
      this.$emit('saved');
      this.savedMessage(errDesc, this.$t('budget.amount'), this.amount_kgs);
      this.highlightRow(newId);
    },
  },

  computed: {
    ...mapState({
      workCategoriesList: (state) => state.Dropdowns.work_categories,
    }),
    ...mapGetters('Planning', ['categoriesInBudget']),

    budgetCategories() {
      return this.categoriesInBudget(this.fk_region, this.year);
    },

    filteredCategories() {
      const res = this.workCategoriesList.filter(cat =>
        !this.budgetCategories.some(item2 => item2.id === cat.id && cat.id !== 0 && cat.id !== this.fk_work_category)
      );
      return res;
    },

    screenTitle() {
      return this.budget.budget_id ? this.$t('screen_titles.budget_upd') : this.$t('screen_titles.budget_add');
    },

    getCurrentState() {
      return {
        fk_region: this.fk_region,
        year: this.year,
        fk_work_category: this.fk_work_category,
        amount_kgs: this.amount_kgs / 1,
        amount_usd: this.amount_kgs / this.exchange_rate,
        version: this.version,
        approved: 0,
        ...(!this.budget.budget_id ? { created_at: new Date() } : { updated_at: new Date() })
      };
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false;

      return this.fk_region !== this.initialFormState.fk_region ||
        this.year !== this.initialFormState.year ||
        this.fk_work_category !== this.initialFormState.fk_work_category ||
        this.amount_kgs !== this.initialFormState.amount_kgs ||
        this.version !== this.initialFormState.version;
    }
  }
}
</script>