/* 
File: road_network.js
Description: implements API calls for the Road Network parameters (Regions, DEU, Roads, etc.)
*/
import { trafficInstallationApi } from '@/api/road_network'; // make sure this is at the top
import * as roadNetworkApi from "@/api/road_network";
import { createActions, apiCall, handleApiCall } from '@/store/helpers/apicall_helpers';
import { getUniqueValues } from '@/store/helpers/unique_values.js';

const {
  regionApi, deuApi, roadApi, sectionApi, sectionGeometryApi, districtApi,
  districtSectionApi, conditionApi, trafficSiteApi, homoSectionApi
} = roadNetworkApi;

// Generationf of Actions: LOAD_XXX_LIST, LOAD_XXX_BY_ID, ADD_NEW_XXX, UPDATE_XXX, DELETE_XXX, CLEAR_XXX_LIST
const regionActions = createActions(regionApi, 'REGION');
const deuActions = createActions(deuApi, 'DEU', 201);
const districtActions = createActions(districtApi, 'DISTRICT');
const districtSectionActions = createActions(districtSectionApi, 'DISTRICT_SECTION');
const roadActions = createActions(roadApi, 'ROAD');
const sectionActions = createActions(sectionApi, 'SECTION');
const sectionGeometryActions = createActions(sectionGeometryApi, 'SECTION_GEOMETRY');

const conditionActions = createActions(conditionApi, 'CONDITION', 201);
const trafficSiteActions = createActions(trafficSiteApi, 'TRAFFIC_SITE', 201);

const homoSectionActions = createActions(homoSectionApi, 'HOMO_SECTION', 201);

export default {
  //namespaced: true,
  state: {
    region_list: [],
    deu_list: [],
    road_list: [],
    section_list: [],
    section_geometry_list: [],
    district_list: [],
    district_section_list: [],

    condition_list: [],
    traffic_site_list: [],
    traffic_installation_list: [],

    homo_section_list: [],
    all_homo_sections_in_list: [],
  },

  actions: {
    ...regionActions,
    ...deuActions,
    ...roadActions,
    ...sectionActions,
    ...sectionGeometryActions,
    ...districtActions,
    ...districtSectionActions,

    ...conditionActions,
    ...trafficSiteActions,
    
    ...homoSectionActions,

    // Additional actions for Roads
    async GET_ROAD_IMPORT_TEMPLATE({ commit }) {
      return await apiCall(roadApi.get_road_import_template(), 'GET_ROAD_IMPORT_TEMPLATE');
    },

    async IMPORT_ROAD({ commit }, import_file) {
      return await apiCall(roadApi.import_road(import_file), 'IMPORT_ROAD', 201);
    },

    // Additional actions for Traffic Installation

    // Get all traffic installations
    async LOAD_ALL_TRAFFIC_INSTALLATIONS({ commit }) {
      return await apiCall(trafficInstallationApi.getAll(), 'LOAD_ALL_TRAFFIC_INSTALLATIONS');
    },

    // Get traffic installation import template
    async GET_TRAFFIC_INSTALLATION_IMPORT_TEMPLATE({ commit }) {
      return await apiCall(trafficInstallationApi.getImportTemplate(), 'GET_TRAFFIC_INSTALLATION_IMPORT_TEMPLATE');
    },

    // Import traffic installation data
    async IMPORT_TRAFFIC_INSTALLATION_EXCEL({ commit }, { formData, trafficInstallationId }) {
        return await apiCall(
          trafficInstallationApi.uploadTrafficInstallationFile(formData, trafficInstallationId),
          'IMPORT_TRAFFIC_INSTALLATION_EXCEL',
          201
        );
    },

    // Additional actions for Sections
    async GET_REGION_ROAD_FROM_SECTION({ commit }, section_id) {
      return await apiCall(sectionApi.get_region_road_id_from_section(section_id), 'GET_REGION_ROAD_FROM_SECTION');
    },

    async GET_SECTION_IMPORT_TEMPLATE({ commit }) {
      return await apiCall(sectionApi.get_section_import_template(), 'GET_SECTION_IMPORT_TEMPLATE');
    },

    async IMPORT_SECTION({ commit }, import_file) {
      return await apiCall(sectionApi.import_section(import_file), 'IMPORT_SECTION', 201);
    },

    // Additional actions for Condition
    async LOAD_CONDITION_DATA_FOR_CHART({ commit }, payload) {
      if (payload?.section_id == null || payload?.section_id == '') { return [] }
      return await apiCall(conditionApi.loadList(payload), 'LOAD_CONDITION_DATA_FOR_CHART');
    },

    async GET_CONDITION_DATA_BY_COORDS({ commit }, coords) {
      const x = Math.round(coords[0])
      const y = Math.round(coords[1])
      return await apiCall(conditionApi.get_condition_data_by_coords(x, y), 'GET_CONDITION_DATA_BY_COORDS');
    },

    async LOAD_YEAR_LIST({ commit }) {
      return await apiCall(conditionApi.load_years_dropdown_list(), 'LOAD_YEAR_LIST');
    },

    async GET_IRI_IMPORT_TEMPLATE({ commit }) {
      return await apiCall(conditionApi.get_iri_import_template(), 'GET_IRI_IMPORT_TEMPLATE');
    },

    async GET_RUTTING_IMPORT_TEMPLATE({ commit }) {
      return await apiCall(conditionApi.get_rutting_import_template(), 'GET_RUTTING_IMPORT_TEMPLATE');
    },

    async IMPORT_DATA100({ commit }, { import_files, section_id }) {
      return await apiCall(conditionApi.import_data100(import_files, section_id), 'IMPORT_DATA100', 201);
    },

    // Additional actions for Homogeneous sections
    async APPROVE_HOMO_SECTION_LIST({ commit }, homoSectionListId) {
      return await apiCall(homoSectionApi.approve_homo_section_list(homoSectionListId), 'APPROVE_HOMO_SECTION_LIST', 201);
    },

    async CANCEL_HOMO_SECTION_LIST({ commit }, homoSectionListId) {
      return await apiCall(homoSectionApi.cancel_homo_section_list(homoSectionListId), 'CANCEL_HOMO_SECTION_LIST', 201);
    },

    async LOAD_ALL_HOMO_SECTIONS({ commit }, homoSectionListId) {
      return await handleApiCall({
        request: homoSectionApi.load_all_homo_sections(homoSectionListId),
        caller: 'LOAD_ALL_HOMO_SECTIONS',
        commit, mutation: 'SET_LIST',
        mutationKey: 'all_homo_sections_in_list'
      });
    },
  },

  mutations: {
    SET_LIST(state, { key, data }) {
      if (state.hasOwnProperty(key)) {
        state[key] = [...data];
      } else {
        console.warn(`SET_LIST: State key "${key}" not found`);
      }
    }
  },

  getters: {
    // ------------------ Getters for DEU
    deuWithPrefix: (state) => (deuLabel) => {
      return state.deu_list.map(item => ({
        ...item,
        description: `${deuLabel}-${item.description}`
      }))
    },

    // ------------------ Getters for Section
    sectionsWithPrefix: (state) => (deuLabel) => {
      return state.section_list.map(item => ({
        ...item,
        deu: `${deuLabel}-${item.deu}`
      }))
    },

    roadsList: (state) => {
      return getUniqueValues(state.section_list, 'road', 'road_id', false, 'deu_id');
    },

    roadsListFiltered: (state, getters) => (deu_id, addEmptyItem = true) => {
      const res = getters.roadsList.filter(item => (!deu_id || item.deu_id === deu_id))
      if (addEmptyItem) { // Add null value to the beginnig
        res.unshift({ id: 0, description: '', deu_id: null })
      }
      return res
    },

    lastGeometry: (state) => {
      const len = state.section_geometry_list.length
      return len > 0 ? state.section_geometry_list[len - 1] : {}
    },

    // ------------------ Getters for Condition
    conditionListFiltered: (state) => (year) => {
      return state.condition_list.filter(el => !year || el.survey_year === year);
    },

    yearsInConditionList: (state) => {
      return getUniqueValues(state.condition_list, 'survey_year', '', true);
    },

    // ------------------ Getters for Traffic Sites
    roadsInTrafficSitesList: (state) => {
      return getUniqueValues(state.traffic_site_list, 'road', 'fk_road', true);
    },

    trafficSitesFiltered: (state) => (fk_road) => {
      return state.traffic_site_list.filter(item => {
        return !fk_road || item.fk_road == fk_road
      })
    },

    // ------------------ Getters for Homogeneous sections
    yearsInHSList: (state) => (addEmptyItem = true) => {
      return getUniqueValues(state.homo_section_list, 'year', 'year', addEmptyItem);
    },

    approvedYearsInHSList: (state) => {
      return getUniqueValues(state.homo_section_list, 'year', 'year', false, 'approved_by_user_id')
      .filter (item => !!item.approved_by_user_id)
      .reduce((acc, item) => {
        acc[item.id] = item.id
        return acc
      }, {});
    },

    hsListByYear: (state) => (year) => {
      return state.homo_section_list.filter(row => !year || row.year === year)
    },

    // ------------------ Getters for the list of Homogeneous sections
    roadsInList: (state) => (region_id) => {
      const filtered = state.all_homo_sections_in_list.filter(item => !region_id || item.fk_region === region_id);
      return getUniqueValues(filtered, 'road_description', 'fk_road', true)
    },

    homoSectionsFiltered: (state) => (region_id, road_id) => {
      return state.all_homo_sections_in_list.filter(row => 
        (!region_id || row.fk_region == region_id) &&
        (!road_id || row.fk_road == road_id)
      ).sort((a, b) => a.start_distance - b.start_distance)
    },

    homoSectionSummary: (state, getters) => (region_id, road_id) => {
      const roadsCount = getters.roadsInList(region_id).length
      const filteredSections = getters.homoSectionsFiltered(region_id, road_id)
      const sectionsCount = filteredSections.length
      const sectionsLength = filteredSections.reduce((sum, row) => sum + row.length, 0) / 1000

      return {
        roadsCount,
        sectionsCount,
        sectionsLength
      }
    }
  },

}