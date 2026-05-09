<template>
  <div class="toolbar_grid">
    <div class="toolbar_grid__left">
      <BaseSearchBox @search="handleSearch" placeholder="Tìm kiếm hoặc nhờ AI trợ giúp">
        <template #aiOption>
          <AiHelpButton @click="handleAiHelpClick" />
        </template>
      </BaseSearchBox>
    </div>
    <div class="toolbar_grid__right">
      <!-- Các nút chức năng khác có thể được thêm vào đây -->
      <BaseButton variant="icon" title="Bộ lọc" iconClass="icon_filter" @click="console.log('Lọc dữ liệu')" />
      <BaseButton variant="icon" title="Xuất khẩu" iconClass="icon_export" @click="console.log('Xuất dữ liệu')" />
      <BaseButton
        variant="icon"
        title="Xem nhanh hoạt động"
        iconClass="icon_interactive_history"
        @click="console.log('Xem lịch sử hoạt động')"
      />
      <BaseButton variant="icon" iconClass="icon_setting_column" @click="console.log('Tùy chỉnh cột hiển thị')" />
    </div>
  </div>
</template>
<script setup>
import BaseSearchBox from '../base/BaseSearchBox.vue'
import AiHelpButton from '../base/baseButton/AiHelpButton.vue'
const emit = defineEmits(['search'])

const handleAiHelpClick = () => {
  // Logic để hiển thị trợ giúp AI
  console.log('Hiển thị trợ giúp AI')
}
const handleSearch = (keyword) => {
  emit('search', keyword)
}
</script>
<style lang="scss" scoped>
.toolbar_grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  height: 36px;
  padding: 16px 24px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  &__left {
    flex: 1;
    min-width: 0;
  }
  &__right {
    display: flex;
    align-items: center;
  }
}
</style>
