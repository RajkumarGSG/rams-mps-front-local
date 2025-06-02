// budget.spec.js
import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApiMock_new } from '../mocks/apiMockFactory';
import { budgetApi } from '@/api/planning';
import Plans from '@/store/planning'

import { apiCall } from '@/store/helpers/apicall_helpers'

vi.mock("@/api/planning", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    budgetApi: {
      ...createApiMock_new("Budgets"),
      approve_budget: vi.fn(),
      cancel_budget_approval: vi.fn(),
    },
  };
});
vi.mock('@/store/helpers/apicall_helpers', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    apiCall: vi.fn(),
  }
});

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ modules: { Plans } });

// Change to check only the getters, as we test the CRUD in another tests
describe('budget.js Vuex module', () => {
  let commit, state

  beforeEach(() => {
    commit = vi.fn()
    state = {
      budget_list: [
        { budget_id: 1, fk_region: 2, year: 2023, fk_work_category: 4, work_category: 'Maintenance', approved: true, amount_kgs: 100, amount_usd: 10, treatment_count: 5 },
        { budget_id: 2, fk_region: 2, year: 2023, fk_work_category: 6, work_category: 'Repair', approved: false, amount_kgs: 200, amount_usd: 20, treatment_count: 10 },
      ]
    }
    vi.clearAllMocks()
  })

  it('should call APPROVE_BUDGET action', async () => {
    const budgetId = 1
    await Plans.actions.APPROVE_BUDGET({ commit }, budgetId)
    expect(apiCall).toHaveBeenCalledWith(budgetApi.approve_budget(budgetId), 'APPROVE_BUDGET', 201)
  })

  it('should call CANCEL_BUDGET_APPROVAL action', async () => {
    const budgetId = 1
    await Plans.actions.CANCEL_BUDGET_APPROVAL({ commit }, budgetId)
    expect(apiCall).toHaveBeenCalledWith(budgetApi.cancel_budget_approval(budgetId), 'CANCEL_BUDGET_APPROVAL', 201)
  })

  it('budgetsByRegionAndYear getter should filter by region', () => {
    const result = Plans.getters.budgetsByRegionAndYear(state)(2, 2023)
    expect(result.length).toBe(2)
  })

  it('budgetsByCategory getter should filter by region', () => {
    const mockGetters = {
      budgetsByRegionAndYear: () => state.budget_list, // явно возвращаем массив из состояния
    }
    const result = Plans.getters.budgetsByCategory(state, mockGetters)(2, 2023, 4)
    expect(result.length).toBe(1)
  })

  it('budgetSummary getter should calculate summary correctly', () => {
    const mockGetters = {
      budgetsByRegionAndYear: () => state.budget_list, // явно возвращаем массив из состояния
    }
    const summary = Plans.getters.budgetSummary(state, mockGetters)(2, 2023)
    expect(summary).toEqual({
      totalRecords: 2,
      totalKGS: 300,
      totalUSD: 30,
      totalTreatments: 15,
      totalApproved: 100,
      approved: false,
    })
  })
/*
  it('allocatedBudgetByRegionAndYear getter should calculate allocations', () => {
    const mockGetters = {
      budgetsByRegionAndYear: () => state.list, // явно возвращаем массив из состояния
    }
    const allocated = Plans.getters.allocatedBudgetByRegionAndYear(state, mockGetters)(2, 2023)
    expect(allocated).toEqual({ periodic: undefined, routine: 200, approved: false })
  })
  */
})
