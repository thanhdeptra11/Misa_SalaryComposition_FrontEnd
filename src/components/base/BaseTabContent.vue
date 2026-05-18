<template>
  <div class="base_tab_content">
    <div class="base_tab_content__header" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="base_tab_content__tab"
        :class="{
          'base_tab_content__tab--active': isActive(tab.key),
          'base_tab_content__tab--disabled': tab.disabled
        }"
        :disabled="tab.disabled"
        role="tab"
        :aria-selected="isActive(tab.key)"
        :tabindex="isActive(tab.key) ? 0 : -1"
        @click="handleChangeTab(tab)"
      >
        <slot name="tab-label" :tab="tab" :active="isActive(tab.key)">
          {{ tab.label }}
        </slot>
      </button>
    </div>

    <div
      class="base_tab_content__body"
      :style="{ maxHeight: bodyMaxHeight }"
    >
      <template v-for="tab in tabs" :key="tab.key">
        <div
          v-show="isActive(tab.key)"
          class="base_tab_content__panel"
          role="tabpanel"
        >
          <slot :name="String(tab.key)" :tab="tab" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    default: () => []
     // Mảng các tab, mỗi tab có dạng:
    // { key: string|number, label: string, disabled?: boolean }
  },
  modelValue: {
    type: [String, Number],
    default: ''
    // Key của tab đang active, dùng với v-model
  },
  bodyMaxHeight: {
    type: String,
    default: '280px'
     // Giới hạn chiều cao phần body, quá thì scroll
  }
})
 // Để v-model hoạt động: emit key tab mới khi đổi tab
 // Thông báo cho cha biết tab vừa đổi, kèm object tab
const emit = defineEmits(['update:modelValue', 'change'])
const enabledTabs = computed(() =>
  props.tabs.filter((tab) => !tab.disabled)
)

const fallbackTabKey = computed(() =>
  enabledTabs.value[0]?.key ?? ''
)

const activeTabKey = computed(() => {
  const isValidTab = props.tabs.some(
    (tab) => tab.key === props.modelValue && !tab.disabled
  )

  return isValidTab ? props.modelValue : fallbackTabKey.value
})

watch(
  [() => props.tabs, () => props.modelValue],
  () => {
    const isValidTab = props.tabs.some(
      (tab) => tab.key === props.modelValue && !tab.disabled
    )

    if (!isValidTab && fallbackTabKey.value !== '') {
      emit('update:modelValue', fallbackTabKey.value)
    }
  },
  {
    immediate: true,
    deep: true
  }
)

const isActive = (key) => activeTabKey.value === key

const handleChangeTab = (tab) => {
  if (tab.disabled || tab.key === activeTabKey.value) return

  emit('update:modelValue', tab.key)
  emit('change', tab)
}
</script>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;

.base_tab_content {
  width: 100%;
  background-color: #ffffff;
  border: 1px solid $border-gray;
  border-radius: 4px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

  &__header {
    display: flex;
    align-items: center;
    gap: 24px;
    height: 48px;
    padding: 0 24px;
    border-bottom: 1px solid $border-gray;
  }

  &__tab {
    position: relative;
    height: 48px;
    padding: 0;
    border: none;
    background: transparent;
    color: $main-text-color;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &::after {
      content: '';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 3px;
      border-radius: 2px 2px 0 0;
      background-color: transparent;
    }

    &--active {
      color: $primary-green;
      font-weight: 700;

      &::after {
        background-color: $primary-green;
      }
    }

    &--disabled {
      color: #a0a0a0;
      cursor: not-allowed;
    }
  }

  &__body {
    overflow-y: auto;
  }

  &__panel {
    padding: 0 16px;
  }
}
</style>