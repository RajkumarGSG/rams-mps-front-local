<!--
File: SectionEditOverview.vue
Description: Part of the SectionEditForm.vue used for adding/editing a single road section.
-->
<template>
  <div>
    <div class="md-layout">
      <div class="md-layout-item md-small-size-100 md-size-40">
        <RoadsDropdown :class="getClass('fk_road')" v-model="section.fk_road" data-vv-name="fk_road"
          :v-validate="modelValidations.fk_road" :isRequired="true" :regionId="section.fk_region" />
      </div>
      <div class="md-layout-item md-small-size-100 md-size-20">
        <md-field :class="getClass('section_key')">
          <label>{{ $t('road_network.section_key') }}</label>
          <md-input v-model="section.section_key" type="text" data-vv-name="section_key" required
            v-validate="modelValidations.section_key" />
        </md-field>
      </div>
      <div class="md-layout-item md-small-size-100 md-size-20">
        <md-field :class="getClass('section_number')">
          <label>{{ $t('road_network.section_number') }}</label>
          <md-input v-model="section.section_number" type="number" data-vv-name="section_number" required
            v-validate="modelValidations.section_number" />
        </md-field>
      </div>
    </div>
    <div class="md-layout">
      <div class="md-layout-item md-small-size-100 md-size-40">
        <md-field :class="getClass('section_description')">
          <label>{{ $t('stdCols.name_ru') }}</label>
          <md-input v-model="section.section_description" type="text" data-vv-name="section_description" required
            v-validate="modelValidations.section_description" />
        </md-field>
      </div>
      <div class="md-layout-item md-small-size-100 md-size-40">
        <md-field :class="getClass('section_description_en')">
          <label>{{ $t('stdCols.name_en') }}</label>
          <md-input v-model="section.section_description_en" type="text" data-vv-name="section_description_en" required
            v-validate="modelValidations.section_description_en" />
        </md-field>
      </div>
    </div>
    <div class="md-layout">
      <div class="md-layout-item md-small-size-100 md-size-20">
        <md-field :class="getClass('villages')">
          <label>{{ $t('inventory.villages') }}</label>
          <md-input v-model="section.villages" type="number" data-vv-name="villages" required
            v-validate="modelValidations.villages" />
        </md-field>
      </div>
      <div class="md-layout-item md-small-size-100 md-size-20">
        <md-field :class="getClass('aadt')">
          <label>{{ $t('inventory.aadt') }}</label>
          <md-input v-model="section.aadt" type="number" data-vv-name="aadt" required
            v-validate="modelValidations.aadt" />
        </md-field>
      </div>
      <div class="md-layout-item md-small-size-100 md-size-20">
        <md-field :class="getClass('fclass')">
          <label>{{ $t('inventory.fclass') }}</label>
          <md-input v-model="section.fclass" data-vv-name="fclass" type="number" min=0 max=3 required
            v-validate="modelValidations.fclass" />
        </md-field>
      </div>
      <div class="md-layout-item md-small-size-100 md-size-20">
        <md-field :class="getClass('black_spots')">
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
    <EditForm ref="dynamicForm"
    v-model="section"
    :fields="[
      { name: 'section_description', label: 'stdCols.name_ru', type: 'text', class: 'md-layout-item md-size-40' },
      { name: 'section_key', label: 'road_network.section_key', type: 'text', class: 'md-layout-item md-size-10' },
      { name: 'section_number', label: 'road_network.section_number', type: 'text', class: 'md-layout-item md-size-10', props: { type: 'number' } },
      { name: 'fk_region', type: 'custom', component: 'RegionsDropdown', class: 'md-layout-item md-size-20' },
      { name: 'fk_deu', type: 'custom', component: 'DepsDropdown' , class: 'md-layout-item md-size-20', props: { regionId: this.section.fk_region }},
      { name: 'fk_road', type: 'custom', component: 'RoadsDropdown', class: 'md-layout-item md-size-40' },
    ]"
    :validations="modelValidations" />
  </div>
</template> 
<script>
  import { RegionsDropdown, RoadsDropdown, DepsDropdown } from '@/pages/Components'
  import permissions from "@/mixins/permissionsMixin"
  import EditForm from '@/pages/Components/EditForm.vue'

  export default {
    name: 'section-edit-overview',
    mixins: [permissions],
     data() {
      return {
        formName: 'Sections',
        eligible: true,

        sectionListLoaded: false,
        section_id: null,
        initialFormState: null,
        section: {},

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
        },
      }
    },

    props: {
      itemId: null,
    },

    components: {
      RegionsDropdown,
      DepsDropdown,
      RoadsDropdown,
      EditForm
    },
  }
</script>
