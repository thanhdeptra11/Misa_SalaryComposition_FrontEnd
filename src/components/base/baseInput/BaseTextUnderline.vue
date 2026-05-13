<template>
  <div class="base_text_underline">
    <label :style="{ minWidth: labelWidth, width: labelWidth}"><b>{{ label }}</b></label>
    <input 
    :style="{ minWidth: inputWidth, width: inputWidth}"
    type="text" :value="modelValue" @input="emit('update:modelValue', $event.target.value)">
  </div>
</template>

<script setup>


const props = defineProps({
  label: { type: String, default: '' },
  modelValue: { type: String, default: '' },
  labelWidth: { type: String, default: 'auto' },
  inputWidth: { type: String, default: 'auto' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;

.base_text_underline {
  display: flex;
  align-items: center;
  line-height: 35px;
  input {
    padding-left: 5px;
    padding-bottom: 5px;
    border: none;
    border-bottom: 1px solid #e3e5ee;
    outline: none;
  }
}
</style>