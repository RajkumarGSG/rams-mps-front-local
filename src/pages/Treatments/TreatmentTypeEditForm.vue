<!--
File: TreatmentTypeEditForm.vue
Description: form for adding/editing a single treatment.
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
          <WorkCategoriesDropdown :class="getClass('fk_work_category')" v-model="fk_work_category" :isRequired="true"
            data-vv-name="fk_work_category" v-validate="modelValidations.fk_work_category"
            :routine="selectedMaintenanceType" required />
        </div>
      </div>

      <div class="md-layout">
        <!-- TODO: change to EditFields with multiedit components-->
        <div class="md-layout-item md-small-size-100 md-size-30">
          <md-field :class="getClass('key')">
            <label for="key">{{ $t('treatment.treatment_key') }} ({{ ($t('translate.ru')) }})</label>
            <md-input id="key" v-model="key" type="text" data-vv-name="key" v-validate="modelValidations.key"
              required />
          </md-field>
        </div>
        <div class="md-layout-item md-small-size-100 md-size-70">
          <md-field :class="getClass('treatment_type_description')">
            <label for="description">{{ $t('treatment.treatment_description') }} ({{ ($t('translate.ru')) }})</label>
            <md-input id="description" v-model="treatment_type_description" type="text"
              data-vv-name="treatment_type_description" v-validate="modelValidations.treatment_type_description"
              required />
          </md-field>
        </div>
      </div>

      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-30">
          <md-field :class="getClass('key_en')">
            <label for="key_en">{{ $t('treatment.treatment_key') }} ({{ ($t('translate.en')) }})</label>
            <md-input id="key_en" v-model="key_en" type="text" data-vv-name="key_en"
              v-validate="modelValidations.key_en" required />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100 md-size-70">
          <md-field :class="getClass('treatment_type_description_en')">
            <label for="description_en">{{ $t('treatment.treatment_description') }} ({{ ($t('translate.en')) }})</label>
            <md-input id="description_en" v-model="treatment_type_description_en" type="text"
              data-vv-name="treatment_type_description_en" v-validate="modelValidations.treatment_type_description_en"
              required />
          </md-field>
        </div>
      </div>

      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-30">
          <UnitsDropdown :class="getClass('fk_unit')" v-model="fk_unit" data-vv-name="fk_unit"
            v-validate="modelValidations.fk_unit" :isRequired="true" required />
        </div>
        <div v-show="selectedMaintenanceType == 0" class="md-layout-item md-small-size-20 md-size-40">
          <RdbLookupDropdown :label="$t('label.expected_outcome')" v-model="expected_outcome"
            :lookupType="'surface_type'" :hiddenField="'description_en'" :addEmptyLine="false" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-30">
          <RdbLookupDropdown :label="$t('label.work_area')" v-model="work_area" :lookupType="'work_area'" />
        </div>
      </div>

      <div class="md-layout" v-show="selectedMaintenanceType == 0">
        <label for="swatches" :style="{ color: errors.has('color') ? '#f44336' : '#4caf50' }">
          {{ $t('selections.select_color') }}
        </label>
        <VSwatches v-model="color" id="swatches" :swatches="swatches" shapes="circles" inline show-checkbox show-border
          v-validate="modelValidations.color" data-vv-name="color" />
      </div>
    </template>
  </modal>
</template>
<script>
import { mapActions } from 'vuex'
import { Modal, UnitsDropdown, WorkCategoriesDropdown, RdbLookupDropdown } from '@/pages/Components'
import permissions from "@/mixins/permissionsMixin"
import { savedMessage } from '@/mixins/messagesMixin'
import VSwatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.css'

export default {
  name: 'treatment-type-edit-form',
  mixins: [permissions],

  data() {
    return {
      formName: 'TreatmentTypeEditForm',
      eligible: false,

      selectedMaintenanceType: 0,

      key: null,
      treatment_type_description: null,
      key_en: null,
      treatment_type_description_en: null,
      fk_unit: null,
      fk_work_category: null,
      expected_outcome: 0,
      color: '',
      work_area: null,

      initialFormState: null,
      swatches: ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'black', ''],
    }
  },

  props: {
    itemId: null
  },

  components: {
    Modal,
    UnitsDropdown,
    WorkCategoriesDropdown,
    RdbLookupDropdown,
    VSwatches
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed();
    if (!this.eligible) {
      this.$emit('close');
      return;
    };

    if (this.itemId) { // Load data on existing treatment
      const treatmentType = await this.loadTreatmentType(this.itemId);
      this.selectedMaintenanceType = treatmentType.is_routine;
      this.fk_work_category = treatmentType.fk_work_category;
      this.key = treatmentType.key;
      this.treatment_type_description = treatmentType.treatment_type_description;
      this.key_en = treatmentType.key_en;
      this.treatment_type_description_en = treatmentType.treatment_type_description_en;
      this.fk_unit = treatmentType.fk_unit;
      this.expected_outcome = treatmentType.expected_outcome;
      this.work_area = treatmentType.work_area;
      this.color = treatmentType.color;
    };
    this.$nextTick(async () => {
      this.initialFormState = this.getCurrentState;
      await this.$validator.validateAll();
    });
  },

  methods: {
    ...mapActions({
      loadTreatmentType: 'ReferenceData/LOAD_TREATMENT_TYPE_BY_ID',
      addTreatmentType: 'ReferenceData/ADD_NEW_TREATMENT_TYPE',
      editTreatmentType: 'ReferenceData/UPDATE_TREATMENT_TYPE',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    async validate() {
      const isValid = await this.$validator.validateAll();
      if (!isValid) return;

      const theItem = this.getCurrentState;
      let errDesc = '';
      let newId;
      const action = !this.itemId ? this.addTreatmentType : this.editTreatmentType;
      const payload = !this.itemId ? theItem : { id: this.itemId, theItem };
      try {
        const res = await action(payload)
        newId = res?.treatment_type_id;
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error')
      }

      this.$nextTick(() => this.$validator.reset());
      this.$emit('close');
      await savedMessage(errDesc, this.$t('treatment.treatment_description'), this.treatment_type_description, this.treatment_type_description_en);
      this.highlightRow(newId);
    },
  },

  computed: {
    screenTitle() {
      return this.itemId ? this.$t('screen_titles.treatment_type_upd') : this.$t('screen_titles.treatment_type_add')
    },

    modelValidations() {
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
        expected_outcome: this.expected_outcome,  //.trim(),
        color: this.color,
        work_area: this.work_area
      };
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false;

      return this.key !== this.initialFormState.key ||
        this.treatment_type_description !== this.initialFormState.treatment_type_description ||
        this.key_en !== this.initialFormState.key_en ||
        this.treatment_type_description_en !== this.initialFormState.treatment_type_description_en ||
        this.fk_unit !== this.initialFormState.fk_unit ||
        this.fk_work_category !== this.initialFormState.fk_work_category ||
        this.expected_outcome !== this.initialFormState.expected_outcome ||
        this.color !== this.initialFormState.color ||
        this.work_area !== this.initialFormState.work_area;
    }
  },
}
</script>
<style lang='scss' scoped>
.md-button+.md-button {
  margin-left: 10px;
}

.modal-container {
  max-width: 700px;
}
</style>