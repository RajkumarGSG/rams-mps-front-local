<!--
File: ConditionIndexCriteriaSingle.vue
Description: show list/pivot of Condition Index Criteria.
-->
<template>
  <modal v-if="eligible" :title="screenTitle" :form="formName" :errCount="errors.count()"
    :hasUnsavedChanges="hasUnsavedChanges" @close="$emit('close')" @save="validate">

    <template slot='body'>
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-70">
          <BaseDropdown :class="getClass('indicator_type')" :label="$t('label.indicator_type')" :items="dropDownList"
            v-model="indicator_type" data-vv-name="indicator_type" v-validate="modelValidations.indicator_type"
            :isRequired="true" required />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-30">
          <BaseDropdown :class="getClass('score')" :label="$t('label.score')" v-model="score" :items="getScores"
            :displayField="'val'" :valueField="'val'" data-vv-name="score" v-validate="modelValidations.score"
            :isRequired="true" required />
        </div>
      </div>

      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-50">
          <FloatInput :class="getClass('value_from')" :label="$t('label.value_from')" v-model="value_from"
            data-vv-name="value_from" :step="0.1" v-validate="modelValidations.value_from" required />
        </div>

        <div class="md-layout-item md-small-size-100 md-size-50">
          <FloatInput :class="getClass('value_to')" :label="$t('label.value_to')" v-model="value_to"
            data-vv-name="value_to" :step="0.1" v-validate="modelValidations.value_to" required />
        </div>
      </div>
    </template>
  </modal>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { Modal, BaseDropdown, FloatInput } from '@/pages/Components'
import permissions from "@/mixins/permissionsMixin"
import {savedMessage} from '@/mixins/messagesMixin'

export default {
  name: 'condition-index-criteria-single',
  mixins: [permissions],

  data() {
    return {
      formName: 'ConditionIndexCriteriaSingle',
      eligible: false,

      indicator_type: null,
      score: null,
      value_from: null,
      value_to: null,

      initialFormState: null,

      modelValidations: {
        indicator_type: { required: true, min: 3 },
        score: { required: true, numeric: true },
        value_from: { required: true, decimal: true, min_value: 0 },
        value_to: { required: true, decimal: true, min_value: 0 },
      }
    }
  },

  props: {
    itemId: { type: Number, default: 0 },
  },

  components: {
    Modal,
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

    if (this.itemId) {
      // Load data on existing treatment
      const conditionIndex = await this.loadById(this.itemId)
      console.log('conditionIndex', conditionIndex)
      this.indicator_type = conditionIndex.indicator_type
      this.score = conditionIndex.score
      this.value_from = conditionIndex.value_from
      this.value_to = conditionIndex.value_to
    }
    this.$nextTick(async () => {
      this.initialFormState = this.getCurrentState;
      await this.$validator.validateAll();
    });
  },

  methods: {
    ...mapActions({
      loadById: 'ReferenceData/LOAD_CONDITION_INDEX_CRITERIA_BY_ID',
      addItem: 'ReferenceData/ADD_NEW_CONDITION_INDEX_CRITERIA',
      updItem: 'ReferenceData/UPDATE_CONDITION_INDEX_CRITERIA',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    async validate() {
      const isValid = await this.$validator.validateAll()
      if (!isValid) return

      const theItem = this.getCurrentState

      let errDesc = '';
      const action = !this.itemId ? this.addItem : this.updItem;
      const payload = !this.itemId ? theItem : { id: this.itemId, theItem };
      try {
        await action(payload)
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error')
      }

      this.$nextTick(() => this.$validator.reset())
      this.$emit('close')

      const descr = this.$t(`condition.${this.indicator_type}`) + '-' + this.$t(`criteria.score_${this.score}`)
      await savedMessage(errDesc, this.$t('condition.condition_index'), descr)
      this.highlightRow(this.indicator_type)
    },
  },

  computed: {
    ...mapState({
    }),
    ...mapGetters('ReferenceData', ['getDropDownList', 'getScores']),

    dropDownList() {
      return this.getDropDownList.map(item => ({ ...item, description: this.$t(item.description) }))
    },

    screenTitle() {
      return this.itemId ? this.$t('screen_titles.parameter_upd') : this.$t('screen_titles.parameter_add')
    },

    getCurrentState() {
      return {
        indicator_type: this.indicator_type,
        score: this.score,
        value_from: this.value_from,
        value_to: this.value_to,
      }
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false

      return this.indicator_type !== this.initialFormState.indicator_type ||
        this.score !== this.initialFormState.score ||
        this.value_from !== this.initialFormState.value_from ||
        this.value_to !== this.initialFormState.value_to
    }
  }
}
</script>