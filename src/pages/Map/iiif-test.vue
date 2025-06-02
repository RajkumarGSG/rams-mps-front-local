<template>
  <div class="map-container">
    <div id="map" class="map"></div>
    <div id="info">&nbsp;</div>
  </div>
</template>

<script>
  import IIIF from 'ol/source/IIIF.js';
  import IIIFInfo from 'ol/format/IIIFInfo.js';
  import Map from 'ol/Map.js';
  import TileLayer from 'ol/layer/Tile.js';
  import View from 'ol/View.js';

  export default {
    data() {
      return {
        map: null,
        points: [
          { x: 100, y: 150 }, // замените на ваши координаты
          { x: 200, y: 250 }
        ],
        imageURL: require('@/assets/A08.png'), // путь к вашему изображению карты
        imageSources: [
          //        { url: require('@/assets/A08.png'), extent: [0, 0, 1308, 1308] },
          //        { url: require('@/assets/A09.png'), extent: [0, 0, 1308, 1308] }
          { url: require('@/assets/A08.png'), extent: [0, 0, 1000, 800] },
          { url: require('@/assets/A09.png'), extent: [0, 0, 1200, 1000] }
          // добавьте другие файлы и их экстенты по необходимости
        ]
      };
    },
    mounted() {
      this.refreshMap('https://iiif.ub.uni-leipzig.de/iiif/j2k/0000/0107/0000010732/00000072.jpx/info.json')
    },
    methods: {
        refreshMap(imageInfoUrl) {
        const layer = new TileLayer()
        const map = new Map({
          layers: [layer],
          target: 'map',
        })
        fetch(imageInfoUrl)
          .then(function (response) {
            response
              .json()
              .then(function (imageInfo) {
                const options = new IIIFInfo(imageInfo).getTileSourceOptions();
                if (options === undefined || options.version === undefined) {
                  console.log('Data seems to be no valid IIIF image information.')
                  return;
                }
                options.zDirection = -1;
                const iiifTileSource = new IIIF(options);
                layer.setSource(iiifTileSource);
                map.setView(
                  new View({
                    resolutions: iiifTileSource.getTileGrid().getResolutions(),
                    extent: iiifTileSource.getTileGrid().getExtent(),
                    constrainOnlyCenter: true,
                  }),
                );
                map.getView().fit(iiifTileSource.getTileGrid().getExtent());
              })
              .catch(function (body) {
                console.log('Could not read image info json. ' + body)
              });
          })
          .catch(function () {
            console.log('Could not read data from URL.')
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
