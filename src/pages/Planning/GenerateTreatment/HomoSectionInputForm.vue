<!--
File: HomoSectionInputForm.vue
Description: form for entering parameters for generatin homogeneous sections list.
-->
<template>
  <modal v-if="eligible" :title="screenTitle" :form="formName" :errCount="errors.count()"
    @close="$emit('close')" @save="validate">

    <template slot='body'>
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-50">
          <YearsDropdown :label="$t('label.from_year')" v-model="selectedYearFrom" /> 
        </div>
        <div class="md-layout-item md-small-size-100 md-size-50">
          <YearsDropdown :label="$t('label.to_year')" v-model="selectedYearTo" />
        </div>
      </div>
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-50">
          <md-field :class="getClass('ciThreshold')">
            <label for="ciThreshold">{{ $t('stdCols.range') }}</label>
            <md-input id="ciThreshold" v-model="ciThreshold" data-vv-name="ciThreshold" type="number" min=1 max=50
              required v-validate="modelValidations.ciThreshold" />
          </md-field>
        </div>
        <div class="md-layout-item md-small-size-100 md-size-50">
          <md-field :class="getClass('minHsLength')">
            <label for="min_hs_length">{{ $t('label.min_hs_length') }}</label>
            <md-input id="min_hs_length" v-model="minHsLength" data-vv-name="minHsLength" type="number" min=100 max=5000
              step=100 required v-validate="modelValidations.minHsLength" />
          </md-field>
        </div>
      </div>
    </template>

    <template slot='footer'>
      <md-button class="md-success" native-type="submit" @click.native.prevent="validate" :disabled="saveBtnDisabled">
        {{ $t('buttons.generate') }}
      </md-button>
    </template>
  </modal>
</template>
<script>
import { mapState } from 'vuex'
import { Modal, YearsDropdown } from '@/pages/Components'
import permissions from "@/mixins/permissionsMixin"
import messages from '@/mixins/messagesMixin'

export default {
  name: 'homosection-parameters-input-form',
  mixins: [permissions, messages],

  data() {
    return {
      formName: 'HomoSectionInputForm',
      eligible: false,

      selectedYearFrom: null,
      selectedYearTo: null,
      years: [],
      minHsLength: 100,
      ciThreshold: 10,

      modelValidations: {
        minHsLength: { required: true, numeric: true, min_value: 100, max_value: 5000 },
        ciThreshold: { required: true, numeric: true, min_value: 1, max_value: 50 },
      },
    }
  },

  components: {
    Modal,
    YearsDropdown
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      return
    };

    const thisYear = new Date().getFullYear()
    const yearsBack = 2 // used to set to 6 during HDM finishing in 2024
    this.selectedYearTo = thisYear
    this.selectedYearFrom = thisYear //- yearsBack
    //this.years = Array.from({ length: yearsBack + 1 }, (_, index) => ({ id: index, description: thisYear - (yearsBack - index) }));
  },

  methods: {
    async validate() {
      const isValid = await this.$validator.validateAll()
      if (!isValid) return

      // Check whether there is already generated list with same parameters 
      const exists = this.hsList.find(el =>
        el.input_year_from == this.selectedYearFrom &&
        el.input_year_to == this.selectedYearTo &&
        el.input_min_hs_length == this.minHsLength &&
        el.input_condition_index_threshold == this.ciThreshold
      )
      if (exists) {
        this.generatedListExistsMessage()
        return
      }

      // Show warning if the user selected big period (> 2 years)
      if (this.selectedYearTo - this.selectedYearFrom > 2) {
        const { isConfirmed } = await this.confirmation(
          this.$t('messages.will_take_time'),
          this.$t('messages.long_period')
        )

        // Exit if user selects cancel
        if (!isConfirmed) {
          return
        }
      }

      const params = {
        year_from: this.selectedYearFrom,
        year_to: this.selectedYearTo,
        min_hs_length: this.minHsLength,
        condition_index_threshold: this.ciThreshold
      }
      this.$emit('input', params)
    }
  },

  computed: {
    ...mapState({
      hsList: (state) => state.RoadNetwork.homo_section_list
    }),

    screenTitle() {
      return this.$t('tabs.homo_sections');
    },
  }
}
</script>