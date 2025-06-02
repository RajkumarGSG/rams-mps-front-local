<!--
File: TrafficImportForm.vue
Description: form for bulk import/upload of Traffic data.
-->
<template>
  <div class="md-layout">
    <md-card>
      <md-card-content>
        <div class="md-layout">

          <div class="md-layout-item md-small-size-100 md-size-30">
            <RegionsDropdown v-model="selected_region" />
          </div>
          <div class="md-layout-item md-small-size-100 md-size-30">
            <RoadsDropdown v-model="selected_road" :regionId="selected_region" :disabled='!selected_region' />
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item md-small-size-100 md-size-30">
            <SectionsDropdown v-model="selected_section" :regionId="selected_region" :roadId="selected_road"
              :isRequired="true" :disabled='!selected_region' />
          </div>
          <div class="md-layout-item md-small-size-10.0 md-size-20">
            <md-field class='section-select-dropdown'>
              <label>{{ $t('upload.type') }}</label>
              <md-select v-model.number='uploadType' type="text" required name="uploadType" id="uploadType">
                <md-option v-for='(types) in uploadTypes' :key='types' :value='types'>
                  {{ types }}
                </md-option>
              </md-select>
            </md-field>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item md-small-size-10.0 md-size-20">
            <md-field>
              <label>{{ $t('selections.select_file') }}</label>
              <md-file v-model="fileName.name" @md-change="onFileUpload($event)" />
            </md-field>
          </div>
        </div>
      </md-card-content>
      <div class="md-layout-item md-size-100 text-right">
        <!--md-just-icon-->
        <md-button class="md-success md-raised" native-type="preview" required @click.native.prevent="validate"
          :disabled="preview_disabled">
          {{ $t('buttons.preview') }}
        </md-button>
      </div>
    </md-card>
    <md-card>
      <md-card-header class="md-card-header-icon md-card-header-green">
      </md-card-header>

      <md-card-content>
        <div>
          <table id="content" class="display table" width="100%">
            <tbody>
              <tr v-for="data in this.content">
                <td> {{ data }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </md-card-content>

      <md-card-actions md-alignment="space-between">
        <div class="md-layout-item md-size-100 text-right">
          <!--<md-field class="text">
              <label>{{ $t('upload.comments') }}</label>
              <md-input v-model="comments" type="text" data-vv-name="comments"></md-input>
            </md-field>-->
          <md-button class="md-success" native-type="submit" @click.native.prevent="upload" :disabled="!readyToUpload">
            <md-icon>upload</md-icon>
            {{ $t('buttons.confirm_upload') }}
          </md-button>
          <md-button class="md-accent" @click.stop.prevent="onCancel">
            {{ $t('buttons.cancel') }}
          </md-button>
        </div>

      </md-card-actions>
    </md-card>
  </div>
</template>
<script>
  import { RegionsDropdown, RoadsDropdown, SectionsDropdown } from '@/pages/Components'
  import messagesMixin from '@/mixins/messagesMixin'

  export default {
    name: 'bulk-upload',
    mixins: [messagesMixin],

    data() {
      return {
        formName: 'TrafficImportForm',
        eligible: false,

        selected_region: null,
        selected_road: null,
        selected_section: null,
        uploadTypes: [this.$t("GPS"), this.$t("Traffic Sites"), this.$t("Traffic Intensity")],
        uploadType: null,
        content: [],
        trafficFile: null,
        fileName: { name: '', },
        readyToUpload: false,
        comments: null,
        maxFileSize: 5000 * 1024,   // in KB, TODO: later change to ge it from RDB Lookup
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
      onFileUpload(evt) {
        this.trafficFile = evt[0]
      },

      validate() {
        const fileInfo = `"Name: ${this.trafficFile.name}<br>Size: ${this.trafficFile.size}`
        let errDesc = ''
        if (this.trafficFile.type.includes("image")) {
          errDesc = this.$t('The file type is wrong!')
        }
        else if (this.trafficFile.size > this.maxFileSize) {
          errDesc = this.$t('The file is too big!')
        }
        else { // Try to read 10 first lines and show its contens
          const reader = new FileReader()
          var tenLines = []
          reader.onload = (res) => {
            const lines = res.target.result.split('\n');
            this.content = lines.slice(0, 10);
          };
          reader.onerror = (err) => console.log(err);
          reader.readAsText(this.trafficFile);
          return
        }

        // file did not pass the check
        this.errorMessage(`${errDesc}<br>${fileInfo}`)
        this.trafficFile = null
      },

      upload() {
        // call the real upload API
      },
    },

    computed: {
      preview_disabled() {
        return this.selected_road === null || this.selected_section === null ||
          this.uploadType === null || this.trafficFile === null
      }
    }
  }
</script>
<style lang="scss" scoped>
.cell-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .md-button {
    margin: 3px 0;
    min-width: 100px;
  }
}

.md-card {
  margin: 0px 0;
}

.md-table-head-label {
  padding-right: 0;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.md-card .md-card-actions {
  border: 0;
  margin-left: 20px;
  margin-right: 20px;
}

.md-button+.md-button {
  margin-left: 10px;
}
</style>