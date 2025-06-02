<!--
File: RoadImages.vue
Description: called from map main window, shows the road image
-->
<template>
  <md-card>
    <div class="md-layout">
      <a href="#" @click.stop.prevent="onPictureClick(-1)"><md-icon class="md-size-2x">arrow_back</md-icon></a>
      <md-card-media class="md-layout-item md-size-70">
        <!--el-image style="width: 100px; height: 100px" :src="picName" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2"
            :preview-src-list="images" :initial-index="4" fit="cover" /-->
        <a href="#" @click.stop.prevent="onPictureClick(1)"><img style="display: block; height: 300px; width: 600px;"
            :src="picName" /></a>
      </md-card-media>
      <a href="#" @click.stop.prevent="onPictureClick(1)"><md-icon class="md-size-2x">arrow_forward</md-icon></a>
    </div>
    <!--el-carousel trigger="click" arrow="always">
            <el-carousel-item v-for="item in 4" :key="item">
              <img :src="item" alt="" class="carousel-block-image">
            </el-carousel-item>
          </el-carousel-->
  </md-card>
</template>
<script>
const images = [
  '30008/001/30008_001_00000_1_0178.jpg',
  '30008/001/30008_001_00010_1_0180.jpg',
  '30008/001/30008_001_00020_1_0182.jpg',
  '30008/001/30008_001_00030_1_0185.jpg',
  '30008/001/30008_001_00040_1_0187.jpg',
  '30008/001/30008_001_00050_1_0189.jpg',
  '30008/001/30008_001_00060_1_0192.jpg',
  '30008/001/30008_001_00070_1_0194.jpg',
  '30008/001/30008_001_00080_1_0196.jpg',
  '30008/001/30008_001_00090_1_0199.jpg',
  '30008/001/30008_001_00100_1_0201.jpg',
  '30008/001/30008_001_00110_1_0203.jpg',
  '30008/001/30008_001_00120_1_0206.jpg',
  '30008/001/30008_001_00130_1_0208.jpg',
  '30008/001/30008_001_00140_1_0211.jpg',
  '30008/001/30008_001_00150_1_0213.jpg',
  '30008/001/30008_001_00160_1_0215.jpg',
  '30008/001/30008_001_00170_1_0218.jpg',
  '30008/001/30008_001_00180_1_0221.jpg',
  '30008/001/30008_001_00190_1_0223.jpg'
]
export default {
  name: 'map-images-component',
  data() {
    return {
      section_id: null,
      uuid: null,   // for bridge or tunnel
      picId: 0,
      picName: "/1px.jpg" //null
    }
  },

  created() {
    this.$eventHub.$on('mapItemSelected', this.onMapItemSelected);
  },
  beforeDestroy() {
    this.$eventHub.$off('mapItemSelected')
  },

  methods: {
    reloadData() {
      const fileName = "../../../assets/A09.png"
      this.picId = 1
      this.onPictureClick(0)
    },

    onPictureClick(val) {
      if (this.picId == 0) return // We did not select road yet

      const path = "/section_images/"
      this.picId += val
      if (this.picId < 1) this.picId = 1; else if (this.picId > images.length) this.picId = images.length
      this.picName = path + images[this.picId - 1]   //`/000000${this.picId}.jpg`
    },

    onMapItemSelected({ layer, item_id, clicked_coords }) {    //feature_data) {
      if (!item_id) return

      switch (layer) {    //this.selectedVectorType) {
        case 'roads':
          this.uuid = null
          this.section_id = item_id
          this.reloadData()
          break
        case 'bridges':
        case 'tunnels':
          this.uuid = item_id
          this.section_id = null
          break
      }
    },
  },

  computed: {
  },

  watch: {
  }
}
</script>
<style lang="scss" scoped></style>