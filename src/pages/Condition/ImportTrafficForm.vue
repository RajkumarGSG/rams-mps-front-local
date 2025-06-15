<!--
File: ImportTrafficForm.vue
Description: form for bulk import/upload of road data.
-->
<template>
  <div class="md-layout">
    <md-card>
      <md-card-content>
        <div class="md-layout-item md-small-size-100 md-size-20">
          <BaseDropdown
            :label="$t('selections.select_import_type')"
            v-model="selectedImportType"
            :items="importTypesList"
            item-text="description"
            item-value="id"
            @input="onImportTypeChange"
          />

        </div>
        <div class="md-layout-item md-small-size-10.0 md-size-50">
          <md-field>
            <label for="fileName">{{ $t('selections.select_file') }}</label>
            <md-file id="fileName" v-model="fileName.name" @md-change="onFileChange($event)" />
          </md-field>
        </div>
      </md-card-content>

      <md-card-actions md-alignment="space-between">
        <div class="md-layout-item md-size-100 text-right">
          <md-button class="md-success md-raised" @click="templateDownload" :disabled="!selectedImportType">
            {{ $t('buttons.download_template') }}
          </md-button>
          <md-button class="md-success md-raised" native-type="submit" 
            @click.native.prevent="validate" :disabled="uploadDisabled">
            <!-- v-if="isBtnAllowed('ImportButton')" TODO: Uncomment it -->
            <md-icon>upload</md-icon>
            {{ $t('buttons.import') }}
          </md-button>
          <md-button class="md-accent" @click.stop.prevent="onClose">
            {{ $t('buttons.cancel') }}
          </md-button>
        </div>
      </md-card-actions>
    </md-card>

    <md-card v-if="showPreview == true">
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
  import { onClose } from '@/mixins/onCloseMixin'
  import permissions from "@/mixins/permissionsMixin"
  import { successMessage, errorMessage } from '@/mixins/messagesMixin'
  import { BaseDropdown } from '@/pages/Components'

  export default {
    name: 'import-sections',
    mixins: [permissions],

    data() {
      return {
        formName: 'ImportTrafficForm',
        eligible: false,

        importFile: null,
        fileName: { name: '' },
        maxFileSize: 5000 * 1024,   // in KB, TODO: later change to ge it from RDB Lookup
        selectedImportType: null,
        importTypeKey: null,

        showPreview: false,
        status: null,
        batch_id: null,

        uploadInProgress: false,

        importTypesList: [],
      }
    },

    components: {
      BaseDropdown
    },

    methods: {
      ...mapActions({
        importLog: 'ReferenceData/IMPORT_LOG_ALL',
        getImporttypes: 'LOAD_ALL_TRAFFIC_INSTALLATIONS',
        getImportTemplate: 'GET_TRAFFIC_INSTALLATION_IMPORT_TEMPLATE',
      }),
      ...mapActions([
                  'GET_ROAD_IMPORT_TEMPLATE', 
                  'GET_SECTION_IMPORT_TEMPLATE', 
                  'IMPORT_ROAD', 
                  'IMPORT_SECTION', 
                  `GET_TRAFFIC_INSTALLATION_IMPORT_TEMPLATE`,
                  `IMPORT_TRAFFIC_INSTALLATION_EXCEL`
                ]),

      onClose,

      onFileChange(evt) {
        this.importFile = evt[0]
        this.showPreview = false
        this.status = null
      },

     async templateDownload() {
          const importTemplate = `GET_TRAFFIC_INSTALLATION_IMPORT_TEMPLATE`;
          const res = await this[importTemplate]();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(new Blob([res]));
          link.download = `traffic_import_template444.xlsx`;
          link.click();
          URL.revokeObjectURL(link.href);
      },

      async validate() {
        if (!this.selectedImportType) {
          this.$toast?.error?.('Please select an import type');
          return;
        }

        let formData = new FormData();
        formData.append('file', this.importFile);

        try {
          const res = await this.IMPORT_TRAFFIC_INSTALLATION_EXCEL({
            formData,
            trafficInstallationId: this.selectedImportType
          });

          this.status = res.msg + ", " + res.result;
          this.batch_id = res.batch_id;

          await successMessage(this.$t('route.import'), this.$t(`messages.import_file_queued`));

          this.importFile = null;
          this.fileName.name = '';

          await this.get_log(this.batch_id);

          this.uploadInProgress = false;
          this.showPreview = true;

        } catch (error) {
          console.error('Error during import:', error);
          this.uploadInProgress = false;
          await errorMessage(this.$t('errors.import_error'));
        }
      },

      async get_log(batch_id) {
        if (!batch_id) return
        const res = await this.importLog(batch_id)
      },

      onImportTypeChange(key, desc) {
        this.importTypeKey = desc
        this.importFile = null
        this.fileName.name = ''
      },
     async fetchTrafficInstallList() {
        try {
          const res = await this.LOAD_ALL_TRAFFIC_INSTALLATIONS()

          if (Array.isArray(res)) {
            this.importTypesList = res.map(item => ({
              id: item.traffic_install_id,
              description: item.traffic_install_desc
            }))
          } else {
            console.warn('Expected an array but got:', res)
          }
        } catch (err) {
          console.error('Failed to fetch traffic installations:', err)
        }
      }
    },

    async mounted() {
      // Check if we are eligible to view the form
      this.eligible = await this.checkIfScreenAllowed()
      if (!this.eligible) {
        this.onClose()
        return
      };

      const res = await this.getImporttypes();
      if (Array.isArray(res)) {
        this.importTypesList = res.map(item => ({
          id: item.traffic_install_id,
          description: item.traffic_install_desc
        }))
      } else {
        console.warn('Expected an array but got:', res)
      }
      
    },

    computed: {
      ...mapState({
        importStatus: (state) => state.ReferenceData.import_status,
      }),

      uploadDisabled() {
        return this.importFile === null || this.uploadInProgress === true
      }
    }
  }
</script>
<style lang="scss" scoped>
.md-card {
  margin: 0px 0;
}
</style>