<!--
File: HomoSections.vue
Description: show list of road sections entered in the DB.
-->
<template>
  <md-card v-if="eligible">
    <md-card-header class="md-card-header-icon md-card-header-green">
      <div class="md-layout">
        <div class="md-layout-item md-size-15 btn-row">
          <md-button class="md-primary md-simple" @click='onModalClose'>
            <md-icon>arrow_back</md-icon>{{ $t('buttons.back') }}
          </md-button>
        </div>
        <div class="md-layout-item md-size-20">
          <RegionsDropdown v-model="selectedRegion" />
        </div>
        <div class="md-layout-item md-size-25">
          <RoadsDropdown v-model="selectedRoad" :items="roadsList" />
        </div>
        <div class="md-layout-item md-size-15">
          <md-field>
            <md-input type="search" class="mb-3" clearable :placeholder="$t('label.search_records')"
              v-model="searchQuery" />
          </md-field>
        </div>
        <div class="md-layout-item md-size-20 btn-row">
          <md-button v-if="isBtnAllowed('ExportButton')" class="md-raised md-success" @click="exportToExcel" :disabled="showSpinner">
            {{ $t('buttons.excel_export') }}
          </md-button>
          <md-button class='md-simple md-just-icon md-round modal-default-button' @click='onModalClose'>
            <md-icon>clear</md-icon>
          </md-button>
        </div>
      </div>
    </md-card-header>

    <md-card-content>
      <md-progress-spinner v-if="showSpinner == true" :md-diameter="100" md-mode="indeterminate" />
      <md-table class="paginated-table table-striped table-hover" :value="queriedData" md-fixed-header>
        <md-table-empty-state :md-label="$t('label.no_data')" :md-description="$t('messages.select_another_criteria')" />
        <md-table-row slot="md-table-row" slot-scope="{item}">
          <md-table-cell :md-label="$t('road_network.road')">
            {{ item.road_key }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.section_description')">
            {{ item.section_description }}
          </md-table-cell>
          <md-table-cell :md-label="$t('label.hs_id')" md-numeric>
            {{ item.homogeneous_section_id }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.start_km')" md-numeric>
            {{ item.start_distance / 1000 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.end_km')" md-numeric>
            {{ item.end_distance / 1000 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('road_network.length')" md-numeric>
            {{ item.length / 1000 | numFormat(3) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('condition.condition_index')" md-numeric>
            {{ item.condition_index }}
          </md-table-cell>
        </md-table-row>
      </md-table>

      <div class="footer-table md-table">
        <table>
          <tfoot>
            <tr>
              <th v-for="item in footerTable" :key="item" class="md-table-head">
                <div class="md-table-head-container md-ripple md-disabled">
                  <div class="md-table-head-label">{{ item }}</div>
                </div>
              </th>
            </tr>
          </tfoot>
        </table>
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { onModalClose } from '@/mixins/onCloseMixin'
  import { RegionsDropdown, RoadsDropdown } from '@/pages/Components'
  import permissions from "@/mixins/permissionsMixin"
  import listView from '@/mixins/listViewMixin'
  import Fuse from 'fuse.js'
  import { numFormat } from "@/store/helpers/format_helpers"
  import ExcelJS from 'exceljs';
  import { saveAs } from 'file-saver'; // Для сохранения файла на клиенте

  export default {
    name: 'HomoSections',
    mixins: [permissions, listView],

    props: {
      hsId: { default: null, type: Number },
    },

    data() {
      return {
        formName: 'HomoSections',
        eligible: false,

        selectedRegion: null,
        selectedRoad: null,
        showSpinner: false,
        searchQuery: '',
        propsToSearch: ['road_key', 'section_description'],
        fuseSearch: null,
        currentSort: 'road_key',
        currentSortOrder: 'asc',
      }
    },

    components: {
      RegionsDropdown,
      RoadsDropdown
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        return
      };

      this.toggleSpinner(true)
      this.resetList()
      //this.reloadData()
    },

    methods: {
      ...mapActions({
        resetList: 'CLEAR_HOMO_SECTION_LIST',
        loadList: 'LOAD_ALL_HOMO_SECTIONS',
      }),

      onModalClose,

      toggleSpinner(state) {
        this.showSpinner = state
        document.body.style.cursor = state ? 'progress' : 'auto';
      },

      reloadData(searchQuery) {
        if (!this.hsId) return

        this.toggleSpinner(true)
        this.searchQuery = ''
        this.loadList(this.hsId).then(() => {
          // Fuse search initialization.
          this.fuseSearch = new Fuse(this.hsList, { keys: this.propsToSearch, threshold: 0.3 })
          if (searchQuery) this.searchQuery = searchQuery
          this.toggleSpinner(false)
        })
      },

      async exportToExcel() {
        // Создаем новую книгу Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(this.$t('tabs.homo_sections'));

        // Устанавливаем заголовки колонок
        worksheet.columns = [
          { header: this.$t('road_network.region'), key: 'region_description', width: 20 },
          { header: this.$t('road_network.road'), key: 'road_key', width: 15 },
          { header: this.$t('road_network.section_description'), key: 'section_description', width: 50 },
          { header: this.$t('label.hs_id'), key: 'homogeneous_section_id', width: 10 },
          { header: this.$t('road_network.start_km'), key: 'start_distance', width: 15 },
          { header: this.$t('road_network.end_km'), key: 'end_distance', width: 15 },
          { header: this.$t('road_network.length'), key: 'length', width: 15 },
          { header: this.$t('condition.condition_index'), key: 'condition_index', width: 10 },
        ];

        // Заполняем данные из this.tableData
        this.tableData.forEach(item => {
          worksheet.addRow(item);
        });

        // Применение форматирования для заголовков (первая строка)
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Белый текст
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0070C0' } // Синий фон
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Применение числового форматирования для колонок
        worksheet.getColumn('homogeneous_section_id').numFmt = '#,##0'
        worksheet.getColumn('start_distance').numFmt = '#,##0.000'
        worksheet.getColumn('end_distance').numFmt = '#,##0.000'
        worksheet.getColumn('length').numFmt = '#,##0.000'
        worksheet.getColumn('condition_index').numFmt = '#,##0'

        // Генерация Excel файла и сохранение
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, this.$t('tabs.homo_sections'));
      }
    },

    computed: {
      ...mapState({
        hsList: (state) => state.RoadNetwork.all_homo_sections_in_list,
      }),

      ...mapGetters(['homoSectionsFiltered', 'roadsInList', 'homoSectionSummary']),

      queriedData() {
        const result = !this.searchQuery ? this.tableData : this.searchedData
        return result
      },

      tableData() {
        return this.homoSectionsFiltered(this.selectedRegion, this.selectedRoad);
      },

      roadsList() {
        return this.roadsInList(this.selectedRegion)
      },

      summary() {
        return this.homoSectionSummary(this.selectedRegion, this.selectedRoad)
      },

      footerTable() {
        return [
          this.$t('label.total'),
          `${this.$t('road_network.section_count')}: ${numFormat(this.summary.sectionsCount, 0)}`,
          `${this.$t('road_network.length')}: ${numFormat(this.summary.sectionsLength, 3)}`
        ];
      }
    },

    watch: {
      hsId(value) {
        //console.log('hsId changed', value)
        this.selectedRegion = null
        this.selectedRoad = null
        if (value) {
          this.reloadData()
        } else {
          this.resetList()
        }
      }
    }
  }
</script>
<style lang="scss" scoped>
.md-card {
  margin: 0px 0;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.md-button+.md-button {
  margin-left: 10px;
}
.md-progress-spinner {
  margin: 18px;
  position: absolute;
  top: 25%;
  left: 45%;
  z-index: 20;
}
</style>