/* 
File: reports.js
Description: Async functions for  Reports .
*/
import Api from '@/api/reports'
import { handleApiCall } from '@/store/helpers/apicall_helpers';
import { getUniqueValues } from '@/store/helpers/unique_values.js';

export default {
  state: {
    report_1_data: [],    // administrative_setup
    report_2_data: [],    // list_of_roads
    report_3_data: [],    // yearwise_report
    report_4_data: [],    // length_by_traffic
    report_5_data: [],    // road_way_details
    report_6_data: [],    // road_sections
    report_7_data: [],    // road_condition_summary
    report_8_data: [],    // road_condition_inxex
    report_9_data: [],    // yearly_condition_inxex
    report_10_data: [],   // section_wise_aadt
    report_11_data: [],   // total_elevation_zones
    report_12_data: [],   // road_length_by_elevation_zones
    report_14_data: [],   // Survey_data_reconciliation
  },

  actions: {
    async CLEAR_REPORT({ commit }, reportNo ) {
      commit('SET_REPORT', { key: reportNo, data: [] })
      return 'success'
    },

    async REPORT_1_ADMINISTRATIVE_SETUP({ commit }, { inserted_date, region_id }) {
      return await handleApiCall({
        request: Api.report_1_administrative_setup(inserted_date, region_id),
        caller: 'REPORT_1_ADMINISTRATIVE_SETUP',
        commit, mutation: 'SET_REPORT',
        mutationKey: 1
      });
    },

    async REPORT_2_ROAD_INFO({ commit }, values) {
      const { inserted_date, region_id, deu_id, road_class } = values
      return await handleApiCall({
        request: Api.report_2_roads_info(inserted_date, region_id, deu_id, road_class),
        caller: 'REPORT_2_ROAD_INFO',
        commit, mutation: 'SET_REPORT',
        mutationKey: 2
      });
    },

    async REPORT_3_YEARWISE_LENGTH({ commit }, values) {
      const { start_year, end_year, region_id, road_class, deu_id } = values
      return await handleApiCall({
        request: Api.report_3_year_wise_road_length(start_year, end_year, region_id, road_class, deu_id),
        caller: 'REPORT_3_YEARWISE_LENGTH',
        commit, mutation: 'SET_REPORT',
        mutationKey: 3
      });
    },

    async REPORT_4_LENGTH_BY_TRAFFIC({ commit }, values) {
      const { survey_year_from, survey_year_to, region_id, road_class, deu_id } = values
      return await handleApiCall({
        request: Api.report_4_road_length_by_traffic(survey_year_from, survey_year_to, region_id, road_class, deu_id),
        caller: 'REPORT_4_LENGTH_BY_TRAFFIC',
        commit, mutation: 'SET_REPORT',
        mutationKey: 4
      });
    },

    async REPORT_5_ROADWAY_DETAILS({ commit }, values) {
      const { region_id, road_class, deu_id, inserted_date } = values
      return await handleApiCall({
        request: Api.report_5_road_way_details(region_id, road_class, deu_id, inserted_date),
        caller: 'REPORT_5_ROADWAY_DETAILS',
        commit, mutation: 'SET_REPORT',
        mutationKey: 5
      });
    },

    async REPORT_6_ROAD_SECTIONS({ commit }, values) {
      const { region_id, road_class, deu_id, inserted_date } = values
      return await handleApiCall({
        request: Api.report_6_sections(region_id, road_class, deu_id, inserted_date),
        caller: 'REPORT_6_ROAD_SECTIONS',
        commit, mutation: 'SET_REPORT',
        mutationKey: 6
      });
    },

    async REPORT_7_ROAD_CONDITION_DATA({ commit }, values) {
      const { region_id, deu_id, road_id, section_id, survey_date_from, survey_date_to } = values
      return await handleApiCall({
        request: Api.report_7_road_condition_summary(region_id, deu_id, road_id, section_id, survey_date_from, survey_date_to),
        caller: 'REPORT_7_ROAD_CONDITION_DATA',
        commit, mutation: 'SET_REPORT',
        mutationKey: 7
      });
    },

    async REPORT_8_ROAD_CONDITION_INDEX({ commit }, values) {
      const { region_id, survey_year } = values
      return await handleApiCall({
        request: Api.report_8_region_wise_condition(region_id, survey_year),
        caller: 'REPORT_8_ROAD_CONDITION_INDEX',
        commit, mutation: 'SET_REPORT',
        mutationKey: 8
      });
    },

    async REPORT_9_YEARLY_CONDITION_INDEX({ commit }, values) {
      const { region_id, deu_id, road_id, section_id, survey_date_from, survey_date_to } = values
      return await handleApiCall({
        request: Api.report_9_yearly_condition(region_id, deu_id, road_id, section_id, survey_date_from, survey_date_to),
        caller: 'REPORT_9_YEARLY_CONDITION_INDEX',
        commit, mutation: 'SET_REPORT',
        mutationKey: 9
      });
    },

    async REPORT_10_SECTION_WISE_AADT({ commit }) {
      //const { selected_year, region_id, deu_id, road_id } = values
      return await handleApiCall({
        request: Api.report_10_section_wise_aadt(), // selected_year, selected_year, region_id, deu_id, road_id),
        caller: 'REPORT_10_SECTION_WISE_AADT',
        commit, mutation: 'SET_REPORT',
        mutationKey: 10
      });
    },

    async REPORT_11_TOTAL_ELEVATION_ZONES({ commit }) {
      return await handleApiCall({
        request: Api.report_11_total_elevation_zones(),
        caller: 'REPORT_11_TOTAL_ELEVATION_ZONES',
        commit, mutation: 'SET_REPORT',
        mutationKey: 11
      });
    },

    async REPORT_12_LENGTH_BY_ELEVATION_ZONES({ commit }) {
      return await handleApiCall({
        request: Api.report_12_road_length_by_elevation_zones(),
        caller: 'REPORT_12_LENGTH_BY_ELEVATION_ZONES',
        commit, mutation: 'SET_REPORT',
        mutationKey: 12
      });
   },
   
    async REPORT_14_SURVEY_DATA_RECONCILIATION({ commit }, values) {
      const { survey_year } = values
      console.log('survey_year in reports.js', survey_year)
      return await handleApiCall({
        request: Api.report_11_survey_data_reconciliation(survey_year),
        caller: 'REPORT_14_SURVEY_DATA_RECONCILIATION',
        commit, mutation: 'SET_REPORT',
        mutationKey: 14
      });
   }
  },

  mutations: {
    SET_REPORT(state, { key, data }) {
      const reportKey = `report_${key}_data`
      if (state.hasOwnProperty(reportKey)) {
        state[reportKey] = [...data];
      } else {
        console.warn(`SET_LIST: State key "${reportKey}" not found`);
      }
    },
  },

  getters: {
    report_1_total: (state) => {
      const fields = [
        'length_km_road_class_m',
        'length_km_road_class_em',
        'length_km_road_class_zh',
        'road_class_none'
      ];

      const res = fields.reduce((totals, field) => {
        totals[field] = state.report_1_data.reduce((acc, currVal) => acc + (currVal[field] || 0), 0);
        return totals;
      }, {});
      res['total'] = state.report_1_data.length
      return res
    },

    report_2_total: (state) => {
      return state.report_2_data.reduce((acc, currValue) => acc + currValue.length_km, 0,)
    },

    report_6_total: (state) => {
      return state.report_6_data.reduce((acc, currValue) => acc + currValue.length_km, 0,)
    },

    report_7_total: (state) => {
      return state.report_7_data.reduce((acc, currValue) => acc + currValue.distance, 0,)
    },

    roadsInReport7: (state) => {
      return getUniqueValues(state.report_7_data, 'road_description', 'road_id', true);
    },

    report_8_total: (state) => {
      return state.report_8_data.reduce((acc, currValue) => acc + currValue.length_km, 0,)
    },

    report10_notNull: (state) => {
      const filteredRows = state.report_10_data.filter(row => {
        const nonEmptyFields = [row.aadt_a1_spc, row.aadt_b1_mb, row.aadt_b2_l2tr, row.aadt_b3_tractors,
        row.aadt_c1_m2tr, row.aadt_c2_h3tr, row.aadt_d1_buses, row.aadt_d2_truck_tr, row.aadt_d3_ar4tr_tr]
          .filter(field => field !== null && field !== undefined && field !== 0);
        return nonEmptyFields.length >= 9;
      });

      return filteredRows
    },

  report14_notNull: (state) => {
    return state.report_14_data.filter(row => {
      const nonEmptyFields = [
        row.survey_year,
        row.road_key,
        row.section_id,
        row.section_description,
        row.length_km,
        row.iri_length_km,
        row.rutting_length_km,
        row.distress_length_km
      ].filter(field => field !== null && field !== undefined && field !== 0);
      return nonEmptyFields.length >= 5; // adjusted threshold
    });
  },

    report10_filtered: (state, getters) => (region_id, road_id, year) => {
      return getters.report10_notNull.filter(el =>
        (!region_id || el.region_id === region_id) &&  // Проверка на регион (если передан)
        (!road_id || el.road_id === road_id) &&  // Проверка на дорогу (если передана)
        (!year || el.survey_year === year)           // Проверка на год (если передан)
      )
    },

    report14_filtered: (state, getters) => (year) => { // region_id, road_id, 
      return getters.report14_notNull.filter(el =>
        (!year || el.survey_year === year)           // Проверка на год (если передан)
      )
    },
    roadsInReport10: (state, getters) => (region_id) => {
      return getUniqueValues(getters.report10_filtered(region_id), 'road_description', 'road_id', true);
    },
    
    
    yearsInReport10: (state, getters) => (region_id, road_id) => {
      return getUniqueValues(getters.report10_filtered(region_id, road_id), 'survey_year', 'survey_year', true);
    },

    yearsInReport14: (state, getters) => () => {
      return getUniqueValues(getters.load_years_dropdown_list(), 'survey_year', 'survey_year', true);
    },

    report_11_total: (state) => {
      const zoneTotals = {
        zone_1: 0,
        zone_2: 0,
        zone_3: 0,
        zone_4: 0,
        zone_5: 0,
        zone_6: 0,
        total: 0
      };

      return state.report_11_data.reduce((totals, row) => {
        Object.keys(totals).forEach(zone => { totals[zone] += row[zone] || 0 });
        return totals;
      }, zoneTotals);
    },

    report12_filtered: (state) => (region_id, road_class) => {
      return state.report_12_data.filter(el =>
        (!region_id || el.region_id === region_id) &&
        (!road_class || el.road_class === road_class)
      )
    },

    report_12_total: (state, getters) => (region_id, road_class) => {
      const zoneTotals = {
        zone_1: 0,
        zone_2: 0,
        zone_3: 0,
        zone_4: 0,
        zone_5: 0,
        zone_6: 0,
        total: 0
      };

      return getters.report12_filtered(region_id, road_class).reduce((totals, row) => {
        Object.keys(totals).forEach(zone => { totals[zone] += row[zone] || 0 });
        return totals;
      }, zoneTotals);
    },
  }
};