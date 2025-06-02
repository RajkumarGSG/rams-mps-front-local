<template>
  <div>
    <div v-for="section in details" :key="section.name" class="section-row">
      <md-card>
        <md-card-header>
          <div class="md-title " v-if="section.label">
            [ {{ $t(section.label) }} ]
          </div>
          <div class="md-subhead " v-if="section.subLabel">
            {{ $t(section.subLabel) }}
          </div>
        </md-card-header>
        <md-card-content>
          <template v-if="section.type === 'labels'">
            <div
              v-for="(subSection, index) in section.items"
              :key="`${section.name + index}`"
              class="md-layout subsection-row"
            >
              <div
                v-for="item in Object.keys(subSection)"
                :key="item"
                class="label-grp md-layout-item md-size-100"
              >
                <LabelGroup>
                  <template slot="title">{{ $t(`bridge.${item}`) }}</template>
                  {{ subSection[item] }}
                </LabelGroup>
              </div>
            </div>
          </template>
          <template v-else-if="section.type === 'table'">
            <md-table>
              <md-table-row>
                <md-table-head
                  v-for="header in section.table.headers"
                  :key="header"
                >
                  {{ $t(`bridge.${header}`) }}
                </md-table-head>
              </md-table-row>

              <md-table-row
                v-for="(row, row_index) in section.table.data"
                :key="`${section.name}.table.${row_index}`"
              >
                <md-table-cell
                  v-for="(field, index) in row"
                  :key="`${section.name}.table.${row}.${index}`"
                >
                  {{ $t(field) }}
                </md-table-cell>
              </md-table-row>
            </md-table>
          </template>
        </md-card-content>
      </md-card>
    </div>

    <div class="pagebreak"></div>
    <div class="md-layout ">
      <div
        v-for="type in image_types"
        :key="type"
        class="md-layout-item md-size-34 md-small-size-100 md-xsmall-size-100 "
      >
        <div class="pagebreak"></div>
        <md-card>
          <md-card-header>
            <div class="md-title">{{ $t(`bridge.image_${type}`) }}</div>
          </md-card-header>
          <md-card-media>
            <img
              :src="
                `/bridges_tunnels_images/Bridges/${type}/${bridge_uuid.toUpperCase()}.jpeg`
              "
              :alt="$t(`bridge.image_${type}`)"
            />
          </md-card-media>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import LabelGroup from '@/components/LabelGroup'
export default {
  props: {
    pas_details: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      image_types: ['overview', 'surface', 'underside']
    }
  },
  computed: {
    details() {
      const {
        pluad_uad: uad,
        dep,
        region_name: oblast,
        structural_soundness,
        bridge_num,
        river,
        road_class,
        year_construction,
        route_name,
        location,
        longitude_e,
        latitude_n,
        design_load,
        feature,
        attachment,
        dim_length: bridge_length,
        dim_width_roadway: roadway_width,
        dim_width_sidewalk: sidewalk_width,
        num_of_span,
        sub_material,
        sub_structural_type_of_pier,
        sub_height_of_substructure,
        sub_num_of_substructure
      } = {...this.pas_details}
      const general_information = {
        type: 'labels',
        name: 'general_information',
        label: 'bridge.general_information',
        subLabel: 'bridge.each_dimensional_unit_m',
        items: [
          {uad, dep},
          {
            oblast,
            structural_soundness
          },
          {},
          {
            bridge_num,
            river,
            road_class,
            year_construction
          },
          {route_name},
          {location, longitude_e, latitude_n},
          {design_load, feature, attachment}
        ]
      }
      const dimensions = {
        type: 'labels',
        name: 'dimensions',
        label: 'bridge.dimensions',
        subLabel: '',
        items: [
          {
            bridge_length,
            roadway_width,
            sidewalk_width,
            num_of_span
          }
        ]
      }
      const material_headers = [
        'element',
        'material',
        'structural_type_1',
        'structural_type_2',
        'structural_type_3',
        'num_of_girder',
        'num_of_slab'
      ]
      const materials = {
        type: 'table',
        name: 'materials',
        label: 'bridge.materials',
        subLabel: '',
        table: {
          headers: [...material_headers],
          data: []
        }
      }

      for (let i = 1; i <= 3; i += 1) {
        const row = material_headers.map((field) => {
          return field === 'element'
            ? `${this.$t('bridge.superstructure')} ${i}`
            : this.pas_details[`ss${i}_${field}`]
        })
        materials.table.data.push(row)
      }
      const materials_add = {
        type: 'labels',
        name: 'materials_add',
        label: '',
        subLabel: '',
        items: [
          {
            sub_material,
            sub_structural_type_of_pier,
            sub_height_of_substructure,
            sub_num_of_substructure
          }
        ]
      }

      const other_table_headers = ['item', 'with_or_without', 'material']
      const other_items = ['bearing', 'ej', 'railing']
      const other_parts = {
        type: 'table',
        name: 'other_parts',
        label: 'bridge.other_parts',
        subLabel: '',
        table: {
          headers: [...other_table_headers.map((header) => `other_${header}`)],
          data: [
            ...other_items.map((item) => {
              return other_table_headers.map((elem) => {
                return elem === 'item'
                  ? `bridge.${item}`
                  : this.pas_details[`${item}_${elem}`]
              })
            })
          ]
        }
      }
      return [
        general_information,
        dimensions,
        materials,
        materials_add,
        other_parts
      ]
    },
    bridge_uuid() {
      return this.pas_details.bridge_uuid
    }
  },
  components: {LabelGroup}
}
</script>

<style lang="scss">
.section-row {
  span.passport-label {
    font-size: 18px;
    font-weight: 500;
  }
  span.passport-sub-label {
  }
  .subsection-row {
    min-height: 20px;
  }
}
.label-grp {
  min-height: 40px;
  line-height: 40px;
  padding-left: 0;
  padding-right: 0;
  border-bottom: 1px solid #eee;
}
</style>
