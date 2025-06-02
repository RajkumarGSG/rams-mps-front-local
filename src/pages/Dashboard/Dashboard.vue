<template>
  <div>
    <div class='plans-select'>
      <!--PlansDropdown class='plans-select-dropdown' v-model="selected_plan" @input="reloadChartData" /-->
    </div>
    <div class='md-layout'>
      <div class='md-layout-item md-size-50 md-small-size-100 md-medium-size-50'>
        <chart-card header-animation='false' :chart-data='multipleBarsChart.data'
          :chart-options='multipleBarsChart.options' chart-type='Bar' header-icon chart-inside-content
          background-color='green' :dataIsLoading='chartsDataIsLoading'>
          <template slot='chartInsideHeader'>
            <div class='card-icon'> <md-icon>insert_chart</md-icon> </div>
            <h4 class='title'> {{ $t('label.cost_of_work_by_organizations') }} </h4>
          </template>
          <template slot='footer'>
            <div class='md-layout'>
              <div v-for='(name, ind) in multipleBarsChart.data.legend' :key='name' class='md-layout-item'>
                <i class='fa fa-circle' :class='[legend_color[ind]]'></i>
                {{ $t(name) }}
              </div>
            </div>
          </template>
        </chart-card>
      </div>

      <div class='md-layout-item md-size-50 md-small-size-100'>
        <chart-card header-animation='false' :chart-data='pieChart.data' :chart-options='pieChart.options'
          chart-type='Pie' header-icon chart-inside-content background-color='green' :dataIsLoading='chartsDataIsLoading'>
          <template slot='chartInsideHeader'>
            <div class='card-icon'> <md-icon>pie_chart</md-icon> </div>
            <h4 class='title'> {{ $t('label.work_types') }} </h4>
          </template>
          <template slot='footer'>
            <div class='md-layout'>
              <div class='md-layout-item' v-for='(name, ind) in pieChart.data.legend' :key='name'>
                <i class='fa fa-circle' :class='[legend_color[ind]]'></i>
                {{ $t(name) }}
              </div>
            </div>
          </template>
        </chart-card>
      </div>
    </div>
  </div>
</template>

<script>
  import permissions from "@/mixins/permissionsMixin"
  import { mapState, mapActions } from 'vuex'
  import { PlansDropdown } from '@/pages/Components'
  import { ChartCard } from '@/components'

  export default {
    name: 'home-page',
    mixins: [permissions],

    data() {
      return {
        formName: 'Dashboard',

        selected_plan: undefined,
        legend_color: ['text-info', 'text-danger', 'text-warning'],
        chartsDataIsLoading: true,
        pieChart: {
          data: {
            labels: [],
            series: [],
            legend: []
          },
          options: {
            height: '300px'
          }
        },

        multipleBarsChart: {
          data: {
            labels: [],
            series: [],
            legend: []
          },
          options: {
            seriesBarDistance: 40,
            axisX: {
              showGrid: false
            },
            height: '300px',
            scales: {
              xAxes: [
                {
                  ticks: {
                    autoSkip: false,
                    maxRotation: 90,
                    minRotation: 90
                  }
                }
              ]
            }
          },
          responsiveOptions: [
            [
              'screen and (max-width: 640px)',
              {
                seriesBarDistance: 5,
                axisX: {
                  labelInterpolationFnc: function (value) {
                    return value[0]
                  }
                }
              }
            ]
          ]
        },
        cards: []
      }
    },

    components: {
      PlansDropdown,
      ChartCard
    },

    async mounted() {
      // Check if we are eligible to view the form
      if (!this.checkIfScreenAllowed()) {
        this.onClose()
        return
      };
/* For testing purposes */


/* End testing purposes */
      this.chartsDataIsLoading = true
      //this.selected_plan = this.currentPlan ? this.currentPlan : this.planList[0].id
      //this.reloadChartData()
    },

    methods: {
      ...mapActions({
        //loadDashboardCharts: 'LOAD_DASHBOARD_CHARTS',
      }),

      async reloadChartData() {
        this.chartsDataIsLoading = true
        try {
          this.multipleBarsChart.data.labels = []
          this.multipleBarsChart.data.series = []
          this.multipleBarsChart.data.legend = []
          this.pieChart.data.labels = []
          this.pieChart.data.series = []
          this.pieChart.data.legend = []
          this.cards = []

          //const res = await this.loadDashboardCharts(this.selected_plan)

          const brChartData = res.barchart.data
          const pChartData = res.piechart.data
          this.cards = res.cards

          this.multipleBarsChart.data.labels = brChartData.dimensions
          brChartData.measures.forEach((mr, index) => {
            this.$set(
              this.multipleBarsChart.data.series,
              index,
              mr.map((val) => val / 1000000)
            )
          })
          this.multipleBarsChart.data.legend = brChartData.legend

          this.pieChart.data.legend = pChartData.legend
          this.pieChart.data.labels = Object.keys(pChartData.measures).map(
            (item) => `${pChartData.measures[item]}`
          )
          this.pieChart.data.series = Object.keys(pChartData.measures).map(
            (item) => pChartData.measures[item]
          )
        } catch (err) {
          this.multipleBarsChart.data.labels = []
          this.multipleBarsChart.data.series = []
          this.multipleBarsChart.data.legend = []
          this.pieChart.data.labels = []
          this.pieChart.data.series = []
          this.pieChart.data.legend = []
          this.cards = []
        } finally {
          this.chartsDataIsLoading = false
        }
      }
    },

    computed: {
      ...mapState({
        currentPlan: (state) => state.Planning.currentPlan,
      })
    }
  }
</script>
<style lang='scss'>
.plans-select {
  display: flex;
  position: inherit;
  top: 20px;
  margin-left: auto;
  align-items: center;
  justify-content: flex-end;

  .plans-select-dropdown {
    max-width: 300px;
  }
}

.ct-bar {
  stroke-width: 40px
}
</style>
