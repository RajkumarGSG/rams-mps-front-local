/* 
File: reports.js
Description: API connections for the async functions for Reports .
*/
import { apiGet, getLang } from '@/api'
import elevation_zones from '../store/jsons/elevation_zones.json'
import length_per_elevation from '../store/jsons/length_per_elevation.json'

const reportsPath = "/rdb/reports";

export default {
  report_1_administrative_setup(inserted_date, region_id) {
    return apiGet(reportsPath, "report_1_administrative_setup", { inserted_date, region_id });
  },

  report_2_roads_info(inserted_date, region_id, deu_id, road_class) {
    return apiGet(reportsPath, "report_2_roads", { inserted_date, region_id, deu_id, road_class });
  },

  report_3_year_wise_road_length(start_year, end_year, region_id, road_class, deu_id) {
    return apiGet(
      reportsPath,
      "report_3_year_wise_road_length",
      { start_year, end_year, region_id, road_class, deu_id }
    );
  },

  report_4_road_length_by_traffic(survey_year_from, survey_year_to, region_id, road_class, deu_id) {
    return apiGet(
      reportsPath,
      "report_4_road_length_by_traffic_intensity",
      { survey_year_from, survey_year_to, region_id, road_class, deu_id }
    );
  },

  report_5_road_way_details(region_id, road_class, deu_id, inserted_date) {
    return apiGet(reportsPath, "report_5_road_way_details", { region_id, road_class, deu_id, inserted_date });
  },

  report_6_sections(region_id, road_class, deu_id, inserted_date) {
    return apiGet(reportsPath, "report_6_sections", { region_id, road_class, deu_id, inserted_date });
  },

  report_7_road_condition_detailed(region_id, deu_id, road_id, survey_date_from, survey_date_to) {
    return apiGet(
      reportsPath,
      "report_7_road_condition_data_detailed",
      { region_id, deu_id, road_id, survey_date_from, survey_date_to }
    );
  },

  report_7_road_condition_summary(region_id, deu_id, road_id, section_id, survey_date_from, survey_date_to) {
    return apiGet(
      reportsPath,
      "report_7_road_condition_data_summary",
      { region_id, deu_id, road_id, section_id, survey_date_from, survey_date_to }
    );
  },

  report_8_region_wise_condition(region_id, survey_year) {
    return apiGet(reportsPath, "report_8_region_wise_condition_distribution", { region_id, survey_year });
  },

  report_9_yearly_condition(region_id, deu_id, road_id, section_id, survey_date_from, survey_date_to) {
    return apiGet(
      reportsPath,
      "report_9_yearly_condition_index",
      { region_id, deu_id, road_id, section_id, survey_date_from, survey_date_to }
    );
  },

  report_10_section_wise_aadt(survey_year_from, survey_year_to, region_id, deu_id, road_id) {
    return apiGet(
      reportsPath,
      "report_10_section_wise_aadt",
      { survey_year_from, survey_year_to, region_id, deu_id, road_id }
    );
  },

  report_11_total_elevation_zones() {
    // TODO: remove next 5 lines after implementing via API
    const data = elevation_zones.map(item => ({
      ...item,
      region_description: item[getLang() === 'ru' ? 'region_description' : 'region_description_en']
    }));
    return { status: 200, data };
  },

  report_12_road_length_by_elevation_zones() {
    // TODO: remove next 5 lines after implementing via API
    const data = length_per_elevation.map(item => ({
      ...item,
      region_description: item[getLang() === 'ru' ? 'region_description' : 'region_description_en']
    }));
    return { status: 200, data };
  },
};