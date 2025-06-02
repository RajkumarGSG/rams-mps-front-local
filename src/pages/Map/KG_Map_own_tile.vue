//KG_Map.vue
<template>
  <div class="map-container">
    <div id="map" class="map"></div>
  </div>
</template>

<script>
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Style, Stroke } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

export default {
  data() {
    return {
      map: null,
      points: [
        { x: 100, y: 150 }, // замените на ваши координаты
        { x: 200, y: 250 }
      ],
      imageURL: require('@/assets/A08.png') // путь к вашему изображению карты
    };
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      // Создание базового слоя с изображением карты
      const rasterLayer = new TileLayer({
        source: new XYZ({
          url: this.imageURL,
          projection: 'EPSG:3857' // Используйте 'EPSG:3857' для стандартной проекции, если нужно
        })
      });

      // Создание слоя для точек
      const vectorSource = new VectorSource();
      this.points.forEach(point => {
        const feature = new Feature({
          geometry: new Point([point.x, point.y])
        });
        vectorSource.addFeature(feature);
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: 'red' }),
            stroke: new Stroke({ color: 'white', width: 1 })
          })
        })
      });

      // Инициализация карты
      this.map = new Map({
        target: 'map',
        layers: [rasterLayer, vectorLayer],
        view: new View({
          projection: 'EPSG:3857',
          center: fromLonLat([0, 0]), // Установите центр карты
          zoom: 2 // Установите начальный уровень зума
        })
      });
    }
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
}
.map {
  width: 100%;
  height: 100%;
}
</style>
