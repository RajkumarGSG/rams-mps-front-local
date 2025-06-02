<!--
File: ReportsPanel.vue
Description: shows panel with possibility to select the reports.
-->
<template>
  <md-card class="md-layout-item">
    <md-card-content>
      <div v-for="(report, index) in reports" :key="index" class="report-link">
        <md-icon>print</md-icon>
        <a href="#" @click.stop.prevent="showReport(report.url)">
          {{ index + 1 }}. {{ $t(report.name) }}
        </a>
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
  import permissions from "@/mixins/permissionsMixin"
  import { onClose } from '@/mixins/onCloseMixin'

  export default {
    name: 'reports-panel',
    mixins: [permissions],

    data() {
      return {
        formName: 'ReportsPanel',
        reports: [
          { url: '/reports/1_roads_administrative_setup', name: 'route.report_roads_administrative_setup' },
          { url: '/reports/2_roads_list', name: 'route.report_roads_list' },
          { url: '/reports/6_sections', name: 'route.report_sections' },
          { url: '/reports/3_yearwise_road_length', name: 'route.report_yearwise_road_length' },
          { url: '/reports/4_length_by_traffic_intensity', name: 'route.report_length_by_intensity' },
          { url: '/reports/5_road_way_details', name: 'route.report_road_way_details' },
          { url: '/reports/7_road_condition', name: 'route.report_road_condition_data' },
          { url: '/reports/8_region_wise_condition', name: 'route.report_region_wise_condition' },
          { url: '/reports/9_yearly_condition', name: 'route.report_yearly_condition' },
          { url: '/reports/10_section_wise_aadt', name: 'route.report_section_wise_aadt' },
          { url: '/reports/11_total_elevation_zones', name: 'route.report_total_elevation_zones' },
          { url: '/reports/12_road_length_in_elevation_zones', name: 'route.report_road_length_in_elevation_zones' },
          { url: '/reports/13_patching_details', name: 'route.report_patching_details' }
        ]
      };
    },

    async mounted() {
      // Check if we are eligible to view the form
      if (!this.checkIfScreenAllowed()) {
        this.onClose()
        return
      };
    },

    methods: {
      onClose,

      showReport(url) {
        if (url) this.$router.push(url)
      }
    }
  }
</script>
<style>
.md-card {
  margin: 0px 0;
}

.report-link {
  margin-bottom: 15px;
}

.report-link a {
  text-decoration: none;
  color: #007bff;
}

.report-link a:hover {
  text-decoration: underline;
}
</style>