<template>
    <div class="base_radio">
        <label>
            <div class="base_radio__item">
                <input type="radio"
                class="radio_input"
                :value="value"
                :checked="modelValue === value"
                @change="emit('update:modelValue', value)">
                <!-- Radio custom -->
                <div class="radio_custom">
                    <div
                        class="radio_button"
                        :class="{
                            'icon_radio_checked': modelValue === value,
                            'icon_radio_uncheck': modelValue !== value
                        }">
                    </div>
                    <span class="radio_label">{{ label }}</span>
                </div>
            </div>
        </label>
    </div>
</template>
<script setup>
const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    value: {
        type: [String, Number],
        default: ''
    },
    label: {
        type: String,
        default: ''
    }
})
const emit = defineEmits(['update:modelValue'])
</script>
<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;
.base_radio{
    display: flex;
    align-items: center;
    .base_radio__item {
        display: flex;
        align-items: center;
        white-space: nowrap;
        cursor: pointer;
        .radio_label {
            margin-left: 5px;
            font-size: 14px;
            color: #111;
        }
        input[type="radio"] {
            display: none;

        }
        .radio_custom{
            display: flex;
            align-items: center;
            .radio_button{
                display: flex;
                align-items: center;
            }
        }
    }
}
</style>