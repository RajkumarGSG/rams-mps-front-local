import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { createApiMock, createApiMock_new } from '../mocks/apiMockFactory';
import * as roadNetworkApi from "@/api/road_network";
import RoadNetwork from '@/store/refdata/road_network';
import * as referenceDataApi from '@/api/reference_data';
import ReferenceData from '@/store/refdata/reference_data'
import { budgetApi, planApi, rmPlanApi, rmPlanDetailApi } from '@/api/planning';
import Planning from '@/store/planning';

const {
  regionApi, deuApi, roadApi, sectionApi, sectionGeometryApi, districtApi,
  districtSectionApi, conditionApi, trafficSiteApi, trafficInstallationApi, homoSectionApi
} = roadNetworkApi;

const {
  workCategoryApi, unitsApi, inventoryApi, inventoryTypeApi, inventoryEventApi,
  treatmentTypeApi, treatmentRateApi, treatmentMatrixApi, conditionIndexCriteriaApi,
  userApi, groupApi, roleApi, userRoleApi, apiPathApi
} = referenceDataApi;

vi.mock("@/api/road_network", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    regionApi: createApiMock_new("Region"),
    deuApi: createApiMock_new("DEU"),
    roadApi: {
      ...createApiMock_new("Road"),
      //loadShortList: vi.fn(() => Promise.resolve({ id: 1, name: "Region 1" }))
    },
    sectionApi: {
      ...createApiMock_new("Section"),
      get_region_road_id_from_section: vi.fn(() => Promise.resolve({ id: 1, name: "Region 1" }))
    },
    sectionGeometryApi: createApiMock_new("Section Geometry"),
    districtApi: createApiMock_new("District"),
    districtSectionApi: createApiMock_new("Section District"),

    conditionApi: createApiMock_new("Road Conditions"),
    trafficSiteApi: createApiMock_new("Traffic Sites"),
    trafficInstallationApi: createApiMock_new("Traffic Installations"),

    homoSectionApi: createApiMock_new("Homogeneous Sections"),
  };
});

vi.mock("@/api/reference_data", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // TODO: finish implementing translations test
    // translationApi: createApiMock_new("Translation"),
    unitsApi: createApiMock_new("Unit"),
    workCategoryApi: createApiMock_new("Work Category"),
    inventoryApi: createApiMock_new("Inventories"),
    inventoryTypeApi: createApiMock_new("Inventory Types"),
    inventoryEventApi: createApiMock_new("Inventory Events"),
    treatmentTypeApi: createApiMock_new("Treatment Types"),
    treatmentRateApi: createApiMock_new("Treatment Rates"),
    treatmentMatrixApi: {
      ...createApiMock_new("Treatment Matrix"),
      load_treatment_matrix_pivot_html: vi.fn(), //() => Promise.resolve({ status: 200, data: "<table><thead></thead></table>"}))
      load_treatment_matrix_pivot_excel: vi.fn()
    },
    conditionIndexCriteriaApi: {
      ...createApiMock_new("Condition Index Criteria"),
      load_condition_index_criteria_pivot: vi.fn(),
    },
    groupApi: createApiMock_new("Groups"),
    userApi: createApiMock_new("Users"),
    roleApi: createApiMock_new("Roles"),
    userRoleApi: createApiMock_new("User Roles"),
    apiPathApi: createApiMock_new("API Paths"),
  };
});

vi.mock("@/api/planning", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    budgetApi: createApiMock_new("Budgets"),
    planApi: createApiMock_new("Planning"),
    rmPlanApi: createApiMock_new("Routine Maintenance Planning"),
    rmPlanDetailApi: createApiMock_new("Routine Maintenance Plan details"),
  };
});

// Modules configuration
const modulesConfig = {
  RoadNetwork: { mutations: RoadNetwork.mutations, actions: RoadNetwork.actions },
  ReferenceData: { mutations: ReferenceData.mutations, actions: ReferenceData.actions },
  Planning: { mutations: Planning.mutations, actions: Planning.actions },
};

const modulesParams = [
  { name: 'REGION', module: 'RoadNetwork', api: regionApi, list: 'region_list', paramName: '', paramVal: [] },
  { name: 'DEU', module: 'RoadNetwork', api: deuApi, list: 'deu_list', paramName: 'region_id', paramVal: 2, updStatus201: true },
  { name: 'ROAD', module: 'RoadNetwork', api: roadApi, list: 'road_list', paramName: 'road_class', paramVal: 'Ж' },
  { name: 'SECTION', module: 'RoadNetwork', api: sectionApi, list: 'section_list', paramName: 'region_id', paramVal: 2 },
  { name: 'SECTION_GEOMETRY', module: 'RoadNetwork', api: sectionGeometryApi, list: 'section_geometry_list', paramName: 'region_id', paramVal: 2 },
  { name: 'DISTRICT', module: 'RoadNetwork', api: districtApi, list: 'district_list', paramName: 'region_id', paramVal: 2 },
  { name: 'DISTRICT_SECTION', module: 'RoadNetwork', api: districtSectionApi, list: 'district_section_list' },
  { name: 'TRAFFIC_SITE', module: 'RoadNetwork', api: trafficSiteApi, list: 'traffic_site_list', updStatus201: true },
  { name: 'TRAFFIC_INSTALLATION', module: 'RoadNetwork', api: trafficInstallationApi, list: 'traffic_installation_list' },
  { name: 'CONDITION', module: 'RoadNetwork', api: conditionApi, list: 'condition_list', paramName: 'section_id', paramVal: 2, updStatus201: true },
  { name: 'HOMO_SECTION', module: 'RoadNetwork', api: homoSectionApi, list: 'homo_section_list', updStatus201: true },

  { name: 'UNIT', module: 'ReferenceData', api: unitsApi, list: 'unit_list', updStatus201: true },
  { name: 'WORK_CATEGORY', module: 'ReferenceData', api: workCategoryApi, list: 'work_category_list', updStatus201: true },
  { name: 'INVENTORY', module: 'ReferenceData', api: inventoryApi, list: 'inventory_list' },
  { name: 'INVENTORY_TYPE', module: 'ReferenceData', api: inventoryTypeApi, list: 'inventory_type_list', updStatus201: true },
  { name: 'INVENTORY_EVENT', module: 'ReferenceData', api: inventoryEventApi, list: 'inventory_event_list', updStatus201: true },
  { name: 'TREATMENT_TYPE', module: 'ReferenceData', api: treatmentTypeApi, list: 'treatment_type_list', updStatus201: true },
  { name: 'TREATMENT_RATE', module: 'ReferenceData', api: treatmentRateApi, list: 'treatment_rate_list', updStatus201: true },
  { name: 'TREATMENT_MATRIX', module: 'ReferenceData', api: treatmentMatrixApi, list: 'treatment_matrix_list', updStatus201: true },
  { name: 'CONDITION_INDEX_CRITERIA', module: 'ReferenceData', api: conditionIndexCriteriaApi, list: 'condition_index_criteria_list', updStatus201: true },

  { name: 'GROUP', module: 'ReferenceData', api: groupApi, list: 'group_list' },
  { name: 'USER', module: 'ReferenceData', api: userApi, list: 'user_list' },
  { name: 'ROLE', module: 'ReferenceData', api: roleApi, list: 'role_list', updStatus201: true },
  { name: 'USER_ROLE', module: 'ReferenceData', api: userRoleApi, list: 'user_role_list' },
  { name: 'API_PATH', module: 'ReferenceData', api: apiPathApi, list: 'api_path_list' },

  { name: 'BUDGET', module: 'Planning', api: budgetApi, list: 'budget_list', updStatus201: true },
  { name: 'PLAN', module: 'Planning', api: planApi, list: 'plan_list', updStatus201: true },
  { name: 'RM_PLAN', module: 'Planning', api: rmPlanApi, list: 'rm_plan_list', updStatus201: true },
  //{ name: 'RM_PLAN_DETAIL', module: 'Planning', api: rmPlanDetailApi, list: 'rm_plan_detail_list', updStatus201: true },
];
const payload = [{ id: 1, name: 'Test' }];

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ modules: { RoadNetwork, ReferenceData, Planning } });

const mockSuccessResponse = (data, status = 200) => Promise.resolve({ status, data });
//const mockErrorResponse = (msg) => Promise.reject({ response: { data: { msg } } });

describe.each(modulesParams)('APIs for $name' + '', ({ module, list, api, name, paramName, paramVal, updStatus201 }) => {
  const { mutations, actions } = modulesConfig[module];

  // TODO: After optimizing and standardizing all APIS there will be only LOAD_XXX_LIST name
  const oldStyleNames = false;  //(module !== 'RoadNetwork' && module !== 'ReferenceData')
  const mutationName = `SET${oldStyleNames ? `_${name.toUpperCase()}S` : ''}_LIST`;

  function getNames(type = 'load') {
    let result = name.toUpperCase()
    let apiMethodName = ''
    switch (type) {
      case 'load':
        result = `LOAD_${result}${oldStyleNames ? 'S' : ''}_LIST`; // Currently sometimes it can be LOAD_XXXS_LIST
        apiMethodName += 'loadList';
        break;
      case 'byId':
        result = `LOAD_${result}_BY_ID`;
        apiMethodName += 'loadById';
        break;
      case 'add':
        result = `ADD_NEW_${result}`;
        apiMethodName += 'addNew';
        break;
      case 'upd':
        result = `UPDATE_${result}`;
        apiMethodName += 'update';
        break;
      case 'del':
        result = `DELETE_${result}`;
        apiMethodName += 'delete';
        break;
      case 'clear':
        result = `CLEAR_${result}_LIST`;
        break;
    };

    // TODO: After optimizing and standardizing all APIS there will be only standard apiMethodName
    if (oldStyleNames) apiMethodName = result.toLowerCase()
    return { actionName: result, apiMethodName };
  };

  let commit;
  beforeEach(() => {
    commit = vi.fn();
  });

  it('Module should initialize with empty lists', () => {
    expect(store.state[module][list]).toEqual([]);
  });

  it(`${mutationName} should update state when mutation is committed`, () => {
    mutations[mutationName](store.state[module], oldStyleNames ? payload : { key: list, data: payload });
    expect(store.state[module][list]).toEqual(payload);
  });

  it(`LOAD_${name}_LIST should call API and commit mutation`, async () => {
    const { actionName, apiMethodName } = getNames();
    api[apiMethodName].mockReturnValue(mockSuccessResponse(payload));
    const actionSpy = vi.spyOn(actions, actionName);

    const params = {}
    if (name === 'SECTION' || name === 'CONDITION') params[paramName] = 1
    await actions[actionName]({ commit }, params);

    expect(actionSpy).toHaveBeenCalled();
    expect(api[apiMethodName]).toHaveBeenCalled();

    let realPayload = name !== 'TREATMENT_RATE' ? payload : [{ id: 1, name: 'Test', fk_work_category: 0, is_routine: 0 }];
    // TODO: After optimizing and standardizing...
    expect(commit).toHaveBeenCalledWith(mutationName, oldStyleNames ? payload : { key: list, data: realPayload });

    if (paramName) {
      params[paramName] = paramVal
      await actions[actionName]({ commit }, params);
      expect(actionSpy).toHaveBeenCalled();
      expect(api[apiMethodName]).toHaveBeenCalled();

      // TODO: After optimizing and standardizing...
      expect(commit).toHaveBeenCalledWith(mutationName, oldStyleNames ? payload : { key: list, data: payload });
    }
  });

  it(`LOAD_${name}_LIST with forDropdown=true should not commit`, async () => {
    const { actionName, apiMethodName } = getNames();
    api[apiMethodName].mockReturnValue(mockSuccessResponse(payload));

    const res = await actions[actionName]({ commit }, { forDropdown: true });
    expect(api[apiMethodName]).toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
    
    const anotherPayload = [{ id: 1, name: 'Test', fk_work_category: 0, is_routine: 0 }];
    expect(res).toEqual(name !== 'TREATMENT_RATE' ? payload : anotherPayload);
  });

  if (name === 'SECTION') {
    it('GET_REGION_ROAD_FROM_SECTION should call API and return data', async () => {
      const actionName = 'GET_REGION_ROAD_FROM_SECTION';
      const apiMethodName = 'get_region_road_id_from_section';
      api[apiMethodName].mockReturnValue(mockSuccessResponse(payload));

      const result = await actions[actionName]({ commit }, 1);
      expect(result).toEqual(payload);
      expect(api[apiMethodName]).toHaveBeenCalledWith(1);
    });
  };

  if (name === 'TREATMENT_MATRIX') {
    it('LOAD_TREATMENT_MATRIX_PIVOT_HTML should call API and return data', async () => {
      const actionName = 'LOAD_TREATMENT_MATRIX_PIVOT_HTML';
      const apiMethodName = 'load_treatment_matrix_pivot_html';
      api[apiMethodName].mockReturnValue(mockSuccessResponse(payload));
      const result = await actions[actionName]({ commit });
      expect(result).toEqual('success');
      expect(api[apiMethodName]).toHaveBeenCalled();
    });

    it('LOAD_TREATMENT_MATRIX_PIVOT_EXCEL should call API and return data', async () => {
      const actionName = 'LOAD_TREATMENT_MATRIX_PIVOT_EXCEL';
      const apiMethodName = 'load_treatment_matrix_pivot_excel';
      api[apiMethodName].mockReturnValue(mockSuccessResponse(payload));
      const result = await actions[actionName]({ commit });
      expect(api[apiMethodName]).toHaveBeenCalled();
      expect(result).toEqual(payload);
    });

    it('should commit SET_TREATMENT_MATRIX_PIVOT mutation', () => {
      const state = {
        treatmentMatrixPivot: null,
      }
      const matrix = [{ id: 1, value: 100 }]
      ReferenceData.mutations.SET_TREATMENT_MATRIX_PIVOT(state, matrix)
      expect(state.treatmentMatrixPivot).toEqual(matrix)
    })
  };

  //TODO:
  //GET_CONDITION_DATA_BY_COORDS
  //LOAD_CONDITION_DATA_FOR_CHART

  if (!oldStyleNames) {
    it(`${getNames('clear').actionName} should clear the list`, async () => {
      const { actionName } = getNames('clear');
      const res = await actions[actionName]({ commit });
      expect(res).toEqual('success');
      expect(commit).toHaveBeenCalledWith('SET_LIST', { key: list, data: [] });
      //expect(store.state[module][list]).toEqual([]);
    });
  }

  it(`LOAD_${name}_BY_ID should return error if no id provided`, async () => {
    const { actionName, apiMethodName } = getNames('byId');
    await expect(actions[actionName]({ commit })).rejects.toThrow(`Failed: ${actionName}`)
    expect(commit).not.toHaveBeenCalled();

    expect(api[apiMethodName]).toHaveBeenCalledWith(undefined);
  });

  it(`LOAD_${name}_BY_ID should return error if wrong id provided`, async () => {
    const { actionName, apiMethodName } = getNames('byId');
    await expect(actions[actionName]({ commit }, 9999)).rejects.toThrow(`Failed: ${actionName}`)
    expect(commit).not.toHaveBeenCalled();

    expect(api[apiMethodName]).toHaveBeenCalledWith(undefined);
  });

  it(`LOAD_${name}_BY_ID should call API and return data`, async () => {
    const { actionName, apiMethodName } = getNames('byId');
    api[apiMethodName].mockReturnValue(mockSuccessResponse(payload));

    const result = await actions[actionName]({ commit }, 1);
    expect(result).toEqual(payload);
    expect(commit).not.toHaveBeenCalled();

    expect(api[apiMethodName]).toHaveBeenCalledWith(1);
  });

  it(`ADD_NEW_${name} should call API and return data`, async () => {
    const { actionName, apiMethodName } = getNames('add');
    const newItem = { name: 'New Item' };
    const response = { id: 99, ...newItem };

    api[apiMethodName].mockReturnValue(mockSuccessResponse(response, 201));

    const result = await actions[actionName]({ commit }, newItem);
    expect(result).toEqual(response);
    expect(commit).not.toHaveBeenCalled();

    expect(api[apiMethodName]).toHaveBeenCalledWith(newItem);
  });

  it(`UPDATE_${name} should call API and return data`, async () => {
    const { actionName, apiMethodName } = getNames('upd');
    const id = 1;
    const theItem = { name: 'Updated Item' };

    if (updStatus201) { // returns 201 as a success
      api[apiMethodName].mockReturnValue(mockSuccessResponse(id, 201));
    } else { // returns 200 as a success
      api[apiMethodName].mockReturnValue(mockSuccessResponse(id));
    }

    const result = await actions[actionName]({ commit }, { id, theItem });
    expect(result).toEqual(id);
    expect(commit).not.toHaveBeenCalled();

    expect(api[apiMethodName]).toHaveBeenCalledWith(id, theItem);
  });

  it(`DELETE_${name} should call API and return success`, async () => {
    const { actionName, apiMethodName } = getNames('del');
    const itemId = 1;
    const response = { success: true };

    api[apiMethodName].mockReturnValue(mockSuccessResponse(response));

    const result = await actions[actionName]({ commit }, itemId);
    expect(commit).not.toHaveBeenCalled();

    expect(api[apiMethodName]).toHaveBeenCalledWith(itemId);
    expect(result).toEqual(response);
  });
});

describe('Condition getters', () => {
  const state = {
    condition_list: [
      { id: 1, survey_year: '2023' },
      { id: 2, survey_year: '2024' },
      { id: 3, survey_year: '2023' },
    ],
  };

  it('conditionListFiltered should return filtered list by year', () => {
    const result = RoadNetwork.getters.conditionListFiltered(state)('2023');
    expect(result).toEqual([
      { id: 1, survey_year: '2023' },
      { id: 3, survey_year: '2023' },
    ]);
  });

  it('conditionListFiltered should return all items if year is not provided', () => {
    const result = RoadNetwork.getters.conditionListFiltered(state)();
    expect(result).toEqual(state.condition_list);
  });

  it('conditionListFiltered should return empty list if no matching year', () => {
    const result = RoadNetwork.getters.conditionListFiltered(state)('2020');
    expect(result).toEqual([]);
  });

  it('yearsInConditionList should return list of years', () => {
    const result = RoadNetwork.getters.yearsInConditionList(state);
    expect(result).toEqual([
      { id: 0, description: '' },
      { id: '2023', description: '2023' },
      { id: '2024', description: '2024' },
    ]);
  });
});

describe('Treatment Types getters', () => {
  let commit, state

  beforeEach(() => {
    commit = vi.fn()
    state = {
      treatment_type_list: [
        { treatment_type_id: 1, fk_unit: 2, fk_work_category: 3 },
        { treatment_type_id: 2, fk_unit: 4, fk_work_category: 3 }
      ],
      treatmentRatesList: [],
      treatmentMatrix: [],
      treatmentMatrixPivot: null,
      variablesList: []
    }
    vi.clearAllMocks()
  });

  it('treatmentTypesFiltered getter filters by unit and category', () => {
    const result = ReferenceData.getters.treatmentTypesFiltered(state)(2, 3)
    expect(result).toEqual([{ treatment_type_id: 1, fk_unit: 2, fk_work_category: 3 }])
  });
});