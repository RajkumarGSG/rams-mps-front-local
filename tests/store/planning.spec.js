// planning.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import planningModule from '@/store/planning'
/*
vi.mock('@/api/planning', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  }
});

vi.mock('@/store/helpers/apicall_helpers', () => ({
  apiCall: vi.fn(),
}))
*/
describe('planning.js Vuex module', () => {
  let commit, state

  beforeEach(() => {
    commit = vi.fn()
    state = {
      plan_list: [
        { id: 1, name: 'Plan A', fk_region: 2, year: 2024, approved_by_user_id: 10, region_description: 'North' },
        { id: 2, name: 'Plan B', fk_region: 2, year: 2024, approved_by_user_id: null, region_description: 'North' },
      ],
      dropdownList: [
        { id: 1, name: 'Plan A', fk_region: 2, year: 2024, approved_by_user_id: 10 },
        { id: 2, name: 'Plan B', fk_region: 2, year: 2024, approved_by_user_id: null },
      ]
    }
    vi.clearAllMocks()
  })
/*
  it('should call LOAD_PLAN_LIST action and commit SET_PLAN_LIST mutation', async () => {
    const payload = { region_id: 2, year: 2024, forDropdown: false }
    const mockData = [{ id: 3, name: 'Plan C', region_description: 'East' }]

    apiCall.mockResolvedValue(mockData)

    await planningModule.actions.LOAD_PLAN_LIST({ commit }, payload)

    expect(apiCall).toHaveBeenCalledWith(Api.load_plan_list(2, 2024), 'LOAD_PLAN_LIST')
    expect(commit).toHaveBeenCalledWith('SET_PLAN_LIST', mockData)
  })

  it('should call ADD_PLAN action', async () => {
    const plan = { name: 'Plan New' }
    await planningModule.actions.ADD_PLAN({ commit }, plan)
    expect(apiCall).toHaveBeenCalledWith(Api.add_plan(plan), 'ADD_PLAN', 201)
  })

  it('should commit SET_PLAN_LIST mutation', () => {
    const plans = [{ id: 5, name: 'Plan X' }]
    planningModule.mutations.SET_PLAN_LIST(state, plans)
    expect(state.list).toEqual(plans)
  })
*/
  it('filterAndSortPlans getter returns filtered result', () => {
    const getterFunction = planningModule.getters.filterAndSortPlans(state)
    const res = getterFunction(2, 2024, true)
    expect(res).toEqual([{ id: 1, name: 'Plan A' }])
  })

  it('plansApproved getter returns only approved plans', () => {
    const mockGetters = {
      filterAndSortPlans: planningModule.getters.filterAndSortPlans(state)
    };
    const res = planningModule.getters.plansApproved(state, mockGetters)(2, 2024, true);
    expect(res).toEqual([{ id: 1, name: 'Plan A' }]);
  })

  it('plansNotApproved getter returns only non-approved plans', () => {
    const mockGetters = {
      filterAndSortPlans: planningModule.getters.filterAndSortPlans(state),
    };
    const getterFunction = planningModule.getters.plansNotApproved(state, mockGetters);
    const res = getterFunction(2, 2024, true);
  
    expect(res).toEqual([{ id: 2, name: 'Plan B' }]);
  });

  it('planApproved getter correctly identifies approved plan', () => {
    const res = planningModule.getters.planApproved(state)(1)
    expect(res).toBe(true)
  })

  it('findPlanByName getter returns correct plan ID', () => {
    const res = planningModule.getters.findPlanByName(state)('Plan B')
    expect(res).toBe(2)
  })

  it('yearsInPlanList getter returns unique sorted years', () => {
    const res = planningModule.getters.yearsInPlanList(state)
    expect(res).toEqual([
      { id: 0, description: '' },
      { id: 2024, description: 2024 },
    ])
  })

  it('planListByYear getter filters plans by year', () => {
    const res = planningModule.getters.planListByYear(state)(2024)
    expect(res.length).toBe(2)
  })
})
