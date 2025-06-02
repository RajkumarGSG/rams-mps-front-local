<!--
File: TestRMTreatmentEditForm.vue
Description: form for adding/editing a single RM Treatment.
-->
<template>
  <EditForm
    v-if="eligible"
    ref="treatmentsForm"
    :itemId="itemId"
    :actionBase="'treatment_type'"
    :formName="'TreatmentTypeEditForm'"
    :idFieldName="idFieldName"
    :moduleName="'ReferenceData'"
    :fields="fields"
    :validations="validations"
    :messageTitle="$t('treatment.treatment_description')"
    @close="$emit('close')">

    <template #fields_before>
      <div :class="getSize(40)"><RdbLookupDropdown :class="getClass('type')" :label="$t('selections.select_type')"
        v-model="selectedMaintenanceType" :lookupType="'maintenance_type'" :addEmptyLine="false" />
      </div>
      <div :class="getSize(40)">
        <WorkCategoriesDropdown :class="getClass('fk_work_category')" v-model="fk_work_category" :isRequired="true"
          data-vv-name="fk_work_category" v-validate="validations.fk_work_category" :routine="selectedMaintenanceType" required />
      </div>
    </template>

    <template #fields_after>
        <div class="md-layout" >
        <label for="swatches" :style="{ color: errors.has('color') ? '#f44336' : '#4caf50' }">
          {{ $t('selections.select_color') }}
        </label>
        <VSwatches v-model="color" id="swatches" :swatches="swatches" shapes="circles" inline show-checkbox show-border
          v-validate="validations.color" data-vv-name="color" />
      </div>

    </template>
  </EditForm>
</template>
<script>
import { mapActions } from 'vuex'
import { EditForm, RdbLookupDropdown, WorkCategoriesDropdown, UnitsDropdown, FloatInput } from '@/pages/Components'
import { savedMessage } from '@/mixins/messagesMixin'
import permissions from "@/mixins/permissionsMixin"
import VSwatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.css'

export default {
  name: 'rm-treatment-edit-form',
  mixins: [permissions],

  data() {
    return {
      // TODO: change to appropriate name and add to the permissions table
      formName: 'TreatmentTypeEditForm',
      eligible: false,

      selectedMaintenanceType: 0,
      fk_work_category: null,
      idFieldName: 'treatment_type_id',
      key: null,
      treatment_type_description: null,
      key_en: null,
      treatment_type_description_en: null,
      fk_unit: null,
      fk_work_category: null,
      expected_outcome_lookup: 0,
      //expected_outcome_en: '',
      color: '',
      work_area: null,

      initialFormState: null,
      swatches: ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'black', ''],

      fields: [
        { name: 'key', label: `${this.$t('treatment.treatment_key')} (${this.$t('translate.ru')}`, type: 'text', class: 'md-layout-item md-size-30' },
        { name: 'treatment_type_description', label: `${this.$t('treatment.treatment_description')} (${this.$t('translate.ru')}`, type: 'text', class: 'md-layout-item md-size-70' },
        { name: 'key_en', label: `${this.$t('treatment.treatment_key')} (${this.$t('translate.en')}`, type: 'text', class: 'md-layout-item md-size-30' },
        { name: 'treatment_type_description_en', label: `${this.$t('treatment.treatment_description')} (${this.$t('translate.en')}`, type: 'text', class: 'md-layout-item md-size-70' },
        { 
          name: 'fk_unit', type: 'custom', component: 'UnitsDropdown', 
          class: 'md-layout-item md-size-30', props: { required: true } 
        },
        { 
          name: 'expected_outcome_lookup', label: 'label.expected_outcome', type: 'custom', component: 'RdbLookupDropdown', 
          class: 'md-layout-item md-size-30', props: { lookupType: 'surface_type', addEmptyLine: false } 
        },
        { name: 'notes', label: 'stdCols.notes', type: 'text', class: 'md-layout-item md-size-100' },
      ]
    }
  },

  props: {
    itemId: null
  },

  components: {
    EditForm,
    RdbLookupDropdown, 
    WorkCategoriesDropdown, 
    UnitsDropdown,
    FloatInput,
    VSwatches
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      this.$emit('close');
      return
    };

    if (this.itemId) {
      const treatmentType = await this.loadItem(this.itemId);
      this.selectedMaintenanceType = treatmentType.maintenanceType;
      this.fk_work_category = treatmentType.fk_work_category;
      this.key = treatmentType.key;
      this.treatment_type_description = treatmentType.treatment_type_description;
      this.key_en = treatmentType.key_en;
      this.treatment_type_description_en = treatmentType.treatment_type_description_en;
      this.fk_unit = treatmentType.fk_unit;
      this.expected_outcome = treatmentType.expected_outcome;
      //this.expected_outcome_en = treatmentType.expected_outcome_en;
      this.work_area = treatmentType.work_area;
      this.color = treatmentType.color;
    }
    this.$nextTick(async () => {
      this.initialFormState = this.getCurrentState;
      //await this.$validator.validateAll();
      await this.$refs.treatmentsForm.validateForm();
    });

    //console.log('props', this.fields[1].props);
  },

  methods: {
    ...mapActions({
      loadItem: 'ReferenceData/LOAD_TREATMENT_TYPE_BY_ID',
      addItem: 'Planning/ADD_NEW_RM_TREATMENT',
      editItem: 'Planning/UPDATE_RM_TREATMENT',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    // TODO: remove this method after API implmentation, as well as in the template section
    onUnitChange(id, desc) {
      this.units = desc
    },

    async validate() {
      const isValid = await this.$validator.validateAll()
      if (!isValid) return

      const theItem = this.getCurrentState;
      // TODO: remove 1 line below after API implmenetation
      theItem.units = this.units

      let errDesc = '';
      let newId;
      const action = !this.itemId ? this.addItem : this.editItem;
      const payload = !this.itemId ? theItem : { id: this.itemId, theItem };
      try {
        const res = await action(payload)
        newId = res?.id;
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error')
      }

      this.$nextTick(() => this.$validator.reset())
      this.$emit('close');
      await savedMessage(errDesc, this.$t('label.units'), this.description)
      this.highlightRow(newId)
    },
  },

  computed: {
    screenTitle() {
      return this.itemId ? this.$t('screen_titles.treatment_type_upd') : this.$t('screen_titles.treatment_type_add')
    },

    validations() {
      const res = {
        key: { required: true, min: 2 },
        treatment_type_description: { required: true, min: 3 },
        key_en: { required: true, min: 2 },
        treatment_type_description_en: { required: true, min: 3 },
        fk_unit: { required: true, numeric: true, min_value: 1 },
        fk_work_category: { required: true, numeric: true, min_value: 1 },
        work_area: { required: true, numeric: true, min_value: 1 },
      };
      if (this.selectedMaintenanceType == 0) {
        res.color = { required: true }
      };
      return res;
    },

    getCurrentState() {
      return {
        key_en: this.key_en,  //.trim(),
        treatment_type_description_en: this.treatment_type_description_en,  //.trim(),
        key: this.key,  //.trim(),
        treatment_type_description: this.treatment_type_description,  //.trim(),
        fk_unit: this.fk_unit,
        fk_work_category: this.fk_work_category,
        expected_outcome_lookup: this.expected_outcome_lookup,
        color: this.color,
        work_area: this.work_area
      }
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false

      return this.description !== this.initialFormState.description ||
        this.fk_unit !== this.initialFormState.fk_unit ||
        this.cost !== this.initialFormState.cost
    }
  }
}
</script>