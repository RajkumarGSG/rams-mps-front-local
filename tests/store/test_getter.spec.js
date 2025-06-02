import RoadNetwork from '@/store/refdata/road_network';

const state = {
  section_list: [
    { id: 1, road_id: 1, deu_id: 1, road: 'A', section: 'AAA' },
    { id: 2, road_id: 2, deu_id: 2, road: 'B', section: 'BBB' },
    { id: 3, road_id: 2, deu_id: 2, road: 'B', section: 'CCC' },
    { id: 4, road_id: 3, deu_id: 3, road: 'C', section: 'DDD' },
    { id: 4, road_id: 3, deu_id: 4, road: 'C', section: 'EEE' },
  ],
};
const getters = {
  roadsList: [
    { id: 1, road_id: 1, deu_id: 1, road: 'A', section: 'AAA' },
    { id: 2, road_id: 2, deu_id: 2, road: 'B', section: 'BBB' },
    { id: 4, road_id: 3, deu_id: 3, road: 'C', section: 'DDD' },
  ],
};

// Тест для геттера roadsList
describe('roadsList Getter', () => {
  it('should return only unique roads', () => {
    const result = RoadNetwork.getters.roadsList(state);
    expect(result).toEqual([
      { id: 1, description: 'A', deu_id: 1 },
      { id: 2, description: 'B', deu_id: 2 },
      { id: 3, description: 'C', deu_id: 3 },
    ]);
  });
});

describe('roadsListFiltered Getter', () => {
  it('should return filtered list by deu_id', async () => {
    const result = await RoadNetwork.getters.roadsListFiltered(state, getters)(1);
    expect(result).toEqual([
      { id: 0, description: '', deu_id: null },
      { id: 1, road_id: 1, deu_id: 1, road: 'A', section: 'AAA' },
    ]);
  });
  
  it('should return all items if filters are not provided', async () => {
    const result = await RoadNetwork.getters.roadsListFiltered(state, getters)();
    getters.roadsList.unshift({ id: 0, description: '', deu_id: null }) 

    expect(result).toEqual(getters.roadsList);
  });

  it('should return empty list if no matching deu_id', async () => {
    const result = await RoadNetwork.getters.roadsListFiltered(state, getters)(5);
    expect(result).toEqual([{ id: 0, description: '', deu_id: null }]);
  });
});