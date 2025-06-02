//permissionsMixin.js

import { mapState, mapGetters, mapActions } from 'vuex'

export const getSize = (layoutItemSize) => {
  const layoutItemClass = layoutItemSize ? `md-layout-item md-size-${layoutItemSize}` : '';
  return layoutItemClass;
};

export default {
  methods: {
    ...mapActions({
      loadUserProfile: 'GET_MY_PROFILE',
      loadPermissions: 'ReferenceData/GET_USER_PERMISSIONS'
    }),

    async checkIfScreenAllowed() {
      //console.log('profile loaded', this.profileLoaded)
      if (!this.profileLoaded) {
        //console.log('loading profile')
        await this.loadUserProfile();
      }

      //console.log('permissions loaded', this.userPermissionsLoaded)
      if (!this.userPermissionsLoaded) {
        //console.log('loading permissions for', this.me.id)
        await this.loadPermissions(this.me.id);
      }
      //console.log('isScreenAllowed for', this.formName, this.isScreenAllowed(this.formName))
      return this.isScreenAllowed(this.formName);
    },

    isBtnAllowed(buttonName) {
      return this.isAllowed(this.formName, 'Button', buttonName);
    },

    isDropdownAllowed(dropdownName) {
      return this.isAllowed(this.formName, 'Dropdown', dropdownName);
    },

    getSize,

    getClass(componentName, layoutItemSize = undefined) {
      const errorClass = this.errors.has(componentName) ? 'md-error' : 'md-valid';
      return `${getSize(layoutItemSize)} ${errorClass}`
    },
  },

  computed: {
    ...mapState({
      me: (state) => state.Login.me,
    }),

    ...mapGetters(['profileLoaded']),
    ...mapGetters('ReferenceData', ['userPermissionsLoaded', 'isAllowed', 'isScreenAllowed']),

    saveBtnDisabled() {
      return this.errors.items.length > 0
    }
  }
}