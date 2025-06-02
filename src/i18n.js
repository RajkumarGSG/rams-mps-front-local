import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from './store/i18n/messages/'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: localStorage.getItem('mps-locale') || 'en', // set locale
  fallbackLocale: 'en',
  messages: messages, // set locale messages
  silentTranslationWarn: true
})

export default i18n
