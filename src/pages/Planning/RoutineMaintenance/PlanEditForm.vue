<!--
File: PlanEditForm.vue
Description: form for adding/editing a single Routine Maintenance Plan.
-->
<template>
      <EditForm
        ref="dynamicForm"
        :formName="formName"
        :actionBase="'rm_plan'"
        :idFieldName="'routine_plan_id'"
        :moduleName="'Planning'"
        :itemId="itemId"
        :fields="fields"
        :validations="validations"
        @close="$emit('close')">
      </EditForm>
</template>
<script>
import { mapActions } from 'vuex'
import { EditForm } from '@/pages/Components'
import { savedMessage } from '@/mixins/messagesMixin'
import permissions from "@/mixins/permissionsMixin"

export default {
  name: 'rm-plan-edit-form',
  mixins: [permissions],

  data() {
    return {
      formName: 'Plans',
      eligible: false,

      year: new Date().getFullYear(),
      fk_region: null,
      fk_deu: null,
      fk_work_category: null,

      // TODO: remove 3 lines below after API implmenetation
      region: null,
      deu: null,
      road: null,

      initialFormState: null,
    }
  },

  props: {
    itemId: null
  },

  components: {
    EditForm,
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      this.$emit('close');
      return
    };

    if (this.itemId) {
      // Load data on existing DEU
      const theItem = await this.loadItem(this.itemId)
      this.fk_region = theItem.fk_region
      this.year = theItem.year
      this.fk_deu = theItem.fk_deu
      //this.fk_road = theItem.fk_road
      //this.plan_name = theItem.plan_name
    }
    this.$nextTick(async () => {
      this.initialFormState = this.getCurrentState;
      await this.$validator.validateAll();
    });
  },

  methods: {
    ...mapActions({
      loadItem: 'Planning/LOAD_RM_PLAN_BY_ID',
      addItem: 'Planning/ADD_NEW_RM_PLAN',
      editItem: 'Planning/UPDATE_RM_PLAN',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    onDeuChange(id, desc) {
      // TODO: remove this method after API implmentation, as well as in the template section
      this.deu = desc
    },

    /*
    onRoadChange(id, desc){
      // TODO: remove this method after API implmentation, as well as in the template section
      this.road = desc
    },
*/
    async validate() {
      const isValid = await this.$validator.validateAll()
      if (!isValid) return

      const theItem = this.getCurrentState;
      // TODO: remove 3 lines below after API implmenetation
      theItem.deu_description = this.deu
      //theItem.road_description = this.road

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
      await savedMessage(errDesc, this.$t('stdCols.plan_name'), this.plan_name)
      this.highlightRow(newId)
    },
  },

  computed: {
    screenTitle() {
      return this.planId ? this.$t('screen_titles.plan_upd') : this.$t('screen_titles.plan_add')
    },

    getCurrentState() {
      return {
        fk_region: this.fk_region,
        year: this.year,
        fk_deu: this.fk_deu,
        //fk_road: this.fk_road,
        plan_name: this.plan_name,
      }
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false

      return this.fk_region !== this.initialFormState.fk_region ||
        this.year !== this.initialFormState.year ||
        this.fk_deu !== this.initialFormState.fk_deu ||
        this.fk_work_category !== this.initialFormState.fk_work_category
    },

    fields() {
      //this.fk_region = this.itemValues.fk_region;
      return [
        { name: 'year', label: 'selections.select_year', type: 'number', class: 'md-layout-item md-size-40' },
        { name: 'fk_region', type: 'custom', component: 'RegionsDropdown', class: 'md-layout-item md-size-60' },
        { name: 'fk_work_category', type: 'custom', component: 'WorkCategoriesDropdown', class: 'md-layout-item md-size-60', props: { routine: 1 } },
        { name: 'fk_deu', type: 'custom', component: 'DepsDropdown', class: 'md-layout-item md-size-40', props: { regionId: 'fk_region' } },
      ]
    },

    validations() {
      return {
        year: { required: true, numeric: true, min_value: 2024 },
        fk_region: { required: true, numeric: true, min_value: 1 },
        fk_deu: { required: true, numeric: true, min_value: 1 },
        fk_work_category: { required: true, numeric: true, min_value: 1 },
      };
    },
  }
}
</script>