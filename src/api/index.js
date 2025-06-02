import axios from 'axios'

//const API_ROOT = 'https://testapi.rams.kg'
const API_ROOT = (process.env.VUE_APP_ENV === "dev") ? 'https://api.rams.kg' : 'https://testapi.rams.kg'
//const API_ROOT = (process.env.NODE_ENV === "development") ? 'https://192.168.31.42:5000/' : 'https://10.0.156.107:8080/'

const type_json = { 'Content-Type': 'application/json' }
const type_form = { 'Content-Type': 'multipart/form-data' };

export const Api = axios.create({
  baseURL: API_ROOT,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer`
  }
})

export default {
  props: {
    Api,
    type_json
  },
};

export const getLang = () => {
  return global.localStorage["mps-locale"] || "en";
};

export const getHeaders = (type = 'standard') => {
  const headerTypes = {
    standard: {
      headers: { ...type_json }
    },
    blob: {
      responseType: 'blob',
      headers: { ...type_json }
    },
    form: {
      headers: { ...type_form }
    }
  };

  return headerTypes[type]; // || headerTypes.json;
};

export const apiGet = (path, endpoint, params = {}, addLang = true, headerType = 'standard') => {
  const filteredParams = Object.entries(params).filter(([, value]) => (value))// !== undefined && value !== null && value !== '')
  const query = new URLSearchParams(filteredParams);
  if (addLang) query.set('lang', getLang());
  const apiQuery = `${path}${endpoint ? '/' + endpoint : ''}?${query}`;
  //console.log('Api.get', apiQuery);
  return Api.get(apiQuery, getHeaders(headerType));
};

export const apiPut = (path, param, value) => {
  return Api.put(`${path}/${param}`, value, getHeaders());
};

export const apiPost = (path, value, headerType = 'standard') => {
  return Api.post(path, value, getHeaders(headerType));
};

export const apiDelete = (path, id) => {
  return Api.delete(`${path}/${id}`, getHeaders());
};

/*
 createApiMethods
 Creates typical methods for API calls
 Some new APIs use "all" endpoint, some - not 
*/
export const createApiMethods = (path, extraParams = false, all = true, addShortListMethod = false) => {
  const methods = {
    loadList(params) {
      return apiGet(path, all ? "all" : '', extraParams ? params : undefined);
    },
    loadById(id) {
      return apiGet(path, id);
    },
    addNew(item) {
      return apiPost(path, item);
    },
    update(id, item) {
      return apiPut(path, id, item);
    },
    delete(id) {
      return apiDelete(path, id);
    }
  };
  // Add 'loadShortList' method if 'addShortListMethod' parameter is set
  if (addShortListMethod) {
    methods.loadShortList = function (param) {
      return apiGet(path, 'list', param);
    };
  }

  return methods;
};

// Statuses returned by the createTestApiMethods
export const status400 = { status: 400, error: "Invalid data source" };
export const status404 = { status: 404, message: "Item not found" };
export const status405 = { status: 405, message: "The method is not allowed for the requested URL." };

// For testing and debugging purpose when API is not ready yet
// Receives array in JSON and creates necessary stubs for it
export const createTestApiMethods = (array, idFiledName = 'id') => {
  return {
    loadList(filters) {
      if (!array) return status400;
      const data = array.filter(item =>
        Object.entries(filters).every(([key, value]) => !value || item[key] == value)
      );
      return { status: 200, data };
    },

    loadById(id) {
      if (!id) return status405;
      const res = array.filter(item => item[idFiledName] == id);
      if (res.length == 0) return status404;
      else return { status: 200, data: res[0] };
    },

    addNew(item) {
      const newId = array.length > 0 ? Math.max(...array.map(item => item[idFiledName])) + 1 : 1;
      item[idFiledName] = newId;
      array.push(item);
      return { status: 201, data: newId};
    },

    update(id, item) {
      const index = array.findIndex(el => el[idFiledName] == id);
      if (index !== -1) {
        array[index] = { ...array[index], ...item };
        return { status: 201, data: array[index] };
      }
      return status404;
    },

    delete(id) {
      const index = array.findIndex(el => el[idFiledName] == id);
      if (index !== -1) {
        const deletedItem = array.splice(index, 1)[0];
        return { status: 200, data: deletedItem };
      }
      return status404;
    }
  };
};