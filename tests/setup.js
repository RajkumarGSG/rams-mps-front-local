import Vue from 'vue';
//import VueI18n from 'vue-i18n';
import { vi } from 'vitest';

// Мокаем `vue-i18n`
// Vue.use(VueI18n);

function tr(key, params) {
    const stringifiedParams = params ? ` ${JSON.stringify(params)}` : '';
    return `${key}${stringifiedParams}`
  }
  
Vue.prototype.$t = vi.fn((key, params) => tr(key, params));

// Глобальный mock для `console.warn` и `console.error`
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Глобальная настройка Vue
Vue.config.productionTip = false;
Vue.config.devtools = false;