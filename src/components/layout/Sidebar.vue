<template>
  <div class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }" :style="sidebarStyle">
    <div class="sidebar_item_list">
      <div class="sidebar_content">
        <BaseSidebarMenu
          :items="menuItems"
          :activeKey="activeKey"
          :collapsed="isCollapsed"
          @select="handleSelect"
        />
      </div>
    </div>
    <button class="sidebar_toggle" type="button" @click="toggleSidebar">
      <div class="sidebar_toggle_icon" :class="isCollapsed ? 'icon_toggle_right' : 'icon_toggle_left'"></div>
      <span class="sidebar_toggle_text">{{ isCollapsed ? '' : 'Thu gọn' }}</span>
    </button>
  </div>
</template>
<script setup>
import BaseSidebarMenu from '@/components/base/BaseSidebarMenu.vue'
import { computed, ref } from 'vue'

const EXPANDED_WIDTH = 233
const COLLAPSED_WIDTH = 72

const activeKey = ref('candidates')
const isCollapsed = ref(false)
// Tính toán chiều rộng của sidebar
const sidebarStyle = computed(() => ({
  width: `${isCollapsed.value ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px`,
}))

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleSelect = (item) => {
  activeKey.value = item.key
}

const menuItems = [
  {
    key: 'general',
    title: 'Tổng quan',
    iconClass: 'icon_general',
  },
  {
    key: 'salary_composition',
    title: 'Thành phần lương',
    iconClass: 'icon_salary_composition',
  },
  {
    key: 'salary_sample',
    title: 'Mẫu bảng lương',
    iconClass: 'icon_salary_sample',
  },
  {
    key: 'salary_data',
    title: 'Dữ liệu tính lương',
    iconClass: 'icon_salary_data',
  },
  {
    key: 'salary_calculate',
    title: 'Tính lương',
    iconClass: 'icon_salary_calculate',
  },
  {
    key: 'salary_afford',
    title: 'Chi trả',
    iconClass: 'icon_salary_afford',
  },
  {
    key: 'report',
    title: 'Báo cáo',
    iconClass: 'icon_report',
  },
  {
    key: 'setting',
    title: 'Thiết lập',
    iconClass: 'icon_setting',
  }
]
</script>
<style lang="scss" scoped>
.sidebar {
  position: relative;
  background-color: rgba(0, 0, 0, 0.6509803922);
  backdrop-filter: blur(14px);
  background-image: url(https://amisplatform.misacdn.net/apps/payroll/static/img/slidebar-30-4.92017f7.png);
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: contain;
  overflow: hidden;
  transition:
    width 0.28s ease,
    box-shadow 0.28s ease;

  &_item_list {
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    padding-top: 32px;
    padding-bottom: 72px;
    transition: padding 0.28s ease;
  }

  &_content {
    height: calc(100% - 56px);
  }

  &_toggle {
    position: absolute;
    bottom: 16px;
    height: 40px;
    width: calc(100% - 48px);
    left: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffffb3;
    border: none;
    cursor: pointer;
    box-sizing: border-box;
    transition:
      width 0.28s ease,
      left 0.28s ease,
      background-color 0.28s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.18);
    }

    &_icon {
      flex-shrink: 0;
      transition: transform 0.28s ease;
    }

    &_text {
      margin-left: 12px;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      opacity: 1;
      transform: translateX(0);
      transition:
        opacity 0.2s ease,
        transform 0.28s ease,
        margin 0.28s ease;
    }
  }

  &--collapsed {
 
    .sidebar_toggle {
      width: 48px;
      left: 12px;
    }

    .sidebar_toggle_text {
      margin-left: 0;
      opacity: 0;
      pointer-events: none;
    }
  }
}
</style>
