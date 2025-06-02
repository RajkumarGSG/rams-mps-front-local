//import Api from '@/api/i18n'
import { localisationApi } from '@/api/reference_data';

import { locales, defaultLocale } from './locales'
import i18n from '../../i18n'
import { apiCall, handleApiCall } from '@/store/helpers/apicall_helpers';
import { getUniqueValues } from '@/store/helpers/unique_values.js';

export default {
  state: {
    locales: [],
    active: defaultLocale,
    translationList: [],
    UiTranslateLoaded: false
  },

  actions: {
    async LOAD_UI_TRANSLATE({ commit }, lang) {
      const res = await apiCall(localisationApi.load_ui_messages(lang), 'LOAD_UI_TRANSLATE');
      i18n.setLocaleMessage(lang, res)
      commit('SET_UI_TRANSLATE_LOAD_STATE', true)
      return res
    },

    async CLEAR_TRANSLATION_LIST({ commit }) {
      commit('SET_TRANSLATION_LIST', []);
      return 'success';
    },

    async LOAD_TRANSLATION_LIST({ commit }) {
      return await handleApiCall({
        request: localisationApi.load_translation_list(),
        caller: 'LOAD_TRANSLATION_LIST',
        commit, mutation: 'SET_TRANSLATION_LIST'
      });
    },

    async LOAD_TRANSLATION_BY_ID({ state }, id) {
      return state.translationList.find(item => item.id == id);
    },

    async ADD_NEW_TRANSLATION({ commit }, item) {
      const res = await apiCall(localisationApi.addNew(item), 'ADD_NEW_TRANSLATION', 201);
      commit('ADD_TRANSLATE_ITEM', res)
      return res
    },

    async UPDATE_TRANSLATION({ commit }, { id, theItem }) {
      const res = await apiCall(localisationApi.update(id, theItem), 'UPDATE_TRANSLATION');
      commit('UPDATE_TRANSLATE_ITEM', res)
      return res
    }
  },

  mutations: {
    SET_UI_TRANSLATE_LOAD_STATE(state, status) {
      state.UiTranslateLoaded = status
    },

    INIT_LANG: (state) => {
      state.locales = [...locales]
      i18n.locale = state.active
    },

    CHANGE_LANG(state, code) {
      state.active = code
      localStorage.setItem('mps-locale', code)
      i18n.locale = state.active
    },

    SET_TRANSLATION_LIST(state, list) {
      state.translationList = list
    },

    ADD_TRANSLATE_ITEM(state, item) {
      state.translationList.push(item)
    },

    UPDATE_TRANSLATE_ITEM(state, item) {
      const { id, category, key, en, ru, kg } = item
      const ind = state.translationList.findIndex(el => el.id == id)
      if (ind > -1) {
        state.translationList[ind].category = category
        state.translationList[ind].key = key
        state.translationList[ind].en = en
        state.translationList[ind].ru = ru
        state.translationList[ind].kg = kg
      }
    }
  },

  getters: {
    locale_active: (state) => state.active,

    isUiTranslateLoaded: (state) => state.UiTranslateLoaded,

    getTranslationCategories: (state) => {
      return getUniqueValues(state.translationList, 'category', '', true);
    },

    getFilteredTranslations: (state) => (category) => {
      return state.translationList.filter(el => (!category || el.category === category));
    }
  }
}