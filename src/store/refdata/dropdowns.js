/* 
File: dropdowns.js
Description: returns lists for filling dropdowns.
*/
import { filterAndSortList } from '@/store/helpers/apicall_helpers';

const success = 'success';

export default {
  state: {
    regions: [],
    deus: [],
    roadClasses: [],
    roads: [],
    sections: [],
    treatmentTypes: [],
    work_categories: [],
    units: [],
    plans: [],
    amounts: [],
    invtype_events: [],
    years: [],

    roles: [],
    pavement_types: [],
    district_types: [],
    surface_types: [],
    terrain_types: [],
    LandUseTypes: [],
    lprs: [],
    workAreas: [],
  },

  actions: {
    async GET_REGIONS_DROPDOWN({ dispatch, commit }, rn = 1) {
      const data = filterAndSortList(
        await dispatch('LOAD_REGION_LIST', { forDropdown: true }),
        { id: 'region_id', description: 'region_description' },  // fields for mapping
        { fk_rn: rn, active: true },  // filters
      );
      commit('SET_DR_LIST', { key: 'regions', data });
      return success;
    },

    async GET_DEUS_DROPDOWN({ dispatch, commit }, { region_id, prefix }) {
      const data = filterAndSortList(
        await dispatch('LOAD_DEU_SHORT_LIST', { region_id }),
        { id: 'deu_id', description: 'deu_description' },  // fields for mapping
        {},  // filters
        true,
        prefix
      );
      commit('SET_DR_LIST', { key: 'deus', data });
      return success;
    },

    async GET_ROADS_CLASSES_DROPDOWN({ commit, dispatch }) {
      const classes = ['', 'Ж', 'М', 'ЭМ'];

      const res = await dispatch('ReferenceData/LOAD_RDB_LOOKUP', { lookupType: 'road_class' });
      const data = res.map(item => ({
        ...item,
        id: classes[item.id],
      }));

      commit('SET_DR_LIST', { key: 'roadClasses', data });
      return success;
    },

    async GET_ROADS_DROPDOWN({ commit, dispatch }, region_id) {
      const data = filterAndSortList(
        await dispatch('LOAD_ROAD_SHORT_LIST', { region_id }),
        { id: 'road_id', description: 'road_description' },  // fields for mapping
      );
      commit('SET_DR_LIST', { key: 'roads', data });
      return success;
    },

    async GET_SECTIONS_DROPDOWN({ commit, dispatch }, { region_id, road_id }) {
      const data = filterAndSortList(
        await dispatch('LOAD_SECTION_SHORT_LIST', { region_id, road_id }),
        { id: 'section_id', description: 'section_description' },  // fields for mapping
      );
      commit('SET_DR_LIST', { key: 'sections', data });
      return success;
    },

    async GET_TREATMENT_TYPE_DROPDOWN({ commit, dispatch }, { routine = 0, workCategory }) {
      const data = filterAndSortList(
        await dispatch('ReferenceData/LOAD_TREATMENT_TYPE_LIST', { forDropdown: true, joinKeyDescr: true, routine, work_category_id: workCategory }),
        { id: 'treatment_type_id', description: 'treatment_type_description' },  // fields for mapping
      );
      //   {{ tr.key }} - {{ tr.treatment_type_description }}
      commit('SET_DR_LIST', { key: 'treatmentTypes', data });
      return success;
    },

    async GET_WORK_CATEGORIES_LIST({ commit, dispatch }, routine) {
      return filterAndSortList(
        await dispatch('ReferenceData/LOAD_WORK_CATEGORY_LIST', { routine, forDropdown: true }),
        { id: 'work_category_id', description: 'description' },  // fields for mapping
      );
      //commit('SET_DR_LIST', { key: 'work_categories', data });
      //return success;
    },

    async GET_UNITS_DROPDOWN({ commit, dispatch }) {
      const data = filterAndSortList(await dispatch('ReferenceData/LOAD_UNIT_LIST', { forDropdown: true }));
      commit('SET_DR_LIST', { key: 'units', data });
      return success;
    },

    async GET_PLANS_DROPDOWN({ commit, dispatch }, { region_id, year }) { //, showApproved = undefined }) {
      //const filter = showApproved ? { approved_by_user_id: '_notEmpty' } : (showApproved === false ? { approved_by_user_id: '_empty' } : {});
      const data = filterAndSortList(
        await dispatch('Planning/LOAD_PLAN_LIST', { region_id, year, forDropdown: true }),
        { id: 'id', description: 'name' },  // fields for mapping
      );
      commit('SET_DR_LIST', { key: 'plans', data });
      return success;
    },

    async GET_AMOUNTS_DROPDOWN({ commit }) {
      // TODO: move to rdb_lookup
      const data = [
        { id: 1, name: "label.soms", shortName: "label.short_soms" },
        { id: 1000, name: "label.thousands", shortName: "label.short_thousands" },
        { id: 1000000, name: "label.millions", shortName: "label.short_millions" }
      ];
      commit('SET_DR_LIST', { key: 'amounts', data });
      return success;
    },

    // TODO: Review it
    async GET_INVTYPE_EVENT_DROPDOWN({ commit, dispatch }) {
      const data = //filterAndSortList(
        await dispatch('ReferenceData/LOAD_INVENTORY_EVENT_LIST', { forDropdown: true });  //,
      //       { id: 'inventory_type_event_id', description: 'description' },  // fields for mapping
      //     );
      commit('SET_DR_LIST', { key: 'invtype_events', data });
      return success;
    },

    async GET_YEARS_LIST({ dispatch, commit }) {
      const data = filterAndSortList(
        await dispatch('LOAD_YEAR_LIST'),
        { id: 'survey_year', description: 'survey_year' },  // fields for mapping
      );
      commit('SET_DR_LIST', { key: 'years', data });
      return success;
    },

    async GET_ROLES_DROPDOWN({ dispatch, commit }) {
      const data = filterAndSortList(
        await dispatch('ReferenceData/LOAD_ROLE_LIST', { forDropdown: true }),
        { id: 'role_id', description: 'role_key' },  // fields for mapping
      );
      commit('SET_DR_LIST', { key: 'roles', data });
      return success;
    },

    // TODO: Remove as we switch to the RdbLookupDropdown
    /*--------- RDB Lookup Values  ---------------------*/
    async LOAD_PAVEMENT_TYPES({ commit, dispatch }) {
      const data = await dispatch('ReferenceData/LOAD_RDB_LOOKUP', 'pavement_type');
      commit('SET_DR_LIST', { key: 'pavement_types', data });
    },

    async LOAD_TERRAIN_TYPES({ commit, dispatch }) {
      const data = await dispatch('ReferenceData/LOAD_RDB_LOOKUP', 'terrain_type');
      commit('SET_DR_LIST', { key: 'terrain_types', data });
    },

    async LOAD_LAND_USE({ commit, dispatch }) {
      const data = await dispatch('ReferenceData/LOAD_RDB_LOOKUP', 'land_use');
      commit('SET_DR_LIST', { key: 'LandUseTypes', data });
    },

    async LOAD_LRPS({ commit, dispatch }) {
      //const res = await dispatch('LOAD_RDB_LOOKUP', 'lrp')
      //commit('SET_LRPS', res)
      const data = [
        { id: 1, description: 'Intersection', },
        { id: 2, description: 'Railway crossing', },
        { id: 3, description: 'Bridge', },
        { id: 4, description: 'Culvert', },
        { id: 5, description: 'Kilometre post', },
        { id: 6, description: 'Start / End', },
        { id: 7, description: 'Border' }
      ];
      commit('SET_DR_LIST', { key: 'lrps', data });
    },
  },

  mutations: {
    SET_DR_LIST(state, { key, data }) {
      if (state.hasOwnProperty(key)) {
        state[key] = [...data];
      } else {
        console.warn(`SET_DR_LIST: State key "${key}" not found`);
      }
    },
  },

  getters: {
  },
};