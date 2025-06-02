// Modal.spec.js
import { mount, createLocalVue } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest';
import Vuex from 'vuex'
import Modal from '@/pages/Components/Modal.vue'
import { confirmation } from '@/mixins/messagesMixin'

vi.mock('@/mixins/messagesMixin', async () => {
  return {
    confirmation: vi.fn().mockResolvedValue({ isConfirmed: true })
  }
});

const localVue = createLocalVue()
localVue.use(Vuex)

const mockStore = new Vuex.Store({
  modules: {
    ReferenceData: {
      namespaced: true,
      getters: {
        isAllowed: () => () => true
      }
    }
  }
});

const factory = (propsData) => mount(Modal, {
  localVue,
  store: mockStore,
  propsData,
   mocks: {
    $t: (msg) => msg,
  }, 
});

describe('Modal.vue', () => {
  it('renders the title correctly', () => {
    const wrapper = factory({ title: 'Test Title' })
    expect(wrapper.find('.modal-title').text()).toBe('Test Title')
  });

  it('emits close event when Cancel button is clicked', async () => {
    const wrapper = factory({})
    const closeBtn = wrapper.findAll('.md-accent').filter(btn => btn.text().includes('buttons.cancel'));
    expect(closeBtn.exists()).toBe(true);

    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  });

  it('calls confirmation dialog if has unsaved changes', async () => {
    const wrapper = factory({ hasUnsavedChanges: true });

    const closeBtn = wrapper.findAll('.md-accent').filter(btn => btn.text().includes('buttons.cancel'));
    expect(closeBtn.exists()).toBe(true);

    await closeBtn.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(confirmation).toHaveBeenCalled();
    expect(confirmation).toHaveBeenCalledWith(
      'messages.unsaved_changes_title',
      'messages.unsaved_changes'
    );
  });

  it('emits save event when Save button is clicked', async () => {
    const wrapper = factory({})
    const saveBtn = wrapper.findAll('.md-success').filter(btn => btn.text().includes('buttons.save')).at(0);
    expect(saveBtn.exists()).toBe(true); // button exists

    // Doesn't work if we defined native click, e.g. @click.native.prevent="onClick"
    // await saveBtn.trigger('click')
    // So we call directly the event handler
    await wrapper.vm.saveClicked();
    expect(wrapper.emitted('save')).toBeTruthy()
  });

  it('disables save button when there are errors', () => {
    const wrapper = factory({ errCount: 2 })
    const saveBtn = wrapper.find('.md-success')
    expect(saveBtn.attributes('disabled')).toBe('true')
  });

  it('shows error message with correct error count', () => {
    const wrapper = factory({ errCount: 3 })
    const errorMsg = wrapper.find('.md-error')
    expect(errorMsg.exists()).toBe(true)
    expect(errorMsg.text()).toContain('messages.errors_count')
  })
});