<template>
  <div class="base_text_area">
    <label
      v-if="label"
      class="base_text_area__label"
      :style="{ minWidth: labelWidth, width: labelWidth }"
    >
      <b>{{ label }}</b>
      <span v-if="required" class="required">*</span>
    </label>

    <textarea
      ref="textareaRef"
      :id="inputId"
      class="base_text_area__input"
      :placeholder="placeholder"
      :value="modelValue"
      :rows="rows"
      :style="{ width: inputWidth }"
      @input="handleInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: {
    type: String,
    default: ''
  },

  label: {
    type: String,
    default: ''
  },

  placeholder: {
    type: String,
    default: ''
  },

  rows: {
    type: Number,
    default: 4
  },

  required: {
    type: Boolean,
    default: false
  },

  labelWidth: {
    type: String,
    default: '100%'
  },

  inputWidth: {
    type: String,
    default: '100%'
  },

  inputId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'update:modelValue',
  'input',
  'focus',
])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}
</script>
<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;
.base_text_area{
    display: flex;
    align-items: center;
    &__label{
        padding-right: 8px;
    }
    &__input{
        box-sizing: border-box;
        padding: 8px 12px;
        white-space: nowrap;
        border-radius: 4px;
        resize: none;
        outline: none;
        border: 1px solid #e0e0e0 !important;
        caret-color: transparent;
        &:hover{
            border-color: $primary-green !important;
        }
        &:focus{
            border-color: $primary-green !important;
        }
    }
}
</style>