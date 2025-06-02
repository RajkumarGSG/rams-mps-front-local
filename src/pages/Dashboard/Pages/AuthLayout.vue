<template>
  <div class="full-page" :class="{ 'nav-open': $sidebar.showSidebar }">
    <div class="wrapper wrapper-full-page" @click="toggleSidebarPage">
      <div class="page-header header-filter" :class="setPageClass" filter-color="black" :style="setBgImage">
        <div class="container md-offset">
          <zoom-center-transition :duration="pageTransitionDuration" mode="out-in">
            <router-view></router-view>
          </zoom-center-transition>
        </div>
        <footer class="footer">
          <div class="container md-offset">
            <div class="copyright text-center" :style="{ width: '100%' }">
              &copy; {{ year }}
              RAMS PROJECT, v. {{ version}}
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
<script>
  import { ZoomCenterTransition } from 'vue2-transitions'

  export default {
    components: {
      ZoomCenterTransition
    },

    props: {
      backgroundColor: {
        type: String,
        default: 'black'
      }
    },

    inject: {
      autoClose: {
        default: true
      }
    },

    data() {
      return {
        responsive: false,
        showMenu: false,
        menuTransitionDuration: 250,
        pageTransitionDuration: 300,
        year: new Date().getFullYear(),
      }
    },

    computed: {
      version(){
        return this.$store.state.version 
      },

      setBgImage() {
        let images = {
          Login: './img/login.jpg',
          Register: './img/register.jpg',
          Lock: './img/lock.jpg'
        }
        return {
          backgroundImage: `url(${images[this.$route.name]})`
        }
      },

      setPageClass() {
        return `${this.$route.name}-page`.toLowerCase()
      }
    },

    methods: {
      toggleSidebarPage() {
        if (this.$sidebar.showSidebar) {
          this.$sidebar.displaySidebar(false)
        }
      },

      toggleSidebar() {
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar)
      },

      closeMenu() {
        document.body.classList.remove('nav-open')
        this.showMenu = false
      },

      onResponsiveInverted() {
        if (window.innerWidth < 991) {
          this.responsive = true
        } else {
          this.responsive = false
        }
      }
    },

    mounted() {
      this.onResponsiveInverted()
      window.addEventListener('resize', this.onResponsiveInverted)
    },

    beforeDestroy() {
      this.closeMenu()
      window.removeEventListener('resize', this.onResponsiveInverted)
    },

    beforeRouteUpdate(to, from, next) {
      // Close the mobile menu first then transition to next page
      if (this.showMenu) {
        this.closeMenu()
        setTimeout(() => {
          next()
        }, this.menuTransitionDuration)
      } else {
        next()
      }
    }
  }
</script>
<style lang="scss" scoped>
$scaleSize: 0.1;
$zoomOutStart: 0.7;
$zoomOutEnd: 0.46;

@keyframes zoomIn8 {
  from {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }

  100% {
    opacity: 1;
  }
}

.wrapper-full-page .zoomIn {
  animation-name: zoomIn8;
}

.link-container {
  z-index: 1000;
  position: absolute;
  top: 0;
  margin-left: auto;
  padding-right: 5px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

@keyframes zoomOut8 {
  from {
    opacity: 1;
    transform: scale3d($zoomOutStart, $zoomOutStart, $zoomOutStart);
  }

  to {
    opacity: 0;
    transform: scale3d($zoomOutEnd, $zoomOutEnd, $zoomOutEnd);
  }
}

.wrapper-full-page .zoomOut {
  animation-name: zoomOut8;
}
</style>
