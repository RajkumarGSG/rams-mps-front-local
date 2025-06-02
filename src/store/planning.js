/* 
File: planning.js
Description: provides API calls for Planning Periodic and Routine Maintenance and Title list
*/
import { planApi, budgetApi, rmPlanApi, rmPlanDetailApi } from '@/api/planning';
import { createActions, apiCall } from '@/store/helpers/apicall_helpers';
import { getUniqueValues } from '@/store/helpers/unique_values.js';

const planActions = createActions(planApi, 'PLAN', 201);
const budgetActions = createActions(budgetApi, 'BUDGET', 201);

const rmPlanActions = createActions(rmPlanApi, 'RM_PLAN', 201);
const rmPlanDetailActions = createActions(rmPlanDetailApi, 'RM_PLAN_DETAIL', 201);

export default {
  namespaced: true,
  state: {
    budget_list: [],
    plan_list: [],
    dropdownList: [],

    rm_plan_list: [],
    rm_plan_detail_list: [],
  },

  actions: {
    ...budgetActions,
    ...planActions,

    ...rmPlanActions,
    ...rmPlanDetailActions,

    /*--------- Budget ---------------------*/
    async APPROVE_BUDGET({ }, budget_id) {
      return await apiCall(budgetApi.approve_budget(budget_id), 'APPROVE_BUDGET', 201);
    },
    async CANCEL_BUDGET_APPROVAL({ }, budget_id) {
      return await apiCall(budgetApi.cancel_budget_approval(budget_id), 'CANCEL_BUDGET_APPROVAL', 201);
    },

    /*--------- Plans ---------------------*/
    async APPROVE_PLAN({ }, id) {
      return await apiCall(planApi.approve_plan(id), 'APPROVE_PLAN', 201);
    },
    async CANCEL_PLAN({ }, id) {
      return await apiCall(planApi.cancel_plan(id), 'CANCEL_PLAN', 201);
    },

    /*--------- Routine Maintenance Plans ---------------------*/
    async APPROVE_RM_PLAN({ }, id) {
      return await apiCall(rmPlanApi.approve_plan(id), 'APPROVE_RM_PLAN', 201);
    },
    async CANCEL_RM_PLAN({ }, id) {
      return await apiCall(rmPlanApi.cancel_plan(id), 'CANCEL_RM_PLAN', 201);
    },

    /*--------- Routine Maintenance Plan Details ---------------------*/
    async SAVE_BATCH({ }, payload) {
      return await apiCall(rmPlanDetailApi.save_batch(payload), 'SAVE_BATCH', 201);
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
  },

  getters: {
    // Budget getters
    budgetsByYear: (state) => (year) => {
      return !year ? state.budget_list : state.list.filter(el => el.year === year)
    },

    budgetsByRegionAndYear: (state) => (region, year, unapprovedOnly = false) => {
      // Only for periodic maintenance
      return state.budget_list.filter(el =>
        el.fk_region === region &&
        el.year === year && //&& [4, 6].includes(el.fk_work_category)
        (!unapprovedOnly || el.approved === false)
      ).sort((a, b) => a.work_category.localeCompare(b.work_category, undefined, { sensitivity: 'base' }))
    },

    budgetsByCategory: (state, getters) => (region, year, category) => {
      const res = getters.budgetsByRegionAndYear(region, year)
      return !category ? res : res.filter(el => el.fk_work_category === category)
    },

    categoriesInBudget: (state, getters) => (region, year) => {
      const res = getters.budgetsByRegionAndYear(region, year)
        .map(item => ({ id: item.fk_work_category, description: item.work_category }))
      res.unshift({ id: 0, description: '' })
      return res
    },

    budgetSummary: (state, getters) => (region, year) => {
      const res = getters.budgetsByRegionAndYear(region, year)
      const totalRecords = res.length
      const totalKGS = !totalRecords ? null : res.reduce((sum, item) => sum + item.amount_kgs, 0)
      const totalUSD = !totalRecords ? null : res.reduce((sum, item) => sum + item.amount_usd, 0)
      const totalTreatments = res.reduce((sum, item) => sum + item.treatment_count, 0)
      const totalApproved = !totalRecords ? null : res.reduce((sum, item) => sum + (item.approved ? item.amount_kgs : 0), 0)
      const approved = !totalRecords ? false : totalKGS === totalApproved

      return {
        totalRecords,
        totalKGS,
        totalUSD,
        totalTreatments,
        totalApproved,
        approved
      }
    },

    // Plans getters
    filterAndSortPlans: (state) => (fk_region, year, isApproved, dropDown = true) => {
      const res = dropDown ? state.dropdownList : state.plan_list
      return res.filter(el =>
        (isApproved ? el.approved_by_user_id : !el.approved_by_user_id) &&  // Check if approved/not approved
        (!fk_region || el.fk_region === fk_region) &&                       // Filter by region (if provided)
        (!year || el.year === year)                                         // Filter by year (if provided)
      ).map(el => ({ id: el.id, name: el.name }))     // Get only necessary fields
        // Order by name
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    },

    plansApproved: (state, getters) => (fk_region, year, dropDown = true) => {
      return getters.filterAndSortPlans(fk_region, year, true, dropDown);
    },

    plansNotApproved: (state, getters) => (fk_region, year, dropDown = true) => {
      return getters.filterAndSortPlans(fk_region, year, false, dropDown);
    },

    planApproved: (state) => (id) => {
      return Boolean(state.plan_list.find(el => el.id == id)?.approved_by_user_id)
    },

    findPlanByName: (state) => (planName) => {
      return state.dropdownList.find(el => el.name === planName)?.id
    },

    yearsInPlanList: (state) => {
      return getUniqueValues(state.plan_list, 'year', 'year', true);
    },

    planListByYear: (state) => (year) => {
      return !year ? state.plan_list : state.plan_list.filter(row => row.year === year)
    },

    // ------------------ Getters for Routine Maintenance Plans
    rmPlansWithPrefix: (state) => (year, deuLabel, noLabel) => {
      return state.rm_plan_list.filter(item => !year || item.year === year)
        .map(item => ({
          ...item,
          deu_description: `${deuLabel}-${item.deu_description}`,
          approved_at: item.approved_by_user_id ? item.approved_at : noLabel, //item.approved_at,
          treatment_type_count: item.treatment_type_count || 0
        }))
    },

    currentPlan: (state) => (year) => {
      // status: 0 - does not exist, 1 - exists, 2 - approved
      const filteredPlans = state.rm_plan_list.filter(item => item.year === year);
      let res = { status: 0, id: null };
      if (filteredPlans.length == 1) {
        res.status = 1;  // exists
        res.id = filteredPlans[0]?.routine_plan_id;
        if (filteredPlans[0]?.approved_by_user_id !== null) {
          res.status = 2;  // approved
        }
      }
      return res;
    },

    rmPlansSummary: (state) => (year) => {
      const res = state.rm_plan_list.filter(item => !year || item.year === year);
      const totalRecords = res.length;
      const totalTreatmentTypes = res.reduce((sum, item) => sum + item.treatment_type_count, 0);
      const totalAmount = res.reduce((sum, item) => sum + item.total_cost, 0);
      return {
        totalRecords,
        totalTreatmentTypes,
        totalAmount,
      }
    },

    rmPlansForTitleList: (state) => (year) => {
      const res = state.rm_plan_list.reduce((acc, item) => {
        if (item.year === year && item.approved_by_user_id !== null) {
          if (!acc[item.work_category_description]) {
            acc[item.work_category_description] = 0;
          };
          acc[item.work_category_description] += item.total_cost;
        };
        return acc;
      }, {});
      return res
    },

    rmPlansDetailsFiltered: (state) => (fk_road, fk_treatment_type) => {
      return state.rm_plan_detail_list.filter(item =>
        (item.fk_road == fk_road) &&
        (!fk_treatment_type || item.fk_treatment_type == fk_treatment_type)
      );
    },

    rmPlanDetailTreatmentsInList: (state) => (fk_road) => {
      const res = state.rm_plan_detail_list.filter(item => (!fk_road || item.fk_road == fk_road));
      return getUniqueValues(res, 'treatment_type_description', 'fk_treatment_type', true);
    },

    rmPlanDetailRoadsInList: (state) => {
      return getUniqueValues(state.rm_plan_detail_list, 'road_description', 'fk_road', true);
    },

    rmPlanDetailSummary: (state, getters) => (fk_road, fk_treatment_type) => {
      const res = getters.rmPlansDetailsFiltered(fk_road, fk_treatment_type);
      const totalRecords = res.length;
      const totalAmount = res.reduce((sum, item) => sum + item.total_cost, 0);
      return {
        totalRecords,
        totalAmount,
      };
    }
  }
}