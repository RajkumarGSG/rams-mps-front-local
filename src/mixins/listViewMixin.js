// File: /mixins/listViewMixin.js
import { mapState, mapActions } from 'vuex'
import { onClose } from '@/mixins/onCloseMixin'
import { customSortMixin } from '@/mixins/customSortMixin';
import { deleteConfirmation, deletedMessage, errorMessage } from '@/mixins/messagesMixin'

export default {
  mixins: [customSortMixin],

  methods: {
    ...mapActions({
      loadHistory: 'LOAD_HISTORY',
      saveHistory: 'SAVE_HISTORY',
      setHistory: 'USE_HISTORY',
      clrHistory: 'CLEAR_HISTORY',
      highlightRow: 'HIGHLIGHT_ROW'
    }),

    onClose,

    clearHistory() {
      // Set the timer for highlighting for 5 sec
      if (this.highlightedRow) setTimeout(() => { this.clrHistory() }, 5000);
    },

    scrollToHighlightedRow() {
      this.$nextTick(() => {
        const highlightedRowElement = document.getElementById('highlightedRow');
        if (highlightedRowElement) {
          highlightedRowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },

    async deleteItem(id, descr) {
      this.save_history();
      const { value } = await deleteConfirmation(descr);
      if (!value) {
        return;
      };
      try {
        await this.delete(id);
        this.reloadData();
        await deletedMessage(descr);
      } catch (err) {
        await errorMessage(err.message || this.$t('errors.unknown_error'));
      };
    }
  },

  computed: {
    ...mapState({
      highlightedRow: (state) => state.History.row
    }),

    queriedData() {
      const result = this.searchedData;
      return result.slice(this.from, this.to);
    },

    rowsCount() {
      return this.tableData.length;
    },

    searchedData() {
      if (!this.rowsCount) {
        return [];
      } else {
        return (!this.searchQuery || !this.fuseSearch) ? this.tableData : this.fuseSearch.search(this.searchQuery);
      };
    },

    total() {
      return this.searchedData.length;
    },

    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },

    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      };
      return highBound;
    },
  },

  watch: {
    async highlightedRow(newVal) {
      if (newVal) {
        await this.reloadData();
        // calculate - which page edited item belongs to
        const ind = this.searchedData.findIndex(item => item[this.idFieldName] == newVal);
        this.pagination.currentPage = Math.ceil(ind / this.pagination.perPage) || 1;
        this.scrollToHighlightedRow();
        this.clearHistory();
      };
    },
  }
}