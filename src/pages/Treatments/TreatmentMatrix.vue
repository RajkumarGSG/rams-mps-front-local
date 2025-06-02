<!--
File: TreatmentMatrix.vue
Description: TreatmentMatrix as the pivot and as the list.
-->
<template>
  <VueTabs v-if="eligible">
    <v-tab id="tab0" v-if="tab0Allowed" :title="$t('tabs.pivot')">
      <TreatmentMatrixPivot />
    </v-tab>

    <v-tab id="tab1" v-if="tab1Allowed" :title="$t('tabs.list')">
      <TreatmentMatrixList />
    </v-tab>
  </VueTabs>
</template>
<script>
  import { VueTabs, VTab } from 'vue-nav-tabs'
  import 'vue-nav-tabs/themes/vue-tabs.css'
  import permissions from "@/mixins/permissionsMixin"
  import { onClose } from '@/mixins/onCloseMixin'

  import TreatmentMatrixPivot from './TreatmentMatrixPivot.vue'
  import TreatmentMatrixList from './TreatmentMatrixList.vue'

  export default {
    name: 'treatment-matrix',
    mixins: [permissions],

    data() {
      return {
        formName: 'TreatmentMatrix',
        eligible: false,
      }
    },

    components: {
      VueTabs,
      VTab,
      TreatmentMatrixPivot,
      TreatmentMatrixList,
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
    },

    computed: {
      tab0Allowed() {
        return this.isScreenAllowed(TreatmentMatrixPivot.name);
      },
      tab1Allowed() {
        return this.isScreenAllowed(TreatmentMatrixList.name);
      }
    },
  }
</script>
<style lang="scss" scoped>
.vue-tabs {
  height: 100%;
}

.vue-tabs .tab-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vue-tabs .tab-content>div {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vue-tabs .nav-tabs>li.active>a,
.vue-tabs .nav-tabs>li.active>a:hover,
.vue-tabs .nav-tabs>li.active>a:focus {
  background-color: #4caf50;
}

.tab-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
