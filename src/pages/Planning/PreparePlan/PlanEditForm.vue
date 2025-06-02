<!--
File: PlanEditForm.vue
Description: show list/pivot of Condition Index Criteria.
-->
<template>
  <modal v-if="eligible" :title="screenTitle" :form="formName" :errCount="errors.count()"
    :hasUnsavedChanges="hasUnsavedChanges" @close="$emit('close')" @save="validate">

    <template slot='body'>
      <div class="md-layout">
        <div class="md-layout-item md-size-60">
          <RegionsDropdown :class="getClass('fk_region')" :label="$t('road_network.region')" v-model="fk_region"
            data-vv-name="fk_region" v-validate="modelValidations.fk_region" />
        </div>

        <div class="md-layout-item md-size-40">
          <md-field :class="getClass('year')">
            <label for="year">{{ $t('stdCols.year') }}</label>
            <md-input id="year" v-model="year" type="number" data-vv-name="year" required
              v-validate="modelValidations.year" min="2021" />
          </md-field>
        </div>

        <div class="md-layout-item md-size-100">
          <md-field :class="getClass('name')">
            <label for="name">{{ $t('stdCols.name') }}</label>
            <md-input id="name" v-model="name" type="text" data-vv-name="name" required
              v-validate="modelValidations.name" :placeholder="$t('label.enter_name')" />
          </md-field>
        </div>
      </div>
    </template>
  </modal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { Modal, RegionsDropdown } from '@/pages/Components'
import { savedMessage } from '@/mixins/messagesMixin'
import permissions from "@/mixins/permissionsMixin"

export default {
  name: 'edit-profile-form',
  mixins: [permissions],

  data() {
    return {
      formName: 'PlanEditForm',
      eligible: false,

      fk_region: 0,
      year: new Date().getFullYear(),
      name: '',

      initialFormState: null,
      modelValidations: {
        fk_region: { required: true, numeric: true, min_value: 1 },
        year: { required: true, numeric: true, min_value: 2021 },
        name: { required: true, min: 3 }
      }
    }
  },

  props: {
    plan: { default: {}, type: Object },
  },

  components: {
    Modal,
    RegionsDropdown
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed();
    if (!this.eligible) {
      this.$emit('close');
      return;
    };

    if (this.plan) {
      this.fk_region = this.plan.fk_region;
      this.year = this.plan.year;
      this.name = this.plan.name;
    }

    this.$nextTick(() => {
      this.initialFormState = this.getCurrentState;
      this.$validator.validateAll();
    })
  },

  methods: {
    ...mapActions({
      //loadById: 'ReferenceData/LOAD_CONDITION_INDEX_CRITERIA_BY_ID',
      addItem: 'Planning/ADD_NEW_PLAN',
      editItem: 'Planning/UPDATE_PLAN',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    async validate() {
      const isValid = await this.$validator.validateAll()
      if (!isValid) return

      const theItem = this.getCurrentState;
      let errDesc = '';
      let newId;
      const action = !this.plan ? this.addItem : this.editItem;
      const payload = !this.plan ? theItem : { id: this.plan.id, theItem }
      try {
        const res = await action(payload)
        newId = res?.id;
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error')
      }

      this.$nextTick(() => this.$validator.reset())
      this.$emit('saved')

      await savedMessage(errDesc, this.$t('messages.plan_change'), this.name)
      this.highlightRow(newId)
    },
  },

  computed: {
    ...mapGetters(['planListByYear']),

    screenTitle() {
      return this.plan ? this.$t('screen_titles.plan_upd') : this.$t('screen_titles.plan_add')
    },

    getCurrentState() {
      return {
        fk_region: this.fk_region,
        year: Number(this.year),
        name: this.name
      }
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false

      return this.fk_region !== this.initialFormState.fk_region ||
        Number(this.year) !== this.initialFormState.year ||
        this.name !== this.initialFormState.name
    }
  }
}
</script>