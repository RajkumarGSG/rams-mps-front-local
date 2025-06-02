<template>
  <div class="md-layout">
    <md-card>
      <md-card-content>
        <md-table :value="queriedData" @md-selected="onSelect" :md-sort.sync="currentSort"
          :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort"
          class="paginated-table table-striped table-hover">
          <md-table-toolbar>
            <md-field>
              <label for="pages">{{ $t('label.per_page') }}</label>
              <md-select v-model="pagination.perPage" name="pages">
                <md-option v-for="item in pagination.perPageOptions" :key="item" :label="item" :value="item">
                  {{ item }}
                </md-option>
              </md-select>
            </md-field>

            <md-field>
              <md-input type="search" class="mb-3" clearable style="width: 200px"
                :placeholder="`${$t('label.search_records')}`" v-model="searchQuery"></md-input>
            </md-field>
          </md-table-toolbar>

          <md-table-row slot="md-table-row" slot-scope="{item}">
            <md-table-cell>
              <a href="#" @click.stop.prevent="passportOpen(item.bridge_uuid)" :TITLE="$t('label.passport')">
                <md-icon>assignment</md-icon>
              </a>
              <a href="#" @click.stop.prevent="carouselShow(item.bridge_uuid)" :TITLE="$t('label.show_pictures')">
                <md-icon>image</md-icon>
              </a>
            </md-table-cell>
            <md-table-cell v-for="title in bridgesTitles" :key="title" :md-label="$t(`bridges_table.${title}`)"
              :md-sort-by="title">
              {{ item[title] }}
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-card-content>

      <md-card-actions md-alignment="space-between">
        <div class>
          <p class="card-category">
            {{
          $t('label.showing_from_to_of_entries', {
            from: to === 0 ? 0 : from + 1,
            to: to,
            total
          })
        }}
          </p>
        </div>
        <pagination class="pagination-no-border pagination-success" v-model="pagination.currentPage"
          :per-page="pagination.perPage" :total="total"></pagination>
      </md-card-actions>
    </md-card>
    <div class="carousel-block" v-if="isCarouselShow">
      <div class="close-carousel" @click="carouselHide">
        <md-icon>clear</md-icon>
      </div>
      <el-carousel>
        <el-carousel-item v-for="item in carouselImages" :key="item">
          <img :src="item" alt="" class="carousel-block-image">
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script>
import { Pagination } from '@/components'
import { mapState } from 'vuex'
import permissions from "@/mixins/permissionsMixin"
import Fuse from 'fuse.js'

export default {
  name: 'BridgesTable',
  mixins: [permissions],

  data() {
    return {
      formName: 'BridgesTable',

      carouselImages: [],
      bridgesList: [],
      pagination: {
        perPage: 10,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      currentSort: 'bridge_uuid',
      currentSortOrder: 'asc',
      searchQuery: '',
      selected_bridges: [],
      isCarouselShow: false
    }
  },

  components: {
    Pagination
    //Modal
  },

  mounted() {
    // Check if we are eligible to view the form
    if (!this.checkIfScreenAllowed()) {
      this.onClose()
      return
    };

    this.$store.dispatch('LOAD_BRIDGES_TABLE_DATA').then(() => {
      this.fuseSearch = new Fuse(this.bridgesData, {
        keys: [...this.bridgesTitles],
        threshold: 0.3
      })
    })
  },

  watch: {
    searchQuery(value) {
      let result = this.bridgesData
      if (value !== '') {
        result = this.fuseSearch.search(this.searchQuery)
      }
      this.searchedData = result
    }
  },

  computed: {
    ...mapState({
      bridgesTable: (state) => state.Bridges.bridges_table
    }),

    bridgesData() {
      return this.bridgesTable.data
    },

    bridgesTitles() {
      return this.bridgesTable.vars
    },

    queriedData() {
      const result = !this.searchQuery
        ? this.tableData
        : this.searchedData
          ? this.searchedData
          : []
      return result.slice(this.from, this.to)
    },

    to() {
      let highBound = this.from + this.pagination.perPage
      if (this.total < highBound) {
        highBound = this.total
      }
      return highBound
    },

    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1)
    },

    total() {
      return this.searchQuery ? this.searchedData.length : this.tableData.length
    },

    tableData() {
      return this.bridgesData
    }
  },

  methods: {
    passportOpen(uuid) {
      this.$router.push({ name: "BridgesPassport", params: { uuid: uuid, target: 'bridge' } })
    },

    carouselHide() {
      this.isCarouselShow = false
    },

    carouselShow(uuid) {
      this.carouselImages = []
      const path = '/bridges_tunnels_images/Bridges/'
      const img_overview = `${path}overview/${uuid.toUpperCase()}.jpeg`
      const img_surface = `${path}surface/${uuid.toUpperCase()}.jpeg`
      const img_underside = `${path}underside/${uuid.toUpperCase()}.jpeg`
      this.carouselImages = [img_overview, img_surface, img_underside]
      this.isCarouselShow = true
    },

    customSort(value) {
      return value.sort((a, b) => {
        const sortBy = this.currentSort
        if (this.currentSortOrder === 'desc') {
          return a[sortBy]
            .toString()
            .localeCompare(b[sortBy].toString(), undefined, { numeric: true })
        }
        return b[sortBy]
          .toString()
          .localeCompare(a[sortBy].toString(), undefined, { numeric: true })
      })
    },

    onSelect(items) {
      this.selected_bridges = items
    }
  }
}
</script>

<style lang="scss">
.md-card {
  margin: 0px 0;
  height: 100%;
}

.el-carousel__container {
  position: relative;
  height: 40em;
}

.el-carousel__item {
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-height: 100%;
    width: auto !important;
  }

  h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
  }
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}

.carousel-block {
  position: absolute;
  width: 99.5%;
  z-index: 100;

  .close-carousel {
    position: absolute;
    top: 3px;
    right: 3px;
    z-index: 101;
    cursor: pointer;
  }
}
</style>
