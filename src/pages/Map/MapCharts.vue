<!--
File: MapCharts.vue
Description: called from map main window, shows the chard with different parameters of the road
-->
<template>
  <div class="md-layout">
    <div class="md-layout-item md-small-size-100 md-size-30">
      <BaseDropdown :label="''" v-model="selectedParamType" :disabled="!section_id" :items="paramTypes"
        @input="reloadData" />
    </div>
    <canvas class='md-layout-item md-small-size-100 md-size-100' id="MapChart"></canvas>
  </div>
</template>
<script>
  import { BaseDropdown } from '@/pages/Components'
  import { getChartParamTypes } from '@/store/helpers/ranges_helper';
  import permissions from "@/mixins/permissionsMixin"
  import Chart from 'chart.js';

  const chartParams = {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: '',
        data: [],
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        borderColor: 'rgba(0, 255, 0, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: { ticks: { beginAtZero: true }, },
        y: { ticks: { beginAtZero: true }, },
      },
      legend: { display: false },
      // for version ^3: plugins: { legend: { display: false, } }
    },
  }

  export default {
    name: 'map-charts-component',
    mixins: [permissions],

    data() {
      return {
        formName: 'Map',
        eligible: false,

        section_id: null,
        chart: null,
        tableData: [],
        item_id: null,
        selectedParamType: 'iri',
      }
    },

    components: {
      BaseDropdown,
    },

    created() {
      this.$eventHub.$on('mapItemSelected', this.onMapItemSelected)
      this.$eventHub.$on('viewGridClicked', this.onViewGridClicked)
    },

    beforeDestroy() {
      this.chart.destroy();
      this.$eventHub.$off('mapItemSelected')
      this.$eventHub.$off('viewGridClicked')
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        return
      };

      // Создаем новый график
      const ctx = document.getElementById('MapChart').getContext('2d');
      this.chart = new Chart(ctx, chartParams);

      //this.reloadData()
    },

    methods: {
      async reloadData() {
        const payload = {
          section_id: this.section_id,
          column_name: this.selectedParamType,
        };

        const res = await this.$store.dispatch("LOAD_CONDITION_DATA_FOR_CHART", payload);
        // TODO: change to zoom/scroll later by installing  chartjs-plugin-zoom@1.2.1
        const divisor = Math.round(res.length / 30)
        this.tableData = res.filter((_, index) => (index + 1) % divisor === 0);
        this.redrawChart();
      },

      async redrawChart() {
        let labels = []
        let dataSeries = []

        if (this.tableData.length) {
          labels = this.tableData.map((item) => item.start_distance);
          dataSeries = this.tableData.map((item) => item[this.selectedParamType]);
        }

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = dataSeries;
        this.chart.data.datasets[0].label = this.selectedParamType;
        this.chart.update(); // Перерисовываем график с новыми данными
      },

      onMapItemSelected({ layer, item_id }) {
        this.section_id = (layer !== 'bridges' && layer !== 'tunnels') ? item_id : null
        this.reloadData()
      },

      onViewGridClicked({ layer, filter, value }) {
        //this.section_id = ((layer !== 'bridges' || layer === 'tunnels') && filter === 'section_id') ? value : null
        this.section_id = (filter === 'section_id') ? value : null
        this.reloadData()
      }
    },

    computed: {
      paramTypes() {
        return getChartParamTypes().map(item => ({ id: item.key, description: this.$t(item.value) }));
      },
    },
  }
</script>
<style lang="scss" scoped>
</style>