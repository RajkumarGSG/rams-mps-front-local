/*File: api/login.js
Description: API connections for the async functions for authentication.
*/
import Api_ref from '@/api'

const Api = Api_ref.props.Api
const type_json = Api_ref.props.type_json

export default {
  /**
  *
  * @param {number} token JWT token
  */

  setHeaderAuth(token) {
    //    console.log("token: ", token)
    Api.defaults.headers['Authorization'] = `Bearer ${token}`
  },

  /**
   *
   * @returns
   */
  isSetHeaderAuth() {
    const authHeader = Api.defaults.headers['Authorization']
    return /Bearer (.*)/i.test(authHeader)
  },

  delHeaderAuth() {
    delete Api.defaults.headers['Authorization']
  },

  /** Auth management */
  login(data) {
    const { login, password } = data
    return Api.post(`/auth/login`, {
      email: login,
      password
    })
  },

  logout() {
    return Api.post(`/auth/logout`)
  },

  password_recovery_request(email) {
    return Api.post(
      `/users/password-reset-request`,
      { email },
      {
        headers: {
          ...type_json
        }
      }
    )
  },

  get_profile() {
    return Api.get(`/users/me`, {
      headers: {
        ...type_json
      }
    })
  },

  /*--------- Sysinfo ---------------------*/
  get_sysinfo() {
    return Api.get(`/sysinfo`, {
      headers: {
        ...type_json
      }
    })
  },
  
}