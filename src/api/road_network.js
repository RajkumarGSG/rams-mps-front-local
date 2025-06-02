/*
File: api/road_network.js
Description: API connections for the async functions for Regions, Districts, DEUs, Roads, Sections and Conditions.
*/
import { createApiMethods, apiGet, apiPost, apiPut, getLang } from '@/api'

export const regionApi = createApiMethods('/rdb/region');
export const deuApi = createApiMethods('/rdb/deu', true, true, true);
export const districtApi =  createApiMethods('/rdb/district', true, true, true);
export const districtSectionApi =  createApiMethods('/rdb/district_section', true);

const roadsPath = '/rdb/road';
export const roadApi = {
  ...createApiMethods(roadsPath, true, true, true),
  /* Additional API calls */
  get_road_import_template() { return apiGet(roadsPath, 'import_template', {}, false, 'blob'); },
  import_road(import_file) { return apiPost(`${roadsPath}/import`, import_file, 'form'); },
  // TODO: Change to real call after Andrey uploads all the coords to the DB
  //load_unpaved_roads_list() { return { status: 200, data: unpaved_roads } },
};

const sectionsPath = '/rdb/section';
export const sectionApi = {
  ...createApiMethods(sectionsPath, true, true, true),
  /* Additional API calls */
  get_region_road_id_from_section(id) { return apiGet(sectionsPath, `region_road/${id}`); },
  get_section_import_template() { return apiGet(sectionsPath, 'import_template', {}, false, 'blob'); },
  import_section(import_file) { return apiPost(`${sectionsPath}/import`, import_file, 'form'); },
  // for drawing map
  /* Uncomment after Andrey copies all the data to the DB
  load_map_roads_coords(region_id, road_id, deu_id, section_id) {
    return { status: 200, data: [] }
    return apiGet(sectionsPath, 'coords', {region_id, road_id, deu_id, section_id});
    /*  const lang = global.localStorage["mps-locale"]
      let apiStr = `${sectionsPath}/coords?lang=${lang}`
      if (region_id) apiStr += `&region_id=${region_id}`
      if (road_id) apiStr += `&road_id=${road_id}`
      if (deu_id) apiStr += `&deu_id=${deu_id}`
      if (section_id) apiStr += `&section_id=${section_id}`
  
      return Api.get(apiStr, getHeaders());*/
  //},
  load_windowed_map_coords(payload) { return apiGet(sectionsPath, 'coords_x_y', payload); },
  // TODO: Change to real call after Andrey uploads all the coords to the DB
  //load_unpaved_coords_list() { return { status: 200, data: unpaved_coords } },
};

export const sectionGeometryApi = createApiMethods('/rdb/section_geometry', true);

const data100Path = '/rdb/data100';
export const conditionApi = {
  ...createApiMethods(data100Path, true),
  get_condition_data_by_coords(x, y) { return apiGet(data100Path, `get_by_x_y?x=${x}&y=${y}`); },
  load_years_dropdown_list() { return apiGet(data100Path, 'list_survey_years'); },
  /*--------- IRI/Rutting bulk importing  ---------------------*/
  get_iri_import_template() { return apiGet(data100Path, 'import_template/iri', {}, false, 'blob'); },
  get_rutting_import_template() { return apiGet(data100Path, 'import_template/rutting', {}, false, 'blob'); },
  import_data100(import_files, section_id) {
    return apiPost(`${data100Path}/import?section_id=${section_id}`, import_files, 'form');
  },
};

export const trafficSiteApi = createApiMethods('/rdb/traffic_site', true);
///rdb/traffic_site/list,"GET"
export const trafficInstallationApi = {
  ...createApiMethods('/rdb/traffic_installation', true, true, true),

  getAll() { return apiGet('/rdb/traffic_installation', 'all'); },

  getImportTemplate() { return apiGet('/rdb/traffic_installation', 'traffic_import_template', {}, false, 'blob'); },

  // getImportTemplate() {
  //     return {
  //       url: '/rdb/traffic_installation/traffic_import_template',
  //       method: 'GET',
  //       responseType: 'blob'
  //     };
  //   },

  importTrafficExcel(file, traffic_installation_id) {
    return apiPost(
      `/rdb/traffic_installation/traffic_import/?traffic_installation_id=${traffic_installation_id}`,
      file,
      'form'
    );
  }
};
///rdb/traffic_installation/traffic-site/<int:traffic_site_id>,"GET"

const hsPath = '/homogeneous_section_list'
export const homoSectionApi = {
  ...createApiMethods(hsPath, true),
  addNew(params) { // params should be an Object { year_from, year_to, min_hs_length, condition_index_threshold }
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => (value)))  //.toString();
    return apiPost(`${hsPath}/generate_hs/?${query}`, undefined);
  },
  approve_homo_section_list(homoSectionListId) { return apiPut(`${hsPath}/approve`, homoSectionListId, null); },
  cancel_homo_section_list(homoSectionListId) { return apiPut(`${hsPath}/cancel_approval`, homoSectionListId, undefined); },
  load_all_homo_sections(homoSectionListId) { return apiGet(`${hsPath}/all_hs`, homoSectionListId); },
};