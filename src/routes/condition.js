/* 
File: condition.js
Description: provides main routes for condition editing forms, component of the routes.js
*/
const Condition = () => import('@/pages/Condition/Condition.vue')
const ConditionImportForm = () => import('@/pages/Condition/ConditionImportForm.vue')

const Traffic = () => import('@/pages/Condition/Traffic.vue')
// const TrafficImportForm = () => import('@/pages/Condition/TrafficImportForm.vue')
const ImportTrafficForm = () => import('@/pages/Condition/ImportTrafficForm.vue')

const ConditionDataMenu = [
  { // Condition data
    path: 'condition',
    name: 'Condition_Data',
    component: Condition,
  },
  { // Condition data import
    path: 'upload',
    name: 'import',
    component: ConditionImportForm
  },
  
  { // Traffic
    path: 'traffic',
    name: 'Traffic_data',
    component: Traffic,
  },

  // Ashi: This was old route. Commented to confirm that it is not used anymore.
  // { // Trafficimport
  //   path: 'import',
  //   name: 'import_traffic',
  //   component: TrafficImportForm,
  // },
  { // Import Traffic
    path: 'import',
    name: 'import_traffic',
    component: ImportTrafficForm,
  },

]

export default ConditionDataMenu
