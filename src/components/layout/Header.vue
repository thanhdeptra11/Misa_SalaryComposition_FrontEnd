<template>
  <header class="header">
    <div class="header--left">
      <div class="icon icon_app_switcher"></div>
      <div class="header--brand">
        <img
          src="https://amisplatform.misacdn.net/apps/payroll/static/img/Logo_30-4.a5741a5.svg?v=R62"
          alt="logo"
        />
        <span class="header--brand_name">Tiền lương</span>
      </div>
      <BaseHeaderSearch placeholder="Tìm kiếm" class="header--search" />
    </div>
    <div class="header--right">
      <div class="icon icon_cart"></div>
      <div class="icon icon_chat_agent"></div>
      <div class="icon icon_speaker"></div>
      <BaseHeaderIconGroup class="header--right_icon_group" />
      <BaseAvatarHeader src="" alt="User Avatar" name="John Doe" />
    </div>
  </header>
</template>
<script setup>
import BaseHeaderSearch from '../base/BaseHeaderSearch.vue'
import BaseHeaderIconGroup from '../base/BaseHeaderIconGroup.vue'
import BaseAvatarHeader from '../base/BaseAvatarHeader.vue'
</script>
<style lang="scss" scoped>
$primary-color: #2680eb;
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding-right: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #1e2633;
  &--left {
    position: relative;
    height: 100%;
    padding-left: 16px;
    display: flex;
    align-items: center;
    gap: 20px;
    background-repeat: no-repeat;
    flex-shrink: 0; //chặn co header left
  }
  &--brand {
    display: flex;
    align-items: center;
    gap: 8px;
    &_name {
      font-size: 18px;
      font-weight: 700;
      color: #1f1f1f;
      margin-left: 8px;
      margin-right: 8px;
    }
  }
  &--right {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 14px;
    color: #1e2633;
    height: 48px;
    .recruitment_page_redirect {
      margin-right: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 400;
    }
  }
}
.icon_chat_agent{
  margin-left: 8px;
  margin-right: 8px;
}
</style>
