<template>
  <div class="md-layout">
    <div class="md-layout-item md-small-size-100 md-size-80">
      <span>{{ $t('selections.selected') }}: {{ $t(selection_info) }}
        <a id="image-download" v -if="showDetailsUrl" href="#" @click.stop.prevent="onSelectionClick()">
          {{ showDetailsUrl }}</a>
      </span>
    </div>
    <div class="md-layout-item md-small-size-30">
      <StyleTypesDropdown v-model="selectedStyleType" @input='onStyleTypeChanged' />
      <!--: disabled = "styleTypesDropdownDisabled" / -->
    </div>
    <div class="md-layout-item btn-row md-small-size-30">
      <md-button class="md-success" @click="print" :disabled="btnPrintDisabled">
        {{ $t('buttons.print') }}
      </md-button>
    </div>
    <SectionDetails v-if="showDetailsDlg" :title="$t(showDetailsUrl)" :sectionId="selectedSectionId"
      @close="showDetailsDlg = false" />
  </div>
</template>
<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { StyleTypesDropdown } from '@/pages/Components'
  import SectionDetails from '@/pages/RoadNetwork/SectionDetails.vue'

  export default {
    name: 'map-status-line',
    mixins: [permissions, printMap],

    data() {
      return {
        btnPrintDisabled: false,
        selectedStyleType: 'point',
        selection_info: 'Blabla',
        showDetailsDlg: false,
        payload: {},
      }
    },
    props: {
      showDetailsUrl: null,
      selectedSectionId: null,
    },

    components: {
      StyleTypesDropdown,
      SectionDetails
    },

    methods: {
      ...mapActions({
        loadList: 'LOAD_ROAD_LIST',
        delete: 'DELETE_ROAD',
      }),

      onSelectionClick() {
      this.showDetailsDlg = true
    },

      async onStyleTypeChanged(styletype) {
        console.log('onRoadTypeChanged: style, layer', styletype, this.selectedLayer)
        this.showSpinner = true
        this.$store.commit('SET_STYLE_TYPE', styletype)
        await this.loadLayersData()
        await this.onResetStatus('roads')
        this.showSpinner = false
      },
    },

    computed: {
      ...mapState({
      }),

    }
  }
</script>
