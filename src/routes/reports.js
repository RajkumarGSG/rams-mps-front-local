/* 
File: reports.js
Description: provides main routes for reports, component of the routes.js
*/
const Report_1_AdministrativeSetup = () => import('@/pages/Reports/Report_1_AdministrativeSetup.vue')
const Report_2_RoadsList = () => import('@/pages/Reports/Report_2_RoadsList.vue')
const Report_3_YearwiseRoadLength = () => import('@/pages/Reports/Report_3_YearwiseRoadLength.vue')
const Report_4_RoadLengthByTraffic = () => import('@/pages/Reports/Report_4_RoadLengthByTraffic.vue')
const Report_5_RoadwayDetails = () => import('@/pages/Reports/Report_5_RoadwayDetails.vue')
const Report_6_ListOfSections = () => import('@/pages/Reports/Report_6_ListOfSections.vue')
const Report_7_RoadConditionData = () => import('@/pages/Reports/Report_7_RoadConditionData.vue')
const Report_8_ConditionIndex = () => import('@/pages/Reports/Report_8_ConditionIndex.vue')
const Report_9_Yearly_Condition_Index = () => import('@/pages/Reports/Report_9_Yearly_Condition_Index.vue')
const Report_10_Section_wise_AADT = () => import('@/pages/Reports/Report_10_Section_wise_AADT.vue')
const Report_11_TotalElevationZones = () => import('@/pages/Reports/Report_11_TotalElevationZones.vue')
const Report_12_RoadLengthByElevationZones = () => import('@/pages/Reports/Report_12_RoadLengthByElevationZones.vue')
const Report_PatchingDetails = () => import('@/pages/Reports/Report_PatchingDetails.vue')
const Report_14_SurveyDataReconciliation = () => import('@/pages/Reports/Report_14_SurveyDataReconciliation.vue')

const ReportsMenu = [
  {
    path: '1_roads_administrative_setup',
    name: 'report_roads_administrative_setup',
    component: Report_1_AdministrativeSetup,
  },
  {
    path: '2_roads_list',
    name: 'report_roads_list',
    component: Report_2_RoadsList,
  },
  {
    path: '3_yearwise_road_length',
    name: 'report_yearwise_road_length',
    component: Report_3_YearwiseRoadLength,
  },
  {
    path: '4_length_by_traffic_intensity',
    name: 'report_length_by_intensity',
    component: Report_4_RoadLengthByTraffic,
  },
  {
    path: '5_road_way_details',
    name: 'report_road_way_details',
    component: Report_5_RoadwayDetails,
  },
  {
    path: '6_sections',
    name: 'report_sections',
    component: Report_6_ListOfSections,
  },
  {
    path: '7_road_condition',
    name: 'report_road_condition_data',
    component: Report_7_RoadConditionData,
  },
  {
    path: '8_region_wise_condition',
    name: 'report_region_wise_condition',
    component: Report_8_ConditionIndex,
  },
  {
    path: '9_yearly_condition',
    name: 'report_yearly_condition',
    component: Report_9_Yearly_Condition_Index,
  },
  {
    path: '10_section_wise_aadt',
    name: 'report_section_wise_aadt',
    component: Report_10_Section_wise_AADT,
  },
  {
    path: '11_total_elevation_zones',
    name: 'report_total_elevation_zones',
    component: Report_11_TotalElevationZones,
  },
  {
    path: '12_road_length_in_elevation_zones',
    name: 'report_road_length_in_elevation_zones',
    component: Report_12_RoadLengthByElevationZones,
  },
  {
    path: '13_patching_details',
    name: 'report_patching_details',
    component: Report_PatchingDetails,
  },
  {
    path: '14_survey_data_reconciliation_report',
    name: 'report_survey_data_reconciliation',
    component: Report_14_SurveyDataReconciliation,
  }
]

export default ReportsMenu