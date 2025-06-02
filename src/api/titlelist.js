/* 
File: api/titlelist.js
Description: API connections for the async functions for the Works list and Title list generation.
*/
import Api_ref from '@/api'

const { Api, type_json } = Api_ref.props;

const getHeaders = () => ({
  headers: {
    ...type_json
  }
});

const getLangQuery = () => {
  const lang = global.localStorage["mps-locale"] || "en";
  return `?lang=${lang}`;
};

export default {
  /*---------  Work list ---------*/
  load_works_lists(year, is_approved) {
    let apiStr = `/work_list/all${getLangQuery()}`
    if (year) apiStr += `&year=${year}`
    if (is_approved != null) apiStr += `&is_approved=${is_approved}`   // changed to !==null as we accept 0 as the value

    return Api.get(apiStr, getHeaders());
  },

  get_work_list_by_id(work_list_id) {
    return Api.get(`/work_list/${work_list_id}`, getHeaders());
  },

  del_work_list(work_list_id) {
    return Api.delete(`/work_list/${work_list_id}`, getHeaders());
  },

  /*---------  Works ---------*/
  generate_works(year) {
    return Api.post(`/work_list/generate_works/${year}`, getHeaders());
  },

  load_all_works(payload) {
    const { work_list_id } = payload;
    delete payload.work_list_id;

    const queryString = Object.entries(payload)
      .filter(([, value]) => value !== undefined && value !== null) // Remove empty values
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`) // Encode values ans parameters
      .join('&');

    return Api.get(`/work_list/all_works/${work_list_id}${getLangQuery()}&${queryString}`, getHeaders());
  },

  /*--------- Plans/budgets assigning/unassigning ---------*/
  assign_plan(payload) {
    return Api.put(`/work_list/assign_plan/`, payload, getHeaders());
  },

  assign_budget(payload) {
    return Api.put(`/work_list/assign_budget/`, payload, getHeaders());
  },

  unassign_budget(payload) {
    return Api.put(`/work_list/unassign_budget/`, payload, getHeaders());
  },

  /*--------- Summary sheet for the Title list ---------*/
  get_title_list_summary(work_list_id) {
    return Api.get(`/work_list/get_title_list_summary/${work_list_id}${getLangQuery()}`, getHeaders());
  }
}