import Swal from 'sweetalert2';
import i18n from '@/i18n'

/**
 * Displays a saved message alert with a success or error icon, based on the presence of an error description.
 * @param {String} errDesc - Error description (if any).
 * @param {String} title - Title for the alert.
 * @param {String} name_ru - The primary name in Russian.
 * @param {String|null} name_en - The optional name in English. Defaults to null.
 */
export const savedMessage = async (errDesc, title, name_ru, name_en = null) => {
  const text = i18n.t(`messages.was_${errDesc ? 'not_' : ''}saved`, { name_ru, name_en: name_en || name_ru })
  const alert = {
    icon: errDesc ? 'error' : 'success',
    title,
    text,
    footer: errDesc,
  };
  await Swal.fire(alert);
}

/**
 * Shows a success message.
 * @param {String} title - Title of the alert.
 * @param {String} details - Details of the alert.
 */
export const successMessage = async (title, details) => {
  Swal.fire(title, details, 'success');
}

/**
 * Shows a message indicating an item has been deleted.
 * @param {String} details - The details or name of the deleted item.
 */
export const deletedMessage = async (details) => {
  Swal.fire(i18n.t('messages.deleted'), i18n.t('messages.you_deleted', { name: details }), 'success');
}

/**
 * Shows an error message.
 * @param {String} err - The error message to display.
 */
export const errorMessage = async (err) => {
  Swal.fire(i18n.t('errors.title'), err, 'error');
}

/**
 * Shows an approval status message (approved/revoked).
 * @param {Boolean} status - True for approved, false for revoked.
 * @param {String} name - Name associated with the approval status.
 */
export const approvedMessage = async (status, name) => {
  Swal.fire(status ? i18n.t('label.approved') : i18n.t('messages.revoked'), name, 'success');
}

/**
 * Shows a message indicating assignment or unassignment status.
 * @param {Number} status - Positive for assigned, negative for unassigned.
 * @param {Number} count - Number of works affected.
 */
export const assignedMessage = async (status, count) => {
  const key = `${status < 0 ? 'un' : ''}assigned`;
  Swal.fire(i18n.t(`messages.${key}`), i18n.t(`messages.works_${key}`, { count: count }), 'success');
}

/**
 * Shows a warning message that a generated list already exists.
 */
export const generatedListExistsMessage = async () => {
  Swal.fire(i18n.t('messages.generated_hs_list_exists_title'), i18n.t('messages.generated_hs_list_exists'), 'warning');
}

/**
 * Shows a warning message that an approved list already exists.
 */
export const approvedListExistsMessage = async () => {
  Swal.fire(i18n.t('messages.approved_hs_list_exists_title'), i18n.t('messages.approved_hs_list_exists'), 'warning');
}

/**
* Displays a confirmation prompt with custom title and details.
* @param {String} title - Title for the confirmation alert.
* @param {String} details - HTML-formatted details for the alert.
* @returns {Promise} - Returns a promise resolving to the user's choice.
*/
export const confirmation = async (title, details, showDenyButton = false) => {
  const alert = {
    icon: 'warning',
    title,
    html: details,
    showCancelButton: true,
    confirmButtonText: i18n.t('buttons.yes'),
    cancelButtonText: i18n.t('buttons.cancel'),
    showDenyButton,
    denyButtonText: i18n.t('buttons.no'),
    allowEscapeKey: false,
  };
  return await Swal.fire(alert);
}

/**
 * Displays a delete confirmation prompt with custom details.
 * @param {String} details - Details or name of the item to be deleted.
 * @returns {Promise} - Returns a promise resolving to the user's choice.
 */
export const deleteConfirmation = async (details) => {
  const html = `${i18n.t('messages.you_want_delete', { name: details })}<br><br>
                ${i18n.t('messages.the_operation_cannot_be_canceled')}`
  const alert = {
    icon: 'warning',
    title: i18n.t('messages.are_you_sure'),
    html,
    showCancelButton: true,
    confirmButtonText: i18n.t('messages.yes_delete'),
    cancelButtonText: i18n.t('buttons.cancel'),
  };
  return await Swal.fire(alert);
}

/**
 * Displays a prompt with a text input field.
 * @param {String} title - Title for the prompt.
 * @param {String} label - Placeholder for the input field.
 * @param {String} details - Additional information for the prompt (optional).
 * @returns {Promise} - Returns a promise resolving to the input value.
 */
export const textInput = async (title, label, details = '') => {
  const alert = {
    icon: !details ? null : 'warning',
    title,
    input: "text",
    html: details,
    inputPlaceholder: label,
    showCancelButton: true,
    cancelButtonText: i18n.t('buttons.cancel'),
    allowOutsideClick: false,
  };
  return await Swal.fire(alert);
}

/**
 * Displays a prompt with a dropdown input.
 * @param {String} title - Title for the prompt.
 * @param {String} label - Placeholder for the input field.
 * @param {Object} inputOptions - Dropdown options.
 * @returns {Promise} - Returns a promise resolving to the selected option.
 */
export const dropdownInput = async (title, label, inputOptions) => {
  const alert = {
    title,
    input: "select",
    inputPlaceholder: label,
    inputOptions: inputOptions,
    showCancelButton: true,
    cancelButtonText: i18n.t('buttons.cancel'),
    allowOutsideClick: false,
  };
  return await Swal.fire(alert);
}

/**
* Displays a prompt with two dropdown inputs.
* @param {String} title - Title for the prompt.
* @param {String} label1 - Placeholder for the input field 1.
* @param {Object} inputOptions1 - Dropdown options for input 1.
* @param {String} label2 - Placeholder for the input field 2.
* @param {Object} inputOptions2 - Dropdown options for input 2.
* @returns {Promise} - Returns a promise resolving to the selected option.
*/
export const doubledDropdownInput = async (title, label1, inputOptions1, label2, inputOptions2) => {
  // Prepare html with 2 dropdown fields
  let html = `<select id="input1" class="swal2-select" name="input1" style="display: flex;">
              <option value="" disabled="" selected>${label1}</option>`
  html += inputOptions1.map(el => `<option value="${el.id}">${el.description}</option>`).join('');
  html += `</select>
          <select id="input2" class="swal2-select" name="input2" style="display: flex;">
          <option value="" disabled selected>${label2}</option>`;
  html += inputOptions2.map(el => `<option value="${el.id}">${el.description}</option>`).join('');
  html += `</select>`;

  const validationMessage = i18n.t('messages.fill_both_fields');
  let inpValue1, inpValue2;
  const alert = {
    title,
    html,
    showCancelButton: true,
    cancelButtonText: i18n.t('buttons.cancel'),
    allowOutsideClick: false,
    preConfirm: () => {
      return new Promise(function (resolve) {
        // Validate input
        inpValue1 = document.getElementById('input1').value
        inpValue2 = document.getElementById('input2').value
        if (!inpValue1 || !inpValue2) {
          Swal.showValidationMessage(validationMessage) // Show error when validation fails.
        }
        resolve([inpValue1, inpValue2])
      })
    }
  };
  return await Swal.fire(alert);
}

/**
* Displays a prompt with one dropdown and one text inputs.
* @param {String} title - Title for the prompt.
* @param {String} label1 - Placeholder for the input field 1.
* @param {Object} inputOptions1 - Dropdown options for input 1.
* @param {String} label2 - Placeholder for the input field 2.
* @param {Object} inputOptions2 - Dropdown options for input 2.
* @returns {Promise} - Returns a promise resolving to the selected option.
*/
export const doubledInput = async (title, label1, inputOptions1, label2, value1 = '', value2 = '') => {
  // Prepare html with 2 dropdown fields
  let html = `<select id="input1" class="swal2-select" name="input1" style="display: flex;">
                  <option value="" disabled="" selected>${label1}</option>`
  html += inputOptions1
    .map(el => `<option value="${el.id}" ${el.id === value1 ? 'selected' : ''}>${el.description}</option>`)
    .join('');
  html += `<BaseDropdown :label="$t('select type')" v-model="selectedMethod" :items="inputOptions1" />`

  html += `</select>
        <input id="input2" class="swal2-input" type="text" placeholder="${label2}" value="${value2}" 
          style="display:block !important;">`

  const validationMessage = i18n.t('messages.fill_both_fields');
  let inpValue1, inpValue2;
  const alert = {
    title,
    html,
    showCancelButton: true,
    cancelButtonText: i18n.t('buttons.cancel'),
    allowOutsideClick: false,
    preConfirm: () => {
      return new Promise(function (resolve) {
        // Validate input
        inpValue1 = document.getElementById('input1').value
        inpValue2 = document.getElementById('input2').value
        if (!inpValue1 || !inpValue2) {
          Swal.showValidationMessage(validationMessage) // Show error when validation fails.
        }
        resolve([inpValue1, inpValue2])
      })
    }
  };
  return await Swal.fire(alert);
}

export default {
  methods: {
    savedMessage,
    successMessage,
    deletedMessage,
    errorMessage,
    approvedMessage,
    assignedMessage,
    generatedListExistsMessage,
    approvedListExistsMessage,
    confirmation,
    deleteConfirmation,
    textInput,
    dropdownInput,
    doubledDropdownInput,
    doubledInput
  }
};