import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TableActions from "@/pages/Components/TableActions.vue"

const factory = (propsData = {}) => {
  return shallowMount(TableActions, {
    propsData,
    global: {
      mocks: {
        $t: (msg) => msg, // Mock localization
      },
    },
  });
};

describe('TableActions.vue', () => {
  it('renders with default props', () => {
    const wrapper = factory();
    expect(wrapper.exists()).toBe(true);
  });

  it('should show EditButton if btnEditAllowed = true', () => {
    const wrapper = factory({ btnEditAllowed: true });
    expect(wrapper.find('.md-default').exists()).toBe(true);
  });

  it('should not show EditButton if btnEditAllowed = false', () => {
    const wrapper = factory({ btnEditAllowed: false });
    expect(wrapper.find('.md-default').exists()).toBe(false);
  });

  it('should show DeleteButton if btnDeleteAllowed = true', () => {
    const wrapper = factory({ btnDeleteAllowed: true });
    expect(wrapper.find('.md-danger').exists()).toBe(true);
  });

  it('should not show EditButton if btnDeleteAllowed = false', () => {
    const wrapper = factory({ btnDeleteAllowed: false });
    expect(wrapper.find('.md-danger').exists()).toBe(false);
  });

  it('emits edit event when EditButton clicked', async () => {
    const wrapper = factory({ btnEditAllowed: true });
    await wrapper.find('.md-default').trigger('click');
    expect(wrapper.emitted('edit')).toBeTruthy();
  });

  it('emits delete event when DeleteButton clicked', async () => {
    const wrapper = factory({ btnDeleteAllowed: true });
    await wrapper.find('.md-danger').trigger('click');
    expect(wrapper.emitted('delete')).toBeTruthy();
  });
});