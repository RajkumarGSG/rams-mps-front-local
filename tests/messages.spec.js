import { describe, it, expect, vi } from 'vitest';
import messagesMixin from '@/mixins/messagesMixin.js';
import Swal from 'sweetalert2';

vi.mock('sweetalert2');

function tr(key, params) {
  const stringifiedParams = params ? ` ${JSON.stringify(params)}` : '';
  return `${key}${stringifiedParams}`
}

describe('messagesMixin', () => {
  const mockInstance = {
    //$t: (msg) => msg,
    $t:(key, params) => tr(key, params),
    ...messagesMixin.methods
  };

  it('shows saved message with success icon', async () => {
    await mockInstance.savedMessage(null, 'Title', 'Car Name');
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      icon: 'success',
      title: 'Title',
      footer: null,
      text: 'messages.was_saved'
    }));
  });

  it('shows saved message with error icon', async () => {
    await mockInstance.savedMessage('Error occurred', 'Title', 'Car Name');
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      icon: 'error',
      title: 'Title',
      text: 'messages.was_not_saved',
      footer: 'Error occurred'
    }));
  });

  it('shows success message', () => {
    mockInstance.successMessage('Success Title', 'Details');
    expect(Swal.fire).toHaveBeenCalledWith('Success Title', 'Details', 'success');
  });

  it('shows error message', () => {
    vi.clearAllMocks();
    mockInstance.errorMessage('Something went wrong');
    expect(Swal.fire).toHaveBeenCalledWith('messages.error', 'Something went wrong', 'error');
  });

  it('shows deleted message', () => {
    mockInstance.deletedMessage('Car Name');
    expect(Swal.fire).toHaveBeenCalledWith('messages.deleted', 'messages.you_deleted', 'success');
  });

  it('shows approval message for approval', () => {
    mockInstance.approvedMessage(true, 'Project X');
    expect(Swal.fire).toHaveBeenCalledWith('label.approved', 'Project X', 'success');
  });

  it('shows approval message for revocation', () => {
    mockInstance.approvedMessage(false, 'Project X');
    expect(Swal.fire).toHaveBeenCalledWith('messages.revoked', 'Project X', 'success');
  });

  it('shows assigned/unassigned message', () => {
    mockInstance.assignedMessage(1, 5);
    expect(Swal.fire).toHaveBeenCalledWith('messages.assigned', 'messages.works_assigned', 'success');

    mockInstance.assignedMessage(-1, 3);
    expect(Swal.fire).toHaveBeenCalledWith('messages.unassigned', 'messages.works_unassigned', 'success');
  });

  it('shows generated list exists message', () => {
    mockInstance.generatedListExistsMessage();
    expect(Swal.fire).toHaveBeenCalledWith('messages.generated_hs_list_exists_title', 'messages.generated_hs_list_exists', 'warning');
  });

  it('shows approved list exists message', () => {
    mockInstance.approvedListExistsMessage();
    expect(Swal.fire).toHaveBeenCalledWith('messages.approved_hs_list_exists_title', 'messages.approved_hs_list_exists', 'warning');
  });

  it('shows confirmation dialog', async () => {
    await mockInstance.confirmation('Confirm Title', 'Are you sure?', true);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      icon: 'warning',
      title: 'Confirm Title',
      html: 'Are you sure?',
      showDenyButton: true,
      denyButtonText: 'buttons.no'
    }));
  });

  it('shows delete confirmation dialog', async () => {
    vi.clearAllMocks();
    await mockInstance.deleteConfirmation('Item X');
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      icon: 'warning',
      title: 'messages.are_you_sure',
      html: expect.stringContaining('messages.you_want_delete')
    }));
  });

  it('shows text input prompt', async () => {
    await mockInstance.textInput('Enter Name', 'Name');
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      input: 'text',
      title: 'Enter Name',
      inputPlaceholder: 'Name'
    }));
  });

  it('shows dropdown input prompt', async () => {
    await mockInstance.dropdownInput('Select Option', 'Choose:', { 1: 'Option 1', 2: 'Option 2' });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      input: 'select',
      title: 'Select Option',
      inputPlaceholder: 'Choose:',
      inputOptions: { 1: 'Option 1', 2: 'Option 2' }
    }));
  });

  it('shows doubled dropdown input prompt', async () => {
    await mockInstance.doubledDropdownInput('Select Two', 'First', [{ id: 1, description: 'One' }], 'Second', [{ id: 2, description: 'Two' }]);
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('shows doubled input prompt', async () => {
    await mockInstance.doubledInput('Enter Data', 'Dropdown', [{ id: 1, description: 'One' }], 'Text Field', '1', 'Default Value');
    expect(Swal.fire).toHaveBeenCalled();
  });
});