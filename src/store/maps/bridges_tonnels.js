import Api from '@/api/bridges_tonnels'

import { transform } from 'ol/proj'
import { apiCall, handleApiCall } from '@/store/helpers/apicall_helpers';
import { bridge_icon_template, icon_background, icon_bridge_color } from '@/store/helpers/bridges_helper'
import { GeoJsonTemp, GeoJsonFeature } from '@/store/helpers/geojson_helper'

const tunnels_uuid = [
  { uuid: 'b27f2f8b-f037-45d7-a8e4-e870dae4c9b2', name: 'Kolbaev Tunnel' },
  { uuid: 'c215b056-bd7a-4408-baf0-3f51e1b10c1b', name: 'Tunnel No.1' },
  { uuid: 'f9227432-a1c6-496b-a749-63c4e4305737', name: 'Taskomur Tunnel' },
  { uuid: '1fc71537-5aae-4ccf-a4c3-7b16f236c2be', name: 'Tunnel No.2' },
  { uuid: 'ec207b64-bdc0-4d5d-bf94-25020b787993', name: 'Tunnel No.3' }
]

export default {
  state: {
    bridges_coords: [],
    bridges_table: { vars: [], data: [] },
  },

  actions: {
    async LOAD_TUNNELS_LIST({ state, commit }, data) {
      let legend = []

      const gjSource = GeoJsonTemp()
      data.tunnels.sort((a, b) => a.reference_number - b.reference_number)
      data.tunnels.forEach((tunnel, index) => {
        const feature = GeoJsonFeature()
        feature.geometry.type = 'MultiPoint'
        const tunnel_coord = transform([tunnel.longitude_e, tunnel.latitude_n], 'EPSG:4326', 'EPSG:32643')

        const tunnel_name = tunnel.tunnel_name_ru

        const tunnel_pops = [tunnel_name, tunnels_uuid[index].uuid]

        feature.geometry.coordinates.push(tunnel_coord)
        feature.properties.data.push(tunnel_pops)
        feature.properties.localisation_keys = ['', '', '']
        feature.properties.style.type = 'icon'
        let bridge_icon = bridge_icon_template({
          icon_bridge_color,
          icon_background: icon_background[index]
        })
        feature.properties.style.image = bridge_icon.replace(/#/gi, '%23')
        feature.properties.style.scale = 0.08
        feature.properties.style.opacity = 0.6
        feature.properties.style.anchor = [0.5, 1]

        gjSource.features.push(feature)
        legend.push({
          colour: icon_background[index],
          name: tunnel.tunnel_name_ru
        })
      })
      await commit('SET_TUNNELS_LEGEND', legend)
      return gjSource
    },

    async LOAD_BRIDGES_LIST({ }, data) {
      const gjSource = GeoJsonTemp()

      data.bridges.forEach((bridge) => {
        const feature = GeoJsonFeature()
        feature.geometry.type = 'MultiPoint'
        const bridge_soundness = bridge.structural_soundness //Math.round(Math.random() * 3)
        const bridge_coord = transform([bridge.longitude_e, bridge.latitude_n], 'EPSG:4326', 'EPSG:32643')
        const bridge_route = /^(.+)_.*/.exec(bridge.route_name)[1]
        const bridge_full_name = `${bridge_route.replace(' ', '')} (${bridge.location
          })`

        const bridge_props = [bridge_full_name, bridge.bridge_uuid]
        feature.geometry.coordinates.push(bridge_coord)
        feature.properties.data.push(bridge_props)
        feature.properties.localisation_keys = ['', '', '']
        feature.properties.style.type = 'icon'
        let bridge_icon = bridge_icon_template({
          icon_bridge_color,
          icon_background: icon_background[bridge_soundness]
        })
        feature.properties.style.image = bridge_icon.replace(/#/gi, '%23')
        feature.properties.style.scale = 0.04
        feature.properties.style.opacity = 0.6
        feature.properties.style.anchor = [0.5, 0.5]

        gjSource.features.push(feature)
      })
      return gjSource
    },

    async LOAD_COORDS({ dispatch }, type) {
      const data = await apiCall(Api[`load_${type}_coords`](), 'LOAD_COORDS');
      return await dispatch(`LOAD_${type.toUpperCase()}_LIST`, data);
    },

    async LOAD_BRIDGES_TABLE_DATA({ commit }) {
      return await handleApiCall({
        request: await Api.load_bridges_table(),
        caller: 'LOAD_BRIDGES_TABLE_DATA',
        commit, mutation: 'SET_BRIDGES_TABLE'
      });
    },

    async LOAD_BRIDGE_DETAILS({ commit }, uuid) {
      const res = await apiCall(await Api.load_bridge_details(uuid), 'LOAD_BRIDGE_DETAILS')
      return res[0]
    },

    async LOAD_TUNNELS_TABLE_LIST() {
      const { tunnels } = await apiCall(await Api.load_tunnels_coords(), 'LOAD_TUNNELS_TABLE_LIST')
      return tunnels
    },

    async LOAD_TUNNEL_DETAILS({ dispatch }, uuid) {
      const data = await dispatch('LOAD_TUNNELS_TABLE_LIST')
      return data.find((tunnel) => tunnel.tunnel_uuid === uuid)
    },

    async LOAD_BASEMAP_TYPES({ commit }) {
      return await apiCall(await Api.load_basemaps(), 'LOAD_BASEMAP_TYPES')
    }
  },

  mutations: {
    SET_BRIDGES_TABLE(state, payload) {
      state.bridges_table = { ...payload }
    },

    SET_BRIDGES_COORDS(state, payload) {
      state.bridges_coords = [...payload]
    }
  },

  getters: {}
}
