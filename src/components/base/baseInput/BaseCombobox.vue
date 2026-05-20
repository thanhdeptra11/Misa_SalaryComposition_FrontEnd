<!-- Component = inpu + dropdown(dùng để chọn giá trị từ danh sách có thể gõ để filter và loadmore) 
 Các tính năng chính:
  Gõ text -> tự lọc options theo từ khóa
  Click icon -> mở đóng dropdonw
  Chọn 1 option -> emit giá trị qua v-model
  Click ra ngoài -> đóng dropdown, khôi phục text về giá trị đã chọn không giữ text gõ dở
  Scroll đến cuối hỗ trợ lazy loading
  Nếu nhiều cbbox trong 1 trang -> tự đóng khi mở cái mới -->
<template>
  <div class="base-combobox" ref="wrapperRef">
    <label v-if="label"  class="base-combobox-label" :style="{ minWidth: labelWidth, width: labelWidth }">
      <b>{{ label }}</b> <span v-if="required" class="required">*</span>
    </label>
    <div class="base-combobox-wrap">
      <div class="base-combobox-container" 
      :class="{ 'focused': isOpen, 'disabled': disabled, 'error': errorMessage }" 
      :style="{ width: inputWidth }">
        <input
          type="text"
          class="base-combobox-input" 
          :placeholder="placeholder"
          :disabled="disabled"
          v-model="inputValue"
          @focus="openPopup"
          @input="handleInput"
          @blur="$emit('blur')"
        />
        <!-- MISA often uses icon_down for dropdowns -->
        <div class="base-combobox-btn" @click="togglePopup">
          <div class="icon_chervon_down"></div>
        </div>
        
        <!-- Dropdown Popup -->
        <!-- Dùng mousedown vì thứ tự chạy của trình duyệt sẽ chạy trước click -->
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
      <div v-if="errorMessage" class="base-combobox-error is-visible">
        {{ errorMessage }}
      </div>
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
  },
  labelWidth: {
    type: String,
    default: ''
  },
  inputWidth: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'load-more', 'blur'])

const wrapperRef = ref(null)
const isOpen = ref(false)
const inputValue = ref('')
const highlightedValue = ref(null)

const syncInputValue = () => {
  // Khi options load async sau modelValue, cần sync lại label hiển thị
  const selectedOpt = props.options.find((option) => {
    return option.value === props.modelValue;
  });

  if (selectedOpt) {
    inputValue.value = selectedOpt.label;
    return;
  }

  // Nếu không có modelValue thì clear text hiển thị
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    inputValue.value = '';
  }
};

watch(
  () => [props.modelValue, props.options],
  () => {
    syncInputValue();
  },
  {
    immediate: true,
    deep: true
  }
);

/* Cập nhật text input khi modelValue từ ngoài truyền vào (hoặc thay đổi) phải 
watch cả options và modelvalue vì khi edit thì có modelvalue trước options
*/
watch(
  () => props.modelValue,
  () => {
    syncInputValue();
  },
  { immediate: true }
);

watch(
  () => props.options,
  () => {
    syncInputValue();
  },
  { deep: true }
);

// Hàm computed phụ thuộc vào inputValue và props.options khi các giá trị này thay đổi sẽ tính toán lại filteredOptions
const filteredOptions = computed(() => {
  // Không có text tìm kiếm thì trả lại list options
  if (!inputValue.value) return props.options
  
  const selectedOpt = props.options.find(o => o.value === props.modelValue)
  // User mới chỉ chọn chưa gõ tìm kiếm gì
  if (selectedOpt && selectedOpt.label === inputValue.value) {
    return props.options
  }

  // Filter theo input value
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
    // Bắn custom event lên
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
// Document listener gọi hàm
const handleClickOutside = (e) => {
  // Click vào phần tử không trong component đang thao tác
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    // Gọi hàm close
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
  // Lắng nghe sự kiện click ra bên ngoài
  document.addEventListener('mousedown', handleClickOutside)
  // Lắng nghe xem có cb bõ nào khác đang mở không
  window.addEventListener('close-all-comboboxes', closeComboboxEvent)
})
// Unmounted để khi component destroy listener không còn treo trên document
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('close-all-comboboxes', closeComboboxEvent)
})
</script>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;

.base-combobox {
  display: flex;
  align-items: flex-start;
  position: relative;
}

.base-combobox-label {
  font-size: 14px;
  color: #212121;
  display: flex;
  align-items: center;
  white-space: nowrap;
  height: 36px;
  padding-right: 8px;
}

.required {
  color: #ff0000;
}

.base-combobox-container {
  position: relative;
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
    border-color: $primary-green;
  }
  
  &.focused {
    border-color: $primary-green;
  }
  
  &.disabled {
    background-color: #f1f2f5;
    border-color: #e0e0e0 !important;
  }
}

.base-combobox-input {
  padding: 0 12px;
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #111;
  outline: none;
  
  &::placeholder {
    color: #999;
  }
  
  &:disabled {
    color: #999;
  }
  &.error {
    border-color: #ff6161;
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
  background-color: $primary-background;
}

.base-combobox-item.selected {
  background-color: $primary-background;
  color: $primary-green;
}

.base-combobox-empty {
  color: #666;
  text-align: left;
}
.base-combobox-container.error {
  border-color: #ff6161;
}
.base-combobox-error {
  min-height: 18px;
  margin-top: 4px;
  font-size: 12px;
  color: #ff6161;
  visibility: hidden;

  &.is-visible {
    visibility: visible;
  }
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
