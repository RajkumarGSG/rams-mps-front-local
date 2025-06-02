import Api from '@/api/login'

export default {
  state: {
    token: localStorage.getItem('mps-token') || '',
    authStatus: '',
    me: {},
    sysinfo: {}
  },

  actions: {
    async LOGIN({ commit, dispatch }, formData) {
      commit('AUTH_REQUEST')
      const { login, password } = formData

      try {
        const { status, data } = await Api.login({ login, password })
        const { access_token } = data
        if (status === 200 && access_token) {
          localStorage.setItem('mps-token', access_token)
          commit('AUTH_SUCCESS', access_token)
          commit('SET_HEADER_AUTH')
          return 'success'
        } else {
          throw Error('Authorization error')
        }
      } catch (err) {
        commit('AUTH_ERROR')
        localStorage.removeItem('mps-token') // if the request fails, remove any possible user token if possible
      }
    },

    async LOGOUT({ commit }) {
      localStorage.removeItem('mps-token')
      await Api.logout()
      await Api.delHeaderAuth()
      commit('AUTH_LOGOUT')
    },

    async GET_MY_PROFILE({ commit, dispatch }) {
      try {
        const {data} = await Api.get_profile()
        commit('SET_USER', data)
      } catch (e) {
        dispatch('LOGOUT')
        throw new Error('Error while getting profile')
      }
    },

    async PASSWORD_RECOVERY({ }, email) {
      try {
        const {status} = await Api.password_recovery_request(email)
        if (status !== 202) {
          throw new Error(`Did not find indicated email: ${status}`);
        }
      } catch ({ response }) {
        throw new Error(response?.data?.msg || 'Unknown error');
      }
    },
    // async SAVE_RECOVERY_PASSWORD({commit}, payload) {
    //   const {token, password} = payload
    //   try {
    //     const resp = await Api.save_req_pass(token, password)
    //     const code = resp.status
    //     if (code !== 200) {
    //       console.log(result)
    //     }
    //   } catch (error) {}
    // }

    async GET_SYSINFO({ commit }) {
      try {
        const { status, data } = await Api.get_sysinfo()
        if (status === 200) {
          commit('SET_SYSINFO', data)
          return 'success'
        } else {
          throw new Error(`GET_SYSINFO status: ${status}`);
        }
      } catch ({ response }) {
        throw new Error(response?.data?.msg || 'Failed to get sys_info');
      }
    },
  },

  mutations: {
    AUTH_REQUEST: (state) => {
      state.authStatus = 'loading'
    },
    AUTH_SUCCESS: (state, token) => {
      state.token = token
      state.authStatus = 'success'
    },
    AUTH_ERROR: (state) => {
      state.authStatus = 'error'
    },
    AUTH_LOGOUT: (state) => {
      state.authStatus = ''
      state.token = ''
      state.me = {}
    },
    SET_HEADER_AUTH: (state) => {
      if (!Api.isSetHeaderAuth()) {
        Api.setHeaderAuth(state.token)
      }
    },
    SET_USER: (state, _profile) => {
      state.me = { ..._profile }
    },
    SET_SYSINFO: (state, info) => {
      state.sysinfo = { ...info }
    }
  },

  getters: {
    hasToken: (state) => Boolean(state.token),
    profileLoaded: (state) => Object.keys(state.me) > 0,
    amIAdmin: (state) => state.me.role === 'admin',
    amIFromRMD: (state) => state.me.access_level === 0,
    myGroupId: (state) => state.me.group_id,

    userName: (state) => `${state.me.first_name} ${state.me.last_name}`,
    treatmentMatrixEditable: (state) => state.me.id == 2,    // Allow Meyyappan to edit treatment matrix
    getDBName: (state) => { return state.sysinfo.db_name },
    getEnvConfig: (state) => { return state.sysinfo.env_config }
  }
}
