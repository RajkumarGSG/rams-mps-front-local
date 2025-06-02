/* 
File: geojson_helper.js
Description: provides description GeoJSON classes.
*/
const GeoJsonFeature = (geomType = 'MultiPoint', strokeColor = '#000000', strokeWidth = 1) => {
  return {
    type: 'Feature',
    geometry: {
      type: geomType,   //'MultiPoint',
      coordinates: []
    },
    properties: {
      style: {
        stroke: {
          color: strokeColor,   //'#000000',
          width: strokeWidth    //1
        },
        type: 'circle'
      },
      data: [],
      localisation_keys: ['road_network.section', '', '', '']
    }
  };
};

const GeoJsonTemp = () => {
  return {
    type: 'FeatureCollection',
    features: []
  };
};

export { GeoJsonFeature, GeoJsonTemp }
