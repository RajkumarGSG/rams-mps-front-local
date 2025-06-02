<!--
File: Map.vue
Description: shows map with roads entered in the DB.
-->
<template>
  <div v-if="eligible" class="grid-container">
    <MapSelectParams class="q1" />

    <!-- Here is the place for the Map -->
    <KG_Map class="q2 maps-area" ref="mapInstance" />

    <!-- Here is the place for the Chart -->
    <MapCharts class="q3" />
  </div>
</template>
<script>
  import { onClose } from '@/mixins/onCloseMixin'
  import permissions from "@/mixins/permissionsMixin"
  import MapSelectParams from "./MapSelectParams.vue"
  import KG_Map from './KG_Map.vue'
  import MapCharts from "./MapCharts.vue"

  export default {
    name: 'map-main',
    mixins: [permissions],

    data() {
      return {
        formName: 'Map',
        eligible: false,
        closePath: 'home'
      }
    },

    components: {
      MapSelectParams,
      KG_Map,
      MapCharts,
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
      };
    },

    methods: {
      onClose,
    }
  }
</script>
<style lang="scss" scoped>
.q1 {
  grid-column: 1 / 1;
  grid-row: 1 / span 3;
  margin: 0 0;
}

.q2 {
  grid-column: 2 / span 3;
  grid-row: 1 / span 4;
  margin: 0 0;
}

.q3 {
  grid-column: 1 / 1;
  grid-row: 4 / 4;
  margin: 0 0;
}

.grid-container {
  position: absolute;
  padding: 0 12px;
  left: 0;
  height: calc(100% - 100px);
  width: 100%;
  display: grid;
  grid-template-columns: 30% 35% 35%;
  grid-template-rows: 25% 25% 25% 20%;
}

.maps-area {
  position: static;
  padding: 0 12px;
  left: 0;
  //height: calc(100% - 100px);
  width: 100%;
}
</style>