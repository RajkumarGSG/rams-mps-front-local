/*
File: api/reference_data.js
Description: API connections for the async functions for Reference (master) Data including
             Units, Inventory Types and Events.
*/
import { createApiMethods, apiGet, apiPut, apiPost } from '@/api'

const localisationPath = '/localisation';
export const localisationApi = {
  load_translation_list() { return apiGet(localisationPath, 'all', {}, false); },
  load_ui_messages(lang) { return apiGet(localisationPath, lang, {}, false); },
  addNew(item) { return apiPost(localisationPath, item) },
  update(id, item) { return apiPut(localisationPath, id, item) }
};

export const workCategoryApi = createApiMethods('/rdb/work_category', true);
export const unitsApi = createApiMethods('/unit', true);

export const inventoryApi = createApiMethods('/rdb/inventory', true);
export const inventoryTypeApi = createApiMethods('/rdb/inventory_type', true);
export const inventoryEventApi = createApiMethods('/rdb/inventory_type_event', true);
export const treatmentTypeApi = createApiMethods('/treatment_type', true);
export const treatmentRateApi = createApiMethods('/treatment_rate', true);

export const treatmentMatrixApi = {
  ...createApiMethods('/treatment_matrix', true),
  /* Additional API calls */
  load_treatment_matrix_pivot_html() { return apiGet('/treatment_matrix', 'pivot_html'); },
  load_treatment_matrix_pivot_excel() { return apiGet('/treatment_matrix', 'pivot_excel'); },
};

export const conditionIndexCriteriaApi = {
  ...createApiMethods('/condition_index_criteria', true),
  load_condition_index_criteria_pivot() { return apiGet('/condition_index_criteria', 'pivot'); },
};

export const importApi = {
  //get_permissions_by_user(user_id) { return apiGet('/rbac/permission', `get_front_permissions_by_user_id/${user_id}`); }
  get_import_log_all(batch_id) {
    return apiGet('/rdb/import_log', 'all', { batch_id }, false);
    //return Api.get(`/rdb/import_log/all?batch_id=${batch_id}`, getHeaders());
  },

  get_import_log_by_id(log_id) {
    return apiGet('/rdb/import_log', `${log_id}`);
    //return Api.get(`/rdb/import_log/${log_id}`, getHeaders());
  },
};

export const userApi = {
  ...createApiMethods('/users', true, false),
  // TODO: move here from state/rbac/login
  // me() {    return apiGet('/users', 'me');  }
  // password-reset-request() {    return apiPost('/users', 'password-reset-request');  }
};

export const groupApi = {
  ...createApiMethods('/groups', true, false),
  load_groups_region_list() { return apiGet('/groups', 'regions'); },
  load_acc_level_list() {
    return {
      status: 200, data: [
        { id: 0, name_en: 'DDH', name_ru: 'ДДХ' },
        { id: 1, name_en: 'RD/UAD', name_ru: 'РО/УАД' },
        { id: 2, name_en: 'DEU', name_ru: 'ДЭУ' }
      ]
    }
  }
};

export const roleApi = createApiMethods('/rbac/role', true);
export const userRoleApi = createApiMethods('/rbac/user_role', true);

export const apiPathApi = {
  ...createApiMethods('/api_path', true, false),
  api_url_map() { return apiGet('/rbac/api_path', ''); },
  sync_api_path() { return apiPost('/rbac/api_path', 'synchronize_to_db'); },
}

export const permissionApi = {
  load_permissions_pivot() { return apiGet('/rbac/permission', 'permission_role_pivot'); },
  get_permissions_anonymous() { return apiGet('/rbac/permission', 'get_front_permissions_anonymous'); },
  get_permissions_by_user(user_id) { return apiGet('/rbac/permission', `get_front_permissions_by_user_id/${user_id}`); }
};

export const lookupApi = {
  load_rdb_lookup(lookup_type) {
    return apiGet('/rdb_lookup', 'all', { lookup_type });
  },
  load_import_type_list() {
    return apiGet('/rdb/import_type', 'all');
  },
};