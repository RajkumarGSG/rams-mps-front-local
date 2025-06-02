/*
File: api/bridges_tonnels.js
Description: API connections for the async functions for Bridges & Tonnels.
*/
import Api_ref from '@/api'
import basemaps from '@/store/jsons/basemaps.json'

const { Api, type_json } = Api_ref.props;

const getHeaders = () => ({
  headers: {
    ...type_json
  }
});

export default {
  /*  ---------  Bridges&Tonnels  ---------------------*/
  /** Table data
   * @return {Promise<*> {}} - 200 Response
   * @throws Error
   */
  load_bridges_table() {
    return Api.get(`/bridges/table`, getHeaders());
  },

  /** Bridges coords
   * @return {Promise<*> {}} - 200 Response
   * @throws Error
   */
  load_bridges_coords() {
    return Api.get(`/bridges/coords`, getHeaders());
  },

  /** Bridge details
   * @param {string} uuid
   * @return {Promise<*> {}} - 200 Response
   * @throws Error
   */
  load_bridge_details(uuid) {
    return Api.get(`/bridges/${uuid}`, getHeaders());
  },

  /** tunnels coords
   * @return {Promise<*> {}} - 200 Response
   * @throws Error
   */
  load_tunnels_coords() {
    return Api.get(`/tunnels/coords`, getHeaders());
  },

  load_basemaps() {
    return { status: 200, data: basemaps }
  }
}