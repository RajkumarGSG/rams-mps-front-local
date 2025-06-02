<!--
File: MapSelectParams.vue
Description: Shows the attributes of the road
uses https://github.com/MisterTaki/vue-table-with-tree-grid
-->
<template>
  <md-card>
    <md-card-header>
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-30">
          <BaseDropdown id='vectorsFilter' :label="$t('map.vector_types')" v-model="selectedVectorType"
            :items="dropdownLists(true)" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-30">
          <YearsDropdown :label="$t('label.survey_year')" v-model="survey_year" />
        </div>
        <div class="md-layout-item md-small-size-100 md-size-30">
          <md-button class="md-raised md-success" @click="onResetParams"> {{ $t('map.reset') }} </md-button>
        </div>
        <div class="md-layout-item md-small-size-100 md-size-50">
          <BaseDropdown :label="$t('map.color_by')" v-model="selectedParamType" :items="dropdownLists(false)"
            :disabled="paramsDropdownDisabled" :displayField="'description'" :valueField="'id'" />
          <RdbLookupDropdown :label="$t('label.road_type')" v-model="selectedRoadType" :lookupType="'road_type'"
            :addEmptyLine="false" :disabled="selectedVectorType !== 'roads'" @input='onRoadTypeChanged' />
          <!--StyleTypesDropdown :label="$t('label.show_as')" v-model="selectedStyleType" :disabled="selectedVectorType !== 'roads'"
         @input='onStyleTypeChanged' /-->
        </div>
        <div class="md-layout-item md-small-size-100 md-size-50">
          <md-checkbox v-model="zoomToSelection">{{ $t('map.zoom_to_selection') }}</md-checkbox>
        </div>
      </div>
    </md-card-header>

    <md-card-content>
      <md-progress-spinner v-if="showSpinner == true" :md-diameter="70" md-mode="indeterminate" />

      <VueTabs v-model="tabName">
        <v-tab :title="$t('tabs.map_view')">
          <TreeGrid class="treegrid" :data="viewGridData" :columns="viewGridColumns" :stripe="true" :expand-type="false"
            :selection-type="false" emptyText="$t('map.nothing')" :is-fold="false">
            <template slot="value" slot-scope="scope">
              {{ scope.row.value }}
            </template>
          </TreeGrid>
        </v-tab>

        <v-tab :title="$t('tabs.roads_list')" v-if="selectedVectorType === 'roads'">
          <TreeGrid class="treegrid" :data="roadsInfo" :columns="roadsListGridColumns" :stripe="true"
            :expand-type="false" :selection-type="false" emptyText="$t('map.nothing')">
            <template slot="value" slot-scope="scope">
              <a href="#" @click.stop.prevent="onViewGridClick(scope.row.param, scope.row.id, scope.row.value)">
                {{ scope.row.value }}
              </a>
            </template>
          </TreeGrid>
        </v-tab>

        <v-tab :title="$t('tabs.sections_list')" v-if="selectedVectorType === 'roads'">
          <TreeGrid class="treegrid" :data="sectionsInfo" :columns="sectionsListGridColumns" :stripe="true"
            :expand-type="false" :selection-type="false" emptyText="$t('map.nothing')">
            <template slot="value" slot-scope="scope">
              <a href="#" @click.stop.prevent="onViewGridClick(scope.row.param, scope.row.id, scope.row.value)">
                {{ scope.row.value }}
              </a>
            </template>
          </TreeGrid>
        </v-tab>
      </VueTabs>
    </md-card-content>
  </md-card>
</template>

<script>
import { VueTabs, VTab } from 'vue-nav-tabs'
import 'vue-nav-tabs/themes/vue-tabs.css'
import { mapState, mapActions } from 'vuex'
import { getVectorTypes } from '@/store/helpers/ranges_helper';
import { BaseDropdown, YearsDropdown, RdbLookupDropdown, StyleTypesDropdown } from '@/pages/Components'
import permissions from "@/mixins/permissionsMixin"
import TreeGrid from 'vue-table-with-tree-grid'

export default {
  name: 'map-attribute-selector-component',
  mixins: [permissions],

  data() {
    return {
      formName: 'Map',
      eligible: false,

      tabName: '',
      section_id: null,
      uuid: null,   // for bridge or tunnel
      showSpinner: false,

      viewGridData: [
        { name: "sect_info", label: this.$t('bridge.general_information'), children: [] },
        { name: "survey_data", label: this.$t('route.condition_data'), children: [] },
        // { name: "indices", label: 'Indices and Maintenance', children: [] }
      ],
      viewGridColumns: [
        { label: this.$t('label.attribute'), prop: 'label', width: '50%' },
        { label: this.$t('label.value'), prop: 'value', type: 'template', template: 'value', width: '50%' },
      ],
      roadsListGridColumns: [
        { label: '', prop: '', width: '50px' },
        {
          label: `${this.$t('road_network.road_class')} / ${this.$t('road_network.road')} / ${this.$t('road_network.section')}`,
          prop: 'value', type: 'template', template: 'value', width: 'auto'
        },
      ],
      sectionsListGridColumns: [
        { label: '', prop: '', width: '50px' },
        {
          label: `${this.$t('road_network.region')} / ${this.$t('road_network.dep')} / ${this.$t('road_network.section')}`,
          prop: 'value', type: 'template', template: 'value', width: 'auto'
        },
      ],
      selectedRoadType: 1,
      selectedStyleType: 'point',
      selectedVectorType: 'roads',
      selectedParamType: 'road_class',
      paramsDropdownDisabled: true,
      survey_year: null,
      zoomToSelection: false
    }
  },

  components: {
    VueTabs,
    VTab,
    TreeGrid,
    YearsDropdown,
    BaseDropdown,
    RdbLookupDropdown,
    StyleTypesDropdown,
  },

  created() {
    this.$eventHub.$on('mapItemSelected', this.onMapItemSelected);
  },

  beforeDestroy() {
    this.$eventHub.$off('mapItemSelected')
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed()
    if (!this.eligible) {
      return
    };

    this.showSpinner = true
    await this.loadGridInfo(this.$t('road_network.dep'))
    this.showSpinner = false
  },

  methods: {
    ...mapActions({
      loadGridInfo: 'LOAD_ROADS_BY_CLASSES_GRID_INFO',
      loadSectionInfo: 'FILL_SECTION_INFO',
      loadSectionSurveyInfo: 'FILL_SECTION_SURVEY_INFO',
      loadBridgeTunnelInfo: 'FILL_BRIDGE_TUNNEL_INFO',
    }),

    clearviewGridData() {
      this.viewGridData[0].children = []
      this.viewGridData[1].children = []
      this.paramsDropdownDisabled = true
    },

    reloadSectionInfo(section_id) {
      if (!section_id) return

      this.showSpinner = true
      this.loadSectionInfo(section_id).then(() => {
        this.viewGridData[0].children = this.mainInfo
        //this.reloadSectionSurveyInfo() //this.years[0].id)
      })
      this.showSpinner = false
    },

    reloadSectionSurveyInfo(coords) {
      this.showSpinner = true
      this.loadSectionSurveyInfo({ year: this.survey_year, coords }).then(() => {
        this.viewGridData[1].children = this.surveyInfo
      })
      this.showSpinner = false
    },

    reloadBridgeTunnelInfo(layer, uuid) {
      if (!uuid) return

      this.showSpinner = true
      this.loadBridgeTunnelInfo({ layer, uuid }).then(() => {
        this.viewGridData[0].children = this.mainInfo
        this.viewGridData[1].children = this.surveyInfo
      })
      this.showSpinner = false
    },

    onViewGridClick(itemName, itemValue, itemDesc) {
      console.log('onViewGridClick', itemName, itemValue, itemDesc)
      this.clearviewGridData()
      if (itemName === 'section_id') {
        this.paramsDropdownDisabled = false
        this.reloadSectionInfo(itemValue)
      } else {
        this.paramsDropdownDisabled = true
        this.selectedParamType = 'road_class' // Show coloring only for the sections
      }
      //const layer = itemDesc === 'Region' ? 'coloringLayer' : 'selectionLayer'
      const layer = 'selectionLayer'

      this.$eventHub.$emit('viewGridClicked', { layer, filter: itemName, value: itemValue, desc: itemDesc })
    },

    onResetParams() {
      this.clearviewGridData()
      this.selectedVectorType = 'roads'
      this.selectedParamType = 'road_class'
      this.selectedRoadType = 1
      this.paramsDropdownDisabled = false
      this.$eventHub.$emit('resetStatus', this.selectedVectorType)
    },

    onRoadTypeChanged(value) {
      this.$eventHub.$emit('roadTypeChange', value)
    },

    onStyleTypeChanged(styletype) {
      this.$store.commit('SET_STYLE_TYPE', styletype)
    },

    onStrokeWidthChanged(stroke) {
      this.$store.commit('SET_STROKE_WIDTH', stroke)
    },

    onMapItemSelected({ layer, item_id, clicked_coords }) {    //feature_data) {
      console.log('onMapItemSelected', layer, item_id, clicked_coords)
      this.clearviewGridData()
      if (!item_id) return

      if (layer === 'bridges' || layer === 'tunnels') {
        this.uuid = item_id
        this.section_id = null
        this.reloadBridgeTunnelInfo(layer.substring(0, 6), item_id)   // get rid of 's' in the end
      } else {
        this.uuid = null
        this.section_id = item_id
        this.reloadSectionInfo(item_id)
        this.reloadSectionSurveyInfo(clicked_coords)
        this.paramsDropdownDisabled = false     // because browser hangs if we color by param  whole roadnetwork except for road classes
      }
      this.tabName = "$t('tabs.map_view')"
    },

    dropdownLists(forVectorTypes) {
      const res = getVectorTypes(forVectorTypes).map(item => ({ id: item.key, description: this.$t(item.value) }));
      return res
    },

  },

  computed: {
    ...mapState({
      mainInfoUntranslated: (state) => state.ParamsComponent.mainInfo,
      surveyInfoUntranslated: (state) => state.ParamsComponent.surveyInfo,
      roadsInfo: (state) => state.ParamsComponent.roadsInfo,
      sectionsInfo: (state) => state.ParamsComponent.sectionsInfo,
      //indexInfo: (state) => state.ParamsComponent.indexInfo,
      years: (state) => state.ParamsComponent.years,
    }),

    mainInfo() {
      return this.mainInfoUntranslated.map(item => ({ ...item, label: this.$t(item.label) }))
    },

    surveyInfo() {
      return this.surveyInfoUntranslated.map(item => ({ ...item, label: this.$t(item.label) }))
    },

  },

  watch: {
    survey_year(newValue, oldValue) {
      //if (newValue !== oldValue && newValue) this.reloadSectionSurveyInfo() //newValue)
    },

    selectedVectorType(newValue, oldValue) {
      this.clearviewGridData()
      this.$eventHub.$emit('vectorLayerChanged', newValue)
    },

    selectedParamType(value) {
      this.$eventHub.$emit('paramTypeChanged', { layer: 'coloringLayer', value })
    },

    zoomToSelection(value) {
      this.$eventHub.$emit('zoomToSelection', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.md-card {
  margin: 0px 0;
}

.md-card .md-card-content {
  //overflow: auto;
  height: 100%;
  max-height: 100%;
}

body {
  padding: 20px 0;
}

.treegrid {
  width: 95%;
  height: 100%;
  position: absolute;
  max-height: 80%;
  overflow: auto;
}

.md-progress-spinner {
  margin: 24px;
  position: center;
  top: 25%;
  left: 55%;
  z-index: 20;
}
</style>