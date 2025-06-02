<template>
  <div class="md-layout text-center">
    <div class="md-layout-item md-size-33 md-medium-size-50 md-small-size-70 md-xsmall-size-100">
      <login-card header-color="green">
        <h3 slot="title" class="title">{{ $t('label.app_titul') }}</h3>
        <p slot="description" class="description">{{ $t('screen_titles.login') }}</p>
        
        <div slot="langs" class="lang-buttons">
          <md-button v-for="locale in locales" :key="locale" @click="switchLocale(locale)"
            class="md-primary md-just-icon ms-sm" :class="{ 'md-simple': locale !== activeLocale }">
            {{ locale }}
          </md-button>
        </div>

        <form slot="form" @submit.prevent="onEnter">
          <md-field class="md-form-group" slot="inputs">
            <md-icon>face</md-icon>
            <label for="login">{{ $t('users.user_login') }}</label>
            <md-input id="login" v-model="login"></md-input>
          </md-field>
          <md-field class="md-form-group" slot="inputs" :class="{ 'md-invalid': authStatus === 'error' }">
            <md-icon>lock_outline</md-icon>
            <label for="password">{{ $t('users.user_password') }}</label>
            <md-input id="password" v-model="password" type="password"></md-input>
            <span class="md-error">{{ $t('errors.auth_error') }}</span>
          </md-field>
          <div class="md-layout">
            <div class="md-layout-item">
              <md-button slot="footer" class="md-simple md-success md-lg" type="submit">
                {{ $t('buttons.enter') }}
              </md-button>
            </div>
          </div>
          <a href @click.stop.prevent="onPassModalShow" class="md-caption">
            {{ $t('label.lnkPassRec') }}
          </a>
        </form>
      </login-card>
    </div>

    <modal v-if="passwdModal" class="small-alert-modal" :title="$t('label.lnkPassRec')" @close="passwdModalHide">
      <template slot="body">
        <p v="html">{{ $t('label.forgot_pass_descr') }}</p>
        <md-field>
          <label for="email">{{ $t('label.email') }}</label>
          <md-input id="email" v-model="reqEmail"></md-input>
        </md-field>
      </template>

      <template slot="footer">
        <md-button class="md-success" @click="onReqPassRecovery">
          {{ $t('buttons.send') }}
        </md-button>
      </template>
    </modal>
  </div>
</template>
<script>
  import { mapState, mapActions, mapMutations } from 'vuex'
  import { Modal } from '@/pages/Components'
  import { LoginCard } from '@/components'
  import messages from '@/mixins/messagesMixin'

  export default {
    name: 'login-form',
    mixins: [messages],

    data() {
      return {
        login: null,
        password: null,
        passwdModal: false,
        reqEmail: ''
      }
    },

    components: {
      LoginCard,
      Modal
    },

    async mounted() {
      await this.$store.commit('INIT_LANG')
      //await this.initLang();
    },

    methods: {
      ...mapActions({
        userLogin: 'LOGIN',
        passRecovery: 'PASSWORD_RECOVERY',
        getMyProfile: 'GET_MY_PROFILE',
        loadTranslations: 'LOAD_UI_TRANSLATE',
        getPermissions: 'ReferenceData/GET_USER_PERMISSIONS'
      }),

      ...mapMutations({
        initLang: 'INIT_LANG',
        switchLocale: 'CHANGE_LANG'
      }),

      passwdModalHide() {
        this.reqEmail = ''
        this.passwdModal = false
      },

      onPassModalShow() {
      console.log(this.$t('screentitles.login'))
        this.passwdModal = true
      },

      async onReqPassRecovery() {
        if (!this.reqEmail) {
          return
        }

        this.passwdModalHide()
        try {
          await this.passRecovery(this.reqEmail)
          this.successMessage('', this.$t('messages.recovery_mail_was_sent'))
        } catch (err) {
          this.errorMessage(`${this.$t('messages.recovery_mail_was_not_sent')} ${err}`)
        }
      },

      getValidationClass(fieldName) {
        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty
          }
        }
      },

      async onEnter() {
        const { login, password } = this
        await this.userLogin({ login, password })
        if (this.authStatus === 'success') {
          /*
          await this.getMyProfile()
          await this.getPermissions(this.me.id)
          */
          this.loadTranslations(this.activeLocale)
          this.$router.push(`home`)
        } else if (this.authStatus === 'error') {
          this.password = ''
        }
      },
    },

    computed: {
      ...mapState({
        me: (state) => state.Login.me,
        authStatus: (state) => state.Login.authStatus,
        localeList: (state) => state.i18nStore.locales,
      }),

      locales() {
        return this.localeList.map((locale) => locale.code)
      },

      activeLocale() {
        return this.$i18n.locale
      }
    }
  }
</script>

<style lang="scss">
.mp-invalid {
  color: red;
}

.modal-container {
  color: #3c4858;

  margin: 0 auto;
}

.lang-buttons {
  display: flex;
  justify-content: flex-end;

  .md-button {
    font-size: 16px;
  }
}

.description {
  padding-top: 10px;
}
</style>
