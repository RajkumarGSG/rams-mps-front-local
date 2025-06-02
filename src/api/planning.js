/* 
File: planning.js
Description: API connections for the async functions for old planning functionality.
*/
import { createApiMethods, apiPost, apiPut } from '@/api'

export const budgetApi = {
  ...createApiMethods('/rdb/budget', true),
  approve_budget(id) { return apiPut('/rdb/budget/approve', id, null); },
  cancel_budget_approval(id) { return apiPut('/rdb/budget/cancel_approval', id, null); },
};

export const planApi = { // Periodic Maintenance Planning API calls
  ...createApiMethods('/plan', true, true),
  /* Additional API calls */
  approve_plan(id) { return apiPut('/plan/approve', id, null); },
  cancel_plan(id) { return apiPut('/plan/cancel_approval', id, null); },
};

export const rmPlanApi = { // Routine Maintenance Planning API calls
  ...createApiMethods('/routine_plan', true),
  approve_plan(id) { return apiPut('/routine_plan/approve', id, null); },
  cancel_plan(id) { return apiPut('/routine_plan/cancel_approval', id, null); },
};

export const rmPlanDetailApi = { // Routine Maintenance Plan Details API calls
  ...createApiMethods('/routine_plan_details', true),
  save_batch(payload) { return apiPost('/routine_plan_details/batch', payload); },
};