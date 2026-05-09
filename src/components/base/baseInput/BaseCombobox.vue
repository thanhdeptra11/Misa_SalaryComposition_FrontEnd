<template>
  <div class="base-combobox" ref="wrapperRef">
    <label v-if="label" class="base-combobox-label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>
    
    <div class="base-combobox-container" :class="{ 'focused': isOpen, 'disabled': disabled }">
      <input
        type="text"
        class="base-combobox-input"
        :placeholder="placeholder"
        :disabled="disabled"
        v-model="inputValue"
        @focus="openPopup"
        @input="handleInput"
      />
      <!-- MISA often uses icon_down for dropdowns -->
      <div class="base-combobox-btn" @click="togglePopup">
        <div class="icon_down" :class="{ 'rotate-180': isOpen }"></div>
      </div>
      
      <!-- Dropdown Popup -->
      <Transition name="fade-slide">
        <ul v-if="isOpen" class="base-combobox-dropdown shadow-box" @scroll="handleScroll">
          <li v-if="filteredOptions.length === 0" class="base-combobox-empty">
            Không có dữ liệu để hiển thị
          </li>
          <li 
            v-else
            v-for="opt in filteredOptions" 
            :key="opt.value" 
            class="base-combobox-item"
            :class="{ 'selected': opt.value === modelValue, 'highlighted': highlightedValue === opt.value }"
            @mousedown.prevent="selectOption(opt)"
            @mouseenter="highlightedValue = opt.value"
          >
            {{ opt.label }}
          </li>
        </ul>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Chọn giá trị'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'load-more'])

const wrapperRef = ref(null)
const isOpen = ref(false)
const inputValue = ref('')
const highlightedValue = ref(null)

// Cập nhật text input khi modelValue từ ngoài truyền vào (hoặc thay đổi)
watch(() => props.modelValue, (newVal) => {
  const selectedOpt = props.options.find(o => o.value === newVal)
  if (selectedOpt) {
    inputValue.value = selectedOpt.label
  } else {
    inputValue.value = ''
  }
}, { immediate: true })

const filteredOptions = computed(() => {
  if (!inputValue.value) return props.options
  
  // Nếu Text Input đang khớp chuẩn với Option đang chọn thì hiển thị toàn list (Trường hợp vừa click chọn)
  const selectedOpt = props.options.find(o => o.value === props.modelValue)
  if (selectedOpt && selectedOpt.label === inputValue.value) {
    return props.options
  }

  // Filter case-insensitive
  const query = inputValue.value.toLowerCase().trim()
  return props.options.filter(opt => opt.label.toLowerCase().includes(query))
})

const openPopup = () => {
  if (props.disabled) return
  if (!isOpen.value) {
    window.dispatchEvent(new CustomEvent('close-all-comboboxes'))
    isOpen.value = true
  }
}

const togglePopup = () => {
  if (props.disabled) return
  if (!isOpen.value) {
    window.dispatchEvent(new CustomEvent('close-all-comboboxes'))
  }
  isOpen.value = !isOpen.value
}

const closePopup = () => {
  // Khi Blur ra ngoài, phục hồi lại Text theo giá trị đã chọn chuẩn xác (tránh user gõ bậy rồi bấm click ra ngoài)
  const selectedOpt = props.options.find(o => o.value === props.modelValue)
  if (selectedOpt) {
    inputValue.value = selectedOpt.label
  } else {
    inputValue.value = ''
    emit('update:modelValue', '')
  }
  
  isOpen.value = false
  highlightedValue.value = null
}

const handleInput = () => {
  if (props.disabled) return
  if (!isOpen.value) {
    window.dispatchEvent(new CustomEvent('close-all-comboboxes'))
  }
  isOpen.value = true
  highlightedValue.value = null
}

const selectOption = (opt) => {
  inputValue.value = opt.label
  emit('update:modelValue', opt.value)
  isOpen.value = false
}

const handleClickOutside = (e) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    closePopup()
  }
}

const handleScroll = (e) => {
  const target = e.target
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 5) {
    emit('load-more')
  }
}

const closeComboboxEvent = () => {
  if (isOpen.value) isOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('close-all-comboboxes', closeComboboxEvent)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('close-all-comboboxes', closeComboboxEvent)
})
</script>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;

.base-combobox {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Khoảng cách từ label xuống input */
  width: 100%;
  position: relative;
}

.base-combobox-label {
  font-size: 14px;
  font-weight: 500;
  color: #1e2633;
}

.required {
  color: #ff0000;
}

.base-combobox-container {
  width: 100%;
  height: 36px;
  border: 1px solid $border-gray;
  border-radius: 4px;
  background-color: #fff;
  display: flex;
  align-items: center;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  
  &:hover {
    border-color: $primary-blue;
  }
  
  &.focused {
    border-color: $primary-blue;
  }
  
  &.disabled {
    background-color: #f1f2f5;
    border-color: #e0e0e0 !important;
  }
}

.base-combobox-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 12px;
  font-size: 14px;
  color: #111;
  outline: none;
  
  &::placeholder {
    color: #999;
  }
  
  &:disabled {
    color: #999;
  }
}

.base-combobox-btn {
  width: 32px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.disabled .base-combobox-btn {
  cursor: not-allowed;
  opacity: 0.5;
}

.icon_down {
  transition: transform 0.2s;
}
.icon_down.rotate-180 {
  transform: rotate(180deg);
}

/* Dropdown List */
.base-combobox-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px 0;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  list-style: none;
  z-index: 1000;
  /* Kích hoạt thanh cuộn */
  max-height: 250px;
  overflow-y: auto;
}
.shadow-box {
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
}

.base-combobox-item,
.base-combobox-empty {
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
}

.base-combobox-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.base-combobox-item:hover,
.base-combobox-item.highlighted {
  background-color: #e5efff;
}

.base-combobox-item.selected {
  background-color: #e5efff;
  color: $primary-blue;
}

.base-combobox-empty {
  color: #666;
  text-align: left;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
