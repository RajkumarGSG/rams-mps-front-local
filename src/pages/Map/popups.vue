<template>
  <div class="popup" v-show="visible">
    <a
      href="#"
      id="popup-closer"
      v-if="isCloserEnable"
      class="popup-closer"
      @click="onClose"
    ></a>
    <div id="popup-content" class="popup-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    visible: {type: Boolean},
    isCloserEnable: {type: Boolean, default: false}
  },
  data() {
    return {}
  },
  methods: {
    onClose() {
      this.$emit('onClose')
    }
  }
}
</script>
<style lang="scss" scoped>
.popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 200px;
  z-index: 999;

  &:after,
  &:before {
    top: 100%;
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }
  &:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
  }
  &:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
  }
}
.popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
  &:after {
    content: '✖';
  }
}
.popup-content {
  display: flex;
  flex-direction: column;
  font-weight: 400;
}
</style>
