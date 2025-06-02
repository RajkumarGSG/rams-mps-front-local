/* 
File: map_component.js
Description: provides routines for map edit forms calling API's.
*/
import { apiCall } from '@/store/helpers/apicall_helpers';
import { sectionApi } from '@/api/road_network';
import { unpavedApi } from '@/api/temp_unpaved';
import { GeoJsonTemp, GeoJsonFeature } from '@/store/helpers/geojson_helper'
import { getLegend, getRange, getRangeVal, getRoadClassColor } from '@/store/helpers/ranges_helper';
import { start_icon_template } from '@/store/helpers/bridges_helper'
//import { transform } from 'ol/proj'

const RoadProps = (i1, i2) => {
  return [
    i1,  // section_coords
    i2,  // item.section_id,
  ]
}

export default {
  state: {
    selection_info: 'map.nothing',
    // move to the params_component.js ???
    strokeWidth: 1,
    styletype: 'point',   //'line' or 'point',
    parameter: 'iri',    // parameter to color on the map,
    parameterValue: '',
    mapExtent: [80347, 4443524, 1027105, 4767255],    //[409766, 4722088, 424910, 4663562]
    roadsGeoJSON: GeoJsonTemp(),
    paramsGeoJSON: GeoJsonTemp(),

    allCoords: [],
  },

  data() {
    return {
      coords: [],
      strWdth: 1
    }
  },

  actions: {
    async LOAD_ALL_ROADS_COORDS({ commit, dispatch }) {
      const params = {
        zoom: 7,
        start_x: 80347,
        start_y: 4443524,
        end_x: 1027105,
        end_y: 4767255
      }

      this.coords = await apiCall(sectionApi.load_windowed_map_coords(params), 'LOAD_ALL_ROADS_COORDS');
      commit("SET_ALL_ROADS_COORDS", this.coords);
      dispatch('PARSE_COORDS', null)
    },

    /*---------  Unpaved roads/ sections ---------------------*/
    //async LOAD_UNPAVED_ROADS_LIST({ commit }) {
    //  return await apiCall(unpavedApi.load_unpaved_roads_list(), 'LOAD_UNPAVED_ROADS_LIST');
    //},

    async LOAD_UNPAVED_COORDS_LIST({ state, commit }) {
      const coords = await apiCall(unpavedApi.load_unpaved_coords_list(), 'LOAD_UNPAVED_COORDS_LIST');
      const sections = await apiCall(unpavedApi.load_unpaved_roads_list(), 'LOAD_UNPAVED_ROADS_LIST');
      const gjSource = GeoJsonTemp()
      this.strWdth = (state.strokeWidth / 2) + (state.styletype === "line") ? 2 : 0
      const col = '#eded23'
      coords.forEach((item) => {
        const sect = sections.find(el => el.id === item.section_id)?.description || ''
        //const col = getRoadClassColor(item.road_class)

        const feature = GeoJsonFeature('MultiPoint', col, this.strWdth)
        const section_coords = item.coords
        //section_coords.forEach((single_coord) => {

          if (state.styletype === "point") {
          //const trans_coord = transform([single_coord[0], single_coord[1]], 'EPSG:4326', 'EPSG:32643')
            //feature.geometry.coordinates.push(trans_coord)
            feature.geometry.coordinates = section_coords
          }
        //});
        item.coords = feature.geometry.coordinates
        if (state.styletype === "line") {
          feature.geometry.type = 'MultiLineString';
          feature.geometry.coordinates.push(section_coords);
        }
        //const road_props = RoadProps(0, item.section_id)
        feature.properties.data.push([sect])  //road_props)
        gjSource.features.push(feature)
      })
      //console.log('LOAD_UNPAVED_COORDS_LIST', JSON.stringify(coords, null, 2));
      commit('SET_ROADS_GEO_JSON', gjSource)
    },

    async LOAD_ROADS_COORDS({ commit, dispatch, state }, payload) {
      const { region_id, road_id, deu_id, section_id, zoom, survey_year, start_x, start_y, end_x, end_y } = payload
      let { data_100_column_name } = payload
      const { road_class } = payload

      if (data_100_column_name === 'road_class') {
        delete payload.data_100_column_name
        data_100_column_name = null
      }

      console.log('LOAD_ROADS_COORDS: section_id', section_id)
      this.coords = await apiCall(sectionApi.load_windowed_map_coords(payload), 'LOAD_ROADS_COORDS');

      if (road_class) {
        // for catching if we need to show only roads of one  class
        this.coords = this.coords.filter(item => item.road_class === road_class)
      }

      this.strWdth = state.strokeWidth + (zoom - 7) / 2 + (state.styletype === "line") ? 2 : 0
      if (data_100_column_name)
        dispatch('PARSE_COORDS_2', data_100_column_name)
      else {
        dispatch('PARSE_COORDS', (road_class || region_id || road_id || deu_id || section_id) ? "ra" : null)
      }
      //dispatch('PARSE_COORDS_NEW', data_100_column_name || "roads")
    },

    async PARSE_COORDS_NEW({ state, commit }, parameter) {
      const gjSource = GeoJsonTemp();
      let newMapExtent = [];
      let firstCoord = true;

      // Предварительные вычисления, если parameter задан
      const valuesRange = getRange(parameter)
      const colorsRange = getLegend(parameter)
      console.log('PARSE_COORDS_NEW parameter, valuesRange, colorsRange:', parameter, valuesRange, colorsRange)

      // Предварительная обработка данных
      const features = this.coords.map((item) => {
        const section_coords = JSON.parse(item.coords);
        const defaultColor = getRoadClassColor(item.road_class);

        // Определение типа геометрии
        const geometryType = state.styletype === "line" ? "MultiLineString" : "Point";

        // Генерация функций для обработки координат
        const processCoords = (coords) => {
          const data100_id = coords.shift();
          const val = coords.pop();
          const colorIndex = getRangeVal(val, valuesRange)
          const color = parameter === 'roads' ? defaultColor : colorsRange[colorIndex].colour

          const feature = GeoJsonFeature(geometryType, color, this.strWdth);
          feature.geometry.coordinates =
            geometryType === "line" ? section_coords : [[coords[0], coords[1]]];

          // Обновление границ карты
          if (parameter) {
            if (firstCoord) {
              newMapExtent = [coords[0], coords[1], coords[0], coords[1]];
              firstCoord = false;
            } else {
              newMapExtent[0] = Math.min(newMapExtent[0], coords[0]);
              newMapExtent[1] = Math.min(newMapExtent[1], coords[1]);
              newMapExtent[2] = Math.max(newMapExtent[2], coords[0]);
              newMapExtent[3] = Math.max(newMapExtent[3], coords[1]);
            }
          }

          const roadProps = RoadProps(
            data100_id,
            item.section_id,
          );
          feature.properties.data.push(roadProps);
          return feature;
        };

        return section_coords.map(processCoords);
      });

      // Плоская структура из вложенного массива features
      gjSource.features = features.flat();

      // Коммит данных
      commit(parameter ? "SET_PARAMS_GEO_JSON" : "SET_ROADS_GEO_JSON", gjSource);

      // Установка карты, если есть parameter
      if (parameter) {
        newMapExtent[0] -= 200;
        newMapExtent[1] -= 200;
        newMapExtent[2] += 200;
        newMapExtent[3] += 200;
        commit("SET_MAPEXTENT", newMapExtent);
      }
    },

    async PARSE_COORDS({ state, commit }, parameter) {
      //const valuesRange = getRange('roads')
      //const colorsRange = getLegend(parameter)

      const gjSource = GeoJsonTemp()
      let newMapExtent = []
      let firstCoord = true
      this.coords.forEach((item) => {
        const col = getRoadClassColor(item.road_class)

        const feature = GeoJsonFeature('MultiPoint', col, this.strWdth)
        const section_coords = JSON.parse(item.coords)          //item.coords

        let data100_id
        section_coords.forEach((single_coord) => {
          data100_id = single_coord.shift();
          const val = single_coord.pop(); // to get the real coords

          /*        // Определение цвета, если параметр задан
                  if (parameter) {
                    const color = colorsRange[getRangeVal(val, valuesRange)].colour;
                    feature.properties.style.stroke.color = color;
                  }
        */
          if (state.styletype === "point") {
            feature.geometry.coordinates.push([single_coord[0], single_coord[1]])
            //feature.properties.style.type = 'circle';
          }

          // Get the "window" coordinates in order to zoom to the selected road/section
          if (parameter) {
            if (firstCoord) {
              newMapExtent = [single_coord[0], single_coord[1], single_coord[0], single_coord[1]];
              /*
                            feature.properties.style.type = 'icon'
                            let icon_template = start_icon_template({ col })
                            feature.properties.style.image = icon_template  //.replace(/#/gi, '%23')
                            feature.properties.style.scale = 0.08
                            feature.properties.style.opacity = 0.6
                            feature.properties.style.anchor = [0.5, 1]
              */
              firstCoord = false;
            } else {
              newMapExtent[0] = Math.min(newMapExtent[0], single_coord[0]);
              newMapExtent[1] = Math.min(newMapExtent[1], single_coord[1]);
              newMapExtent[2] = Math.max(newMapExtent[2], single_coord[0]);
              newMapExtent[3] = Math.max(newMapExtent[3], single_coord[1]);
            }
          }

        });

        if (state.styletype === "line") {
          feature.geometry.type = 'MultiLineString';
          feature.geometry.coordinates.push(section_coords);
        }
        const road_props = RoadProps(data100_id, item.section_id)
        feature.properties.data.push(road_props)
        gjSource.features.push(feature)
      })
      commit((!parameter) ? 'SET_ROADS_GEO_JSON' : 'SET_PARAMS_GEO_JSON', gjSource)
      if (parameter) { // Adjustment
        newMapExtent[0] -= 200
        newMapExtent[1] -= 200
        newMapExtent[2] += 200
        newMapExtent[3] += 200
        commit('SET_MAPEXTENT', newMapExtent)
      }
    },

    async PARSE_COORDS_2({ commit }, parameter) {
      const valuesRange = getRange(parameter)
      const colorsRange = getLegend(parameter)
      console.log('parameter, valuesRange, colorsRange:', parameter, valuesRange, colorsRange)
      const gjSource = GeoJsonTemp()
      this.coords.forEach((item, index) => {
        const section_coords = JSON.parse(item.coords)
        section_coords.forEach((single_coord) => {
          const val = single_coord.pop()

          //const colorIndex = getRangeVal(val, valuesRange)
          //const color = colorsRange[colorIndex].colour
          const color = colorsRange[getRangeVal(val, valuesRange)].colour

          const feature = GeoJsonFeature("Point", color, this.strWdth)
          const data100_id = single_coord.shift()

          feature.geometry.coordinates.push(single_coord[0], single_coord[1])
          const road_props = RoadProps(data100_id, item.section_id)
          //const road_props = [data100_id]
          feature.properties.data.push(road_props)
          gjSource.features.push(feature)
        })
      })
      commit('SET_PARAMS_GEO_JSON', gjSource)
    }
  },

  mutations: {
    SET_ALL_ROADS_COORDS(state, list) {
      state.allCoords = list
    },
    SET_ROADS_GEO_JSON(state, geoJSON) {
      state.roadsGeoJSON = geoJSON
    },
    SET_PARAMS_GEO_JSON(state, geoJSON) {
      state.paramsGeoJSON = geoJSON
    },
    SET_ROAD_PARAMETER(state, parameter) {
      state.parameter = parameter
    },
    //move to the params?
    SET_STROKE_WIDTH(state, stroke) {
      state.strokeWidth = stroke
    },
    SET_STYLE_TYPE(state, styletype) {
      state.styletype = styletype
    },
    SET_SELECTION_INFO(state, value, concat = false) {
      //console.log('SET_SELECTION_INFO', state.selection_info, value, concat)
      if (concat) {
        state.selection_info += value;
      } else {
        state.selection_info = value
      }
    },
    SET_MAPEXTENT(state, newMapExtent) {
      state.mapExtent = newMapExtent
    },
  },

  getters: {
    allCoordsLoaded: (state) => {
      return state.allCoords.length > 0
    },

    getSelectedSectionCoords: (state) => (section_id) => {
      return this.coords.filter(item => item.section_id === section_id)
    },
  }
}
