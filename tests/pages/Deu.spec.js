import Vuex from 'vuex';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Deu from '@/pages/RoadNetwork/Deu.vue';
import BaseDataTable from '@/pages/Components/BaseDataTable.vue';
//import EditForm from '@/pages/RoadNetwork/DeuEditForm.vue';
//import SearchInput from '@/pages/Components/SearchInput.vue';
//import RegionsDropdown from '@/pages/Components/Dropdowns/RegionsDropdown.vue';
//import TableActions from '@/pages/Components/TableActions.vue';

//vi.mock("@/api/road_network")

const localVue = createLocalVue();
localVue.use(Vuex);

const items = [
  { deu_id: 1, region_id: 1, region_description: 'North', description: 'Desc1', city: 'City1', address1: 'Addr1' },
  { deu_id: 2, region_id: 2, region_description: 'South', description: 'Desc2', city: 'City2', address1: 'Addr2' },
];

const mockStore = new Vuex.Store({
  modules: {
    ReferenceData: {
      namespaced: true,
      getters: {
        isAllowed: () => () => true
      }
    }
  },
  state: {
    RoadNetwork: {
      deu_list: [ { deu_id: 1, description: 'Desc1' }     ],
    },
    Dropdowns: {
      regions: (state) => state.Dropdowns.regions
    },
    History: {
      row: null
    }
  },
  actions: {
    CLEAR_DEU_LIST: vi.fn(),
//    LOAD_DEU_LIST: vi.fn().mockResolvedValue('success'),
    LOAD_DEU_LIST: vi.fn(() => Promise.resolve(items)),
    DELETE_DEU: vi.fn(),
  },
  getters: {
    isAllowed: () => () => true,
    deuWithPrefix: () => vi.fn(() => []), // Mock the getter
    //deuWithPrefix: (prefix) => vi.fn(),
  }
});

const factory = (propsData = {}, dataOverrides = {}) => mount(Deu, {
  localVue,
  store: mockStore,
  propsData,
  data() {
    return {
      eligible: true,
      ...dataOverrides
    }
  },
   mocks: {
    $t: (msg) => msg,
    sort: vi.fn(),
  }, 
  methods: {
    reloadData: vi.fn(),
  }
});

vi.clearAllMocks();

describe('Deu.vue', () => {
  it('renders the component correctly', async () => {
    const wrapper = factory();
    expect(wrapper.vm.eligible).toBe(true);
    expect(wrapper.findComponent({ name: 'BaseDataTable' }).exists()).toBe(true);
    expect(wrapper.vm.formName).toBe('Deu');
  });

  it('does not render the component when ineligible', async () => {
    const wrapper = factory({}, { eligible: false });
    expect(wrapper.vm.eligible).toBe(false);
    expect(wrapper.findComponent({ name: 'BaseDataTable' }).exists()).toBe(false);
  });

  it('gets data correctly', async () => {
/*    const wrapper = factory();
    wrapper.vm.reloadData = vi.fn();
    await wrapper.setData({ selectedRegion: 'East' });
    expect(wrapper.vm.reloadData).toHaveBeenCalled();


    const actionSpy = vi.spyOn(Deu.methods, 'loadList');
    
  console.log('Deu.methods', Deu.methods);
  //const actionSpy = vi.spyOn(wrapper.vm.$store.actions, 'CLEAR_DEU_LIST');

console.log('queriedData',  wrapper.vm.queriedData.length)
    expect(actionSpy).toHaveBeenCalled();

    expect(wrapper.vm.tableData.length).toBe(2);
    expect(wrapper.vm.queriedData.length).toBe(2);
    //expect(wrapper.vm.cachedData.length).toBe(2);
    //expect(wrapper.vm.cachedData.at(1).description).toBe('road_network.dep-Desc1');
    expect(wrapper.vm.headers.length).toBe(4);*/
  });

  /*
  it('renders the sub-components correctly', async () => {
    expect(wrapper.findComponent(BaseDataTable).exists()).toBe(true);
    expect(wrapper.findComponent(SearchInput).exists()).toBe(true);
    expect(wrapper.findComponent(RegionsDropdown).exists()).toBe(true);
  });
*/
  it('debug', async () => {
    const wrapper = factory()
    let subComponent = wrapper.findAll('label').filter(el => el.text().includes('label.select_region'));
    expect(subComponent.exists()).toBe(true);

    subComponent = wrapper.findAll('md-input')  //.filter(btn => btn.text().includes('label.select_region'));
    console.log('subComponent', subComponent.at(0).value)
    //expect(subComponent.exists()).toBe(true);
//<md-input type="search" 


    //console.log('wrapper', wrapper.html())
    console.log('historyMapping', wrapper.vm.historyMapping)
    console.log('showSpinner', wrapper.vm.showSpinner)

    await wrapper.vm.$nextTick();
    const select = wrapper.find('md-select');
    console.log('select exists', select.exists()); // Должно быть true

    const find = wrapper.findComponent('BaseDataTable') //.length;
    console.log('find', find)
    //    const find = wrapper.find({name: 'Deu'}) //wrapper.find("BaseDataTable")
    //   console.log('BaseDataTable exists', find.exists())
    //   expect(find.exists()).toBe(true);
    //expect(.element).not.toBeVisible()
    //expect(wrapper.findComponent(BaseDataTable).exists()).toBe(true);
  });

/*
  it('displays data in the table', async () => {
    const wrapper = factory()
    //await wrapper.vm.reloadData();
    console.log('searchQuery', wrapper.vm.searchQuery)
    console.log('fuseSearch', wrapper.vm.fuseSearch)
    console.log('total', wrapper.vm.total)

    console.log('searchedData', wrapper.vm.searchedData)
    console.log('queriedData', wrapper.vm.queriedData)
    
    expect(wrapper.findAll('md-table-row').length).toBe(2);
  });

  it('filters data based on search query', async () => {
    //const wrapper = factory()
    const wrapper = factory({ searchQuery: 'North' })
    await wrapper.vm.reloadData();
    await wrapper.setData({ searchQuery: 'Nor' });
    expect(wrapper.vm.queriedData.length).toBe(1);
  });
  */

  /* 
    it('calls viewItem when add-item event is triggered', async () => {
      wrapper.vm.viewItem = vi.fn();
      await wrapper.findComponent(BaseDataTable).vm.$emit('add-item');
      expect(wrapper.vm.viewItem).toHaveBeenCalled();
    });
  
    it('calls deleteItem when delete event is triggered', async () => {
      //const wrapper = shallowMount(Deu, { localVue, store: mockStore });
      wrapper.vm.deleteItem = vi.fn();
      await wrapper.findComponent(TableActions).vm.$emit('delete', 1, 'Desc1');
      expect(wrapper.vm.deleteItem).toHaveBeenCalledWith(1, 'Desc1');
    });
  
    it('displays EditForm when showDetailsDlg is true', async () => {
      await wrapper.setData({ showDetailsDlg: true, currentId: 1 });
      await wrapper.vm.$nextTick();
      console.log('wrapper', wrapper)
      expect(wrapper.findComponent(EditForm).exists()).toBe(true);
    });
    */
  it('triggers reloadData when selectedRegion changes', async () => {
    const wrapper = factory()
    wrapper.vm.reloadData = vi.fn();
    await wrapper.setData({ selectedRegion: 'East' });
    expect(wrapper.vm.reloadData).toHaveBeenCalled();
  });

  /*
  it('sorts data when clicking on sortable header', async () => {
    wrapper.vm.customSort = vi.fn();
    const actionSpy = vi.spyOn(wrapper, 'customSort');
    await wrapper.setData({ currentSort: 'description', currentSortOrder: 'asc' });
   // expect(wrapper.vm.customSort).toHaveBeenCalled();
    expect(actionSpy).toHaveBeenCalled();
  });
  */
});
