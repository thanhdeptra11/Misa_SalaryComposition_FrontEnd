<template>
    <div class="base_check_box">
        <div class="base_check_box__custom_checkbox"
        @click="handleChangeCustomCheckBox">
            <div v-if="modelValue" class="icon_square_check_primary"></div>
            <div v-else class="icon_square_default"></div>
        </div>
        <span class="checkbox__label">{{ label }}</span>
    </div>
</template>
<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const handleChangeCustomCheckBox = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>
<style lang="scss" scoped>
@import '@/assets/variables.scss';
.base_check_box {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    // Ẩn input mặc định
    &__checkbox{
        display: none;
    }
}
</style>