/* 
File: inventory.js
Description: provides main routes for road inventory forms, component of the routes.js
*/
const Regions = () => import('@/pages/RoadNetwork/Regions.vue')
const Deu = () => import('@/pages/RoadNetwork/Deu.vue')
const Roads = () => import('@/pages/RoadNetwork/Roads.vue')
const ImportForm = () => import('@/pages/RoadNetwork/ImportForm.vue')
const Sections = () => import('@/pages/RoadNetwork/Sections.vue')
const TrafficSites = () => import('@/pages/RoadNetwork/TrafficSites.vue')

const Districts = () => import('@/pages/RoadNetwork/Districts.vue')

const InventoryDataMenu = [
  { // Regions
    path: 'regions',
    name: 'list_of_regions',
    component: Regions,
  },
  { // Districts
    path: 'districts',
    name: 'districts',
    component: Districts,
  },
  { // DEU
    path: 'deu',
    name: 'list_of_deus',
    component: Deu,
  },
  { // Roads
    path: 'roads',
    name: 'list_of_roads',
    components: { default: Roads },
  },
  { //Sections
    path: 'sections',
    name: 'list_of_sections',
    components: { default: Sections },
  },
  { // Traffic sites
    path: 'traffic',
    name: 'Traffic_sites',
    components: { default: TrafficSites },
  },
  { // Import (Roads/sections)
    path: 'import',
    name: 'roads_sections_import',
    component: ImportForm,
  },
]

export default InventoryDataMenu
