/* 
File: settings.js
Description: provides main routes for settings editing forms, component of the routes.js
*/
const TreatmentTypes = () => import('@/pages/Treatments/TreatmentTypes.vue')
const TreatmentRates = () => import('@/pages/Treatments/TreatmentRates.vue')
const TreatmentMatrix = () => import('@/pages/Treatments/TreatmentMatrix.vue')
const ConditionIndexCriteria = () => import('@/pages/Settings/ConditionIndexCriteria.vue')

const Units = () => import('@/pages/Settings/Units.vue')
const Translate = () => import('@/pages/Settings/Translate.vue')
const WorkCategories = () => import('@/pages/Settings/WorkCategories.vue')

const Users = () => import('@/pages/RBAC/Users.vue')
const Groups = () => import('@/pages/RBAC/Groups.vue')
const RolesScreen = () => import('@/pages/RBAC/Roles.vue')
const UserRolesScreen = () => import('@/pages/RBAC/UserRoles.vue')
const PermissionsScreen = () => import('@/pages/RBAC/Permissions.vue')

const InventoryTypes = () => import('@/pages/Settings/InventoryTypes.vue')
const InventoryEvents = () => import('@/pages/Settings/InventoryEvents.vue')

//const convertToJson = () => import('@/pages/Unused/ConvertToJson.vue')
//const imageTest = () => import('@/pages/Map/ImageShowing.vue')

const SettingsMenu = [
/*
  {
    path: 'img',
    name: 'img',
    component: imageTest,
  },
  {
    path: 'convert',
    name: 'convert',
    component: convertToJson,
  },*/

  { // Treatment Typess
    path: 'types',
    name: 'treatment_types',
    component: TreatmentTypes,
  },
  { // Treatment Rates
    path: 'rates',
    name: 'treatment_rates',
    component: TreatmentRates,
  },
  { // Treatment Matrix
    path: 'treatment_matrix',
    name: 'treatment_matrix',
    component: TreatmentMatrix,
  },
  { // Condition Index Criteria
    path: 'condition_index_criteria',
    name: 'condition_index_criteria',
    component: ConditionIndexCriteria,
  },
  { // Units
    path: 'units',
    name: 'Units',
    component: Units,
  },
  { // Translations
    path: 'translate',
    name: 'Translate',
    component: Translate,
  },
  { // Work Categories
    path: 'work_categories',
    name: 'Work_Categories',
    component: WorkCategories,
  },
  { // Users
    path: 'users',
    name: 'Users',
    component: Users,
  },
  { // Groups
    path: 'groups',
    name: 'Groups',
    component: Groups,
  },
  { // Roles
    path: 'roles',
    name: 'roles',
    component: RolesScreen,
  },
  { // Permissions
    path: 'permissions',
    name: 'permissions',
    component: PermissionsScreen,
  },
  { // User roles
    path: 'user_roles',
    name: 'user_roles',
    component: UserRolesScreen,
  },
  { // Inventory Types 
    path: 'inventory_types',
    name: 'Inventory_Types',
    component: InventoryTypes,
  },
  { //Inventory Events
    path: 'inventory_events',
    name: 'Inventory_Events',
    component: InventoryEvents,
  },
];

export default SettingsMenu;