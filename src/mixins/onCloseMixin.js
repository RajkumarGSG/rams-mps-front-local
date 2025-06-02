// onCloseMixin.js

// Экспортируем метод onClose как отдельную функцию
export function onClose() {
  this.$store.dispatch('USE_HISTORY');
  if (this.closePath) {
    this.$router.push(this.closePath);
  } else {
    //console.log('onClose - no path provided for onClose');
    this.$router.back();
  }
  this.$router.replace({ path: '' });
    
  //this.$store.commit('SET_CLEAR_PATH');
  this.$store.commit('SET_CLEAR_HISTORY');
}

// Экспортируем метод onModalClose как отдельную функцию
export function onModalClose() {
  this.$emit('close');
}
