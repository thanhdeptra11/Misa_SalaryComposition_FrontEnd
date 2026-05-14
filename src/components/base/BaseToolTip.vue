<template>
    <DxTooltip
            :hide-on-outside-click="false"
            :target="target"
            show-event="mouseenter"
            hide-event="mouseleave"
            :wrapper-attr="{ class: 'tooltip_custom' }"
          >
            {{ content }}
    </DxTooltip>
</template>
<script setup>
    import { DxTooltip } from 'devextreme-vue';
    const props = defineProps({
        target: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    })
</script>
<style lang="scss">
.tooltip_custom.dx-overlay-content {
  background-color: #34B057 !important;
  border: none !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  .dx-popup-content {
    color: #ffffff !important;
    white-space: normal !important;
    max-width: 440px !important;
    text-align: start;
    font-size: 12px;
  }

  .dx-popover-arrow::after {
    background-color: #454545 !important;
    border: none !important;
  }
}
</style>