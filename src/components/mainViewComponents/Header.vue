<template>
  <div class="header">
    <div class="header_left">
      <slot name="left">
        <span v-if="title" class="header_title">{{ title }}</span>
      </slot>
    </div>
    <div class="header_right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/variables.scss';
.header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  box-sizing: border-box;

  &_left {
    display: flex;
    align-items: center;
  }

  &_title {
    color: $main-text-color; /* Màu chữ được điều chỉnh để hiển thị trên nền sáng như hình */
    font-size: 20px;
    font-weight: 700;
    padding-top: 8px;
    flex-shrink: 0;
  }
  
  &_right {
    display: flex;
    align-items: center;
    gap: 12px; /* Khoảng cách giữa các button */

    /* Sử dụng :deep() để style áp dụng được cho nội dung bên trong slot */
    :deep(.header_right__double_button) {
      display: flex;
      align-items: center;

      .header_right__double_button__btnAdd {
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
      }

      .header_right__double_button__btnDown {
        width: 40px !important;
        height: 36px !important;

        border: 0px !important;
        border-left: 1px solid rgb(98 98 98 / 50%) !important;
        margin-left: 0px !important;

        border-top-right-radius: 4px !important;
        border-bottom-right-radius: 4px !important;
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;

        padding: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
