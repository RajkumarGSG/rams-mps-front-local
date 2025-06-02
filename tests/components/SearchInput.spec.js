import Vuex from 'vuex';
import VueMaterial from 'vue-material';
//import 'vue-material/dist/vue-material.min.css';
import { mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import SearchInput from '@/pages/Components/SearchInput.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueMaterial);

describe('SearchInput.vue', () => {
  let wrapper;
  beforeEach(async () => {
    vi.clearAllMocks();
    wrapper = mount(SearchInput, {
      localVue,
      //attachTo: document.body, // Иногда нужно явно монтировать в DOM!
      stubs: {
        'md-input': false // явно не заглушать компонент md-input!
      }
    });
    await wrapper.vm.$nextTick()
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('binds input value correctly', async () => {
    await wrapper.setProps({ value: 'test' });
    const input = wrapper.find('input');
    expect(input.element.value).toBe('test');
  });

  it('emits input event when typing', async () => {
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);

    input.element.value = 'new value';
    await input.trigger('input');

    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('input')[0]).toEqual(['new value']);
  });
});