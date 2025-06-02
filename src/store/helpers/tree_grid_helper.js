/* 
File: tree_grid_helper.js
Description: provides descriptions for the TreeGrid component
*/
const emptySectionInfo = [
  { name: 'region_id', label: "road_network.region" },
  { name: 'dep', label: 'road_network.dep' },
  { name: 'road', label: "road_network.road" },
  { name: 'section_description', label: "road_network.section", value: "1" },
  { name: 'start_distance_m', label: 'inventory.start_distance_m', isNum: true },
  { name: 'end_distance_m', label: 'inventory.end_distance_m', isNum: true },
];

const emptySectionAdditionalInfo = [
  { name: 'fclass', label: 'inventory.fclass' },
  { name: 'villages', label: 'inventory.villages' },
  { name: 'aadt', label: 'inventory.aadt' },
  { name: 'black_spots', label: 'condition.black_spots' },
  { name: 'social_importance', label: 'inventory.social_importance' },
];

const emptySectionSurveyInfo = [
  { name: 'survey_date', label: "condition.survey_date" },
  { name: 'iri', label: 'condition.iri' },
  { name: 'rut_left', label: 'condition.rut_left' },
  { name: 'rut_right', label: 'condition.rut_right' },
  { name: 'cracking_m2', label: 'condition.cracking_m2' },
  { name: 'potholes_no', label: 'condition.potholes_no' },
  { name: 'repairs_m2', label: 'condition.repairs_m2' },
  { name: 'edge_break_m2', label: 'condition.edge_break_m2' },
  { name: 'nr_of_lanes', label: 'road_network.nr_of_lanes' },
  { name: 'scratches', label: 'condition.scratches' },
  { name: 'start_distance', label: 'road_network.start_distance' },
  { name: 'end_distance', label: 'road_network.end_distance' },
  { name: 'length', label: 'road_network.length' },
  { name: 'offset_m', label: 'condition.offset_m' },
  { name: 'pavement_width_m', label: 'condition.pavement_width_m' },
  { name: 'left_shoulder_width_m', label: 'condition.left_shoulder_width_m' },
  { name: 'right_shoulder_width_m', label: 'condition.right_shoulder_width_m' },
  { name: 'left_shoulder_type', label: 'condition.left_shoulder_type_desc' },
  { name: 'right_shoulder_type', label: 'condition.right_shoulder_type_desc' },
  { name: 'median_width_m', label: 'condition.median_width_m' },
];
const emptyIndexInfo = [
  { name: "functional_index", label: "Functional index " },
  { name: "condition_index", label: "Condition index " },
  { name: "priority_index", label: "Priority index " },
  { name: "treatment_key", label: "Treatment key " },
  { name: "treatment_description", label: "Treatment description " },
  { name: "hs_id", label: "Hs id " },
];

const emptyBridgeInfo = [
  { name: "pluad_uad", label: "bridges_table.pluad_uad" },
  { name: "dep", label: "bridge.dep" },
  { name: "region_name", label: "bridges_table.region_name" },
  { name: "structural_soundness", label: "bridges_table.structural_soundness" },
  { name: "bridge_num", label: "bridge.bridge_num" },
  { name: "road_class", label: "bridge.road_class" },
  { name: "route_name", label: "bridges_table.route_name" },
  { name: "location", label: "bridges_table.location" },
  { name: "longitude_e", label: "bridge.longitude_e" },
  { name: "latitude_n", label: "bridge.latitude_n" },
  { name: "design_load", label: "bridge.design_load" },
  { name: "maintenance_category", label: "bridges_table.maintenance_category" },
  { name: "year_construction", label: "bridge.year_construction" },
];

const emptyBridgeSurveyInfo = [
  { name: "dim_length", label: "bridges_table.dim_length" },
  { name: "year_last_repair", label: "bridges_table.year_last_repair" },
  { name: "dim_width_roadway", label: "bridges_table.dim_width_roadway" },
  { name: "dim_width_sidewalk", label: "bridges_table.dim_width_sidewalk" },
  { name: "num_of_span", label: "bridges_table.num_of_span" },
  { name: "sub_material", label: "bridges_table.sub_material" },
];

const emptyTunnelInfo = [
  { name: "tunnel_name_en", label: "tunnel.name_en" },
  { name: "tunnel_name_ru", label: "tunnel.name_ru" },
  { name: "reference_number", label: "tunnel.reference_number" },
  { name: "tunnel_length", label: "tunnel.length" },
  { name: "distance_post", label: "tunnel.distance_post" },
  { name: "completion_year", label: "tunnel.completion_year" },
  { name: "competent_dep", label: "bridge.competent_dep" },
];

const emptyTunnelSurveyInfo = [
  { name: "traffic_volume", label: "tunnel.traffic_volume" },
  { name: "regulation_speed", label: "tunnel.regulation_speed" },
  { name: "traffic_form_en", label: "tunnel.traffic_form_en" },
  { name: "traffic_form_ru", label: "tunnel.traffic_form_ru" },
  { name: "longitudinal_slope", label: "tunnel.longitudinal_slope" },
  { name: "tunnel_support_structure_en", label: "tunnel.tunnel_support_structure_en" },
  { name: "tunnel_support_structure_ru", label: "tunnel.tunnel_support_structure_ru" },
  { name: "pavement_type_en", label: "tunnel.pavement_type_en" },
  { name: "pavement_type_ru", label: "tunnel.pavement_type_ru" },
  { name: "pavement_thickness", label: "tunnel.pavement_thickness" },
  { name: "longitude_e", label: "tunnel.longitude_e" },
  { name: "latitude_n", label: "tunnel.latitude_n" },
];

function roadClasses2TreeGrid(sectionsData) {
  const result = [
    { id: 'ЭМ', value: 'ЭМ', param: 'road_class', label: 'ЭМ Roads', children: [] },
    { id: 'М', value: 'М', param: 'road_class', label: 'М Roads', children: [] },
    { id: 'Ж', value: 'Ж', param: 'road_class', label: 'Ж Roads', children: [] },
    //{ name: '?', label: '?', children: [] }
  ]

  sectionsData.forEach(section => {
    let index = 3
    switch (section.road_key.at(0)) {
      case 'Э': index = 0; break
      case 'М': index = 1; break
      case 'Ж': index = 2; break
      //default: index = 3
    }

    if (index < 3) {
      let i = result[index].children.findIndex(road => road.id === section.road_id)

      if (i == -1) {
        i = result[index].children.push({
          id: section.road_id,
          value: section.road_description,
          param: 'fk_road',
          label: 'Road',
          children: []
        }) - 1
      }
      result[index].children[i].children.push({
        id: section.section_id,
        value: section.section_description,
        param: 'section_id',
        label: 'Section',
        children: []
      })
    }
  })
  return result;
}

function sections2TreeGrid(deuData, sectionsData) {
  const result = [];

  deuData.forEach(item => {
    // Group by regions
    const existingRegion = result.find(r => r.id === item.fk_region);

    const newDeuChild = {
      id: item.deu_id,
      value: item.description,
      param: 'fk_deu',
      label: 'DEU',
      children: []
    };

    if (existingRegion) {
      // If region exists then add in its children
      existingRegion.children.push(newDeuChild);
    } else {
      // Region does not exist - add new object with children
      result.push({
        id: item.fk_region,
        value: item.region,
        param: 'fk_region',
        label: 'Region',
        children: [newDeuChild]
      });
    }

    // Get Sections to be aaded as children
    // We removed additional roads level as it will show the sections not belonging to this DEU
    // and TregGrid shows only 3 levels
    newDeuChild.children = sectionsData.filter(section => section.deu_id === item.deu_id)
      .map(section => ({
        id: section.section_id,
        value: section.section_description,
        param: 'section_id',
        label: 'Section',
      }))
  });

  return result;
}

export {
  emptySectionInfo, emptySectionAdditionalInfo, emptySectionSurveyInfo,
  emptyBridgeInfo, emptyBridgeSurveyInfo,
  emptyTunnelInfo, emptyTunnelSurveyInfo,
  sections2TreeGrid, roadClasses2TreeGrid
}