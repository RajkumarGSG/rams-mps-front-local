<template>
  <md-card class="md-card-login" :class="{'md-card-hidden': cardHidden}">
    <md-card-header :class="getClass(headerColor)">
      <slot name="title"></slot>
    </md-card-header>

    <md-card-content>
      <slot name="langs"></slot>
      <slot name="description"></slot>
      <slot name="form"></slot>
      <slot name="error-info"></slot>
    </md-card-content>

    <md-card-actions>
      <slot name="footer"></slot>
    </md-card-actions>
  </md-card>
</template>

<script>
export default {
  name: 'login-card',
  props: {
    headerColor: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      cardHidden: true
    }
  },

  beforeMount() {
    setTimeout(this.showCard, 400)
  },

  methods: {
    showCard: function() {
      this.cardHidden = false
    },

    getClass: function(headerColor) {
      return 'md-card-header-' + headerColor + ''
    }
  }
}
</script>

<style lang="css"></style>