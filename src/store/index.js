/* 
File: index.js
Description: main file containig all the componens
*/
/*** Old one's ***/
import Vue from 'vue';
import Vuex from 'vuex';
import i18nStore from './i18n';

/*** RBAC and users, groups: ***/
import Login from './login';

/*** Workplan and Treatments: ***/
import Planning from './planning';
import TitleList from './title_list';
import Reports from './reports';

/*** Maps ***/
import ParamsComponent from './maps/params_component';
import MapComponent from './maps/map_component';
import Bridges from './maps/bridges_tonnels';

/*** Inventory and Reference data: ***/
import RoadNetwork from './refdata/road_network';
import ReferenceData from './refdata/reference_data';
import Dropdowns from './refdata/dropdowns';
import History from './refdata/history';

/*** Development and Testing: ***/
import ImagesComponent from './test_dev/images_component';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    version: process.env.VUE_APP_VERSION
  },
  actions: {},
  modules: {
    /*** Old one's ***/
    i18nStore,
    Bridges,

    /*** Roles, permissions, users and groups: ***/
    Login,

    /*** Workplan and Treatments: ***/
    Planning,
    TitleList,
    Reports,

    /*** Maps ***/
    ParamsComponent,
    MapComponent,

    /*** Inventory and Reference data: ***/
    RoadNetwork,
    Dropdowns,
    ReferenceData,
    History,

    /*** Development and Testing: ***/
    ImagesComponent,
  }
});