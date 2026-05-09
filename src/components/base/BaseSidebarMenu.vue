<template>
  <div class="sidebar_menu">
    <div
      v-for="item in items"
      :key="item.key"
      class="sidebar_menu__item"
      :class="{ 'sidebar_menu__item--active': activeKey === item.key }"
      :title="collapsed ? item.title : ''"
      @click="$emit('select', item)"
    >
      <div class="sidebar_menu__icon">
        <div class="icon" :class="item.iconClass"></div>
      </div>
      <span class="sidebar_menu__title">{{ item.title }}</span>
    </div>
  </div>
</template>
<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  activeKey: {
    type: String,
    default: '',
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select'])
</script>
<style lang="scss" scoped>
@import '@/assets/variables.scss';

.sidebar_menu {
  display: flex;
  flex-direction: column;

  &__item {
    box-sizing: border-box;
    color: #ffffffb3;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 40px;
    padding: 8px 12px;
    border-radius: 8px;
    margin-left: 12px;
    margin-right: 12px;
    margin-bottom: 4px;
    cursor: pointer;
    transition:
      background-color 0.25s ease,
      margin 0.28s ease,
      padding 0.28s ease,
      gap 0.28s ease;

    &--active {
      background-color: $primary-green;
      color: #ffff !important;
    }

    &:hover {
      background-color: $hover-green;
    }

    &--active:hover {
      background-color: $primary-green;
      color: #ffff !important;
    }
  }

  &__icon {
    width: 20px;
    min-width: 20px;
    height: 18px;
    margin-right: 8px;
    flex-shrink: 0;
  }

  &__title {
    color: inherit;
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    opacity: 1;
    max-width: 140px;
    transform: translateX(0);
    transition:
      opacity 0.18s ease,
      max-width 0.28s ease,
      transform 0.28s ease;
  }
}

.sidebar_menu__item--active .icon {
  background-color: #ffff !important;
}

.sidebar_menu__item--active .icon_knowledge {
  background-color: unset !important;
}
</style>
