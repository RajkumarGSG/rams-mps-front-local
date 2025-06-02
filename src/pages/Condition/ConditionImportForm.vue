<!--
File: ConditionImportForm.vue
Description: form for bulk import/upload of IRI and Rutting data.
-->
<template>
  <div class="md-layout-item">
    <md-card v-if="eligible">
      <md-card-content>
        <div class="md-layout-item md-small-size-10.0 md-size-50">
          <RegionsDropdown v-model="selected_region" />
        </div>
        <div class="md-layout-item md-small-size-10.0 md-size-50">
          <RoadsDropdown v-model="selected_road" :regionId="selected_region" />
        </div>
        <div class="md-layout-item md-small-size-10.0 md-size-50">
          <SectionsDropdown v-model="selected_section" :regionId="selected_region" :roadId="selected_road" />
        </div>
        <div class="md-layout-item md-small-size-10.0 md-size-50">
          <md-field>
            <label for="fileNameIRI">{{ $t('selections.select') }} {{ $t('upload.iri_file') }}</label>
            <md-file id="fileNameIRI" v-model="fileNameIRI.name" @md-change="onIRIFileUpload($event)" />
          </md-field>
        </div>
        <div class="md-layout-item md-small-size-10.0 md-size-50">
          <md-field>
            <label for="fileNameRut">{{ $t('selections.select') }} {{ $t('upload.rut_file') }}</label>
            <md-file id="fileNameRut" v-model="fileNameRut.name" @md-change="onRutFileUpload($event)" />
          </md-field>
        </div>
      </md-card-content>

      <md-card-actions md-alignment="space-between">
        <div class="md-layout-item md-size-100 text-right">
          <md-button class="md-success md-raised" @click="downloadTemplates">
            {{ $t('buttons.download_template') }}
          </md-button>
          <md-button v-if="isBtnAllowed('ImportButton')" class="md-success md-raised" native-type="submit"
            @click.native.prevent="validate" :disabled="uploadDisabled">
            <md-icon>upload</md-icon>
            {{ $t('buttons.import') }}
          </md-button>
          <md-button class="md-accent" @click.stop.prevent="onClose">
            {{ $t('buttons.cancel') }}
          </md-button>
        </div>

      </md-card-actions>
    </md-card>

    <md-card v-if="show_preview == true">
      <md-card-content>
        <div>
          <span><strong>{{ $t('upload.status') }}: </strong> {{ status }} </span><br>
        </div>
        <md-table v-model="importStatus" md-fixed-header class="paginated-table table-striped table-hover">
          <md-table-row slot="md-table-row" slot-scope="{item}">
            <md-table-cell :md-label="$t('upload.line_number')">
              {{ item.line_number }}
            </md-table-cell>
            <md-table-cell :md-label="$t('upload.type_description')">
              {{ item.type_description }}
            </md-table-cell>
            <md-table-cell :md-label="$t('upload.is_error')">
              {{ item.is_error == true ? $t('buttons.yes') : $t('buttons.no') }}
            </md-table-cell>
            <md-table-cell :md-label="$t('upload.message')" md-sort-by="message" width="10%">
              {{ item.message }}
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-card-content>
    </md-card>
  </div>
</template>
<script>
  import { mapState, mapActions } from 'vuex'
  import permissions from "@/mixins/permissionsMixin"
  import { successMessage, errorMessage } from '@/mixins/messagesMixin'
  import { onClose } from '@/mixins/onCloseMixin'
  import { RegionsDropdown, RoadsDropdown, SectionsDropdown } from '@/pages/Components'

  export default {
    name: 'import-conditions',
    mixins: [permissions],

    data() {
      return {
        formName: 'ConditionImportForm',
        eligible: false,

        content: [],
        importFileIRI: null,
        importFileRut: null,
        fileNameIRI: { name: '', },
        fileNameRut: { name: '', },
        comments: null,
        maxFileSize: 5000 * 1024,   // in KB, TODO: later change to ge it from RDB Lookup

        selected_region: null,
        selected_road: null,
        selected_section: null,

        show_preview: false,
        status: null,
        batch_id: null,

        upload_in_progress: false
      }
    },

    components: {
      RegionsDropdown,
      RoadsDropdown,
      SectionsDropdown
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };
    },

    methods: {
      ...mapActions({
        iriImportTemplate: 'GET_IRI_IMPORT_TEMPLATE',
        ruttingImportTemplate: 'GET_RUTTING_IMPORT_TEMPLATE',
        runImport: 'IMPORT_DATA100',
        importLog: 'ReferenceData/IMPORT_LOG_ALL',
      }),

      onClose,

      onIRIFileUpload(evt) {
        this.importFileIRI = evt[0]
        this.show_preview = false
        this.status = null
      },

      onRutFileUpload(evt) {
        this.importFileRut = evt[0]
        this.show_preview = false
        this.status = null
      },

      async downloadTemplate(fetchFunction, fileName) {
        const res = await fetchFunction();
        const blob = new Blob([res]);
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        URL.revokeObjectURL(link.href);
      },

      async downloadTemplates() {
        await this.downloadTemplate(this.iriImportTemplate, "iri_import_template.xlsx");
        await this.downloadTemplate(this.ruttingImportTemplate, "rutting_import_template.xlsx");
      },

      async validate() {
        const fileInfo = `${this.$t('upload.iri_file')}: ${this.importFileIRI.name},
                          ${this.$t('upload.filesize', { size: this.importFileIRI.size })}<br><br>
                          ${this.$t('upload.rut_file')}: ${this.importFileRut.name}, 
                          ${this.$t('upload.filesize', { size: this.importFileRut.size })}`

        // Checks and validations
        let errors = []
        if (this.importFileIRI.type.includes("image") || this.importFileRut.type.includes("image")) {
          errors.push(`${errors.length + 1}. ${this.$t('messages.wrong_file_type')}`)
        }
        if (this.importFileIRI.size > this.maxFileSize || this.importFileRut.size > this.maxFileSize) {
          errors.push(`${errors.length + 1}. ${this.$t('messages.big_file')}`)
        }

        if (errors.length > 0) {
          errors.push('', fileInfo)
          this.errorMessage(errors.join('<br>'))
          return
        }

        // We passed all validations - let's try to import
        this.upload_in_progress = true
        let formData = new FormData();
        formData.append('file_iri', this.importFileIRI)
        formData.append('file_rutting', this.importFileRut)

        try {
          const res = await this.runImport({ import_files: formData, section_id: this.selected_section })
          this.status = res.msg + ", " + res.result
          this.batch_id = res.batch_id

          await successMessage(this.$t('route.import'), this.$t(`messages.import_file_queued`))
          this.importFileIRI = null
          this.importFileRut = null
          this.fileNameIRI.name = ''
          this.fileNameRut.name = ''
        } catch (err) {
          this.status = err.message
          this.batch_id = err.batch_id
          await errorMessage(this.$t(`errors.import_error`))
        }
        this.get_log(this.batch_id)
        this.upload_in_progress = false
        this.show_preview = true
      },

      async get_log(batch_id) {
        if (!batch_id) return
        const res = await this.importLog(batch_id)
        console.log('Import status', res, this.importStatus)
      },
    },

    computed: {
      ...mapState({
        importStatus: (state) => state.ReferenceData.import_status,
      }),

      uploadDisabled() {
        return !this.importFileIRI || !this.importFileRut || !this.selected_section || this.upload_in_progress
      }
    }
  }
</script>
<style lang="scss" scoped>
.md-card {
  margin: 0px 0;
}
</style>