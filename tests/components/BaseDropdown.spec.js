import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import BaseDropdown from '@/pages/Components/Dropdowns/BaseDropdown.vue';

describe('BaseDropdown.vue with no props', () => {
  const wrapper = mount(BaseDropdown, {propsData: {}});
  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders label items', () => {
    expect(wrapper.find('label').exists());
  });

  it('renders zero-length items', () => {
    expect(wrapper.find('md-select').exists()).toBe(true);
    expect(wrapper.findAll('md-option').length).toBe(0);
  });

  it('renders no-options slot when items list is empty', () => {
    expect(wrapper.find('.no-options').exists()).toBe(true);
  });

  it('sets initial selected value as null', async () => {
    const value = wrapper.find('md-select').element.value
    expect(value === '' || value === undefined).toBe(true);
  });
});

const items = [
  { id: 1, description: 'Option 1' },
  { id: 2, description: 'Option 2' },
  { id: 3, description: 'Option 3' }
];

describe('BaseDropdown.vue', () => {
  let wrapper;
  beforeEach(async () => {
    vi.clearAllMocks();
    wrapper = mount(BaseDropdown, {
      propsData: {
        label: "Test Label",
        value: 1,
        items
      },
    });
    await wrapper.vm.$nextTick()
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    expect(wrapper.find('md-select').exists()).toBe(true);
    const options = wrapper.findAll('md-option');
    expect(options.length).toBe(items.length);
  });

  it('renders all options correctly', async () => {
    const options = wrapper.findAll('md-option');
    const optionTexts = options.wrappers.map(o => o.element.textContent.trim());
    expect(optionTexts).toEqual(["Option 1", "Option 2", "Option 3"]);
  });

  it('renders label as provided', async () => {
    expect(wrapper.find('label').text()).toContain('Test Label');
  });

  it('sets initial selected value from prop', async () => {
    expect(wrapper.vm.selectedValue).toBe(1);
  });

  it('updates the value if `value` is changed externally', async () => {
    await wrapper.setProps({ value: 2 });
    expect(wrapper.vm.selectedValue).toBe(2);
  });

  it('renders loading slot when list is not loaded', async () => {
    await wrapper.setData({ listLoaded: false });
    expect(wrapper.find('.loading').exists()).toBe(true);
  });

  it('emits input event', async () => {
    await wrapper.setProps({ value: 3 });
    await wrapper.vm.onChange(3);
    expect(wrapper.emitted().input).toBeTruthy();
    expect(wrapper.emitted().input[0][0]).toBe(3);
  });

  it('disables select when disabled prop is true', async () => {
    await wrapper.setProps({ disabled: true });
    const selectWrapper = await wrapper.find('md-select');
    expect(selectWrapper.exists()).toBe(true); // Проверяем, что он найден
    expect(selectWrapper.attributes('disabled')).toBe('true'); // Проверяем атрибут
  });

  it('emulates `loadItems` method call', async () => {
    const loadItemsSpy = vi.spyOn(wrapper.vm, "loadItems");
    await wrapper.vm.loadItems();
    expect(loadItemsSpy).toHaveBeenCalled();
  });

  it('allows multiple selection when multiple prop is true', async () => {
    await wrapper.setProps({ multiple: true, value: [1, 3] });
    const selectWrapper = await wrapper.find('md-select');
    expect(selectWrapper.exists()).toBe(true); // Проверяем, что он найден
    expect(selectWrapper.attributes('multiple')).toBe('true'); // Проверяем атрибут
    expect(wrapper.vm.selectedValue).toEqual([1, 3]);
  });

  it('emits input with an array when multiple selection is enabled', async () => {
    await wrapper.setProps({ multiple: true, value: [1, 3] });
    await wrapper.vm.onChange([1, 3]);
    expect(wrapper.emitted().input).toBeTruthy();
    expect(wrapper.emitted().input[0][0]).toEqual([1, 3]);
  });
});