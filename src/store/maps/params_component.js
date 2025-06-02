import {
  emptySectionInfo, emptySectionAdditionalInfo, emptySectionSurveyInfo,
  emptyBridgeInfo, emptyBridgeSurveyInfo, emptyTunnelInfo, emptyTunnelSurveyInfo,
  roadClasses2TreeGrid, sections2TreeGrid
} from "@/store/helpers/tree_grid_helper"
import { numFormat } from '@/store/helpers/format_helpers'

export default {
  state: {
    mainInfo: [],
    surveyInfo: [],
    indexInfo: [],
    roadsInfo: [],
    sectionsInfo: [],
    years: [],
    //bridges_coords: [],
    vectorTypes: [
      {
        key: 'roads', value: 'route.roads',
        legend: [
          { colour: '#CC3300', name: 'road_network.class_em' },
          { colour: '#ffcc00', name: 'road_network.class_m' },
          { colour: '#339900', name: 'road_network.class_zh' }
        ]
      },
      {
        key: 'bridges',
        value: 'label.bridges',
        legend: [
          { colour: '#CC3300', name: 'criteria.soundness_imminent' },
          { colour: '#ff9966', name: 'criteria.soundness_critical' },
          { colour: '#ffcc00', name: 'criteria.soundness_poor' },
          { colour: '#99cc33', name: 'criteria.soundness_fair' },
          { colour: '#339900', name: 'criteria.soundness_good' }
        ]
      },
      { key: 'tunnels', value: 'label.tunnels', legend: [] }
    ],
    sectionsList: [],
    deuList: [],
    deuLabel: 'DEU-'
  },

  data() {
    return {
      showLegendBox: true,
      ol: undefined,
    }
  },

  actions: {
    async FILL_SECTION_INFO({ dispatch, commit, state }, section_id) {
      let result = []
      const road = state.sectionsList.find(item => item.road_id === section_id)?.road_description

      const section = await dispatch('LOAD_SECTION_BY_ID', section_id)
      if (section) {
        emptySectionInfo.forEach(({ name, label, isNum }) => {
          let value = section[name]

          switch (name) {
            case 'road':
              value = road;
              break;
            case 'region_id':
              value = state.deuList.find(item => item.fk_region === section.fk_region)?.region;
              break;
            case 'dep':
              value = `${state.deuLabel}-${value}`;
              break;
          }
          if (isNum) value = numFormat(value, 0);
          result.push({ name, label, value });
          if (name === 'section_description') {
            commit('SET_SELECTION_INFO', value, true) //Set selected section name to show in the status line under the map
          }
        })

        // Fill additional section attributes
        emptySectionAdditionalInfo.forEach(({ name, label }) => {
          const value = section[name]
          if (value) {
            result.push({ name, label, value })
          }
        })
      }
      commit('SET_TREE_GRID_MAIN_INFO', result)
    },

    async FILL_SECTION_SURVEY_INFO({ dispatch, commit }, payload) {
      const { year, coords } = payload
      // TODO: implement filtering by year
      //year = Number(year)
      let result_survey = []
      const fnName = Array.isArray(coords) ? 'GET_CONDITION_DATA_BY_COORDS' : 'LOAD_CONDITION_BY_ID'

      const section_data = await dispatch(fnName, coords)
      if (section_data) {
        emptySectionSurveyInfo.forEach(({ name, label }) => {
          let value = section_data[name]
          if (value) {
            if (name === 'survey_date') {
              value = new Date(value).toLocaleDateString()
            }
            result_survey.push({ name, label, value })
          }
        })
      }

      commit('SET_TREE_GRID_SURVEY_INFO', result_survey)
      return 'success'
    },

    async FILL_TREE_GRID_INDEX_INFO({ commit }, year) {
      // TODO: implement in the same style
      commit('SET_TREE_GRID_INDEX_INFO', [])
      return 'success'
    },

    async FILL_BRIDGE_TUNNEL_INFO({ dispatch, commit }, { layer, uuid }) {
      let result_info = []
      let result_survey = []

      const emptyInfo = layer === 'bridge' ? emptyBridgeInfo : emptyTunnelInfo
      const emptySurveyInfo = layer === 'bridge' ? emptyBridgeSurveyInfo : emptyTunnelSurveyInfo
      const fnName = `LOAD_${layer.toUpperCase()}_DETAILS`
      const res = await dispatch(fnName, uuid)
      if (res) {
        emptyInfo.forEach(({ name, label }) => {
          const value = res[name]
          if (value) {
            result_info.push({ name, label, value })
          }
        })

        emptySurveyInfo.forEach(({ name, label }) => {
          const value = res[name]
          if (value) {
            result_survey.push({ name, label, value })
          }
        })
      }
      commit('SET_TREE_GRID_MAIN_INFO', result_info)
      commit('SET_TREE_GRID_SURVEY_INFO', result_survey)

      return 'success'
    },

    async LOAD_ROADS_BY_CLASSES_GRID_INFO({ dispatch, commit, state }, prefix) {
      if (typeof (prefix) !== 'undefined') state.deuLabel = prefix

      // Change to API call (ticket #55) when it will be ready
      // Get the list of Roads and Sections and normalize it
      const tmp = await dispatch('LOAD_SECTION_LIST', { forDropdown: true })
      state.sectionsList = tmp.map(item => ({
        road_key: item.road_key,
        deu_id: item.deu_id,
        road_id: item.road_id,
        road_description: item.road,
        section_description: item.section_description,
        section_id: item.section_id
      }))
        .sort((a, b) => {
          let res = a.road_description.localeCompare(b.road_description, undefined, { sensitivity: 'base' })
          if (res == 0) { res = a.section_description.localeCompare(b.section_description, undefined, { sensitivity: 'base' }) }
          return res
        })

      const result = roadClasses2TreeGrid(state.sectionsList);
      commit('SET_ROADS_BY_CLASSES_GRID_INFO', result)
      dispatch('LOAD_SECTIONS_GRID_INFO')
    },

    async LOAD_SECTIONS_GRID_INFO({ dispatch, commit, state }) {
      // Get the list of Regions and DEUs and normalize it
      const tmp = await dispatch('LOAD_DEU_LIST', { forDropdown: true })
      state.deuList = tmp.map(item => ({
        deu_id: item.deu_id,
        description: `${state.deuLabel}-${item.description}`,
        fk_region: item.fk_region,
        region: item.region
      }))
        .sort((a, b) => {
          let res = a.region.localeCompare(b.region, undefined, { sensitivity: 'base' })
          if (res == 0) { res = a.description.localeCompare(b.description, undefined, { sensitivity: 'base' }) }
          return res
        })

      const result = sections2TreeGrid(state.deuList, state.sectionsList);
      commit('SET_SECTIONS_GRID_INFO', result)
    },
    /*
        async LOAD_SHOW_TYPES({ dispatch }) {
          await dispatch('LOAD_CONDITION_LIST', this.section_id).then(() => {
            const conditionList = this.$store.state.Condition.list
            if (this.emptyData) return // no data for the given section
    
          })
        },
      */
  },

  mutations: {
    SET_TREE_GRID_MAIN_INFO(state, list) {
      state.mainInfo = [...list]
    },
    SET_TREE_GRID_SURVEY_INFO(state, list) {
      state.surveyInfo = [...list]
    },
    SET_TREE_GRID_INDEX_INFO(state, list) {
      state.indexInfo = [...list]
    },
    SET_SURVEY_YEARS_LIST(state, list) {
      state.years = [...list]
    },
    SET_ROADS_BY_CLASSES_GRID_INFO(state, list) {
      state.roadsInfo = [...list]
    },
    SET_SECTIONS_GRID_INFO(state, list) {
      state.sectionsInfo = [...list]
    },
    SET_TUNNELS_LEGEND(state, list) {
      //const ind = state.vectorTypes.findIndex((vec) => vec.key === 'tunnels')
      //state.vectorTypes[ind].legend = [...list]
      state.vectorTypes[2].legend = [...list]
    },
  },

  getters: {
  }
}