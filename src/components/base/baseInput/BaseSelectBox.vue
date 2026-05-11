<template>
  <div class="base_select_box" :class="`base_select_box--${variant}`" ref="wrapperRef" tabindex="0" @blur="closePopup">
    <div class="base_select_box__display" @click="togglePopup">
      <span class="base_select_box__text">{{ currentLabel }}</span>
      <div class="icon_down" :class="{ 'rotate-180': isOpen }"></div>
    </div>
    
    <Transition name="fade-slide">
      <ul class="base_select_box__dropdown shadow-box" v-if="isOpen" @mousedown.prevent>
        <li 
          v-for="opt in options" 
          :key="opt.value" 
          class="base_select_box__item"
          :class="{'selected': opt.value === modelValue, 'highlighted': highlightedValue === opt.value}"
          @click.stop="selectOption(opt.value)"
          @mouseenter="highlightedValue = opt.value"
        >
          <span class="item-label">{{ opt.label }}</span>
          <span 
            v-if="opt.value === modelValue"
            class="icon_check"
          ></span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  variant: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['update:modelValue'])

const wrapperRef = ref(null)
const isOpen = ref(false)
const highlightedValue = ref(null)

const currentLabel = computed(() => {
  const f = props.options.find(o => o.value === props.modelValue)
  return f ? f.label : ''
})

const togglePopup = () => {
  isOpen.value = !isOpen.value
}

const closePopup = () => {
  isOpen.value = false
}

const selectOption = (val) => {
  emit('update:modelValue', val)
  closePopup()
}

const handleClickOutside = (e) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    closePopup()
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<style scoped>
.base_select_box {
  position: relative;
  display: inline-block;
  user-select: none;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}
.base_select_box--default {
  border: 1px solid #e0e0e0;
  background-color: #fff;
  height: 32px;
  width: 70px;
  border-radius: 4px;
}
.base_select_box--borderless {
  border: none;
  background-color: transparent;
  width: auto;
  height: auto;
}
.base_select_box__display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #111;
  font-size: 14px;
  font-weight: 400;
  height: 100%;
  padding: 0 4px;
}

.base_select_box--borderless .base_select_box__display {
  color: #7a8188;
  font-size: 13px;
  padding: 0;
  gap: 4px;
}

.base_select_box__dropdown {
  position: absolute;
  bottom: calc(100% + 4px); /* Hiển thị ngoi lên trên form do form nằm ở Footer vướng đáy */
  left: 0;
  min-width: 100%;
  margin: 0;
  padding: 4px 0;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  list-style: none;
}

.base_select_box__item {
  display: flex;
  justify-content: start; /* Như thiết kế, chữ canh giữa */
  align-items: center;
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.base_select_box__item:hover, .base_select_box__item.highlighted {
  background-color: #eafbf2;
}
.base_select_box__item.selected {
  background-color: #eafbf2;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
.base_select_box__dropdown li{
  display: flex;
  justify-content: space-between;
}
</style>
