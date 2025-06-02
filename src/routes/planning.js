/* 
File: planning.js
Description: provides main routes for the WorkPlan, budgeting and HDM forms, component of the routes.js
*/
const GenerateTreatment = () => import('@/pages/Planning/GenerateTreatment/GenerateTreatment.vue')
const Plans = () => import('@/pages/Planning/PreparePlan/PreparePlan.vue')
const RoutineMaintenance = () => import('@/pages/Planning/RoutineMaintenance/RoutineMaintenance.vue')
const TitleList = () => import('@/pages/Planning/TitleList/TitleList.vue')

const WorkPlanMenu = [
  {
    path: 'generate_treatment',
    name: 'generate_treatment',
    component: GenerateTreatment
  },
  {
    path: 'prepare_plan',
    name: 'prepare_plan',
    component: Plans
  },
  {
    path: 'title_list',
    name: 'title_List',
    component: TitleList
  },

  {
    path: 'routine_maintenance',
    name: 'routine_maintenance',
    component: RoutineMaintenance
  },
]

export default WorkPlanMenu