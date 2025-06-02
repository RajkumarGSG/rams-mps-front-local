// history.js
// routines to maintain history for returning back to the same state after editing
export default {
  state: {
    form: null,    // name of the screen
    data: {},     // data object to store (filters, etc.)
    use: false,   // if true then use the data
    row: null,     // row id to highlight
    closePath: null // path to return back
  },

  actions: {
    LOAD_HISTORY({ state, commit }) {
      // Consider changing to a getter
      // commit('SET_CLEAR_HISTORY'); // do not clear becaue it could be for another screen
      const { form, data, use, row } = state
      return { form, data, use, row }
    },

    SAVE_HISTORY({ commit }, payload) {
      commit('SET_HISTORY', payload);
    },

    USE_HISTORY({ commit }) {
      commit('SET_USE_HISTORY');
    },

    CLEAR_HISTORY({ commit }) {
      commit('SET_CLEAR_HISTORY');
    },

    HIGHLIGHT_ROW({ commit }, rowId) {
      commit('SET_ROW', rowId);
    },
  },

  mutations: {
    SET_HISTORY(state, payload) {
      state.form = payload.form
      state.data = payload.data
      state.use = payload?.use //false
      state.row = payload?.row_id
      state.closePath = payload?.closePath || null;
    },

    SET_USE_HISTORY(state) {
      state.use = true
    },

    SET_ROW(state, row_id) {
      state.row = row_id
      state.use = true
    },

    SET_CLEAR_HISTORY(state) {
      state.form = null
      state.data = {}
      state.use = false
      state.row = null
      state.closePath = null
    },

    SET_CLEAR_PATH(state) {
      state.closePath = null
    },
  },

  getters: {
    closePath: (state) =>  {
      return state.closePath;
    },
  }
}
