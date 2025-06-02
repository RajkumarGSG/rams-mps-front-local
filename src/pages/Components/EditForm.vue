<!--
File: EditForm.vue
Description: Component for adding/editing a single entry.
-->
<template>
  <modal
    v-if="eligible"
    :title="screenTitle"
    :form="formName"
    :errCount="errors.items.length"
    :hasUnsavedChanges="hasUnsavedChanges"
    @close="$emit('close')"
    @save="validate">

    <template #body>
      <div class="md-layout">
        <slot name="fields_before"></slot>
      </div>
      
      <EditFields
        ref="dynamicForm"
        v-model="item"
        :fields="fields"
        :validations="validations"
      />
      <slot name="fields_after"></slot>
    </template>

    <template #footer>
      <slot name="footer"></slot>
    </template>
  </modal>
</template>
<script>
import { mapActions } from 'vuex'
import { Modal, EditFields } from '@/pages/Components'
import { savedMessage } from '@/mixins/messagesMixin'
import permissions from "@/mixins/permissionsMixin"

export default {
  name: 'edit-form',
  mixins: [permissions],

  data() {
    return {
      eligible: false,
      item: {},
      initialFormState: null,
    }
  },

  props: {
    itemId: null,
    actionBase: '',
    formName: '',
    idFieldName: '',
    value: { default: null, type: Object },
    moduleName: '',
    fields: [],
    validations: [],
    messageTitle: ''
  },

  components: {
    Modal,
    EditFields
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      this.$emit('close');
      return
    };

    if (this.itemId) { // Load data
      if(this.valueProvided) {
        this.item = this.value;
      } else try {
        this.item = await this.$store.dispatch(this.loadAction, this.itemId);
      } catch (error) {
        //throw new Error(error?.data?.msg || error?.data?.message || `Failed: ${this.loadAction}`);
        console.error(`Failed to dispatch action "${this.loadAction}":`, error);
      };
    };
    this.$nextTick(async () => {
      this.initialFormState = this.getCurrentState;
      await this.$refs.dynamicForm.validateForm();
    });
  },

  methods: {
    ...mapActions({
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    async validate() {
      const isValid = await this.$validator.validateAll()
      if (!isValid) return

      const theItem = this.getCurrentState;

      let errDesc = '';
      let newId;
      const payload = !this.itemId ? theItem : { id: this.itemId, theItem };
      try {
        const res = await this.$store.dispatch(this.saveAction, payload);
        newId = res[this.idFieldName];
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error')
      }

      this.$nextTick(() => this.$validator.reset())
      this.$emit('close');
      // TODO: Consider changing the title
      await savedMessage(errDesc, this.screenTitle, this.messageTitle);
      this.highlightRow(newId)
    },
  },

  computed: {
    screenTitle() {
      const suffix = this.itemId ? 'upd' : 'add'
      return this.$t(`screen_titles.${this.actionBase}_${suffix}`)
    },

    valueProvided(){
      return this.value !== null && this.value !== {};
    },

    actionUpCase() {
      return this.actionBase.toUpperCase();
    },

    modulePrefix(){
      return this.moduleName ? `${this.moduleName}/` : '';
    },

    loadAction() { // Create the action name dynamically
      return `${this.modulePrefix}LOAD_${this.actionUpCase}_BY_ID`;
    },

    saveAction() { // Create the action name dynamically
      return `${this.modulePrefix}${!this.itemId ? 'ADD_NEW' : 'UPDATE'}_${this.actionUpCase}`;
    },

    getCurrentState() {
      const res = {};
      this.fields.forEach(item => {
        const defValue = item.type === 'switch' ? false : '';
        const val = this.item[item.name] || item?.default || defValue;
        res[item.name] = item.type === 'number' ? Number(val) : val; // TODO: Add check if type==='custom' (BaseDropdown, mostly numeric)
      });
      return res;
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false;

      const keys = Object.keys(this.initialFormState);
      for (let key of keys) {
        if (this.item[key] !== this.initialFormState[key]) return true;
      }
      return false;
    }
  }
}
</script>