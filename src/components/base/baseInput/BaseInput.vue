<template>
  <div class="base-input-wrapper">
    <label v-if="label" class="base-input-label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>
    <div class="base-input-container">
      <input
        :type="type"
        class="base-input-field"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
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
  }
})

defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;

.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.base-input-label {
  font-size: 14px;
  font-weight: 500;
  color: #454545;
}

.required {
  color: #ff0000;
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
    border-color: $primary-blue;
  }
}
</style>
