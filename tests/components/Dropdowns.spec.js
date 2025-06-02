import Vuex from 'vuex';
import { mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import * as Components from "@/pages/Components/Dropdowns";

vi.mock('BaseDropdown');

const localVue = createLocalVue();
localVue.use(Vuex);

const items = [
  { id: 1, description: 'Option 1' },
  { id: 2, description: 'Option 2' },
  { id: 3, description: 'Option 3' }
];
const getDropdownStub = vi.fn().mockResolvedValue('success')

const mockStore = new Vuex.Store({
  state: {
    Dropdowns: {
      amounts: items,
      deus: items,
      plans: items,
      regions: items,
      roads: [
        { id: 1, description: 'Road 1' },
        { id: 2, description: 'Road 2' }
      ],
      units: items,
    },
    ReferenceData: {
      treatmentTypes: items,
    }

  },
  actions: {
    GET_AMOUNTS_DROPDOWN: getDropdownStub,
    GET_DEUS_DROPDOWN: getDropdownStub,
    GET_REGIONS_DROPDOWN: getDropdownStub,
    GET_PLANS_DROPDOWN: getDropdownStub,
    GET_ROADS_CLASSES_DROPDOWN: getDropdownStub,
    GET_ROADS_DROPDOWN: getDropdownStub,
    GET_SECTIONS_DROPDOWN: getDropdownStub,
    GET_TREATMENT_TYPE_DROPDOWN: getDropdownStub,
    GET_UNITS_DROPDOWN: getDropdownStub,
    LOAD_RDB_LOOKUP: getDropdownStub,
  }
});

const Dropdowns = [
  { component: Components.AmountsDropdown, name: 'AmountsDropdown', storeKey: '', label: 'label.show_as', action: '' },
  { component: Components.DepsDropdown, name: 'DepsDropdown', storeKey: 'deus', label: 'label.select_deu', action: 'GET_DEUS_DROPDOWN' },
  { component: Components.PlansDropdown, name: 'PlansDropdown', storeKey: 'plansList', label: 'label.plans', action: 'GET_PLANS_DROPDOWN' },
  { component: Components.RegionsDropdown, name: 'RegionsDropdown', storeKey: 'regions', label: 'label.select_region', action: 'GET_REGIONS_DROPDOWN' },
  { component: Components.RoadClassesDropdown, name: 'RoadClassesDropdown', storeKey: 'roadClasses', label: 'road_network.road_class', action: 'GET_ROADS_CLASSES_DROPDOWN' },
  { component: Components.RoadsDropdown, name: 'RoadsDropdown', storeKey: 'roads', label: 'label.select_road', action: 'GET_ROADS_DROPDOWN' },
  { component: Components.SectionsDropdown, name: 'SectionsDropdown', storeKey: 'roads', label: 'label.select_section', action: 'GET_SECTIONS_DROPDOWN' },
  { component: Components.TreatmentsDropdown, name: 'TreatmentsDropdown', storeKey: 'treatmentTypes', label: 'treatment.treatment_key', action: 'GET_TREATMENT_TYPE_DROPDOWN' },
  { component: Components.UnitsDropdown, name: 'UnitsDropdown', storeKey: 'plans', label: 'label.units', action: 'GET_UNITS_DROPDOWN' },

  { component: Components.RdbLookupDropdown, name: 'RdbLookupDropdown', label: 'label.select', action: 'LOAD_RDB_LOOKUP' },
];

describe.each(Dropdowns)('$name', ({ component, storeKey, label, action }) => {
  let wrapper;
  beforeEach(async () => {
    vi.clearAllMocks();

    wrapper = mount(component, { localVue, store: mockStore });
    if (component == Components.RdbLookupDropdown) {
      await wrapper.setProps({ lookupType: "maintenance_type" });
    };

    await wrapper.vm.$nextTick();  // wait for finishing `mounted`
    expect(wrapper.exists()).toBe(true);
  });

  it('renders label with default value when not provided', () => {
    const findLabel = wrapper.find('label')
    expect(findLabel.exists()).toBe(true);
    expect(findLabel.text()).toContain(label);
  });

  it('calls getList method and updates selectedValue on reloadData', async () => {
    const actionSpy = vi.spyOn(wrapper.vm, 'getList');
    await wrapper.setProps({ value: 2 });
    await wrapper.vm.reloadData(3);
    expect(actionSpy).toHaveBeenCalled();
    expect(wrapper.vm.selectedValue).toBe(2);
  });

  if (component == Components.RoadsDropdown) {
    it('renders provided items array', async () => {
      await wrapper.setProps({ items });
      const options = await wrapper.findAll('md-option')
      expect(options.length).toBe(3);
      expect(options.at(1).text()).toBe('Option 2');
    });
  }

  it('emits input event when selection changes', async () => {
    await wrapper.vm.onChange(2, 'Description');
    expect(wrapper.emitted().input).toBeTruthy();
    if (component == Components.RdbLookupDropdown) {
      expect(wrapper.emitted().input[0]).toEqual([2, 'Description', undefined]);
    } else {
      expect(wrapper.emitted().input[0]).toEqual([2, 'Description']);
    }
  });
});