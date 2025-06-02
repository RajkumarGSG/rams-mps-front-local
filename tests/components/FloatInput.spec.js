// File: FloatInput.spec.js
// Automated tests description for the FloatInput component testing used with Vitest
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import FloatInput from '@/pages/Components/FloatInput.vue';

describe('FloatInput.vue', () => {
  let wrapper;
  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(FloatInput);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders with default props', () => {
    expect(wrapper.find('label').exists()).toBe(true);
    const input = wrapper.find('md-input')
    expect(input.exists()).toBe(true);
    expect(input.attributes('value')).toBe('0');
  });

  it('renders with a custom label', async () => {
    const label = 'Enter a number'
    await wrapper.setProps({ label });
    expect(wrapper.find('label').text()).toContain(label);
  });

  it('emits input event with correct value', async () => {
    await wrapper.vm.updateValue(12.5);
    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('input')[0]).toEqual([12.5]);
  });

  it('validates input to allow only numbers and a single decimal separator', async () => {
    /* TODO: разобраться
    const input = wrapper.findComponent('md-input')
    console.log('input', input.html())
    expect(input.exists()).toBe(true);
    await input.trigger('keypress');
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('input')[0]).toEqual([12]);
    */

    await wrapper.vm.updateValue('12..34');
    //expect(wrapper.emitted('input')[0]).toEqual([12.34]);
    expect(wrapper.emitted('input')[0]).toEqual([12]);
    /*
    await wrapper.setProps({ value: '12..34' });
    const event = { keyCode: 13, target: { value: 1 }, preventDefault: vi.fn() }
    await wrapper.vm.validateInput(event);
    expect(wrapper.vm.value).toBe('12.34');
    */
  });

  it('replaces comma with dot', async () => {
    await wrapper.vm.updateValue('12,5');
    expect(wrapper.emitted('input')[0]).toEqual([12.5]);
  });

  it('does not allow more than one dot or comma', async () => {
    await wrapper.vm.updateValue('12.3.4');
    expect(wrapper.emitted('input')[0]).toEqual([12.3]);
    //expect(wrapper.emitted('input')[0]).toEqual([12.34]);
  });

  it('enforces min value', async () => {
    await wrapper.setProps({ min: 5 });
    await wrapper.vm.updateValue(3);
    expect(wrapper.emitted('input')[0]).toEqual([5]);
  });

  it('enforces max value', async () => {
    await wrapper.setProps({ max: 10 });
    await wrapper.vm.updateValue(15);
    expect(wrapper.emitted('input')[0]).toEqual([10]);
  });

  it('does not allow input when disabled', async () => {
    await wrapper.setProps({ disabled: true });
    const findInput = await wrapper.find('md-input');
    expect(findInput.exists()).toBe(true);
    expect(findInput.attributes('disabled')).toBe('true');
  });

  it('handles required prop', async () => {
    await wrapper.setProps({ required: true });
    const findInput = await wrapper.find('md-input');
    expect(findInput.exists()).toBe(true);
    expect(findInput.attributes('required')).toBe('true');
  });
});