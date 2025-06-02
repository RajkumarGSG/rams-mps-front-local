import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Pagination from '@/pages/Components/Pagination.vue';

const factory = (propsData = {}) => {
  return mount(Pagination, {
    propsData,
    global: {
      mocks: {
        $t: (msg, params) => msg.replace(/{\w+}/g, match => params[match.slice(1, -1)] || match), // Mock localization
      },
    },
  });
};

describe('Pagination.vue', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
    
  it('renders with default props', () => {
    const wrapper = factory();
    expect(wrapper.exists()).toBe(true);
  });

  it('should display additional information', () => {
    const wrapper = factory({ additionalInfo: 'Test info' });
    expect(wrapper.text()).toContain('Test info');
  });

  it('should display pagination text correctly', () => {
    const wrapper = factory({ from: 10, to: 20, total: 100 });
    expect(wrapper.text()).toContain('label.showing_from_to_of_entries');
  });

  it('should update v-model for current page', async () => {
    const wrapper = factory({ value: { currentPage: 1, from: 0, to: 10 }, total: 100 });
    await wrapper.setData({ pages: { currentPage: 2, from: 10, to: 20 } });
    expect(wrapper.vm.pages.currentPage).toBe(2);
  });

  it('emits pageChanged event when currentPage changed', async () => {
    const wrapper = factory({ value: { currentPage: 1, from: 0, to: 10 }, total: 100 });
    await wrapper.setData({ pages: { currentPage: 2, from: 10, to: 20 } });
    expect(wrapper.emitted().pageChanged).toBeTruthy();
  });
  /*
    // TODO: finish these tests after finishing the component
    it('should update itemsPerPage when new value selected', async () => {
      const wrapper = factory({ perPageOptions: [5, 10, 25, 50] });
      const select = wrapper.find('md-select');
      
      // Эмулируем выбор нового значения
      await wrapper.vm.$emit('input', 25);
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.itemsPerPage).toBe(25);
    });
  
    it('emits pageChanged event when itemsPerPage changed', async () => {
      const wrapper = factory({ perPageOptions: [5, 10, 25, 50] });
      const select = wrapper.find('md-select');
      
      await select.vm.$emit('input', 25);
      await wrapper.vm.$nextTick();
      
      expect(wrapper.emitted('pageChanged')).toBeTruthy();
    });
    */
});
