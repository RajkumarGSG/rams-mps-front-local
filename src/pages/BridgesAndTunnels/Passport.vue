<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <div class="btn-row">
        <md-button v-if="isBtnAllowed('PrintButton')" class="md-success" @click="onPassportPrint">
          {{ $t('buttons.print') }}
        </md-button>
      </div>
      <component v-bind:is="currentPassport" id="passportForm" :pas_details="dataObject" v-if="!isDataLoading" />
    </div>
  </div>
</template>

<script>
import permissions from "@/mixins/permissionsMixin"
import bridge_passport_form from './bridge'
import tunnel_passport_form from './tunnel'

export default {
  name: 'passport-form',
  mixins: [permissions],

  data() {
    return {
      formName: 'Passport',

      dataObject: {},
      isDataLoading: true
    }
  },
  props: ['uuid', 'target'],

  components: {
    bridge_passport_form,
    tunnel_passport_form
  },

  async mounted() {
    // Check if we are eligible to view the form
    if (!this.checkIfScreenAllowed()) {
      this.onClose()
      return
    };

    this.isDataLoading = true
    try {
      const act = `load_${this.target}_details`.toUpperCase()
      const res = await this.$store.dispatch(act, this.uuid)
      this.dataObject = { ...res }
    } catch (err) {
      console.log(err)
    } finally {
      this.isDataLoading = false
    }
  },

  computed: {
    currentPassport() {
      return `${this.target}_passport_form`
    }
  },

  methods: {
    onPassportPrint() {
      const options = {
        name: '_blank',
        specs: ['fullscreen=yes', 'titlebar=yes', 'scrollbars=yes'],
        styles: [
          '/print.css',
          'https://vuematerial.io/vue-material.min.css',
          'https://fonts.googleapis.com/icon?family=Material+Icons'
        ]
      }
      this.$htmlToPaper('passportForm', options)
    }
  }
}
</script>

<style lang="scss">
.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
