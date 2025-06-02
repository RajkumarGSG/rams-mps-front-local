import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiMock } from '../mocks/apiMockFactory';
import titlelist from '@/store/title_list';
import Api from '@/api/titlelist';

vi.mock('@/api/titlelist', () => createApiMock([
  'load_works_lists', 'get_work_list_by_id', 'del_work_list', 'generate_works', 'load_all_works',
  'assign_plan', 'assign_budget', 'unassign_budget', 'get_title_list_summary'
]));

describe('titlelist.js Vuex Module', () => {
  let state;

  beforeEach(() => {
    state = { ...titlelist.state };
  });

  describe('Mutations', () => {
    it('SET_WORKS_LISTS updates worksLists', () => {
      const mockList = [{ work_list_id: 1, year: 2024 }];
      titlelist.mutations.SET_WORKS_LISTS(state, mockList);
      expect(state.worksLists).toEqual(mockList);
    });

    it('SET_GENERATED_TREATMENTS updates treatmentsList', () => {
      const mockList = [{ id: 1, name: 'Treatment 1' }];
      titlelist.mutations.SET_GENERATED_TREATMENTS(state, mockList);
      expect(state.treatmentsList).toEqual(mockList);
    });

    it('SET_ASSIGNED_TREATMENTS_LIST updates assignedTreatments', () => {
      const mockList = [{ id: 1, name: 'Assigned Treatment 1' }];
      titlelist.mutations.SET_ASSIGNED_TREATMENTS_LIST(state, mockList);
      expect(state.assignedTreatments).toEqual(mockList);
    });
  });

  describe('Actions', () => {
    it('LOAD_WORKS_LISTS calls API and commits SET_WORKS_LISTS', async () => {
      const commit = vi.fn();
      const mockResponse = [{ work_list_id: 1, year: 2024 }];
      Api.load_works_lists.mockReturnValue( Promise.resolve({ status: 200, data: mockResponse }));
      
      await titlelist.actions.LOAD_WORKS_LISTS({ commit }, { year: 2024, is_approved: true });
      
      expect(commit).toHaveBeenCalledWith('SET_WORKS_LISTS', mockResponse);
    });

    it('GET_WORK_LIST_BY_ID calls API and returns data', async () => {
      const mockResponse = { work_list_id: 1, year: 2024 };
      Api.get_work_list_by_id.mockResolvedValue( Promise.resolve({ status: 200, data: mockResponse }));
      
      const result = await titlelist.actions.GET_WORK_LIST_BY_ID({}, 1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Getters', () => {
    it('yearsInWorkList returns sorted years', () => {
      state.worksLists = [
        { work_list_id: 1, year: 2025 },
        { work_list_id: 2, year: 2024 }
      ];
      const result = titlelist.getters.yearsInWorkList(state);
      expect(result).toEqual([
        { id: 2, description: 2024 },
        { id: 1, description: 2025 }
      ]);
    });
  });
});