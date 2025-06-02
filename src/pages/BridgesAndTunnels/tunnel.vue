<template>
  <div>
    <div v-for="section in details" :key="section.name" class="section-row ">
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
                  <template slot="title">{{ $t(`tunnel.${item}`) }}</template>
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
                  {{ $t(`tunnel.${header}`) }}
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
          <template v-if="section.type === 'image'">
            <div class="md-layout">
              <div
                  v-for="(subSection, index) in section.items"
                  :key="`${section.name + index}`"
                  class="md-layout subsection-row md-layout-item"
              >
                <div class="md-layout-item md-size-100">
                  <div class="md-subhead ">
                    {{ $t(subSection.header) }}
                  </div>
                </div>
                <div class="md-layout-item md-size-100">
                  <div class="md-subhead " v-if="section.subLabel">
                    {{ $t(section.subLabel) }}
                  </div>
                  <md-card-media class="">
                    <img
                        class="section-image"
                        :src="subSection.url"
                        alt="aaa"
                    />
                  </md-card-media>
                </div>
              </div>
            </div>
          </template>
        </md-card-content>
      </md-card>
    </div>

    <div class="pagebreak"></div>
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
        tunnel_uuid: uuid,
        tunnel_name_en: name_en,
        tunnel_name_ru: name_ru,
        tunnel_length: length,
        completion_year,
        road_name,
        reference_number,
        distance_post,
        competent_dep,
        traffic_volume,
        regulation_speed,
        traffic_form_en,
        traffic_form_ru,
        longitudinal_slope,
        alignment,
        tunnel_support_structure_en,
        tunnel_support_structure_ru,
        pavement_type_en,
        pavement_type_ru,
        pavement_thickness,
        lighting_type_specification,
        lighting_number,
        ventilation_type_en,
        ventilation_type_ru,
        ventilation_specification_number,
        facilities1,
        facilities2,
        facilities3,
        receiving_voltage
      } = this.pas_details
      const general_information = {
        type: 'labels',
        name: 'general_information',
        label: 'tunnel.general_information',
        subLabel: '',
        items: [
          {name_en, name_ru, road_name, reference_number},
          {},
          {
            length,
            distance_post,
            completion_year,
            competent_dep
          }
        ]
      }
      const dimensions = {
        type: 'labels',
        name: 'dimensions',
        label: 'tunnel.dimensions',
        subLabel: '',
        items: [
          {
            traffic_volume,
            regulation_speed,
            traffic_form_en,
            traffic_form_ru
          },
          {},
          {
            longitudinal_slope,
            alignment,
            tunnel_support_structure_en,
            tunnel_support_structure_ru
          },
          {},
          {
            pavement: '',
            pavement_type_en,
            pavement_type_ru,
            pavement_thickness
          },
          {},
          {lighting: '', lighting_type_specification, lighting_number},
          {},
          {
            ventilation: '',
            ventilation_type_en,
            ventilation_type_ru,
            ventilation_specification_number
          },
          {},
          {facilities: '', facilities1, facilities2, facilities3},
          {receiving_voltage}
        ]
      }
      const cross_section_and_location = {
        type: 'image',
        name: 'cross_section_and_location',
        label: '',
        subLabel: '',
        items: [
          {
            url: `/bridges_tunnels_images/Tunnels/cross-section/${uuid.toUpperCase()}.jpeg`,
            header: 'tunnel.cross_section'
          },
          {
            url: `/bridges_tunnels_images/Tunnels/location_map/${uuid.toUpperCase()}.jpeg`,
            header: 'tunnel.location_map'
          }
        ]
      }

      const width_of_road = {
        type: 'image',
        name: 'width_of_road',
        label: 'tunnel.width_of_road',
        subLabel: '',
        items: [
          {
            url: `/bridges_tunnels_images/Tunnels/width_of_road_bishkek_side/${uuid.toUpperCase()}.jpeg`,
            header: 'tunnel.near_the_portal_of_bishkek_side'
          },
          {
            url: `/bridges_tunnels_images/Tunnels/width_of_road_osh_side/${uuid.toUpperCase()}.jpeg`,
            header: 'tunnel.near_the_portal_of_osh_side'
          }
        ]
      }

      const tunnel_portal = {
        type: 'image',
        name: 'tunnel_portal',
        label: 'tunnel.tunnel_portal',
        subLabel: '',
        items: [
          {
            url: `/bridges_tunnels_images/Tunnels/portal_bishkek_side/${uuid.toUpperCase()}.jpeg`,
            header: 'tunnel.north_side'
          },
          {
            url: `/bridges_tunnels_images/Tunnels/portal_osh_side/${uuid.toUpperCase()}.jpeg`,
            header: 'tunnel.south_side'
          }
        ]
      }

      return [
        general_information,
        dimensions,
        cross_section_and_location,
        width_of_road,
        tunnel_portal
      ]
    },
    tunnel_uuid() {
      return this.pas_details.tunnel_uuid
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

.section-image {
  max-width: 700px;
  min-width: 18em;
}
</style>
