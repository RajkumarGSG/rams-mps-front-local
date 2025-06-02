/*
File: api/temp_unpaved.js
Description: Temporary stubs for API connections
*/
// TODO: 2 lines below are temporarily until Andrey uploads all the coordd to the DB
import unpaved_roads from '@/store/jsons/unpaved_roads.json'
import unpaved_coords from '@/store/jsons/unpaved_coords.json'

export const unpavedApi = {
  load_unpaved_roads_list() { return { status: 200, data: unpaved_roads } },
  load_unpaved_coords_list() { return { status: 200, data: unpaved_coords } },
};