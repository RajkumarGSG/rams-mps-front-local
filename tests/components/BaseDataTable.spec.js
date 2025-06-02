// File: BaseDataTable.spec.js
// Automated tests description for the BaseDataTable component testing used with Vitest
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import BaseDataTable from '@/pages/Components/BaseDataTable.vue';

const factory = (propsData = {}, slots = {}) => {
  return mount(BaseDataTable, {
    propsData,
    slots,
    global: {
      mocks: {
        //$t: (msg) => msg, // Mock localization
      },
    },
  });
};

vi.clearAllMocks();

describe('BaseDataTable.vue', () => {
  it('renders with default props', () => {
    const wrapper = factory();
    expect(wrapper.exists()).toBe(true);
  });

  it('should show spinner if loading = true', () => {
    const wrapper = factory({ loading: true });
    expect(wrapper.find('md-progress-spinner').exists()).toBe(true);
  });

  it('should not show spinner if loading = false', () => {
    const wrapper = factory({ loading: false });
    expect(wrapper.find('md-progress-spinner').exists()).toBe(false);
  });

  it('should show AddButton if btnAddAllowed = true', () => {
    const wrapper = factory({ btnAddAllowed: true });
    const addButton = wrapper.findAll('.md-success').filter(btn => btn.text().includes('buttons.add'));
    //console.log('wrapper', wrapper.html())
    expect(addButton.exists()).toBe(true);
  });

  it('should not show AddButton if btnAddAllowed = false', () => {
    const wrapper = factory({ btnAddAllowed: false });
    const addButton = wrapper.findAll('.md-success').filter(btn => btn.text().includes('buttons.add'));
    expect(addButton.exists()).toBe(false);
  });

  it('should emit add-item event by clicking AddButton', async () => {
    const wrapper = factory({ btnAddAllowed: true });
    const addButton = wrapper.findAll('.md-success').filter(btn => btn.text().includes('buttons.add'));
    await addButton.trigger('click');
    expect(wrapper.emitted('add-item')).toBeTruthy();
  });

  it('should show CloseButton if btnAddAllowed = true', () => {
    const wrapper = factory({ showCloseBtn: true });
    const closeButton = wrapper.findAll('.md-accent').filter(btn => btn.text().includes('buttons.close'));
    expect(closeButton.exists()).toBe(true);
  });

  it('should not show CloseButton if btnAddAllowed = false', () => {
    const wrapper = factory({ showCloseBtn: false });
    const addButton = wrapper.findAll('.md-accent').filter(btn => btn.text().includes('buttons.close'));
    expect(addButton.exists()).toBe(false);
  });

  it('should call onClose method by clicking CloseButton', async () => {
    const wrapper = factory({ showCloseBtn: true });
    wrapper.vm.onClose = vi.fn();
    const actionSpy = vi.spyOn(wrapper.vm, 'onClose');
    const closeButton = wrapper.findAll('.md-accent').filter(btn => btn.text().includes('buttons.close'));
    await closeButton.trigger('click');
    expect(actionSpy).toHaveBeenCalled();
  });

  it('should display pagination text correctly', () => {
    const wrapper = factory({ from: 10, to: 20, total: 100 });
    expect(wrapper.text()).toContain('label.showing_from_to_of_entries {"from":11,"to":20,"total":100');
  });

  it('should update the currentPage value correctly', async () => {
    const wrapper = factory({ from: 5, to: 10, total: 20, pagination: { currentPage: 2 } });
    let link = wrapper.find('.page-link');
    await link.trigger('click');
    expect(wrapper.vm.pagination.currentPage).toBe(1);

    link = wrapper.findAll('.page-link')
    await link.at(3).trigger('click');    // button Next in pagination
    expect(wrapper.vm.pagination.currentPage).toBe(2);
  });

  it('should update the perPage value correctly', async () => {
    const wrapper = factory({ pagination: { perPage: 10, perPageOptions: [10, 20, 50], currentPage: 1 } });
    wrapper.vm.pagination.perPage = 20;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.pagination.perPage).toBe(20);
  });
});
