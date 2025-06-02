<template>
  <md-card>
    <md-card-content>
      <md-table v-model="tunnelList">
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell md-label="#">
            <div class="img-container" @click="onShowPassport(item.tunnel_uuid)">
              <img :src="`/bridges_tunnels_images/Tunnels/location_map/${item.tunnel_uuid.toUpperCase()}.jpeg`"
                alt="passport" />
            </div>
          </md-table-cell>
          <md-table-cell v-for="header of tableHeaders" :key="header" :md-label="$t(`tunnels_table.${header}`)">
            {{ item[header] }}
          </md-table-cell>
        </md-table-row>
      </md-table>
    </md-card-content>
  </md-card>
</template>
<script>
import permissions from "@/mixins/permissionsMixin"

export default {
  name: 'TunnelsTable',
  mixins: [permissions],

  data() {
    return {
      formName: 'TunnelsTable',

      tunnelList: [],
      tableHeaders: [
        "tunnel_name_ru",
        "road_name",
        "tunnel_length",
        "distance_post",
        "completion_year",
        "competent_dep",
        "traffic_volume",
        "regulation_speed",
        "traffic_form_ru",
        "longitudinal_slope",
        "alignment",
        "tunnel_support_structure_ru",
        "pavement_type_ru",
        "pavement_thickness",
        "lighting_type_specification",
        "lighting_number",
        "ventilation_type_ru",
        "ventilation_specification_number",
        "facilities1",
        "facilities2",
        "facilities3",
        "receiving_voltage",
        "cross_section",
        "width_of_road_bishkek_side",
        "width_of_road_osh_side",
        "longitude_e",
        "latitude_n"
      ]
    }
  },

  async mounted() {
    // Check if we are eligible to view the form
    if (!this.checkIfScreenAllowed()) {
      this.onClose()
      return
    };

    this.tunnelList = await this.$store.dispatch("LOAD_TUNNELS_TABLE_LIST")
  },

  methods: {
    onShowPassport(uuid) {
      const passport_url = 'tunnels-passport/'
      this.$router.push({ path: `${passport_url}${uuid}` })
    }
  },
}
</script>

<style lang="scss" scoped>
.md-card {
  margin: 0px 0;
  height: 100%;
}

.img-container {
  width: 150px;
  height: 150px;
  cursor: pointer;
}
</style>
