<template>
  <md-toolbar md-elevation="0" class="md-transparent" :class="{
    'md-toolbar-absolute md-white md-fixed-top': $route.meta.navbarAbsolute
  }">
    <div class="md-toolbar-row">
      <div class="md-toolbar-section-start md-toolbar-offset">
        <!-- Merge with the Title of the screen by Piouslin's comment -->
        <h3 class="title">{{ $t(`route.${$route.name.toLowerCase()}`) }}</h3>
      </div>
      <div class="md-toolbar-section-end">
        <md-button class="md-just-icon md-round md-simple md-toolbar-toggle" :class="{ toggled: $sidebar.showSidebar }"
          @click="toggleSidebar">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </md-button>

        <div class="md-collapse">
          <md-list>
            <li class="md-list-item">
              <a href="#" class="md-list-item-router md-list-item-container md-button-clean dropdown">
                <div class="md-list-item-content">
                  <drop-down direction="down">
                    <md-button slot="title" class="md-button md-just-icon md-simple" data-toggle="dropdown">
                    </md-button>
                  </drop-down>
                </div>
              </a>
            </li>
            <li class="md-list-item">
              <a href="#" class="md-list-item-router md-list-item-container md-button-clean dropdown">
                <div class="md-list-item-content">
                  <drop-down direction="down">
                    <md-button slot="title" class="md-button md-just-icon md-simple" data-toggle="dropdown">
                      <md-icon>person</md-icon>
                      <p class="hidden-lg hidden-md">Profile</p>
                    </md-button>
                    <ul class="dropdown-menu dropdown-menu-right">
                      <li>
                        {{ $t('users.change_language') }}
                        <div slot="langs" class="lang-buttons">
                          <md-button v-for="locale in locales" :key="locale" @click="switchLocale(locale)"
                            class="md-primary md-just-icon ms-sm" :class="{ 'md-simple': locale !== activeLocale }">
                            {{ locale }}
                          </md-button>
                        </div>
                      </li>
                      <li>
                        <md-button class="md-simple md-success md-lg" @click="onLogout">
                          {{ $t('users.logout') }}
                        </md-button>
                      </li>
                      <li>
                        <div>{{ $t('label.version') }}: {{ version }}</div>
                        <div>Env: {{ theEnv }}</div>
                        <div>{{ $t('label.db_name') }}: {{ getDBName }}</div>
                        <div>{{ $t('label.config') }}: {{ getEnvConfig }}</div>
                      </li>
                    </ul>
                  </drop-down>
                </div>
              </a>
            </li>
          </md-list>
        </div>
      </div>
    </div>
  </md-toolbar>
</template>

<script>
  import { mapState, mapActions, mapGetters } from 'vuex'

  export default {
    data() {
      return {}
    },

    async mounted() {
      await this.$store.getSysInfo;
      //console.log(res, this.getDBName, this.getEnvConfig)
    },

    methods: {
      ...mapActions({
        logout: 'LOGOUT',
        getSysInfo: 'GET_SYSINFO'
      }),

      async onLogout() {
        await this.logout
        this.$router.push('/login')
      },

      toggleSidebar() {
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar)
      },

      minimizeSidebar() {
        if (this.$sidebar) {
          this.$sidebar.toggleMinimize()
        }
      },

      switchLocale(code) {
        this.$store.commit('CHANGE_LANG', code)
        this.$router.go();
      }
    },

    computed: {
      ...mapState({
        version: (state) => state.version,
      }),
      ...mapGetters(['getDBName', 'getEnvConfig']),

      locales() {
        return Object.keys(this.$i18n.messages)
      },

      activeLocale() {
        return this.$i18n.locale
      },

      theEnv() {
        return `${process.env.VUE_APP_ENV} (${process.env.NODE_ENV})`
      }
    }
  }
</script>
<style lang="scss" scoped>
h3 {
  text-align: center;
  font-weight: bold;
  margin-top: 5px;
}
</style>