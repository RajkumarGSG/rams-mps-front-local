<!--
File: TrafficSiteEditForm.vue
Description: from for adding/editing one traffic site info.
-->
<template>
  <modal v-if="eligible" :title="screenTitle" :form="formName" :errCount="errors.count()"
    :hasUnsavedChanges="hasUnsavedChanges" @close="$emit('close')" @save="validate">

    <template slot='body'>
      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-100">
          <RegionsDropdown v-model="selectedRegion" :isRequired="true" />
          <RoadsDropdown :class="getClass('fk_road')" v-model="fk_road" data-vv-name="fk_road"
            v-validate="modelValidations.fk_road" :isRequired="true" :regionId="selectedRegion" />
          <SectionsDropdown :class="getClass('fk_section')" v-model="fk_section" data-vv-name="fk_section"
            v-validate="modelValidations.fk_section" :regionId="selectedRegion" :roadId="fk_road" />
        </div>
      </div>

      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-50">
          <md-field :class="getClass('traffic_site_desc')">
            <label for="traffic_site_desc">{{ $t('stdCols.description') }}</label>
            <md-input id="traffic_site_desc" v-model="traffic_site_desc" type="text" data-vv-name="traffic_site_desc"
              required v-validate="modelValidations.traffic_site_desc" />
          </md-field>
        </div>
        <div class="md-layout-item md-small-size-100 md-size-50">
          <RdbLookupDropdown :class="getClass('fk_aadt_coef_set')" :label="$t('traffic.aadt_coef_set')"
            v-model="fk_aadt_coef_set" :lookupType="'aadt_coef_set'" />
        </div>
      </div>

      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-50">
          <md-field :class="getClass('start_distance')">
            <label for="start_distance">{{ $t('road_network.start_distance') }}</label>
            <md-input id="start_distance" v-model="start_distance" type="text" data-vv-name="start_distance" required
              v-validate="modelValidations.start_distance" />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100 md-size-50">
          <md-field :class="getClass('end_distance')">
            <label for="end_distance">{{ $t('road_network.end_distance') }}</label>
            <md-input id="end_distance" v-model="end_distance" type="text" data-vv-name="end_distance" required
              v-validate="modelValidations.end_distance" />
          </md-field>
        </div>
      </div>

      <div class="md-layout">
        <div class="md-layout-item md-small-size-100 md-size-50">
          <md-field :class="getClass('surveyed_distance')">
            <label for="surveyed_distance">{{ $t('traffic.surveyed_distance') }}</label>
            <md-input id="surveyed_distance" v-model="surveyed_distance" type="text" data-vv-name="surveyed_distance"
              required v-validate="modelValidations.surveyed_distance" />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100 md-size-50">
          <md-field :class="getClass('sdr_distance')">
            <label for="sdr_distance">{{ $t('traffic.sdr_distance') }}</label>
            <md-input id="sdr_distance" v-model="sdr_distance" type="number" data-vv-name="sdr_distance"
              v-validate="modelValidations.sdr_distance" />
          </md-field>
        </div>
      </div>
    </template>
  </modal>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { Modal, RegionsDropdown, RoadsDropdown, SectionsDropdown, RdbLookupDropdown } from '@/pages/Components'
import { savedMessage } from '@/mixins/messagesMixin'
import permissions from "@/mixins/permissionsMixin"

export default {
  name: 'trafficsite-edit-form',
  mixins: [permissions],

  data() {
    return {
      formName: 'TrafficSites',
      eligible: false,

      selectedRegion: null,
      fk_road: null,
      fk_section: null,
      traffic_site_desc: null,
      start_distance: null,
      end_distance: null,
      fk_aadt_coef_set: null,
      ts_guid: null,
      fk_vclass_preset: null,
      surveyed_distance: null,
      sdr_distance: null,
      geom: null,
      sdr_road: null,

      initialFormState: null,
      modelValidations: {
        fk_road: { required: true, numeric: true, min_value: 1 },
        fk_section: { required: true, numeric: true, min_value: 1 },
        traffic_site_desc: { required: true, min: 3 },
        fk_aadt_coef_set: { required: true, numeric: true, min_value: 1 },
        start_distance: { required: true, numeric: true },
        end_distance: { required: true, numeric: true },
        surveyed_distance: { required: true, numeric: true },
        sdr_distance: { required: false, numeric: true },
      },
    }
  },

  props: {
    itemId: null
  },

  components: {
    Modal,
    RegionsDropdown,
    RoadsDropdown,
    SectionsDropdown,
    RdbLookupDropdown
  },

  async mounted() {
    // Check if we are eligible to view the form
    this.eligible = await this.checkIfScreenAllowed();
    if (!this.eligible) {
      this.$emit('close');
      return;
    };

    if (this.itemId) { // Load data on existing Traffic Site
      const theSite = await this.loadTrafficSite(this.itemId);
      try {
        const res = await this.getRegionAndRoad(theSite.fk_section);
        this.selectedRegion = res?.fk_region;
        this.fk_road = theSite.fk_road || res?.fk_road;
      } catch (err) {
        this.selectedRegion = 0;
      };


      this.fk_section = theSite.fk_section;
      this.traffic_site_desc = theSite.traffic_site_desc;
      this.start_distance = theSite.start_distance;
      this.end_distance = theSite.end_distance;
      this.fk_aadt_coef_set = theSite.fk_aadt_coef_set;
      this.ts_guid = theSite.ts_guid;
      this.fk_vclass_preset = theSite.fk_vclass_preset;
      this.surveyed_distance = theSite.surveyed_distance;
      this.sdr_distance = theSite.sdr_distance;
      this.geom = theSite.geom;
      this.sdr_road = theSite.sdr_road;
    }
    this.$nextTick(async () => {
      this.initialFormState = this.getCurrentState;
      await this.$validator.validateAll();
    });
  },

  methods: {
    ...mapActions({
      loadTrafficSite: 'LOAD_TRAFFIC_SITE_BY_ID',
      getRegionAndRoad: 'GET_REGION_ROAD_FROM_SECTION',
      addTrafficSite: 'ADD_NEW_TRAFFIC_SITE',
      editTrafficSite: 'UPDATE_TRAFFIC_SITE',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    async validate() {
      const isValid = await this.$validator.validateAll();
      if (!isValid) return;

      const theItem = this.getCurrentState;

      let errDesc = '';
      let newitemId;
      const action = !this.itemId ? this.addTrafficSite : this.editTrafficSite;
      const payload = !this.itemId ? theItem : { id: this.itemId, theItem };
      try {
        const res = await action(payload);
        newitemId = res?.traffic_site_id;
      } catch (err) {
        errDesc = err.message || this.$t('errors.unknown_error');
      };

      this.$nextTick(() => this.$validator.reset());
      this.$emit('close');
      await savedMessage(errDesc, this.$t('traffic.traffic_site'), this.traffic_site_desc);
      this.highlightRow(newitemId);
    }
  },

  computed: {
    ...mapState({
      coeffSetsList: (state) => state.Dropdowns.aadt_coeff_sets
    }),

    screenTitle() {
      return this.itemId ? this.$t('screen_titles.traffic_site_upd') : this.$t('screen_titles.traffic_site_add');
    },

    getCurrentState() {
      return {
        fk_road: this.fk_road,
        fk_section: this.fk_section,
        traffic_site_desc: this.traffic_site_desc,
        start_distance: this.start_distance,
        end_distance: this.end_distance,
        fk_aadt_coef_set: this.fk_aadt_coef_set,
        ts_guid: this.ts_guid,
        fk_vclass_preset: this.fk_vclass_preset,
        surveyed_distance: this.surveyed_distance,
        sdr_distance: this.sdr_distance,
        //geom: this.geom,
        sdr_road: this.sdr_road
      };
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false;

      return this.initialFormState.fk_road !== this.fk_road ||
        this.initialFormState.fk_section !== this.fk_section ||
        this.initialFormState.traffic_site_desc !== this.traffic_site_desc ||
        this.initialFormState.start_distance !== this.start_distance ||
        this.initialFormState.end_distance !== this.end_distance ||
        this.initialFormState.fk_aadt_coef_set !== this.fk_aadt_coef_set ||
        this.initialFormState.ts_guid !== this.ts_guid ||
        this.initialFormState.fk_vclass_preset !== this.fk_vclass_preset ||
        this.initialFormState.surveyed_distance !== this.surveyed_distance ||
        this.initialFormState.sdr_distance !== this.sdr_distance ||
        this.initialFormState.sdr_road !== this.sdr_road;
    }
  }
}
</script>