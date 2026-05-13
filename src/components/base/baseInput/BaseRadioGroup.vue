<template>
    <div class="base_radio_group">
        <!-- Vòng lặp qua các radio item -->
         <label 
         v-for="otp in options"
         :key="otp.value"
         class="base_radio_group__item">
            <input type="radio"
            class="radio_input"
            :value="otp.value"
            :checked="modelValue === otp.value"
            @change="emit('update:modelValue', otp.value)">
            <!-- Radio custom -->
            <div class="radio_custom">
                <div class="radio_button">
                    <div v-if="modelValue === otp.value"
                    class="icon_radio_checked"></div>
                    <div v-else class="icon_radio_uncheck"></div>
                </div>
                <span class="radio_label">{{ otp.label }}</span>
            </div>
            
        </label>
        <slot name="option-content"></slot>
    </div>
</template>
<script setup>
const props = defineProps({
    options: {
        type: Array,
        default: () => []
    },
    modelValue: {
        type: [String, Number],
        default: ''
    }
})
const emit = defineEmits(['update:modelValue'])
</script>
<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;
.base_radio_group {
    display: flex;
    align-items: center;
    .base_radio_group__item {
        display: flex;
        align-items: center;
        white-space: nowrap;
        cursor: pointer;
        .radio_label {
            font-size: 14px;
            color: #111;
        }
        input[type="radio"] {
            display: none;
        }
        .radio_custom{
            display: flex;
            align-items: center;
            padding-left: 32px;
            .radio_button{
                display: flex;
                align-items: center;
                width: 30px;
                height: 30px;
            }
        }
    }
}
.base_radio_group__item:first-child .radio_custom{
    padding-left: 0;
}
</style>