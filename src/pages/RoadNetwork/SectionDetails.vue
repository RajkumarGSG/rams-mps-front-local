<!--
File: SectionsDetails.vue
Description: show details of a selected road section as a dialog window.
-->
<template>
  <modal :title="title || $t('road_network.section_details')" @close="$emit('close')">

    <template slot='body'>
      <div class='modal-scroll-content'>
        <div class='modal-content-row' v-for='(item, index) in sectionInfo' :key='index'
          :class="{ 'gray-row': index % 2 === 0 }">
          <div class='modal-content-title'>
            <span>{{ $t(item.label) }}:</span>
          </div>
          <div class='modal-content-text'>
            <span>{{ item.value }}</span>
          </div>
        </div>
      </div>
    </template>
  </modal>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { Modal } from '@/pages/Components'

export default {
  name: 'section-details-form',

  props: {
    sectionId: null,
    title: null,
  },

  components: {
    Modal
  },

  async mounted() {
    if (!this.sectionId || typeof(this.sectionId) !== 'number') {
      return
    }

    await this.loadSectionInfo(this.sectionId)
    //await this.loadSectionSurveyInfo({})
  },

  methods: {
    ...mapActions({
      loadSectionInfo: 'FILL_SECTION_INFO',
      loadSectionSurveyInfo: 'FILL_SECTION_SURVEY_INFO',
    }),
  },

  computed: {
    ...mapState({
      mainInfoUntranslated: (state) => state.ParamsComponent.mainInfo,
      surveyInfoUntranslated: (state) => state.ParamsComponent.surveyInfo,
    }),

    ...mapGetters(['lastGeometry']),

    sectionInfo() {
      return this.mainInfoUntranslated.concat(this.surveyInfoUntranslated);
    }
  }

}
</script>

<style lang='scss' scoped>
.modal-scroll-content {
  display: flex;
  overflow-y: auto;
  //z-index: 9999;
  flex-direction: column;
  max-height: 30rem;

  .modal-content-row {
    max-width: 500px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .modal-content-title {
      font-weight: 600;
    }

    .modal-content-text {
      min-width: 100px;
      padding-left: 15px;
    }
  }
}

.gray-row {
  background: #ebe9e9;
}
</style>