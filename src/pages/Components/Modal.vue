<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h4 class='modal-title'>{{ title }}</h4>
            <md-button class='md-simple md-just-icon md-round modal-default-button' @click.stop.prevent='closeClicked'>
              <md-icon>clear</md-icon>
            </md-button>
            <slot name="header"></slot>
          </div>
          <md-divider />

          <div class="modal-body text-center">
            <slot name="body"></slot>

            <md-divider />
            <span v-if="saveDisabled" class="md-error"> {{ $t('errors.errors_count', { count: errCount }) }} </span>
            <slot name="error-info"></slot>
          </div>

          <div class="modal-footer">
            <slot name="footer"></slot>
            <md-button v-if="saveAllowed" class="md-success" native-type="submit" @click.native.prevent="saveClicked"
              :disabled="saveDisabled">
              {{ $t('buttons.save') }}
            </md-button>
            <md-button class="md-accent" @click.stop.prevent="closeClicked">
              {{ $t('buttons.cancel') }}
            </md-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import { mapGetters } from 'vuex';
import { confirmation } from '@/mixins/messagesMixin';

export default {
  name: 'modal-edit-form',

  props: {
    title: null,
    errCount: null,
    form: null,
    hasUnsavedChanges: false
  },

  methods: {
    async closeClicked() {
      if (this.hasUnsavedChanges) {
        const { isConfirmed } = await confirmation(this.$t('messages.unsaved_changes_title'), this.$t('messages.unsaved_changes'));
        if (!isConfirmed) return;
      }
      this.$emit('close');
    },

    saveClicked() {
      this.$emit('save');
    },
  },

  computed: {
    ...mapGetters('ReferenceData', ['isAllowed']),

    saveAllowed() {
      return this.isAllowed(this.form, 'Button', 'SaveButton');
    },

    saveDisabled() {
      return this.errCount > 0
    }
  }
};
</script>

<style lang="scss">
.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.md-button+.md-button {
  margin-left: 10px;
}
</style>