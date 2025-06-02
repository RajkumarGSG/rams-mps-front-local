// store/apicall_helpers.js
// single function to call different API's
export async function handleApiCall({
  request, // Promise
  caller,  // Name of the calling method (for debugging)
  commit,  // Optional: commit function
  // TODO: remove mutation when standardize by SET_LIST 
  mutation, // Optional: mutation name to be called by commit
  mutationKey,
  expectedStatus = 200, // Expected status
}) {
  try {
    const { status, data } = await request;
    if (status === expectedStatus) {
      if (commit && mutation) { // call mutation if provided
        commit(mutation, mutationKey ? { key: mutationKey, data } : data);
        return 'success';
      }
      return data; // Return as data if no commit provided
    } else {
      throw new Error(`Error ${caller}: ${status}`);
    }
  } catch ({ response }) { // Error handling
    throw new Error(response?.data?.msg || response?.data?.message || `Failed: ${caller}`);
  }
};

export async function apiCall(request, caller, expectedStatus = 200) {
  // Simplified version for calling API's
  return handleApiCall({
    request,
    caller,
    expectedStatus
  });
};

const standardFields = { id: 'id', description: 'description' }  // fields for mapping
export const filterAndSortList = (data, fields = standardFields, filters = {}, addEmptyLine = true, prefix = '') => {
  const filtersKeys = Object.keys(filters);

  let list = data
    .filter(item => {
      return filtersKeys.length === 0 || filtersKeys.every(key => {
        if (filters[key] === '_notEmpty') {
          return item[key] !== undefined && item[key] !== null && item[key] !== '';
        }
        if (filters[key] === '_empty') {
          return item[key] === undefined || item[key] === null || item[key] === '';
        }
        return filters[key] === undefined || item[key] === filters[key];
      });
    })
    .map(item => ({
      id: item[fields.id],
      description: prefix ? `${prefix}-${item[fields.description]}` : item[fields.description]?.toString() || ''
    }))
    .sort((a, b) => a.description.localeCompare(b.description, undefined, { sensitivity: 'base' }));

  if (addEmptyLine) {
    list.unshift({ id: 0, description: '' });
  }

  return list;
}

export const createActions = (api, entity, updateStatus = 200) => {
  const upper = entity.toUpperCase();
  const names = {
    loadList: `LOAD_${upper}_LIST`,
    clearList: `CLEAR_${upper}_LIST`,
    loadById: `LOAD_${upper}_BY_ID`,
    addNew: `ADD_NEW_${upper}`,
    update: `UPDATE_${upper}`,
    delete: `DELETE_${upper}`,
    loadShortList: `LOAD_${upper}_SHORT_LIST`
  };
  const key = `${entity.toLowerCase()}_list`;

  const actions = {
    async [names.loadList]({ commit }, { forDropdown = false, ...params }) {
      return await handleApiCall({
        request: api.loadList(params),
        caller: names.loadList,
        commit: !forDropdown ? commit : null,
        mutation: !forDropdown ? 'SET_LIST' : null,
        mutationKey: !forDropdown ? key : null,
      });
    },

    async [names.clearList]({ commit }) {
      commit('SET_LIST', { key, data: [] })
      return 'success'
    },

    async [names.loadById]({ }, id) {
      return await apiCall(api.loadById(id), names.loadById);
    },

    async [names.addNew]({ }, item) {
      return await apiCall(api.addNew(item), names.addNew, 201);
    },

    async [names.update]({ }, { id, theItem }) {
      return await apiCall(api.update(id, theItem), names.update, updateStatus);
    },

    async [names.delete]({ }, id) {
      return await apiCall(api.delete(id), names.delete);
    }
  }

  // Check if there is loadShortList method exists
  if (typeof api.loadShortList === 'function') {
    actions[names.loadShortList] = async ({ }, param) => {
      return await apiCall(api.loadShortList(param), names.loadShortList);
    };
  }
  return actions;
};