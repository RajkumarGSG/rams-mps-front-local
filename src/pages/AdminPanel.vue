<!--
File: AdminPanel.vue
Description: shows admin panel with links to open screens for referenca data (Units, Treatments, Rates, etc).
-->
<template >
  <div v-if="eligible" class="md-layout">
    <md-card v-for="card in cards" :key="card.title" class="md-layout-item">
      <md-card-header class="md-card-header-icon md-card-header-green">
        <div class="card-icon">
          <md-icon>{{ card.icon }}</md-icon>
        </div>
        <h4 class="title">{{ $t(card.title) }}</h4>
      </md-card-header>

      <md-card-content>
        <div v-for="link in card.links" :key="link.name" class="report-link">
          <a href="#" @click.stop.prevent="showScreen(link.url)">
            {{ $t(link.name) }}{{ link.suffix }}
          </a>
        </div>
      </md-card-content>
    </md-card>
  </div>
</template>
<script>
  import permissions from "@/mixins/permissionsMixin"
  import { onClose } from '@/mixins/onCloseMixin'

  export default {
    name: 'admin-panel',
    mixins: [permissions],

    data() {
      return {
        formName: 'AdminPanel',
        eligible: false,

        cards: [
          {
            icon: 'inventory',
            title: 'route.inventory',
            links: [
              { url: '/inventory_data/regions', name: 'route.list_of_regions' },
              { url: '/inventory_data/districts', name: 'route.list_of_districts' },
              { url: '/inventory_data/deu', name: 'route.list_of_deus' },
              { url: '/inventory_data/roads', name: 'route.list_of_roads' },
              { url: '/inventory_data/sections', name: 'route.list_of_sections' },
              { url: '/inventory_data/traffic', name: 'route.list_of_traffic_sites', },
            ]
          },
          {
            icon: 'admin_panel_settings',
            title: 'route.treatments',
            links: [
              { url: '/settings/types', name: 'route.treatment_types' },
              { url: '/settings/rates', name: 'route.treatment_rates' },
              { url: '/settings/treatment_matrix', name: 'route.treatment_matrix' },
              //Previously removed according to the issue #81 as indicated in Meyyappan's issues list
              { url: '/settings/condition_index_criteria', name: 'route.condition_index_criteria' }
            ]
          },
          {
            icon: 'settings',
            title: 'route.reference_data',
            links: [
              { url: '/settings/units', name: 'route.units' },
              { url: '/settings/work_categories', name: 'route.work_categories' },
              { url: '/settings/translate', name: 'route.translate' },
            ]
          },
          {
            icon: 'group',
            title: 'route.user_management',
            links: [
              { url: '/settings/users', name: 'route.users' },
              { url: '/settings/groups', name: 'route.groups' },
              { url: '/settings/roles', name: 'route.roles' },
              { url: '/settings/permissions', name: 'route.permissions' },
              { url: '/settings/user_roles', name: 'route.user_roles' },
              //{ url: '/settings/api_path', name: 'route.api_path' },
            ]
          },
          /*
          //Removed according to the issues #777 and 78 as indicated in Meyyappan's issues list
          {
          icon: 'event_note',
          title: 'route.inventory',
          links: [
            { url: '/settings/inventory_types', name: 'route.inventory_types' },
            { url: '/settings/inventory_events', name: 'route.inventory_events' }
          ]
        }
          */
        ]
      };
    },

    async beforeMount() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        //return
      };
    },

    methods: {
      onClose,

      showScreen(url) {
        if (url) this.$router.push(url)
      },
    }
  }
</script>
<style>
.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.report-link {
  margin-bottom: 15px;
}

.report-link a {
  text-decoration: none;
  color: #007bff;
}

.report-link a:hover {
  text-decoration: underline;
}
</style>