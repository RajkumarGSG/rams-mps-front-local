<!--
File: ConditionEditFrom.vue
Description: form for adding/editing a single Condition data (IRI, rutting, etc.).
-->
<template>
  <modal v-if="eligible" :title="screenTitle" :form="formName" :errCount="errors.count()"
    :hasUnsavedChanges="hasUnsavedChanges" @close="$emit('close')" @save="validate">

    <template slot='body'>
      <div class="md-layout">
        <div class="md-layout-item md-small-size-20 md-size-20">
          <md-field :class="getClass('survey_date')">
            <label for="survey_date">{{ $t('condition.survey_date') }}</label>
            <md-input id="survey_date" v-model="condition.survey_date" type="date" data-vv-name="survey_date"
              v-validate="modelValidations.survey_date" required />
          </md-field>
        </div>
        <div class="md-layout-item md-small-size-30 md-size-30">
          <RegionsDropdown v-model="selectedRegion" />
        </div>
        <div class="md-layout-item md-small-size-40 md-size-40">
          <RoadsDropdown v-model="selectedRoad" :regionId="selectedRegion" />
        </div>

        <div class="md-layout-item md-small-size-60 md-size-60">
          <SectionsDropdown :class="getClass('fk_section')" v-model="fk_section" data-vv-name="fk_section"
            v-validate="modelValidations.fk_section" :regionId="selectedRegion" :roadId="selectedRoad" required
            :isRequired="true" />
        </div>
        <div class="md-layout-item md-small-size-30 md-size-30">
          <md-field :class="getClass('fk_interval')">
            <label for="fk_interval">{{ $t('condition.fk_interval') }}</label>
            <md-input id="fk_interval" v-model="condition.fk_interval" type="number" data-vv-name="fk_interval" />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-30 md-size-30">
          <md-field :class="getClass('start_distance')">
            <label for="start_distance">{{ $t('road_network.start_distance') }}</label>
            <md-input id="start_distance" v-model="condition.start_distance" type="number" step="100"
              data-vv-name="start_distance" v-validate="modelValidations.start_distance" required />
          </md-field>
        </div>
        <div class="md-layout-item md-small-size-30 md-size-30">
          <md-field :class="getClass('end_distance')">
            <label for="end_distance">{{ $t('road_network.end_distance') }}</label>
            <md-input id="end_distance" v-model="condition.end_distance" type="number" step='100'
              data-vv-name="end_distance" v-validate="modelValidations.end_distance" required />
          </md-field>
        </div>
        <md-divider />
        <div class="md-layout-item md-small-size-30 md-size-30">
          <md-field :class="getClass('direction')">
            <label for="direction">{{ $t('inventory.direction') }}</label>
            <md-input id="direction" v-model="condition.direction" type="number" data-vv-name="direction" />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-30 md-size-30">
          <FloatInput :class="getClass('iri')" :label="$t('condition.iri')" v-model="condition.iri" data-vv-name="iri"
            v-validate="modelValidations.iri" :min="modelValidations.iri.min_value" :step="0.1" required />
        </div>

        <div class="md-layout-item md-small-size-30 md-size-30">
          <FloatInput :class="getClass('rut_left')" :label="$t('condition.rut_left')" v-model="condition.rut_left"
            data-vv-name="rut_left" v-validate="modelValidations.rut_left" :min="modelValidations.rut_left.min_value"
            :step="0.1" required />
        </div>
        <div class="md-layout-item md-small-size-30 md-size-30">
          <FloatInput :class="getClass('rut_right')" :label="$t('condition.rut_right')" v-model="condition.rut_right"
            data-vv-name="rut_right" v-validate="modelValidations.rut_right" :min="modelValidations.rut_right.min_value"
            :step="0.1" required />
        </div>

        <div class="md-layout-item md-small-size-30 md-size-30">
          <FloatInput :class="getClass('cracking_m2')" :label="$t('condition.cracking_m2')"
            v-model="condition.cracking_m2" data-vv-name="cracking_m2" v-validate="modelValidations.cracking_m2"
            :min="modelValidations.cracking_m2.min_value" :step="0.1" />
        </div>
        <div class="md-layout-item md-small-size-30 md-size-30">
          <md-field :class="getClass('potholes_no')">
            <label for="potholes_no">{{ $t('condition.potholes_no') }}</label>
            <md-input id="potholes_no" v-model="condition.potholes_no" type="number" data-vv-name="potholes_no"
              v-validate="modelValidations.potholes_no" :min="modelValidations.potholes_no.min_value" />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-30 md-size-30">
          <FloatInput :class="getClass('repairs_m2')" :label="$t('condition.repairs_m2')" v-model="condition.repairs_m2"
            data-vv-name="repairs_m2" v-validate="modelValidations.repairs_m2"
            :min="modelValidations.repairs_m2.min_value" :step="0.1" />
        </div>
        <div class="md-layout-item md-small-size-30 md-size-30">
          <FloatInput
            :class="[{ 'md-valid': !errors.has('edge_break_m2') }, { 'md-error': errors.has('edge_break_m2') }]"
            :label="$t('condition.edge_break_m2')" v-model="condition.edge_break_m2" data-vv-name="edge_break_m2"
            v-validate="modelValidations.edge_break_m2" :min="modelValidations.edge_break_m2.min_value" :step="0.1" />
        </div>
      </div>
    </template>
  </modal>
</template>
<script>
import { mapActions } from 'vuex'
import { Modal, RegionsDropdown, RoadsDropdown, SectionsDropdown, FloatInput } from '@/pages/Components'
import { savedMessage } from '@/mixins/messagesMixin'
import permissions from "@/mixins/permissionsMixin"

export default {
  name: 'condition-edit-form',
  mixins: [permissions],

  props: {
    itemId: null
  },

  data() {
    return {
      formName: 'Condition',
      eligible: false,

      selectedRegion: null,
      selectedRoad: null,
      section_desc: null,
      fk_section: null,
      condition: {},

      initialFormState: null,
      modelValidations: {
        fk_section: { required: true, numeric: true, min_value: 1 },
        start_distance: { required: true, numeric: true },
        end_distance: { required: true, numeric: true },
        survey_date: { required: true },
        iri: { required: true, decimal: true, min_value: 0.1, max_value: 100 },
        rut_left: { required: true, decimal: true, min_value: 0.1, max_value: 100 },
        rut_right: { required: true, decimal: true, min_value: 0.1, max_value: 100 },
        cracking_m2: { required: false, decimal: true, min_value: 0 },
        potholes_no: { required: false, numeric: true, min_value: 0 },
        repairs_m2: { required: false, decimal: true, min_value: 0 },
        edge_break_m2: { required: false, decimal: true, min_value: 0 },
      }
    }
  },

  components: {
    Modal,
    RegionsDropdown,
    RoadsDropdown,
    SectionsDropdown,
    FloatInput
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      this.onModalClose()
      return
    };

    if (this.itemId) { // Load data
      this.condition = await this.loadCondition(this.itemId)
      this.fk_section = this.condition.fk_section
      this.condition.survey_date = this.condition.survey_date.slice(0, 10)

      this.getRegionAndRoad(this.condition.fk_section).then(
        (res) => {
          this.selectedRegion = res.fk_region
          this.selectedRoad = res.fk_road
        },
        (err) => {
          this.selectedRegion = 0
          this.selectedRoad = 0
        }
      )
    };
    this.$nextTick(async () => {
      this.initialFormState = this.getCurrentState;
      await this.$validator.validateAll();
    });
  },

  methods: {
    ...mapActions({
      loadCondition: 'LOAD_CONDITION_BY_ID',
      getRegionAndRoad: 'GET_REGION_ROAD_FROM_SECTION',
      addItem: 'ADD_NEW_CONDITION',
      editItem: 'UPDATE_CONDITION',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    async validate() {
      const isValid = await this.$validator.validateAll();
      if (!isValid) return;

      const theItem = this.getCurrentState;
      let errDesc = '';
      let newId;
      const action = !this.itemId ? this.addItem : this.editItem;
      const payload = !this.itemId ? theItem : { id: this.itemId, theItem };
      if (this.itemId) {
        delete payload.theItem.data_id;
      }
      try {
        const res = await action(payload);
        newId = res?.data_id;
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error');
      };

      this.$nextTick(() => this.$validator.reset())
      this.$emit('close');
      await savedMessage(errDesc, this.$t('route.condition_data'),
        `'${this.condition.start_distance}-${this.condition.end_distance}'`)
      this.highlightRow(newId)
    },
  },

  computed: {
    screenTitle() {
      return this.itemId ? this.$t('screen_titles.condition_upd') : this.$t('screen_titles.condition_add')
    },

    getCurrentState() {
      return {
        // TODO: delete the formatting after Andrey resolves it in the back-end or move to the api side
        fk_section: this.condition.fk_section,
        start_distance: Number(this.condition.start_distance),
        end_distance: Number(this.condition.end_distance),
        iri: Number(this.condition.iri),
        rut_left: Number(this.condition.rut_left),
        rut_right: Number(this.condition.rut_right),
        cracking_m2: Number(this.condition.cracking_m2),
        potholes_no: Number(this.condition.potholes_no),
        repairs_m2: Number(this.condition.repairs_m2),
        edge_break_m2: Number(this.condition.edge_break_m2),
      }
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false

      // TODO: delete the formatting after Andrey resolves it in the back-end or move to the api side
      return this.initialFormState.fk_section !== this.fk_section ||
        this.initialFormState.start_distance !== Number(this.condition.start_distance) ||
        this.initialFormState.end_distance !== Number(this.condition.end_distance) ||
        this.initialFormState.iri !== Number(this.condition.iri) ||
        this.initialFormState.rut_left !== Number(this.condition.rut_left) ||
        this.initialFormState.rut_right !== Number(this.condition.rut_right) ||
        this.initialFormState.cracking_m2 !== Number(this.condition.cracking_m2) ||
        this.initialFormState.potholes_no !== Number(this.condition.potholes_no) ||
        this.initialFormState.repairs_m2 !== Number(this.condition.repairs_m2) ||
        this.initialFormState.edge_break_m2 !== Number(this.condition.edge_break_m2)
    }
  }
}
</script>
<style>
.md-card {
  margin: 0px 0;
}

.md-button+.md-button {
  margin-left: 10px;
}

.modal-container {
  max-width: 700px;
}
</style>