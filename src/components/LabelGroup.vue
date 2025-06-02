<template>
  <div class="md-layout">
    <span class="label-group-title md-layout-item ">
      <slot name="title"></slot>:
    </span>
    <span class="label-group-content md-layout-item ">
      <slot />
    </span>
  </div>
</template>
<style lang="scss">
@import '@/assets/scss/material-dashboard.scss';

.label-group-title {
  max-width: 300px;
  height: 100%;
  font-weight: 400;
}
.label-group-content {
  text-align: right;
}
</style>
