<template>
  <div class="main-zone">
    <md-progress-spinner v-if="showSpinner == true" :md-diameter="100" md-mode="indeterminate" />
    <div id="zoomlevel"></div>
    <div id="map2" ref="mapPrint" class="map2"></div>
    <div class="md-layout">
      <div class="md-layout-item md-small-size-100 md-size-80">
        <span>{{ $t('selections.selected') }}: {{ $t(selection_info) }}
          <a id="image-download" v-if="showDetailsUrl" href="#" @click.stop.prevent="onSelectionClick()">
            {{ showDetailsUrl }}</a>
        </span>
      </div>
      <div class="md-layout-item md-small-size-30">
        <StyleTypesDropdown :label="$t('label.show_as')" v-model="selectedStyleType" @input='onStyleTypeChanged' />
        <!--:disabled="styleTypesDropdownDisabled"/-->
      </div>
      <div class="md-layout-item btn-row md-small-size-30">
        <md-button class="md-success" @click="print" :disabled="showSpinner">
          {{ $t('buttons.print') }}
        </md-button>
      </div>
    </div>
    <div id="legend" v-show="showLegendButton" class="ol-legend ol-unselectable ol-control">
      <button @click="toggleLegend">...</button>
      <div v-if="showLegendBox" class="legend-box">
        <div class="legend-label" v-for="elem in vectorLegend" :key="elem.name">
          <span>
            <md-icon :style="{ color: elem.colour }">circle</md-icon>
            {{ $t(elem.name) }}
          </span>
        </div>
      </div>
    </div>

    <!--svg width="32px" height="32px">
      <path
        d="M24,9c0,4.07-3.06,7.44-7,7.94V30c0,0.55-0.45,1-1,1s-1-0.45-1-1V16.94c-3.94-0.5-7-3.87-7-7.94c0-4.41,3.59-8,8-8S24,4.59,24,9z"
        fill="#CC3300" />
    </svg-->

    <SectionDetails v-if="showDetailsDlg" :title="$t(showDetailsUrl)" :sectionId="selectedSectionId"
      @close="showDetailsDlg = false" />
  </div>
</template>

<script>
import { arrayCompare, getRangeVal } from '@/store/helpers/arrayCompare_helper'
import { mapState, mapGetters, mapActions } from 'vuex'
import permissions from "@/mixins/permissionsMixin"
import olMap from '@/store/helpers/olMap_helper'
import { getLegend } from '@/store/helpers/ranges_helper';
import SectionDetails from '@/pages/RoadNetwork/SectionDetails.vue'
import { StyleTypesDropdown } from '@/pages/Components'

import map2png from '@/store/helpers/map2png_helper';
import printMap from '@/mixins/printMixin'

export default {
  name: 'map-component',
  mixins: [permissions, printMap],

  data() {
    return {
      formName: 'Map',
      eligible: false,

      selectedLayer: 'roads',
      showSpinner: false,

      selectedStyleType: 'point',

      selectedSectionId: null,
      showDetailsDlg: false,
      showLegendBox: true,

      ol: undefined,
      map_centre: [494000, 4580000],    //[75.20484, 41.572522],
      initialExtent: null,
      currExtent: null,

      currZoomLevel: 7,
      initialZoomLevel: 7,
      zoomToSelection: false, // to zoom to the selected road/section

      coloringParameter: '',
      filter: '',
      filterValue: '',
      showDetailsUrl: null,
    }
  },

  props: {
    tileLayer: { type: String, default: 'osm' },  //satellite
    filterOptions: { type: Object },
  },

  components: {
    SectionDetails,
    StyleTypesDropdown
  },

  beforeDestroy() {
    this.$eventHub.$off('viewGridClicked')
    this.$eventHub.$off('resetStatus')
    this.$eventHub.$off('vectorLayerChanged')
    this.$eventHub.$off('paramTypeChanged')
    this.$eventHub.$off('roadTypeChange')
    this.$eventHub.$off('zoomToSelection')
    this.ol.destroy()
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      return
    };

    this.showSpinner = true

    // Create new Map instance
    this.ol = new olMap({
      center: this.map_centre,
      zoom: this.initialZoomLevel,
      extent: this.currExtent,
      viewProjection: 'EPSG:4326',      //'EPSG:32643',
      dataProjection: 'EPSG:32643',     //EPSG:4326',
      viewMaxZoomDefault: 16,
      vectorLayerList: ['bridges', 'tunnels', 'roads', 'coloringLayer', 'selectionLayer', 'unpavedRoadsLayer']
    })
    this.ol.init({ overlayElem: 'popup', mapElem: 'map2' })
    this.ol.setEventHandler('singleclick', this.onMapClick)
    //this.ol.setEventHandler('pointermove', this.onPointerMove)

    // Save initial parameters
    this.refreshSizeByExtent()
    this.initialExtent = this.ol.getMapExtent()
    this.currExtent = this.initialExtent
    this.currZoomLevel = this.initialZoomLevel

    const { basemap_tiles } = await this.loadBasemapTypes()
    const tileList = this.ol.createTileLayers(basemap_tiles)
    this.$emit('changeTileList', tileList)
    this.changeTileLayer()

    await this.loadLayersData()

    // Link the events handlers
    this.$eventHub.$on('viewGridClicked', this.onViewGridClicked)
    this.$eventHub.$on('vectorLayerChanged', this.onResetStatus)
    this.$eventHub.$on('paramTypeChanged', this.onParamTypeChanged)
    this.$eventHub.$on('roadTypeChange', this.onRoadTypeChanged)
    this.$eventHub.$on('resetStatus', this.onResetStatus)
    this.$eventHub.$on('zoomToSelection', this.onZoomToSelection)

    this.showSpinner = false
  },

  methods: {
    ...mapActions({
      loadCoords: 'LOAD_COORDS',
      loadRoadsCoords: 'LOAD_ROADS_COORDS',
      loadAllRoadsCoords: 'LOAD_ALL_ROADS_COORDS',
      loadUnpavedCoords: 'LOAD_UNPAVED_COORDS_LIST',
      loadBasemapTypes: 'LOAD_BASEMAP_TYPES',
    }),

    async loadLayersData() {
      this.showSpinner = true

      await this.loadUnpavedCoords()
      this.updateLayerData({ layer: 'unpavedRoadsLayer', source: this.roadsGeoJSON })
      this.setVisible({ layer: 'unpavedRoadsLayer' })

      // Load once coords for all roads
      if (!this.allCoordsLoaded) {
        await this.loadAllRoadsCoords()
      }
      this.updateLayerData({ layer: 'roads', source: this.roadsGeoJSON })
      this.setVisible({ layer: 'coloringLayer' })

      // Load once coords for bridges and tunnels
      let geoJSON = await this.loadCoords('bridges')
      this.updateLayerData({ layer: 'bridges', source: geoJSON })
      this.setVisible({ layer: 'bridges' })

      // Load once coords for tunnels
      geoJSON = await this.loadCoords('tunnels')
      this.updateLayerData({ layer: 'tunnels', source: geoJSON })
      this.setVisible({ layer: 'tunnels' })
      this.showSpinner = false
    },

    setStatusLine(desc = null) {
      this.$store.commit('SET_SELECTION_INFO', desc || 'map.nothing')
    },

    onSelectionClick() {
      this.showDetailsDlg = true
    },

    toggleLegend() {
      this.showLegendBox = !this.showLegendBox
    },

    // Mapped methods for emitted events
    async onViewGridClicked({ layer, filter, value, desc }) {
      this.showSpinner = true
      console.log('viewGridClicked', layer, filter, value, "desc:", desc)

      this.filter = filter
      this.filterValue = value
      this.onLoadLayerData(layer)
      this.selectedLayer = layer

      this.selectedSectionId = value

      if (filter === 'section_id') {
        // We do not set the status line here as it will be set by the fillSectionInfo function in MapSelectParams.vue module
        this.showDetailsUrl = this.$t("road_network.section_details")
      } else {
        this.showDetailsUrl = null
        this.setStatusLine(desc)
      }
      this.showSpinner = false
    },

    async onParamTypeChanged({ layer, value }) {
      console.log('onParamTypeChanged', layer, value)
      this.showSpinner = true
      this.selectedLayer = layer
      this.coloringParameter = value
      if (this.selectedLayer !== 'roads') this.onLoadLayerData('coloringLayer')
      this.showSpinner = false
    },

    async onRoadTypeChanged(value) {
      console.log('onRoadTypeChanged', value)
      this.showSpinner = true
      this.setVisible({ layer: 'roads', show: (value == 1 || value == 3) })
      this.setVisible({ layer: 'unpavedRoadsLayer', show: (value >= 2) })
      this.showSpinner = false
    },

    async onStyleTypeChanged(styletype) {
      console.log('onRoadTypeChanged: style, layer', styletype, this.selectedLayer)
      this.showSpinner = true
      this.$store.commit('SET_STYLE_TYPE', styletype)
      await this.loadLayersData()
      await this.onResetStatus('roads')
      this.showSpinner = false
    },

    async onResetStatus(layer) {
      console.log('onResetStatus switched to layer', layer)

      this.showSpinner = true
      this.ol.map.getView().setCenter(this.map_centre)
      this.ol.map.getView().setZoom(this.initialZoomLevel)
      this.currZoomLevel = this.initialZoomLevel
      this.currExtent = this.initialExtent
      this.refreshSizeByExtent()

      //this.setStatusLine()
      this.selectedLayer = layer //|| 'roads'
      //this.coloringParameter = 'road_class'
      this.showSpinner = false
    },

    onZoomToSelection(value) {
      this.zoomToSelection = value
    },

    async onClearLayerData(layer) {
      this.ol.clearVectorSource(layer)
    },

    // Methods calling olMap methods
    async setVisible(payload) {
      await this.ol.setVisible(payload)
    },

    async updateLayerData(payload) {
      this.showSpinner = true
      await this.ol.updateVectorSource(payload)
      this.showSpinner = false
    },

    refreshSizeByExtent() {
      this.ol.fitMapByExtent(this.currExtent)
    },

    changeTileLayer() {
      this.ol.changeTileLayer(this.tileLayer)
    },

    async onMapClick(evt) {
      const selectedPointInfo = this.ol.getFeatureInfoByCoord(evt)

      let item_id = null
      let clicked_coords = null

      if (selectedPointInfo) {
        console.log('onMapClick', selectedPointInfo.feature_data, this.selectedLayer)
        item_id = selectedPointInfo.feature_data[1]
        this.selectedSectionId = item_id
        if (this.selectedLayer !== 'bridges' && this.selectedLayer !== 'tunnels') {
          // We do not set the status line here as it will be set by the fillSectionInfo function in MapSelectParams.vue module
          this.showDetailsUrl = this.$t("road_network.section_details")
          clicked_coords = selectedPointInfo.feature_data[0]
          this.selectedLayer = 'selectionLayer'
          this.filter = 'section_id'
          this.filterValue = item_id
          this.onLoadLayerData(this.selectedLayer) // === 'selectionLayer') ? 'selectionLayer' : 'coloringLayer')
        } else {
          this.showDetailsUrl = this.$t('label.passport')
          this.setStatusLine(`${this.$t('map.' + this.selectedLayer)} - ${selectedPointInfo.feature_data[0]}`)
        }
      } else this.showDetailsUrl = null
      this.$eventHub.$emit('mapItemSelected', { layer: this.selectedLayer, item_id, clicked_coords })
    },

    async onLoadLayerData(layer) {
      console.log('onLoadLayerData: this.filter, this.coloringParameter', this.filter, this.coloringParameter)
      if (!this.filter && this.coloringParameter) return

      this.showSpinner = true
      const mapViewExtent = this.ol.getMapExtent()
      const mapViewZoom = Math.trunc(this.ol.getZoom())

      let payload = {
        zoom: mapViewZoom,
        /* // Finish - check when switching to another road/section should be another extent
          start_x: Math.round(mapViewExtent[0]),      //80347,
          start_y: Math.round(mapViewExtent[1]),      //4443524,
          end_x: Math.round(mapViewExtent[2]),        //1027105,
          end_y: Math.round(mapViewExtent[3]),         //4767255
      */
        //if no filter is give the browser will hang - resolve later when API fill everything
        data_100_column_name: (this.filter) ? this.coloringParameter : null
      }
      if (this.selectedLayer === 'coloringLayer' || this.selectedLayer === 'selectionLayer') {
        const filterMapping = {
          road_class: 'road_class',
          fk_region: 'region_id',
          fk_road: 'road_id',
          fk_deu: 'deu_id',
          section_id: 'section_id', // или 'section_description', если нужно
        };

        const key = filterMapping[this.filter];
        if (key) {
          payload[key] = this.filterValue;
        }
      }
      await this.loadRoadsCoords(payload);
      await this.updateLayerData({ layer, source: this.paramsGeoJSON });

      this.currExtent = this.zoomToSelection ? this.mapExtent : this.initialExtent
      this.showSpinner = false
    },

    async print() {
      this.showSpinner = true
      document.body.style.cursor = 'progress';
      const mapImage = map2png(this.ol)
      this.printReport(`<img src="${mapImage}">`)
      this.showSpinner = false
      document.body.style.cursor = 'auto';
    },
  },

  computed: {
    ...mapState({
      roadsGeoJSON: (state) => state.MapComponent.roadsGeoJSON,
      paramsGeoJSON: (state) => state.MapComponent.paramsGeoJSON,
      selection_info: (state) => state.MapComponent.selection_info,
      mapExtent: (state) => state.MapComponent.mapExtent,
    }),

    ...mapGetters(['allCoordsLoaded']),

    showLegendButton() {
      return Boolean(this.vectorLegend)
    },

    styleTypesDropdownDisabled() {
      // TODO: optimize
      //console.log('styleTypesDropdownDisabled', this.selectedLayer)
      return this.selectedLayer !== 'roads' ||
        this.selectedLayer !== 'coloringLayer' ||
        this.selectedLayer !== 'selectionLayer' ||
        this.selectedLayer !== 'unpavedRoadsLayer'
    },

    vectorLegend() {
      return getLegend((!this.coloringParameter || this.coloringParameter === 'road_class') ? this.selectedLayer : this.coloringParameter)
    },

    getLayerFeatures(layer) {
      return this.ol.getFeatures(layer)
    },
  },

  watch: {
    tileLayer(/*newVal*/) {
      this.changeTileLayer()
    },

    selectedLayer(newVal, oldVal) {
      //if (newVal !== 'selectionLayer') 
      this.setVisible({ layer: oldVal })
      this.setVisible({ layer: newVal, show: true })
      if (newVal === 'roads') this.coloringParameter = 'road_class'

      this.setStatusLine()
    },

    zoomToSelection(newValue, oldValue) {
      //if (newValue !== oldValue && newValue)
      this.currExtent = newValue ? this.mapExtent : this.initialExtent
    },

    currExtent(newValue) {
      this.refreshSizeByExtent()
    }
  }
}
</script>

<style lang="scss">
#map2 {
  width: 100%;
  height: 100%;

  canvas {
    max-width: unset;
  }

  &:hover {
    .ol-mouse-position {
      background: white;
    }
  }
}

.main-zone {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ol-zoom {
  top: 2.5em;
  left: 0.5em;
}

.ol-legend {
  right: 0.5em;
  top: 2.8em;

  .legend-box {
    position: absolute;
    padding: 5px;
    margin-top: 7px;
    border-radius: 10px;
    right: 0.2em;
    background-color: rgba(255, 255, 255, 0.7);

    .legend-label {
      font-size: 12px;
      display: flex;
      align-items: center;

      i {
        margin-top: 3px;
      }

      span {
        white-space: nowrap;
        padding-left: 5px;
        font-weight: bold;
      }
    }
  }
}

.ol-mouse-position {
  border-radius: 5px;
  padding: 1px 3px;
  top: 8px;
  right: unset;
  left: 8px;
  position: absolute;
}

.ol-zoomslider {
  top: 6.3em;
}

#zoomlevel {
  display: none;
}

.popupbox-content {
  text-align: center;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.md-progress-spinner {
  margin: 24px;
  position: absolute;
  top: 25%;
  left: 55%;
  z-index: 10;
}
</style>
