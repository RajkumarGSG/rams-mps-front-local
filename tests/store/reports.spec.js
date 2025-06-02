// reports.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Api from '@/api/reports';
import reportsModule from '@/store/reports';
import { handleApiCall } from '@/store/helpers/apicall_helpers';

//vi.mock('@/api/reports')
vi.mock('@/store/helpers/apicall_helpers', () => ({
  handleApiCall: vi.fn()
}));

describe('reports.js Vuex module', () => {
  let commit, state;

  beforeEach(() => {
    commit = vi.fn();
    state = {
      report_7_data: [
        { road_id: 1, road_description: 'Road A', distance: 100 },
        { road_id: 2, road_description: 'Road B', distance: 200 },
      ],
      report_12_data: [
        { region_id: 1, road_class: 'A', zone_1: 50, zone_2: 50, zone_3: 100, zone_4: 100, zone_5: 200, zone_6: 0, total: 500 },
        { region_id: 1, road_class: 'B', zone_1: 100, zone_2: 100, zone_3: 200, zone_4: 200, zone_5: 500, zone_6: 100, total: 1150 },
        { region_id: 2, road_class: 'B', zone_1: 100, zone_2: 100, zone_3: 200, zone_4: 200, zone_5: 500, zone_6: 100, total: 1150 },
      ]
    };
    vi.clearAllMocks();
  });

  it('should call REPORT_1_ADMINISTRATIVE_SETUP action', async () => {
    await reportsModule.actions.REPORT_1_ADMINISTRATIVE_SETUP({ commit }, { inserted_date: '2024-01-01', region_id: 1 });
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_1_administrative_setup('2024-01-01', 1),
      caller: 'REPORT_1_ADMINISTRATIVE_SETUP',
      commit, mutation: 'SET_REPORT',
      mutationKey: 1
    });
  });

  it('should call REPORT_2_ROAD_INFO action', async () => {
    const values = { inserted_date: '2024-01-01', region_id: 1, deu_id: 2, road_class: 3 };
    await reportsModule.actions.REPORT_2_ROAD_INFO({ commit }, values);
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_2_roads_info('2024-01-01', 1, 2, 3),
      caller: 'REPORT_2_ROAD_INFO',
      commit, mutation: 'SET_REPORT',
      mutationKey: 2
    });
  });

  it('should call REPORT_3_YEARWISE_LENGTH action', async () => {
    await reportsModule.actions.REPORT_3_YEARWISE_LENGTH({ commit }, {});
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_3_year_wise_road_length(),
      caller: 'REPORT_3_YEARWISE_LENGTH',
      commit, mutation: 'SET_REPORT',
      mutationKey: 3
    });
  });

  it('should call REPORT_4_LENGTH_BY_TRAFFIC action', async () => {
    await reportsModule.actions.REPORT_4_LENGTH_BY_TRAFFIC({ commit }, {});
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_4_road_length_by_traffic(),
      caller: 'REPORT_4_LENGTH_BY_TRAFFIC',
      commit, mutation: 'SET_REPORT',
      mutationKey: 4
    });
  });

  it('should call REPORT_5_ROADWAY_DETAILS action', async () => {
    await reportsModule.actions.REPORT_5_ROADWAY_DETAILS({ commit }, {});
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_5_road_way_details(),
      caller: 'REPORT_5_ROADWAY_DETAILS',
      commit, mutation: 'SET_REPORT',
      mutationKey: 5
    });
  });

  it('should call REPORT_6_ROAD_SECTIONS action', async () => {
    await reportsModule.actions.REPORT_6_ROAD_SECTIONS({ commit }, {});
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_6_sections(),
      caller: 'REPORT_6_ROAD_SECTIONS',
      commit, mutation: 'SET_REPORT',
      mutationKey: 6
    });
  });

  it('should call REPORT_7_ROAD_CONDITION_DATA action', async () => {
    await reportsModule.actions.REPORT_7_ROAD_CONDITION_DATA({ commit }, {});
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_7_road_condition_summary(),
      caller: 'REPORT_7_ROAD_CONDITION_DATA',
      commit, mutation: 'SET_REPORT',
      mutationKey: 7
    });
  });

  it('report_7_total getter calculates total distance', () => {
    const result = reportsModule.getters.report_7_total(state);
    expect(result).toBe(300);
  })

  it('roadsInReport7 getter returns sorted unique roads', () => {
    const result = reportsModule.getters.roadsInReport7(state);
    expect(result).toEqual([
      { id: 0, description: '' },
      { id: 1, description: 'Road A' },
      { id: 2, description: 'Road B' }
    ]);
  });

  it('should call REPORT_8_ROAD_CONDITION_INDEX action', async () => {
    const values = { region_id: 1, survey_year: 2023 };
    await reportsModule.actions.REPORT_8_ROAD_CONDITION_INDEX({ commit }, values);
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_8_region_wise_condition(1, 2023),
      caller: 'REPORT_8_ROAD_CONDITION_INDEX',
      commit, mutation: 'SET_REPORT',
      mutationKey: 8
    });
  });

  it('should call REPORT_9_YEARLY_CONDITION_INDEX action', async () => {
    await reportsModule.actions.REPORT_9_YEARLY_CONDITION_INDEX({ commit }, { region_id: 1 });
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_9_yearly_condition(),
      caller: 'REPORT_9_YEARLY_CONDITION_INDEX',
      commit, mutation: 'SET_REPORT',
      mutationKey: 9
    });
  });

  it('should call REPORT_10_SECTION_WISE_AADT action', async () => {
    await reportsModule.actions.REPORT_10_SECTION_WISE_AADT({ commit });
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_10_section_wise_aadt(),
      caller: 'REPORT_10_SECTION_WISE_AADT',
      commit, mutation: 'SET_REPORT',
      mutationKey: 10
    });
  });

  it('should call REPORT_11_TOTAL_ELEVATION_ZONES action', async () => {
    const data = [{ region_id: 1, zone_1: 100, zone_2: 200 }];
    await reportsModule.actions.REPORT_11_TOTAL_ELEVATION_ZONES({ commit }, data);
    expect(handleApiCall).toHaveBeenCalledWith({
      request: Api.report_11_total_elevation_zones(),
      caller: 'REPORT_11_TOTAL_ELEVATION_ZONES',
      commit, mutation: 'SET_REPORT',
      mutationKey: 11
    });
  });

  it('report_11_total getter calculates total elevation zones', () => {
    state.report_11_data = [
      { region_id: 1, zone_1: 50, zone_2: 50, zone_3: 100, zone_4: 100, zone_5: 200, zone_6: 0, total: 500 },
      { region_id: 2, zone_1: 100, zone_2: 100, zone_3: 200, zone_4: 200, zone_5: 500, zone_6: 100, total: 1150 },
    ];
    const result = reportsModule.getters.report_11_total(state);
    expect(result).toEqual({ zone_1: 150, zone_2: 150, zone_3: 300, zone_4: 300, zone_5: 700, zone_6: 100, total: 1650 });
  });

  it('report_12_total getter calculates total zones correctly', () => {
    const mockGetters = {
      report12_filtered: reportsModule.getters.report12_filtered(state)
    };
    const result = reportsModule.getters.report_12_total(state, mockGetters)(1, 'A');
    expect(result).toEqual({ zone_1: 50, zone_2: 50, zone_3: 100, zone_4: 100, zone_5: 200, zone_6: 0, total: 500 });
  })

  it('report_12_total getter calculates total for different road classes', () => {
    const mockGetters = {
      report12_filtered: reportsModule.getters.report12_filtered(state)
    };
    const result = reportsModule.getters.report_12_total(state, mockGetters)(1);
    expect(result).toEqual({ zone_1: 150, zone_2: 150, zone_3: 300, zone_4: 300, zone_5: 700, zone_6: 100, total: 1650 });
  });
});