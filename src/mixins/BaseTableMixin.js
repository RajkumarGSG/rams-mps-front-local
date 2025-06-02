import { mapState } from 'vuex'
import Fuse from 'fuse.js'
import permissions from "./permissionsMixin"
import listView from './listViewMixin'

export default {
  mixins: [permissions, listView],

  data() {
    return {
      eligible: false,
      showSpinner: false,
      showDetailsDlg: false,
      selectedRegion: null,
      currentId: null,
      loadingHistory: false,

      // Эти поля должны быть переопределены в компоненте
      formName: '',
      idFieldName: '',
      propsToSearch: [],
      payload: {},

      pagination: {
        perPage: 10,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50, 100],
        total: 0
      },
      searchQuery: '',
      currentSort: '',
      currentSortOrder: 'asc',
      fuseSearch: null,
    }
  },

  async mounted() {
    await this.initializeTable()
  },

  methods: {
    toggleSpinner(state) {
      this.showSpinner = state
    },

    async initializeTable() {
      this.eligible = await this.checkIfScreenAllowed();
      if (!this.eligible) {
        this.onClose();
        return;
      };

      this.showSpinner = true;
      await this.clearList(); // Empty the data
      this.historyMapping.pagination = this.pagination;
      const reloadNeeded = await this.restoreHistory(this.historyMapping);
      this.showSpinner = false;
      if (reloadNeeded) await this.reloadData();
    },

    async restoreHistory(mapping) {
      this.loadingHistory = true;
      let reloadNeeded = true;
      const history = await this.loadHistory();
 console.log('history', history)
      if (history.form === this.formName && history.use) {
        Object.keys(mapping).forEach((key) => {
          this[key] = history.data[key] ?? mapping[key]; // Если нет значения, берём из mapping
        });
  
        this.$nextTick(() => {
          if (mapping.searchQuery !== undefined) {
            this.searchQuery = history.data.searchQuery ?? mapping.searchQuery;
          }
          if (mapping.pagination !== undefined) {
            this.pagination = history.data.pagination ?? mapping.pagination;
            //this.pagination.currentPage = history.data.currentPage ?? mapping.pagination.currentPage;
          }
        });
  
        this.clearHistory();
        reloadNeeded = false;
      };
      this.loadingHistory = false;
      return reloadNeeded;
    },
    
    async reloadData() {
      try {
        this.showSpinner = true
        await this.loadList(this.payload)
        this.fuseSearch = new Fuse(this.tableData, {
          keys: this.propsToSearch,
          threshold: 0.1
        })
      } catch (error) {
        console.error('Error loading items:', error)
      } finally {
        this.showSpinner = false
      }
    },

    saveHistory2(keys, formName) { //}, use = true) {
      const historyData = {};
  
      keys.forEach((key) => {
        historyData[key] = this[key]; // Запоминаем текущее состояние переданных свойств
      });
  
      const history = {
        form: formName || this.formName,
        use: Boolean(formName),
        data: historyData,
        closePath: formName ? window.location.pathname : null // current URL path
      };
      console.log('saveHistory2', history)
      this.saveHistory(history)
    },

    save_history() {
      const hist = {
        form: this.formName,
        data: {
          selectedRegion: this.selectedRegion,
          searchQuery: this.searchQuery,
          currentSort: this.currentSort,
          currentSortOrder: this.currentSortOrder,
          perPage: this.pagination.perPage,
          currentPage: this.pagination.currentPage,
        }
      }
      this.saveHistory(hist)
    },

    viewItem(id = null) {
      this.currentId = id
      this.showDetailsDlg = true
    },
  },

  computed: {
    ...mapState({
      highlightedRow: (state) => state.History.row
    }),

    queriedData() {
      const result = this.searchedData
      return result.slice(this.from, this.to)
    },
  }
}