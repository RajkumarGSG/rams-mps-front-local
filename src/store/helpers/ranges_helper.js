/* 
File: ranges_helper.js
Description: provides legends, ranges and mappings for the Map interface.
*/

// for iri, cracks, 
// green, light green, yellow, orange, red
const mainColorRange = ['#008200', '#00ff00', '#ffff00', '#ff8000', '#ff0000'];
// for rutting, potholes
// green, light-green, orange, red
export const ruttingColorRange = ['#008200', '#00ff00', '#ff8000', '#ff0000'];
// for aadt, etc.
// blue, light-blue, cyan, light-green, yellow, orange, red
const aadtColorRange = ['#0000ff', '#0080ff', '#00ffff', '#00ff00', '#ffff00', '#ff8000', '#ff0000'];
export const ruttingRange = [2, 10, 20];
const ranges = [
  ['ЭМ', 'М', 'Ж'],
  [],
  [],
 // [1, 2, 3],           // road_class
  [2.5, 3.5, 5.5, 7],   // iri
  [2, 10, 20],          // rut_left
  [2, 10, 20],          // rut_right
  [0, 40, 100, 200],    // cracks
  [0, 1, 2],            //potholesRange
];
const legendKeys = [
  { key: 'roads', rangeIndex: -1, legend: 0, value: 'route.roads' }, //default for road_class
  { key: 'bridges', rangeIndex: -1, legend: 1, value: 'label.bridges' },
  { key: 'tunnels', rangeIndex: -1, legend: 2, value: 'label.tunnels' },
  //{ key: 'road_class', rangeIndex: -1, legend: 0, value: 'road_network.road_class' }, //default for road_class
  { key: 'iri', rangeIndex: 1, legend: 3, value: 'condition.iri' },
  { key: 'rut_left', rangeIndex: 1, legend: 4, value: 'condition.rut_left' },
  { key: 'rut_right', rangeIndex: 1, legend: 5, value: 'condition.rut_right' },
//  { key: 'cracks', rangeIndex: 1, legend: 6, value: 'condition.cracking_m2' },
//  { key: 'potholes', rangeIndex: 1, legend: 7, value: 'condition.potholes_no' },
//  { key: 'aadt', rangeIndex: 1, legend: 8, value: 'inventory.aadt' },
];

const legends = [
  [ // roadClass
    { colour: '#CC3300', name: 'road_network.class_em' },
    { colour: '#448aff', name: 'road_network.class_m' },   // previously was yellow #ffcc00
    { colour: '#339900', name: 'road_network.class_zh' }
  ],
  [ // bridges
    { colour: '#CC3300', name: 'criteria.soundness_imminent' },
    { colour: '#ff9966', name: 'criteria.soundness_critical' },
    { colour: '#ffcc00', name: 'criteria.soundness_poor' },
    { colour: '#99cc33', name: 'criteria.soundness_fair' },
    { colour: '#339900', name: 'criteria.soundness_good' }
  ],
  [ // tunnels
    { colour: '#CC3300', name: 'Тоннель им.Колбаева' },
    { colour: '#ff9966', name: 'Тоннель №1' },
    { colour: '#ffcc00', name: 'Тоннель №2' },
    { colour: '#99cc33', name: 'Тоннель №3' },
    { colour: '#339900', name: 'Ташкумырский Тоннель' }
  ],
  [ // iri
    { colour: '#008200', name: '< 2.5' },       // green
    { colour: '#00ff00', name: '2.5 - 3.5' },   // light green 
    { colour: '#ffff00', name: '3.5 - 5.5' },   // yellow
    { colour: '#ff8000', name: '5.5 - 7' },     // orange
    { colour: '#ff0000', name: '> 7.0' }        // red
  ],
  [ // for rut_left
    { colour: '#008200', name: '< 2.0' },         // green
    { colour: '#00ff00', name: '2.0 - 10.0' },    // light-green
    { colour: '#ff8000', name: '10.0 - 20.0' },   // orange
    { colour: '#ff0000', name: '> 20.' },         // red
  ],
  [ // for rut_right
    { colour: '#008200', name: '< 2.0' },         // green
    { colour: '#00ff00', name: '2.0 - 10.0' },    // light-green
    { colour: '#ff8000', name: '10.0 - 20.0' },   // orange
    { colour: '#ff0000', name: '> 20.' },         // red
  ],
]

function getIndex(key) {
  let index = legendKeys.findIndex((vector) => vector.key === key)
  if (index < 0) index = 0
  return index
}

function getLegend(key) {
  return legends[getIndex(key)]
}

function getRange(key) {
  return ranges[getIndex(key)]
}

function getVectorTypes(firstThree) {
  let res
  if (firstThree) {
    res = legendKeys.slice(0, 3)
  } else {
    res = legendKeys.slice(3)
    res.unshift({ key: 'road_class', value: 'road_network.road_class' })
  }
  return res
}

function getChartParamTypes() {
  let res = legendKeys.slice(3)
  //res.unshift({ key: '', value: '' })
  return res
}
/*
function getColor(key, index) {
  let index = legendKeys.findIndex((vector) => vector.key === key)
  if (index < 0) index = 0
  console.log(index)
  return legends[index].colour
}
*/
function getRoadClassColor(val) {
  let ind = ranges[0].findIndex(value => value == val)
  return (ind == -1) ? '#000000' : legends[0][ind].colour
}

function getRangeVal(val, range) {
  let res = null
  if (val < range[0]) {
    return 0
  }

  const len = range.length
  if (val >= range[len - 1]) {
    return len
  }

  for (let i = 0; i < len; i++) {
    if (val >= range[i] && val < range[i + 1]) {
      res = i + 1
    }
  }

  return res
}

export { ranges, getVectorTypes, getChartParamTypes, getLegend, getRange, getRangeVal, getRoadClassColor }
