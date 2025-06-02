<!--
File: Pagination.vue
Description: base component for showing the dropdown combo to be inherited by other dropdowns.
-->
<template>
  <div class="md-layout">
    <div class="md-layout-item md-size-50">
      <p class="card-category">
        {{ additionalInfo }}
      </p>
    </div>
    <div class="md-layout-item md-size-20">
      <p class="card-category">
        {{ $t('label.showing_from_to_of_entries', { from: to > 0 ? from + 1 : 0, to, total }) }}
      </p>
    </div>
    <div class="md-layout-item md-size-10">
      <md-field>
        <label for="pages">{{ $t('label.per_page') }}</label>
        <md-select v-model="itemsPerPage" name="pagesList">
          <md-option v-for="item in perPageOptions" :key="item" :value="item">
            {{ item }}
          </md-option>
        </md-select>
      </md-field>
    </div>
    <div class="md-layout-item md-size-20">
      <pgn class="pagination-no-border pagination-success" v-model="pages.currentPage" :per-page="itemsPerPage"
        :total="total" />
    </div>
  </div>
</template>
<script>
  import { Pagination as pgn } from '@/components'

  const defaultValue = {
    currentPage: { default: 1, type: Number },
    from: { default: 0, type: Number },
    to: { default: 0, type: Number },
  }

  const defaultPerPageOptions = [5, 10, 25, 50, 100]

  export default {
    name: 'Pagination',

    props: {
      value: { type: Object, default: defaultValue },
      perPage: { type: Number, default: 5 },
      perPageOptions: { type: Array, default: () => defaultPerPageOptions },
      total: { type: Number, default: 0 },
      additionalInfo: { type: String, default: '' }
    },

    components: {
      pgn,
    },

    data() {
      return {
        pages: this.value || defaultValue,
        itemsPerPage: this.perPage || 5
      }
    },

    async mounted() {
    },

    methods: {
      emitChange(){
        //console.log('emitChange', this.pages)
        this.$emit('pageChanged', this.pages)
      }
    },

    computed: {
      from() {
        this.pages.from = this.itemsPerPage * (this.pages.currentPage - 1)
        this.emitChange();
        return this.pages.from
      },

      to() {
        let highBound = this.from + this.itemsPerPage
        if (this.total < highBound) {
          highBound = this.total
        }
        this.pages.to = highBound
        this.emitChange();
        return highBound
      },
    },

    watch: {
      itemsPerPage() {
        this.emitChange();
      }
    }
  }
</script>