// import.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiCall, handleApiCall } from '@/store/helpers/apicall_helpers'
import { roadApi, sectionApi, conditionApi } from "@/api/road_network";
import RoadNetwork from '@/store/refdata/road_network';
import { importApi } from "@/api/reference_data";
import ReferenceData from '@/store/refdata/reference_data';

vi.mock('@/api/road_network');
vi.mock('@/api/reference_data');
vi.mock('@/store/helpers/apicall_helpers', () => ({
  apiCall: vi.fn(),
  handleApiCall: vi.fn(),
  createActions: vi.fn(),
}));

describe('import.js Vuex module', () => {
  let commit

  beforeEach(() => {
    commit = vi.fn()
    vi.clearAllMocks()
  })

  it('should call GET_ROAD_IMPORT_TEMPLATE action', async () => {
    await RoadNetwork.actions.GET_ROAD_IMPORT_TEMPLATE({ commit });
    expect(apiCall).toHaveBeenCalledWith(roadApi.get_road_import_template(), 'GET_ROAD_IMPORT_TEMPLATE')
  })

  it('should call GET_SECTION_IMPORT_TEMPLATE action', async () => {
    await RoadNetwork.actions.GET_SECTION_IMPORT_TEMPLATE({ commit })
    expect(apiCall).toHaveBeenCalledWith(sectionApi.get_section_import_template(), 'GET_SECTION_IMPORT_TEMPLATE')
  })

  it('should call GET_IRI_IMPORT_TEMPLATE action', async () => {
    await RoadNetwork.actions.GET_IRI_IMPORT_TEMPLATE({ commit })
    expect(apiCall).toHaveBeenCalledWith(conditionApi.get_iri_import_template(), 'GET_IRI_IMPORT_TEMPLATE')
  })

  it('should call GET_RUTTING_IMPORT_TEMPLATE action', async () => {
    await RoadNetwork.actions.GET_RUTTING_IMPORT_TEMPLATE({ commit })
    expect(apiCall).toHaveBeenCalledWith(conditionApi.get_rutting_import_template(), 'GET_RUTTING_IMPORT_TEMPLATE')
  })

  it('should call IMPORT_ROAD action with file', async () => {
    const fileMock = { name: 'road.xlsx' }
    await RoadNetwork.actions.IMPORT_ROAD({ commit }, fileMock)
    expect(apiCall).toHaveBeenCalledWith(roadApi.import_road(fileMock), 'IMPORT_ROAD', 201)
  })

  it('should call IMPORT_SECTION action with file', async () => {
    const fileMock = { name: 'section.xlsx' }
    await RoadNetwork.actions.IMPORT_SECTION({ commit }, fileMock)
    expect(apiCall).toHaveBeenCalledWith(sectionApi.import_section(fileMock), 'IMPORT_SECTION', 201)
  })

  it('should call IMPORT_DATA100 action with files and section_id', async () => {
    const valuesMock = { import_files: [{ name: 'data100.xlsx' }], section_id: 42 }
    await RoadNetwork.actions.IMPORT_DATA100({ commit }, valuesMock)
    expect(apiCall).toHaveBeenCalledWith(conditionApi.import_data100(valuesMock.import_files, 42), 'IMPORT_DATA100', 201)
  })

  it('should call IMPORT_LOG_ALL action and commit mutation', async () => {
    const batchIdMock = 123;
    await ReferenceData.actions.IMPORT_LOG_ALL({ commit }, batchIdMock);
    expect(handleApiCall).toHaveBeenCalledWith({
      request: importApi.get_import_log_all(batchIdMock),
      caller: 'IMPORT_LOG_ALL',
      commit, mutation: 'SET_LIST',
      mutationKey: 'import_status'
    });
  });

  it('should call IMPORT_LOG_BY_ID action', async () => {
    const logIdMock = 456;
    await ReferenceData.actions.IMPORT_LOG_BY_ID({ commit }, logIdMock);
    expect(apiCall).toHaveBeenCalledWith(importApi.get_import_log_by_id(logIdMock), 'IMPORT_LOG_BY_ID');
  });

  it('should commit SET_IMPORT_STATUS mutation', () => {
    const statusList = [{ id: 1, status: 'success' }];
    ReferenceData.mutations.SET_LIST(ReferenceData.state, { key: 'import_status', data: statusList});
    expect(ReferenceData.state.import_status).toEqual(statusList);
  });
})
