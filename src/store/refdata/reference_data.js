/* 
File: reference_data.js
Description: provides methods calling API for almost all reference data screens
*/
import * as ReferenceDataApi from '@/api/reference_data';
import { createActions, apiCall, handleApiCall, filterAndSortList } from '@/store/helpers/apicall_helpers';
import { getUniqueValues } from '@/store/helpers/unique_values.js';

const {
  workCategoryApi, unitsApi, inventoryApi, inventoryTypeApi, inventoryEventApi,
  treatmentTypeApi, treatmentRateApi, treatmentMatrixApi, conditionIndexCriteriaApi,
  lookupApi, importApi,
  userApi, groupApi, roleApi, userRoleApi, apiPathApi, permissionApi
} = ReferenceDataApi;

const workCategoryActions = createActions(workCategoryApi, 'WORK_CATEGORY', 201);
const unitActions = createActions(unitsApi, 'UNIT', 201);

const inventoryActions = createActions(inventoryApi, 'INVENTORY');
const inventoryTypeActions = createActions(inventoryTypeApi, 'INVENTORY_TYPE', 201);
const inventoryEventActions = createActions(inventoryEventApi, 'INVENTORY_EVENT', 201);
const treatmentTypeActions = createActions(treatmentTypeApi, 'TREATMENT_TYPE', 201);
const treatmentRateActions = createActions(treatmentRateApi, 'TREATMENT_RATE', 201);
const treatmentMatrixActions = createActions(treatmentMatrixApi, 'TREATMENT_MATRIX', 201);
const conditionIndexCriteriaActions = createActions(conditionIndexCriteriaApi, 'CONDITION_INDEX_CRITERIA', 201)

const userActions = createActions(userApi, 'USER');
const groupActions = createActions(groupApi, 'GROUP');
const roleActions = createActions(roleApi, 'ROLE', 201);
const userRoleActions = createActions(userRoleApi, 'USER_ROLE');
const apiPathActions = createActions(apiPathApi, 'API_PATH');


export default {
  namespaced: true,
  state: {
    work_category_list: [],
    unit_list: [],

    inventory_list: [],
    inventory_type_list: [],
    inventory_event_list: [],
    treatment_type_list: [],
    treatment_rate_list: [],
    treatment_matrix_list: [],
    treatmentMatrixPivot: null,
    condition_index_criteria_list: [],

    import_status: [],
    //import_log: [],

    user_list: [],
    group_list: [],
    role_list: [],
    user_role_list: [],
    api_path_list: [],

    permissionsList: [],
    userPermissionsList: [],

    //road_type_list: [],

  },

  actions: {
    ...workCategoryActions,
    ...unitActions,

    ...inventoryActions,
    ...inventoryTypeActions,
    ...inventoryEventActions,
    ...treatmentTypeActions,
    ...treatmentRateActions,
    ...treatmentMatrixActions,
    ...conditionIndexCriteriaActions,

    ...userActions,
    ...groupActions,
    ...roleActions,
    ...userRoleActions,
    ...apiPathActions,

    // TODO: Remove after ticket #166 resolution
    async LOAD_TREATMENT_TYPE_LIST({ commit }, { forDropdown = false, joinKeyDescr = false, ...params }) {
      const types = await apiCall(treatmentTypeApi.loadList(params), 'LOAD_TREATMENT_TYPE_LIST');
      const rates = await apiCall(treatmentRateApi.loadList(), 'LOAD_TREATMENT_TYPE_LIST');
      const data = types.map(item => ({
        ...item,
        treatment_type_description: joinKeyDescr ? `${item.key}: ${item.treatment_type_description}` : item.treatment_type_description,
        rate: rates.find(el => el.treatment_type_id == item.treatment_type_id)?.rate || 0
      }));
      if (!forDropdown) {
        commit('SET_LIST', { key: 'treatment_type_list', data });
        return 'success';
      } else {
        return data;
      };
    },

    // TODO: Remove after ticket #167 resolution
    async LOAD_TREATMENT_RATE_LIST({ commit }, { forDropdown = false, routine = 0, work_category_id }) {
      const types = await apiCall(treatmentTypeApi.loadList({ routine }), 'LOAD_TREATMENT_RATE_LIST');
      const rates = await apiCall(treatmentRateApi.loadList(), 'LOAD_TREATMENT_RATE_LIST');
      const data = rates.map(item => {
        const rateType = types.find(el => el.treatment_type_id == item.treatment_type_id);
        return {
          ...item,
          is_routine: rateType?.is_routine || 0,
          fk_work_category: rateType?.fk_work_category || 0
        }
      }).filter(el =>
        (el.is_routine == routine) &&
        (!work_category_id || el.fk_work_category == work_category_id)
      );
      if (!forDropdown) {
        commit('SET_LIST', { key: 'treatment_rate_list', data });
        return 'success';
      } else {
        return data;
      };
    },

    /*---------  Treatment matrix ---------------------*/
    async LOAD_TREATMENT_MATRIX_PIVOT_HTML({ commit }) {
      return await handleApiCall({
        request: await treatmentMatrixApi.load_treatment_matrix_pivot_html(),
        caller: 'LOAD_TREATMENT_MATRIX_PIVOT_HTML',
        commit, mutation: 'SET_TREATMENT_MATRIX_PIVOT'
        // TODO: Review API/mutations as now it returns string and we canot use standard SET_LIST
        //commit, mutation: 'SET_LIST',
        //mutationKey: 'treatmentMatrixPivot'
      });
    },

    async LOAD_TREATMENT_MATRIX_PIVOT_EXCEL({ commit }, id) {
      return await apiCall(treatmentMatrixApi.load_treatment_matrix_pivot_excel(), 'LOAD_TREATMENT_MATRIX_PIVOT_EXCEL');
    },

    /*--------- Condition Index Criteria ------------------*/
    async LOAD_CONDITION_INDEX_CRITERIA_PIVOT({ commit }) {
      return await handleApiCall({
        request: conditionIndexCriteriaApi.load_condition_index_criteria_pivot(),
        caller: 'LOAD_CONDITION_INDEX_CRITERIA_PIVOT',
        commit, mutation: 'SET_LIST',
        mutationKey: 'condition_index_criteria_list'
      });
    },

    /*---------  IMPORT  ---------------------*/
    async IMPORT_LOG_ALL({ commit }, batch_id) {
      return await handleApiCall({
        request: importApi.get_import_log_all(batch_id),
        caller: 'IMPORT_LOG_ALL',
        commit, mutation: 'SET_LIST',
        mutationKey: 'import_status'
      });
    },

    async IMPORT_LOG_BY_ID({ commit }, log_id) {
      return await apiCall(importApi.get_import_log_by_id(log_id), 'IMPORT_LOG_BY_ID');
    },

    /*---------  GROUPS  ---------------------*/
    async LOAD_GROUPS_REGION_LIST({ commit }) {
      return await apiCall(groupApi.load_groups_region_list(), 'LOAD_GROUPS_REGION_LIST');
    },

    async LOAD_ACC_LEVEL_LIST({ commit }) {
      return await apiCall(groupApi.load_acc_level_list(), 'LOAD_ACC_LEVEL_LIST');
    },

    /*---------  API PATH  ---------------------*/
    async GET_API_URL_MAP({ commit }) {
      return await apiCall(Api.api_url_map(), 'GET_API_URL_MAP');
    },

    async SYNC_API_PATH({ commit }) {
      return await apiCall(Api.sync_api_path(), 'SYNC_API_PATH', 201);
    },

    /*--------- PERMISSIONS ---------------------*/
    async LOAD_USER_PERMISSIONS_PIVOT({ commit }) {
      return await handleApiCall({
        request: permissionApi.load_permissions_pivot(),
        caller: 'LOAD_USER_PERMISSIONS_PIVOT',
        commit, mutation: 'SET_LIST',
        mutationKey: 'permissionsList'
      });
    },

    async GET_USER_PERMISSIONS_ANONYMOUS({ commit }) {
      return await apiCall(permissionApi.get_permissions_anonymous(), 'GET_USER_PERMISSIONS_ANONYMOUS');
    },

    async GET_USER_PERMISSIONS({ commit }, user_id) {
      return await handleApiCall({
        request: permissionApi.get_permissions_by_user(user_id),
        caller: 'GET_USER_PERMISSIONS',
        commit, mutation: 'SET_LIST',
        mutationKey: 'userPermissionsList'
      });
    },

    /* ------------ Lookup's ------- */
    async LOAD_RDB_LOOKUP({ commit }, { lookupType, addEmptyLine = true }) {
      const data = filterAndSortList(
        await apiCall(lookupApi.load_rdb_lookup(lookupType), 'LOAD_RDB_LOOKUP'),
        { id: 'lookup_key', description: 'description' },  // fields for mapping
        {},  // filters
        addEmptyLine,
      );
      return data;
    },

    async LOAD_IMPORT_TYPE_LIST({ commit }) {
      return await apiCall(lookupApi.load_import_type_list(), 'LOAD_IMPORT_TYPE_LIST');
    },
  },

  mutations: {
    SET_LIST(state, { key, data }) {
      if (state.hasOwnProperty(key)) {
        state[key] = [...data];
      } else {
        console.warn(`SET_LIST: State key "${key}" not found`);
      }
    },

    SET_TREATMENT_MATRIX_PIVOT(state, list) {
      state.treatmentMatrixPivot = list
    },
  },

  getters: {
    treatmentTypesFiltered: (state) => (unit) => {
      return state.treatment_type_list.filter(el => (!unit || el.fk_unit == unit));
    },

    // TODO: Remove after ticket #167 resolution
    treatmentRatesFiltered: (state) => (maintenanceType, workCategory) => {
      return state.treatment_rate_list.filter(el =>
        (el.is_routine == maintenanceType) &&
        (!workCategory || el.fk_work_category == workCategory)
      );
    },

    getTreatmentMatrixUniqueValues: (state) => (key, id = '') => {
      return getUniqueValues(state.treatment_matrix_list, key, id);
    },

    matrixFiltered: (state) => (treatmentType) => {
      return state.treatment_matrix_list.filter(item =>
        (!treatmentType || item.fk_treatment_type == treatmentType)
      );
    },

    matrixCombined: (state, getters) => (treatmentType) => {
      return getters.matrixFiltered(treatmentType).map(item => ({
        id: item.treatment_matrix_id,
        type: item.fk_treatment_type,
        key: item.key,
        description: item.treatment_type_description,
        aadt: `${item.aadt_from}-${item.aadt_to}`,
        iri: `${item.iri_from}-${item.iri_to}`,
        rutting: `${item.rutting_from}-${item.rutting_to}`,
        cracking: `${item.cracking_from}-${item.cracking_to}`,
        potholes: `${item.potholes_from}-${item.potholes_to}`,
        expected_outcome: item.expected_outcome,
      }));
    },

    // Condition Index Criteria getters
    getDropDownList: (state) => {
      const res = state.condition_index_criteria_list.map(item => ({ id: item.indicator_type, description: `condition.${item.indicator_type}` }))
      res.unshift({ id: '', description: '' })
      return res
    },

    getScores: (state) => {
      return [{ val: 0 }, { val: 1 }, { val: 2 }, { val: 3 }, { val: 4 }]
    },

    criteriaListFiltered: (state) => (type) => {
      return state.condition_index_criteria_list.filter(item => !type || item.indicator_type === type)
    },

    // Api_path getters
    getApiMethodsList: (state) => (addEmptyLine = true) => {
      return getUniqueValues(state.api_path_list, 'method', '', addEmptyLine);
    },

    getApiPathByMethod: (state) => (method) => {
      return state.api_path_list.filter(item => !method || item.method === method)
    },

    // Permissions getters
    getPermissionsByType: (state) => (type) => {
      return state.permissionsList.filter(item => !type || item.component_type === type)
    },

    getPermissionTypes: (state) => {
      return getUniqueValues(state.permissionsList, 'component_type');
    },

    userPermissionsLoaded: (state) => state.userPermissionsList.length > 0,

    getFormPermissions: (state) => (formName) => {
      return state.userPermissionsList.filter(item =>
        //(item.component_type === 'Screen') &&
        (!formName || item.form_name === formName)
      )
    },

    isAllowed: (state) => (formName, type, name) => {
      const res = state.userPermissionsList
        .find(item => item.form_name === formName && item.component_type === type && item.component_name === name)
        ?.front_component_id;
      return !!res;
    },

    isScreenAllowed: (state, getters) => (screenName) => {
      if (screenName == "ImportTrafficForm") // Rajkumar.Gs : ToDo: remove after this new screen is configured to allow
        return true;

      return getters.isAllowed(screenName, 'Screen', 'Form');
    },
  }
}