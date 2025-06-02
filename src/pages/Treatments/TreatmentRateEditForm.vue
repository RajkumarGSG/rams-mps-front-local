<!--
TreatmentRateEditForm.vue
Description: form for adding/editing a single Treatment Rate.
-->
<template>
  <modal v-if="eligible" :title="screenTitle" :form="formName" :errCount="errors.count()"
    :hasUnsavedChanges="hasUnsavedChanges" @close="$emit('close')" @save="validate">

    <template slot='body'>
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-40">
          <RdbLookupDropdown v-model="selectedMaintenanceType" :lookupType="'maintenance_type'" :addEmptyLine="false" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-60">
          <WorkCategoriesDropdown :class="getClass('selectedCategory')" v-model="selectedCategory" :isRequired="true"
            data-vv-name="selectedCategory" v-validate="modelValidations.selectedCategory"
            :routine="selectedMaintenanceType" required />
        </div>
      </div>
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-100">
          <TreatmentsDropdown :class="getClass('selectedTreatmentType')" v-model="selectedTreatmentType"
            data-vv-name="selectedTreatmentType" :isRequired="true" v-validate="modelValidations.selectedTreatmentType"
            :routine="selectedMaintenanceType" :workCategory="selectedCategory" @input='onTreatmentChange' required />
        </div>
      </div>

      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-40">
          <md-field :class="getClass('unit_quantity')">
            <label for="unit_quantity">{{ $t('condition.number_units') }}</label>
            <md-input id="unit_quantity" v-model.number="unit_quantity" type="number" data-vv-name="unit_quantity"
              v-validate="modelValidations.unit_quantity" :min="modelValidations.rate.min_value" required />
          </md-field>
        </div>
        <div class="md-layout-item md-small-size-100 md-size-20">
          <UnitsDropdown :class="getClass('fk_unit')" v-model="fk_unit" disabled />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-40">
          <FloatInput :class="getClass('rate')" :label="$t('label.rate')" v-model="rate" data-vv-name="rate"
            v-validate="modelValidations.rate" :min="modelValidations.rate.min_value" required />
        </div>
      </div>
    </template>
  </modal>
</template>
<script>
import { mapActions } from 'vuex'
import { Modal, RdbLookupDropdown, WorkCategoriesDropdown, TreatmentsDropdown, UnitsDropdown, FloatInput } from '@/pages/Components'
import permissions from "@/mixins/permissionsMixin"
import { savedMessage } from '@/mixins/messagesMixin'

export default {
  name: 'treatment-rate-edit-form',
  mixins: [permissions],

  data() {
    return {
      formName: 'TreatmentRateEditForm',
      eligible: false,

      selectedMaintenanceType: 0,
      selectedCategory: null,
      selectedTreatmentType: 0,
      treatmentDescr: null,
      fk_unit: 0,
      unit_description: null,
      unit_quantity: 0,
      rate: 0,

      isLoading: false,
      initialFormState: null,

      modelValidations: {
        selectedCategory: { required: true, numeric: true, min_value: 1 },
        selectedTreatmentType: { required: true, numeric: true, min_value: 1 },
        rate: { required: true, decimal: true, min_value: 1 },
        unit_quantity: { required: true, numeric: true, min_value: 1 }
      }
    }
  },

  props: {
    itemId: null
  },

  components: {
    Modal,
    RdbLookupDropdown,
    WorkCategoriesDropdown,
    TreatmentsDropdown,
    FloatInput,
    UnitsDropdown
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      this.$emit('close')
      return
    };

    if (this.itemId) { // Load data on existing treatment rate
      const rate = await this.loadTreatmentRate(this.itemId)
      this.selectedTreatmentType = rate.fk_treatment_type
      this.unit_quantity = rate.unit_quantity
      this.unit_description = rate.unit_description
      this.fk_unit = rate.fk_unit
      this.rate = rate.rate

      // TODO: Remove after ticket #167 resolution
      const treatmentType = await this.loadTreatmentType(this.selectedTreatmentType);
      this.selectedMaintenanceType = treatmentType?.is_routine || 0
      this.selectedCategory = treatmentType?.fk_work_category || 0
      // End TODO
    }
    this.$nextTick(async () => {
      this.initialFormState = this.getCurrentState;
      await this.$validator.validateAll();
    });
  },

  methods: {
    ...mapActions({
      loadTreatmentType: 'ReferenceData/LOAD_TREATMENT_TYPE_BY_ID',
      loadTreatmentRate: 'ReferenceData/LOAD_TREATMENT_RATE_BY_ID',
      addTreatmentRate: 'ReferenceData/ADD_NEW_TREATMENT_RATE',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    onTreatmentChange(id, treatmentDescr) {
      this.treatmentDescr = treatmentDescr
    },

    async validate() {
      const isValid = await this.$validator.validateAll()
      if (!isValid) return

      const payload = this.getCurrentState;
      let errDesc = '';
      let newId;
      try {
        const res = await this.addTreatmentRate(payload)
        newId = res?.treatment_rate_id;
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error')
      }

      this.$nextTick(() => this.$validator.reset())
      this.$emit('close')
      await savedMessage(errDesc, this.$t('route.treatment_rates'), this.treatmentDescr)
      this.highlightRow(newId)
    },
  },

  computed: {
    getCurrentState() {
      return {
        fk_treatment_type: this.selectedTreatmentType,
        unit_quantity: this.unit_quantity,
        //fk_unit: this.fk_unit,
        rate: this.rate
      }
    },

    screenTitle() {
      return this.itemId ? this.$t('screen_titles.treatment_rate_upd') : this.$t('screen_titles.treatment_rate_add')
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false

      return this.selectedTreatmentType !== this.initialFormState.fk_treatment_type ||
        this.unit_quantity !== this.initialFormState.unit_quantity ||
        //this.fk_unit !== this.initialFormState.fk_unit ||
        this.rate !== this.initialFormState.rate
    }
  }
}
</script>