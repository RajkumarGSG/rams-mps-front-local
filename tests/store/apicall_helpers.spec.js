import { handleApiCall, apiCall } from '@/store/helpers/apicall_helpers';
import { vi } from 'vitest';

const testData = { items: [1, 2, 3] };
const caller = 'TestCaller';
const errMsg = 'Failed: TestCaller';
const request = Promise.resolve({ status: 200, data: testData });
const mockErrorResponse = (msg) => Promise.reject({ response: { data: { msg } } }); //new Error(`Error ${caller}: ${msg}`)
const mockCommit = () => vi.fn();

describe('API Call Helpers', () => {
  it('handleApiCall should commit mutation when API call is successful', async () => {
    const commit = mockCommit();

    await handleApiCall({ request, caller, commit, mutation: 'SET_ITEMS' });
    expect(commit).toHaveBeenCalledWith('SET_ITEMS', testData);
  });

  it('handleApiCall should return data directly when commit is not provided', async () => {
    const result = await handleApiCall({ request, caller });
    expect(result).toEqual(testData);
  });

  it('handleApiCall should throw error when API status differs from expected', async () => {
    await expect(
      handleApiCall({ request, caller, expectedStatus: 201, })
    ).rejects.toThrow(errMsg);
  });

  it('should throw an error with API error message when request fails', async () => {
    await expect(
      handleApiCall({ request: mockErrorResponse('API error'), caller })
    ).rejects.toThrow('API error');
  });

  it('should handle error without detailed response gracefully', async () => {
    await expect(
      handleApiCall({ request: mockErrorResponse(), caller })
    ).rejects.toThrow(errMsg);
  });

  it('apiCall should resolve correctly and return data', async () => {
    const result = await apiCall(request, caller);
    expect(result).toEqual(testData);
  });

  it('apiCall should should throw an error', async () => {
    await expect(apiCall(mockErrorResponse(), caller)).rejects.toThrow(errMsg)
  });
});