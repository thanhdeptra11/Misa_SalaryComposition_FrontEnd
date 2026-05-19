<template>
  <div class="base-input-wrapper">
    <label v-if="label" class="base-input-label"
    :style="{ minWidth: labelWidth, width: labelWidth }">
      <b>{{ label }}</b> <span v-if="required" class="required">*</span>
    </label>
    <div class="base-input-container"
    :style="{ width: inputWidth }">
      <input
        :type="type"
        class="base-input-field"
        :disabled="disabled"
        :class="{ 'error': errorMessage, 'disabled': disabled }"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur')"
      />
      <div class="base-input-error" :class="{ 'is-visible': errorMessage }">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  labelWidth: {
    type: String,
    default: '100%'
  },

  inputWidth: {
    type: String,
    default: '100%'
  },
  errorMessage:{
    type: String,
    default: ''
  },
  disabled:{
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue', 'blur'])
</script>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;

.base-input-wrapper {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.base-input-label {
  font-size: 14px;
  color: #212121;
  padding-right: 8px;
  height: 36px;
  display: flex;
  align-items: center;
}

.required {
  color: #ff6161;
}

.base-input-container {
  width: 100%;
}

.base-input-field {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid $border-gray;
  border-radius: 4px;
  font-size: 14px;
  color: #111;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: #999;
  }
  
  &:hover,
  &:focus {
    border-color: $primary-green;
  }
}
.base-input-field.error {
  border-color: #ff6161;
}
.base-input-error {
  min-height: 18px;
  margin-top: 4px;
  font-size: 12px;
  color: #ff6161;
  visibility: hidden;

  &.is-visible {
    visibility: visible;
  }
}
.base-input-field:disabled,
.base-input-field.disabled {
  background-color: #f1f2f5;
  color: #666;
}

.base-input-field:disabled:hover,
.base-input-field:disabled:focus {
  border-color: $border-gray;
}
</style>
