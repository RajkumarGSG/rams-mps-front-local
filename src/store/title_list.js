/* 
File: titlelist.js
Description: methods for the Title list implementation.
*/
import Api from '@/api/titlelist'
import { apiCall, handleApiCall } from '@/store/helpers/apicall_helpers';
import { getUniqueValues } from '@/store/helpers/unique_values.js';

export default {
  state: {
    worksLists: [],         // List of worklists
    treatmentsList: [],     // List of treatments with selected filters
    assignedTreatments: [], // List of treatments that are selected for budget assignment
    summaryList: []
  },

  actions: {
    async LOAD_WORKS_LISTS({ commit }, filters) {
      const { year, is_approved } = filters
      return await handleApiCall({
        request: Api.load_works_lists(year, is_approved),
        caller: 'LOAD_WORKS_LISTS',
        commit, mutation: 'SET_WORKS_LISTS'
      });
    },

    async GET_WORK_LIST_BY_ID({ commit }, work_list_id) {
      return await apiCall(Api.get_work_list_by_id(work_list_id), 'GET_WORK_LIST_BY_ID');
    },

    async DEL_WORK_LIST({ commit }, work_list_id) {
      return await apiCall(Api.del_work_list(work_list_id), 'DEL_WORK_LIST');
    },

    async GENERATE_WORKS({ dispatch }, year) {
      return await apiCall(Api.generate_works(year), 'GENERATE_WORKS', 201);
      /* if (err.response && err.response.status === 409) {
          return 'exists'
        } */
    },

    async LOAD_ALL_WORKS({ commit }, filters) {
      const { asList = false } = filters;
      delete filters.asList;

      const data = await apiCall(Api.load_all_works(filters), 'LOAD_ALL_WORKS');
      const res = data.filter(row => row.units != 0)
        .sort((a, b) => {
          // Order by the Priority Index and then by cost in descending mode
          let sorting = b.priority_index - a.priority_index
          if (sorting == 0) { sorting = b.cost - a.cost }
          return sorting
        })
      if (asList) {
        return res
      }
      commit('SET_GENERATED_TREATMENTS', res)
      return 'success'
    },

    async ASSIGN_PLAN({ commit }, payload) {
      return await apiCall(Api.assign_plan(payload), 'ASSIGN_PLAN', 201);
    },

    async ASSIGN_BUDGET({ commit }, payload) {
      return await apiCall(Api.assign_budget(payload), 'ASSIGN_BUDGET', 201);
    },

    async UNASSIGN_BUDGET({ commit }, payload) {
      return await apiCall(Api.unassign_budget(payload), 'UNASSIGN_BUDGET', 201);
    },

    async CLEAR_ALL_ASSIGNMENTS({ dispatch, commit, rootGetters }, { work_list_id, region_id, year }) {
      const params = { work_list_id, region_id, is_budget_assigned: 1, asList: true }
      const data = await dispatch('LOAD_ALL_WORKS', params)
      if (data.length == 0) return;

      // Get the array of unapproved budget_id's
      const unapprovedBudgets = rootGetters['Planning/budgetsByRegionAndYear'](region_id, year, true).map((row) => row.budget_id)

      // Only unapproved budgets
      const filteredWorks = data.filter(item => unapprovedBudgets.includes(item.fk_budget))
        .map((work) => work.treatment_id);

      const payload = { treatment_id: filteredWorks, note: "Cleared all assignments with unapproved budgets by user" }
      return dispatch('UNASSIGN_BUDGET', payload)
    },

    async POPULATE_TREATMENTS({ state, dispatch, commit, rootGetters }, { work_list_id, region_id, year }) {
      // call dispatch in order to calculate amounts of already assigned treatments
      const params = {
        work_list_id,   //: work_list_id,
        region_id,  //: region,
        is_plan_assigned: 1,
        is_approved_plan_assigned: 1,
        is_budget_assigned: 1
      }
      await dispatch('LOAD_ALL_WORKS', params)

      // Convert the budgetsByRegionAndYear array to an object for quick access by category
      const categoryLimits = rootGetters['Planning/budgetsByRegionAndYear'](region_id, year, true)
        .reduce((acc, item) => {
          const assignedAmount = rootGetters['assignedTreatmentsSummary'](item.budget_id)?.totalSum
          acc[item.fk_work_category] = { sum: item.amount_kgs - assignedAmount, id: item.budget_id };
          return acc
        }, {})

      // clear the list
      commit('SET_ASSIGNED_TREATMENTS_LIST', [])
      try {
        const params = {
          work_list_id, //: work_list_id,
          region_id,  //: region,
          is_plan_assigned: 1,
          is_approved_plan_assigned: 1,
          is_budget_assigned: 0,
          asList: true
        }
        const data = await dispatch('LOAD_ALL_WORKS', params)

        // Initiate fk_work_category and budget limits in one reduce call
        const resultArray = data.reduce((acc, item) => {
          const category = item.fk_work_category
          const limitObj = categoryLimits[category]

          if (!limitObj) { return acc }   // skip if there is no such category

          // Initialize the sum for a category if it hasn't been encountered yet
          if (!acc.categoryTotals[category]) { acc.categoryTotals[category] = 0 }

          // Update the accumulated amount
          const updatedTotal = acc.categoryTotals[category] + item.cost   //total_cost

          // If the accumulated amount is less than the category limit, we add the element to the result
          if (updatedTotal <= limitObj.sum) {
            acc.result.push({ ...item, running_total: updatedTotal, fk_budget: limitObj.id });
            acc.categoryTotals[category] = updatedTotal
          }
          return acc;
        }, { result: [], categoryTotals: {} })
        //console.log('resultArray', resultArray)
        // Save the result
        commit('SET_ASSIGNED_TREATMENTS_LIST', resultArray.result)
        dispatch('SAVE_ASSIGNED_TREATMENTS')

        return resultArray.result.length
      } catch ({ response }) {
        throw new Error(response?.data?.msg || `Failed: POPULATE_TREATMENTS`);
      }
    },

    async SAVE_ASSIGNED_TREATMENTS({ state, commit, dispatch }) {

      // TODO: restore it after Andrey resolves ticket #83

      if (state.assignedTreatments.length == 0) {
        return 0
      }
      // Группируем результат по категориям и собираем массив id для каждой категории
      const groupedResult = state.assignedTreatments.reduce((acc, item) => {
        const budget_id = item.fk_budget
        const id = item.treatment_id

        // Если категория еще не добавлена, инициализируем объект для неё
        const existingBudgetId = acc.find(c => c.budget_id === budget_id)
        if (existingBudgetId) {
          existingBudgetId.treatment_id.push(id)
        } else {
          acc.push({
            budget_id: budget_id,
            treatment_id: [id]
          })
        }
        return acc
      }, [])

      return dispatch('ASSIGN_BUDGET', { data: groupedResult })
    },

    async RESET_WORK_LISTS({ commit }) {
      commit('SET_WORKS_LISTS', [])
    },

    async RESET_TREATMENTS({ commit }) {
      commit('SET_GENERATED_TREATMENTS', [])
    },

    async GET_TITLE_LIST_SUMMARY({ commit }, work_list_id) {
      return await handleApiCall({
        request: Api.get_title_list_summary(work_list_id),
        caller: 'GET_TITLE_LIST_SUMMARY',
        commit, mutation: 'SET_TITLE_LIST_SUMMARY'
      });
    }
  },

  mutations: {
    SET_WORKS_LISTS(state, list) {
      state.worksLists = [...list]
    },

    /*DEL_WORK_LIST(state, id) {
      let ind = state.worksLists.findIndex((row) => row.work_list_id === id)
      if (ind >= 0) state.worksLists.splice(ind, 1)
    },*/

    SET_GENERATED_TREATMENTS(state, list) {
      state.treatmentsList = [...list]
    },

    SET_ASSIGNED_TREATMENTS_LIST(state, list) {
      state.assignedTreatments = [...list]
    },

    DELETE_ASSIGNED_TREATMENTS(state, payload) {
      // Удаление объектов, которые соответствуют budget_id и хотя бы одному значению из section_maintenance_plan_id
      state.assignedTreatments = state.assignedTreatments.filter(item => {
        // Если budget_id не совпадает, оставить элемент
        //if (item.budget_id !== payload.budget_id) {
        //   return true;
        // }

        // Проверить, если хотя бы один элемент treatment_id совпадает
        return !payload.includes(item.treatment_id);
      });
    },

    SET_TITLE_LIST_SUMMARY(state, list) {
      state.summaryList = [...list]
    }
  },

  getters: {
    yearsInWorkList: (state) => {
      return getUniqueValues(state.worksLists, 'year', 'work_list_id', true);
    },

    roadsInTreatmentsList: (state) => {
      return getUniqueValues(state.treatmentsList, 'road_description', 'fk_road', true);
    },

    filteredTreatments: (state) => (fk_road, amounts = 1000) => {
      return state.treatmentsList.filter(item => !fk_road || item.fk_road == fk_road)
      .map(item => ({
        ...item,
        cost: item.cost / amounts
      }));
    },

    treatmentsSummary: (state, getters) => (fk_road, amounts = 1000) => {
      const filtered = getters.filteredTreatments(fk_road, amounts);
      const totalRecords = filtered.length;
      const totalSum = filtered.reduce((sum, work) => sum + work.cost, 0);
      const totalLength = filtered.reduce((sum, work) => sum + work.length_m, 0);

      return {
        totalRecords,
        totalSum,
        totalLength
      };
    },

    getAssignedTreatments: (state) => (budget_id) => {
      const res = state.treatmentsList.filter(item => item.fk_budget != null)
      return (!budget_id) ? res : res.filter(item => item.fk_budget == budget_id)
    },

    assignedTreatmentsSummary: (state, getters) => (budget_id) => {
      const assignedTreatments = getters.getAssignedTreatments(budget_id)
      const totalRecords = assignedTreatments.length
      //const ind = assignedTreatments[totalRecords-1].running_total
      //console.log(ind)
      const totalSum = assignedTreatments.reduce((sum, work) => sum + work.cost, 0)
      const totalLength = assignedTreatments.reduce((sum, work) => sum + work.length_m, 0)

      return {
        totalRecords,
        totalSum,
        totalLength
      }
    },

    // Delete it ??? as it is seemss slower than fitering in the component
    treatmentsByPlanId: (state) => (plan_id) => {
      if (!plan_id) {
        return state.treatmentsList
      }
      return state.treatmentsList.filter(work => work.fk_plan === plan_id)
    },

    treatmentsSummaryByRegion: (state, getters) => (region_id) => {
      const filteredWorks = getters.treatmentsByRegion(region_id)
      const totalRecords = filteredWorks.length
      const totalSum = filteredWorks.reduce((sum, work) => sum + work.cost, 0)
      const totalLength = filteredWorks.reduce((sum, work) => sum + work.length_m, 0)

      return {
        totalRecords,
        totalSum,
        totalLength
      }
    },

    treatmentsSummaryByPlanId: (state, getters) => (plan_id) => {
      const filteredWorks = getters.treatmentsByPlanId(plan_id)
      const totalRecords = filteredWorks.length
      const totalSum = filteredWorks.reduce((sum, work) => sum + work.cost, 0)
      const totalLength = filteredWorks.reduce((sum, work) => sum + work.length_m, 0)

      return {
        totalRecords,
        totalSum,
        totalLength
      }
    },

    summaryListRegions: (state) => {
      // Get unique regions
      return [...new Set(state.summaryList.map(item => item.region_description))]
    },

    summaryListRows: (state, getters) => (amountLabel, divisor = 1000, showTotals = '') => {
      const rows = {};
      const totals = { length_m: {}, cost_kgs: {}, total_cost: 0, total_length: 0, units: '' }

      //Заполняем объект значениями по регионам и категориям работ, исключая work_category_description === null
      state.summaryList.forEach(item => {
        if (!item.work_category_description) return; // Пропускаем строки с null в work_category_description

        const category = item.work_category_description;
        const region = item.region_description;

        if (!rows[category]) {
          rows[category] = {
            length_m: {},
            cost_kgs: {},
            total_cost: 0,
            total_length: 0,
            units: ''
          };
        }

        if (!rows[category].length_m[region]) {
          rows[category].length_m[region] = 0;
          rows[category].cost_kgs[region] = 0;
        }

        // Data per category per region
        rows[category].length_m[region] += item.length_m || 0;
        rows[category].cost_kgs[region] += item.total_cost_kgs || 0;
        rows[category].units = item.unit_description || '';

        // Total data per category (for the row)
        rows[category].total_length += item.length_m || 0;
        rows[category].total_cost += item.total_cost_kgs || 0;

        // Total data per region (for the column)
        totals.length_m[region] = (totals.length_m[region] || 0) + item.length_m
        totals.cost_kgs[region] = (totals.cost_kgs[region] || 0) + item.total_cost_kgs

        // Total data for totals (for the column)
        totals.total_length += item.length_m
        totals.total_cost += item.total_cost_kgs
        totals.units = item.unit_description;
      });

      const regions = getters.summaryListRegions
      const result = []
      Object.keys(rows).forEach(category => {
        result.push({
          cat: category,
          units: rows[category].units,
          total: rows[category].total_length,
          ...regions.map(region => rows[category].length_m[region] || 0)
        })
        result.push({
          cat: '',
          units: amountLabel,
          total: rows[category].total_cost / divisor,
          ...regions.map(region => (rows[category].cost_kgs[region] || 0) / divisor)
        })
      });

      // Add total lilne
      if (showTotals) {
        result.push({
          cat: showTotals,
          units: totals.units,
          total: totals.total_length,
          ...regions.map(region => totals.length_m[region] || 0)
        })
        result.push({
          cat: '',
          units: amountLabel,
          total: totals.total_cost / divisor,
          ...regions.map(region => (totals.cost_kgs[region] || 0) / divisor)
        })
      }
      return result
    }
  }
}
