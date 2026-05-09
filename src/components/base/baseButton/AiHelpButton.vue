<template>
  <div class="ai_help_button" @click="$emit('click')">
    <div class="ai_help_button__icon"></div>
  </div>
</template>
<script setup>
defineEmits(['click'])
</script>
<style lang="scss" scoped>
.ai_help_button {
  box-sizing: border-box;
  width: 36px;
  height: 34px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 6px;
  &__icon {
    width: 24px;
    height: 24px !important;
    background-image: url(https://amisplatform.misacdn.net/apps/recruit2/assets/images/ai-feature/ai-search-candidate.svg);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    position: relative;
    animation: spinFFF 20s infinite;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url(https://amisplatform.misacdn.net/apps/recruit2/assets/images/ai-feature/ai-search-candidate-start.svg);
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      animation: inspinFFF 20s infinite;
    }
  }
  &:hover {
    background-color: #f2f2f2;
    //background-color: #df1717;
    box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.1);
  }
}
</style>
