<!--
File: SectionEditForm.vue
Description: form for adding/editing a single road section.
-->
<template>
  <modal v-if="eligible" :title="screenTitle" :form="formName" :errCount="errors.count()"
    :hasUnsavedChanges="hasUnsavedChanges" @close="$emit('close')" @save="validate">

    <template slot='body'>
      <VueTabs>
        <!--SectionEditOverview /-->
        <v-tab id="tab0" :title="$t('tabs.section_overview')">
          <div class="md-layout">
            <RegionsDropdown :class="getClass('fk_region', 30)" :label="$t('road_network.region')"
              v-model="section.fk_region" data-vv-name="fk_region" :isRequired="true" />
            <DepsDropdown :class="getClass('fk_deu', 20)" :label="$t('road_network.dep')" v-model="section.fk_deu"
              data-vv-name="fk_deu" :v-validate="modelValidations.fk_deu" :isRequired="true"
              :regionId="section.fk_region" />
            <RoadsDropdown :class="getClass('fk_road', 40)" :label="$t('road_network.road')" v-model="section.fk_road"
              data-vv-name="fk_road" :v-validate="modelValidations.fk_road" :isRequired="true"
              :regionId="section.fk_region" />
          </div>
          <MultilanguageEditForm v-model="formData" :fields="nameFields" />
          <p>Текущие данные: {{ formData }}</p>
          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field
                :class="[{ 'md-valid': !errors.has('section_key') }, { 'md-error': errors.has('section_key') }]">
                <label>{{ $t('road_network.section_key') }}</label>
                <md-input v-model="section.section_key" type="text" data-vv-name="section_key" required
                  v-validate="modelValidations.section_key" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field
                :class="[{ 'md-valid': !errors.has('section_number') }, { 'md-error': errors.has('section_number') }]">
                <label>{{ $t('road_network.section_number') }}</label>
                <md-input v-model="section.section_number" type="number" data-vv-name="section_number" required
                  v-validate="modelValidations.section_number" />
              </md-field>
            </div>
          </div>
          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-40">
              <md-field
                :class="[{ 'md-valid': !errors.has('section_description') }, { 'md-error': errors.has('section_description') }]">
                <label>{{ $t('stdCols.name_ru') }}</label>
                <md-input v-model="section.section_description" type="text" data-vv-name="section_description" required
                  v-validate="modelValidations.section_description" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-40">
              <md-field
                :class="[{ 'md-valid': !errors.has('section_description_en') }, { 'md-error': errors.has('section_description_en') }]">
                <label>{{ $t('stdCols.name_en') }}</label>
                <md-input v-model="section.section_description_en" type="text" data-vv-name="section_description_en"
                  required v-validate="modelValidations.section_description_en" />
              </md-field>
            </div>
          </div>
          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field :class="[{ 'md-valid': !errors.has('villages') }, { 'md-error': errors.has('villages') }]">
                <label>{{ $t('inventory.villages') }}</label>
                <md-input v-model="section.villages" type="number" data-vv-name="villages" required
                  v-validate="modelValidations.villages" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field :class="[{ 'md-valid': !errors.has('aadt') }, { 'md-error': errors.has('aadt') }]">
                <label>{{ $t('inventory.aadt') }}</label>
                <md-input v-model="section.aadt" type="number" data-vv-name="aadt" required
                  v-validate="modelValidations.aadt" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field :class="[{ 'md-valid': !errors.has('fclass') }, { 'md-error': errors.has('fclass') }]">
                <label>{{ $t('inventory.fclass') }}</label>
                <md-input v-model="section.fclass" data-vv-name="fclass" type="number" min=0 max=3 required
                  v-validate="modelValidations.fclass" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field
                :class="[{ 'md-valid': !errors.has('black_spots') }, { 'md-error': errors.has('black_spots') }]">
                <label>{{ $t('condition.black_spots') }}</label>
                <md-input v-model="section.black_spots" data-vv-name="black_spots" type="number" min=0 max=9 required
                  v-validate="modelValidations.black_spots" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <label>
                <input type="checkbox" v-model="section.social_importance" true-value="1" false-value="0" />
                {{ $t('inventory.social_importance') }}
              </label>
            </div>
          </div>
        </v-tab>

        <v-tab id="tab1" :title="$t('tabs.section_location')">
          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-40">
              <md-field>
                <label>{{ $t('inventory.start_place') }}</label>
                <md-input v-model="section.start_place" type="text" />
              </md-field>
            </div>
          </div>
          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-40">
              <md-field>
                <label>{{ $t('inventory.end_place') }}</label>
                <md-input v-model="section.end_place" type="text" />
              </md-field>
            </div>
          </div>
          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field
                :class="[{ 'md-valid': !errors.has('start_distance_m') }, { 'md-error': errors.has('start_distance_m') }]">
                <label>{{ $t('inventory.start_distance_m') }}</label>
                <md-input v-model="section.start_distance_m" type="number" data-vv-name="start_distance_m" required />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field
                :class="[{ 'md-valid': !errors.has('end_distance_m') }, { 'md-error': errors.has('end_distance_m') }]">
                <label>{{ $t('inventory.end_distance_m') }}</label>
                <md-input v-model="section.end_distance_m" type="number" required />
              </md-field>
            </div>
          </div>
        </v-tab>

        <v-tab id="tab2" :title="$t('tabs.section_geometry')">
          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field>
                <label>{{ $t('inventory.start_distance_m') }}</label>
                <md-input v-model="sectionGeometry.start_distance_m" type="Number" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field>
                <label>{{ $t('inventory.end_distance_m') }}</label>
                <md-input v-model="sectionGeometry.end_distance_m" type="Number" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <BaseDropdown :label="$t('tunnels_table.pavement_type_ru')" v-model="sectionGeometry.pavement_type"
                :dropdownId='"pavement_types"' :items="pavement_types" @onChange='onPavementTypeChange' />
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <BaseDropdown :label="$t('condition.terrain_type_desc')" :initialValue="sectionGeometry.terrain_character"
                :dropdownId='"terrain_character"' :items="terrain_types" :displayField="'description'"
                :valueField="'description'" @onChange='onTerrainCharacterChange' />
            </div>
          </div>

          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field>
                <label>{{ $t('condition.right_shoulder_width_m') }}</label>
                <md-input v-model="sectionGeometry.right_shoulder_width_m" type="Number" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <BaseDropdown :label="$t('condition.right_shoulder_type_desc')"
                :initialValue="sectionGeometry.right_shoulder_type" :dropdownId='"right_shoulder_type"'
                :items="surface_types" :displayField="'description'" :valueField="'description'" />
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field>
                <label>{{ $t('condition.left_shoulder_width_m') }}</label>
                <md-input v-model="sectionGeometry.left_shoulder_width_m" type="Number" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <!-- TODO: change to this:
              <RdbLookupDropdown :label="$t('label.expected_outcome')" v-model="expected_outcome" :lookupType="'surface_type'" :addEmptyLine="false" />
            -->
              <BaseDropdown :label="$t('condition.left_shoulder_type_desc')"
                :initialValue="sectionGeometry.left_shoulder_type" :dropdownId='"left_shoulder_type"'
                :items="surface_types" :displayField="'description'" :valueField="'description'" />
            </div>
          </div>

          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-20">
              <BaseDropdown :label="$t('condition.land_use_type_desc')" :initialValue="sectionGeometry.land_use_type"
                :dropdownId='"land_use_type"' :items="LandUseTypes" :displayField="'description'" :valueField="'id'"
                @onChange='onNumberOfLanesChange' />
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field>
                <label>{{ $t('condition.median_width_m') }}</label>
                <md-input v-model="sectionGeometry.median_width" type="Number" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <BaseDropdown :label="$t('road_network.nr_of_lanes')" :initialValue="sectionGeometry.number_of_lanes"
                :dropdownId='"number_of_lanes"' :items="lanesList" :displayField="'description'"
                :valueField="'description'" @onChange='onNumberOfLanesChange' />
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field>
                <label>{{ $t('label.carriageway_width') + $t('label.meters') }}</label>
                <md-input v-model="sectionGeometry.carriageway_width_m" type="Number" />
              </md-field>
            </div>
          </div>

          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field>
                <label>{{ $t('inventory.direction') }}</label>
                <md-input v-model="sectionGeometry.direction" type="text" />
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-20">
              <md-field>
                <label>{{ $t('label.dual') }}</label>
                <md-input v-model="sectionGeometry.dual" type="Number" />
              </md-field>
            </div>
          </div>
        </v-tab>
      </VueTabs>
    </template>
  </modal>
</template>
<script>
import { VueTabs, VTab } from 'vue-nav-tabs'
import 'vue-nav-tabs/themes/vue-tabs.css'
import { mapState, mapActions } from 'vuex'
import MultilanguageEditForm from '@/pages/Components/MultilanguageEditForm.vue'
import { Modal, RegionsDropdown, RoadsDropdown, BaseDropdown, DepsDropdown } from '@/pages/Components'
import permissions from "@/mixins/permissionsMixin"
import { savedMessage } from '@/mixins/messagesMixin'
//import SectionEditOverview from './SectionEditOverview.vue'
import EditForm from '@/pages/Components/EditForm.vue'

export default {
  name: 'section-edit-form',
  mixins: [permissions],

  data() {
    return {
      formData: {
        description_en: "",
        description_ru: ""
      },
      nameFields: [
        { name: 'description_en', label: 'stdCols.name_en', class: 'md-layout-item md-size-20' },
        { name: 'description_ru', label: 'stdCols.name_ru', class: 'md-layout-item md-size-20' },
        { name: 'description_kg', label: 'stdCols.name_kg', class: 'md-layout-item md-size-20' },
      ],
      formName: 'SectionEditForm',
      eligible: true,

      sectionListLoaded: false,
      section_id: null,
      initialFormState: null,
      section: {},
      sectionGeometry: {
        fk_section: null,
        start_distance_m: null,
        end_distance_m: null,
        pavement_type: null,
        right_shoulder_width_m: null,
        right_shoulder_type: null,
        left_shoulder_width_m: null,
        left_shoulder_type: null,
        land_use_type: null,
        median_width: null,
        terrain_character: null,
        direction: null,
        dual: null,
        number_of_lanes: null,
        carriageway_width_m: null,
      },

      lanesList: [
        { description: 1 }, { description: 2 }, { description: 3 },
        { description: 4 }, { description: 5 }, { description: 6 }
      ],

      modelValidations: {
        fk_deu: { required: true, numeric: true, min_value: 1 },
        fk_road: { required: true, numeric: true, min_value: 1 },
        section_key: { required: true, min: 3 },
        section_number: { required: true, numeric: true },
        section_description: { required: true, min: 3 },
        section_description_en: { required: true, min: 3 },
        //section_description_kg: { required: true, min: 3 },
        villages: { required: true, numeric: true, min_value: 0, max_value: 49 },
        aadt: { required: true, decimal: true },
        fclass: { required: true, numeric: true, min_value: 0, max_value: 3 },
        black_spots: { required: true, numeric: true, min_value: 0, max_value: 9 },
        social_importance: { required: false, numeric: true, min_value: 0, max_value: 1 },
        //start_place: { required: true, numeric: true },
        //end_place: { required: true, numeric: true },
        start_distance_m: { required: true, numeric: true, min_value: 0 },
        end_distance_m: { required: true, numeric: true, min_value: 100 },
        //start_geom: { required: false },
        //end_geom: { required: false },
      },
    }
  },

  props: {
    itemId: null,
  },

  components: {
    VueTabs,
    VTab,
    Modal,
    RegionsDropdown,
    DepsDropdown,
    RoadsDropdown,
    BaseDropdown,
    MultilanguageEditForm,
    //SectionEditOverview
  },

  async mounted() {
    /*
          // Check if we are eligible to view the form
          this.eligible = await this.checkIfScreenAllowed()
          if (!this.eligible) {
            this.$emit('close');
            return
          };
    */
    if (this.itemId) {
      await this.loadSection(this.itemId)
      this.sectionListLoaded = true

      await this.loadGeometry({ section_id: this.itemId })
      const len = this.sectionGeometryList.length
      if (len > 0) {
        this.sectionGeometry = this.sectionGeometryList[len - 1]
        delete this.sectionGeometry.section
      } else {
        this.sectionGeometry.fk_section = Number(this.itemId)
        this.sectionGeometry.start_distance_m = Number(this.section.start_distance_m)
        this.sectionGeometry.end_distance_m = Number(this.section.end_distance_m)
      }
    }

    await this.loadPavementList()
    //await this.loadSurfaceList()
    await this.loadTerrainList()
    await this.loadLandUse()
    this.$nextTick(async () => {
      //this.initialFormState = this.getCurrentState
      await this.$validator.validateAll();
    });
  },

  methods: {
    ...mapActions({
      loadSection: 'LOAD_SECTION_BY_ID',
      loadGeometry: 'LOAD_SECTION_GEOMETRY_LIST',
      loadPavementList: 'LOAD_PAVEMENT_TYPES',
      //loadSurfaceList: 'LOAD_SURFACE_TYPES',
      loadTerrainList: 'LOAD_TERRAIN_TYPES',
      loadLandUse: 'LOAD_LAND_USE',
      addItem: 'ADD_NEW_SECTION',
      editItem: 'UPDATE_SECTION',
      addGeometry: 'ADD_NEW_SECTION_GEOMETRY',
      editGeometry: 'UPDATE_SECTION_GEOMETRY',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    handleSubmit(theValues) {
      console.log('theValues', theValues)
    },
    //onClose,
    /*    onShoulderPavementTypeChange(value) {
          this.sectionGeometry.shoulder_type = value
        },*/
    onPavementTypeChange(value) {
      this.sectionGeometry.pavement_type = value
    },
    onTerrainCharacterChange(value) {
      this.sectionGeometry.terrain_character = value
    },
    onNumberOfLanesChange(value) {
      this.sectionGeometry.number_of_lanes = value
    },
    async validate() {
      const isValid = await this.$validator.validateAll()
      if (!isValid) return

      //const theItem = this.getCurrentState
      //delete after Andrey resolves in Api
      // convert to numbers
      this.section.start_distance_m = Number(this.section.start_distance_m)
      this.section.end_distance_m = Number(this.section.end_distance_m)
      this.section.fclass = Number(this.section.fclass)
      this.section.black_spots = Number(this.section.black_spots)
      this.section.aadt = Number(this.section.aadt)
      this.section.section_number = Number(this.section.section_number)
      this.section.villages = Number(this.section.villages)
      this.section.social_importance = Number(this.section.social_importance)

      this.sectionGeometry.start_distance_m = Number(this.sectionGeometry.start_distance_m)
      this.sectionGeometry.end_distance_m = Number(this.sectionGeometry.end_distance_m)
      /*      this.sectionGeometry.right_shoulder_width_m = Number(this.sectionGeometry.right_shoulder_width_m)
            this.sectionGeometry.right_shoulder_type = Number(this.sectionGeometry.right_shoulder_type)
            this.sectionGeometry.left_shoulder_width_m = Number(this.sectionGeometry.left_shoulder_width_m)
            this.sectionGeometry.left_shoulder_type = Number(this.sectionGeometry.left_shoulder_type)
        */
      this.sectionGeometry.carriageway_width_m = Number(this.sectionGeometry.carriageway_width_m)
      this.sectionGeometry.dual = Number(this.sectionGeometry.dual)
      this.sectionGeometry.terrain_character = Number(this.sectionGeometry.terrain_character)
      this.sectionGeometry.number_of_lanes = Number(this.sectionGeometry.number_of_lanes)
      this.sectionGeometry.direction = Number(this.sectionGeometry.direction)
      //

      let errDesc = '';
      let newId;
      const action = !this.itemId ? this.addItem : this.editItem;
      const actionGeom = !this.itemId ? this.addGeometry : this.editGeometry;
      //const payload = !this.itemId ? theItem : { id: this.itemId, theItem };
      const payload = !this.itemId ? this.section : { id: this.section.section_id, theItem: this.section }
      const payloadGeom = !this.itemId ? this.sectionGeometry : { id: this.sectionGeometry.geometry_id, theItem: this.sectionGeometry }
      delete this.sectionGeometry.geometry_id
      try {
        const res = await action(payload)
        newId = res?.section_id;
        // Add section id to the geometry object
        if (!this.itemId) this.sectionGeometry.fk_section = Number(res)
        try {
          await actionGeom(payloadGeom)
        } catch (errGeom) {
          errDesc += 'Geom: ' + errGeom.message
        }
      } catch (err) {
        errDesc += err.message || this.$t('errors.unknown_error')
      }

      this.$nextTick(() => this.$validator.reset())
      this.$emit('close');

      await savedMessage(errDesc, this.$t('road_network.section'), this.section.section_description,
        this.section.section_description_en)

      this.highlightRow(section_id)
        ;
    }
  },

  computed: {
    ...mapState({
      sectionGeometryList: (state) => state.RoadNetwork.section_geometry_list,
      surface_types: (state) => state.Dropdowns.surface_types,
      pavement_types: (state) => state.Dropdowns.pavement_types,
      terrain_types: (state) => state.Dropdowns.terrain_types,
      LandUseTypes: (state) => state.Dropdowns.LandUseTypes,
    }),

    screenTitle() {
      return this.itemId ? this.$t('screen_titles.section_upd') : this.$t('screen_titles.section_add')
    },

    hasUnsavedChanges() {
      if (!this.initialFormState) return false
      return false
      /*
        return this.fk_region !== this.initialFormState.fk_region ||
          this.description !== this.initialFormState.description ||
          this.description_en !== this.initialFormState.description_en ||
          this.address1 !== this.initialFormState.address1 ||
          this.address2 !== this.initialFormState.address2 ||
          this.city !== this.initialFormState.city
      }
      */
    }
  }
}
</script>
<style>
.md-card {
  margin: 0px 0;
}

.md-button+.md-button {
  margin-left: 10px;
}

.modal-container {
  max-width: 700px;
}

.vue-tabs .nav-tabs>li.active>a,
.vue-tabs .nav-tabs>li.active>a:hover,
.vue-tabs .nav-tabs>li.active>a:focus {
  background-color: #4caf50;
}
</style>
