<!--
File: TreatmentMatrixPivot.vue
Description: shows the Treatment Matrix as the pivot table.
-->
<template>
  <base-data-table v-if="eligible" :loading="showSpinner" :showPagination="false">

    <template #header-buttons>
      <md-button v-if="isBtnAllowed('PrintButton')" class="md-success" @click="print" :disabled="showSpinner">
        {{ $t('buttons.print') }}
      </md-button>
      <!--md-button v-if="isBtnAllowed('ExportButton')" class="md-raised md-success" @click="exportToExcel"
        :disabled="showSpinner">
        {{ $t('buttons.excel_export') }}
      </md-button-->
    </template>

    <template #table-rows>
      <span id="matrix" v-html="tableData"></span>
    </template>
  </base-data-table>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { BaseDataTable, TreatmentsDropdown } from '@/pages/Components/'
import BaseTableMixin from '@/mixins/BaseTableMixin'
import printReport from '@/mixins/printMixin'

export default {
  name: 'TreatmentMatrixPivot',
  mixins: [printReport, BaseTableMixin],

  data() {
    return {
      formName: 'TreatmentMatrixPivot',
      eligible: false,

      historyMapping: {
        pagination: {},
        searchQuery: ''
      }
    }
  },

  components: {
    BaseDataTable,
    TreatmentsDropdown,
  },

  methods: {
    ...mapActions({
      clearList: 'ReferenceData/CLEAR_TREATMENT_MATRIX_LIST',  // Called from the BaseTableMixin's mount()
      loadList: 'ReferenceData/LOAD_TREATMENT_MATRIX_PIVOT_HTML'
    }),

    print() {
      this.showSpinner = true
      this.printReport(this.getPrintHeader)
      this.showSpinner = false
    },

    async exportToExcel() {
      this.$store.dispatch('ReferenceData/LOAD_TREATMENT_MATRIX_PIVOT_EXCEL').then(res => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(new Blob([res]))
        link.download = "treatment_matrix.xlsx"
        link.click()
        URL.revokeObjectURL(link.href)
      })
    },
  },

  computed: {
    ...mapState({
      pivot: (state) => state.ReferenceData.treatmentMatrixPivot,
    }),
    ...mapGetters('ReferenceData', ['treatmentMatrixEditable']),

    tableData() {
      if (!this.pivot) return ''

      const replacements = {
        key: this.$t('label.score'),
        aadt: this.$t('condition.aadt'),
        cracking: this.$t('condition.cracking'),
        potholes: this.$t('label.potholes'),
        rutting: this.$t('condition.rutting'),
        iri: this.$t('condition.iri'),
      };

      /* //TODO: finish it (now it rotates but moves up):
      // Rotate the first column values
      const html = this.pivot.replace(/<tr>\s*<th rowspan="9" valign="top">(.*?)<\/th>/gi, (match, content) => {
        //console.log('match, content', match, content)
        if (content.trim().toLowerCase() !== 'aadt') {
          return match.replace(content, `<div class="text_rotate">${content}</div>`);
        }
        return match;
      });
      */

      // Change the key to the localized versions
      return this.pivot.replace(new RegExp(Object.keys(replacements).join('|'), 'gi'), match => {
        return replacements[match.toLowerCase()];
      });
    },

    getPrintHeader() {
      const today = new Date().toLocaleDateString()
      const matrixElement = this.$el.querySelector('#matrix');
      const prtHtml = !matrixElement ? '' : matrixElement.innerHTML.replace(/<button[^>]*>.*?<\/button>/g, ''); //remove Buttons

      return `<h4 style='text-align:center'>${this.$t('reports.reports_title')}</h4>
              <h4 style='text-align:center'>${this.$t('route.treatment_matrix')} ${this.$t('label.as_on')}${today}</h4>
              ${prtHtml}`
    },
  },
}
</script>
<style lang="scss">
$table-cell-padding: .5rem; // default in bs5
$table-cell-padding-sm: .25rem; // default in bs5

.md-card {
  margin: 0px 0;
}

.text_rotate {
  rotate: -90deg;
  white-space: pre;
  width: 50px;
  text-align: center;
  padding: 0px;
}

#matrix table {
  border: 0.5px solid;
  border-collapse: collapse;
}

#matrix td,
#matrix th {
  border: 0.5px solid;
}
</style>