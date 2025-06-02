<!--
File: FloatInput.vue
Description: component for entering floating point numbers
-->
<template>
  <md-field>
    <label>{{ label }}</label>
    <md-input type="number" :step="step" :min="min" :max="max" :value="value" @input="updateValue"
      @keypress="validateInput" :required="required" :disabled="disabled"/>
  </md-field>
</template>

<script>
  export default {
    props: {
      label: { type: String, default: null },
      value: { type: Number, default: 0 },
      min: { type: Number, default: 0 },
      max: { type: Number, default: null },
      step: { type: Number, default: 1 },
      required: { type: Boolean, default: false},
      disabled: { type: Boolean, default: false}
    },
    methods: {
      validateInput(event) {
        const char = String.fromCharCode(event.keyCode || event.which)
        const currentValue = event.target.value

        // Разрешаем только цифры, точку или запятую
        if (!/[\d.,]/.test(char)) { event.preventDefault() }

        // Запрещаем ввод точки или запятой, если они уже есть
        if ((char === '.' || char === ',') && (currentValue.includes('.') || currentValue.includes(','))) {
          event.preventDefault()
        }
      },
      updateValue(value) {
        let newValue = parseFloat(String(value).replace(',', '.'))

        if (isNaN(newValue)) { newValue = 0 }
        if (this.min !== null && newValue < this.min) { newValue = this.min }
        if (this.max !== null && newValue > this.max) { newValue = this.max }
        this.$emit('input', newValue)
      }
    }
  }
</script>
