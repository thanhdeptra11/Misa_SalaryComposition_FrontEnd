<template>
  <div class="base-datepicker-wrapper">
    <!-- Phần Header: Label gắn liền Dropdown format -->
    <div class="date-header">
      <label v-if="label" class="base-input-label">
        {{ label }} <span v-if="required" class="required">*</span>
      </label>
      <BaseSelectBox 
        v-model="activeFormat" 
        :options="formatOptions"
        variant="borderless"
      />
    </div>

    <!-- Phần Input Field & Calendar Popup -->
    <div class="date-input-container" ref="containerRef">
      <input
        type="text"
        class="date-input-field"
        :placeholder="currentPlaceholder"
        v-model="inputValue"
        @focus="openCalendar"
        @input="handleManualInput"
        @blur="handleBlur"
      />
      <div class="divider"></div>
      <div class="icon_calendar btn-calendar" @click="toggleCalendar"></div>
      
      <!-- Popup Calendar -->
      <Transition name="fade-slide">
        <div v-if="isOpen" class="calendar-popup" @mousedown.prevent>
          <BaseCalendar v-model="selectedDate" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import BaseCalendar from './BaseCalendar.vue'

const props = defineProps({
  modelValue: {
    type: [String, Date],
    default: null
  },
  label: {
    type: String,
    default: 'Ngày sinh'
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const formatOptions = [
  { label: 'Ngày tháng năm', value: 'dd/MM/yyyy' },
  { label: 'Tháng năm', value: 'MM/yyyy' },
  { label: 'Năm', value: 'yyyy' }
]

const activeFormat = ref('dd/MM/yyyy')
const inputValue = ref('')
const selectedDate = ref(null)
const isOpen = ref(false)
const containerRef = ref(null)

const currentPlaceholder = computed(() => activeFormat.value)

// Format Helper
const formatDate = (date, format) => {
  if (!date) return ''
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  
  if (format === 'dd/MM/yyyy') return `${d}/${m}/${y}`
  if (format === 'MM/yyyy') return `${m}/${y}`
  if (format === 'yyyy') return `${y}`
  return ''
}

// Chuyển string nhập tay sang Date object
const parseDate = (str, format) => {
  if (!str) return null
  const parts = str.split('/')
  
  let y, m, d
  
  if (format === 'dd/MM/yyyy' && parts.length === 3) {
    d = parseInt(parts[0], 10)
    m = parseInt(parts[1], 10) - 1
    y = parseInt(parts[2], 10)
  } else if (format === 'MM/yyyy' && parts.length === 2) {
    d = 1
    m = parseInt(parts[0], 10) - 1
    y = parseInt(parts[1], 10)
  } else if (format === 'yyyy' && parts.length === 1) {
    d = 1
    m = 0
    y = parseInt(parts[0], 10)
  } else {
    return null
  }
  
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  const date = new Date(y, m, d)
  // Check validity
  if (date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) {
    return date
  }
  return null
}

// Cập nhật khi user đổi Options
watch(activeFormat, (newFormat) => {
  if (selectedDate.value) {
    inputValue.value = formatDate(selectedDate.value, newFormat)
    emit('update:modelValue', inputValue.value)
  }
})

// Cập nhật khi modelValue thay đổi từ Parent Component
watch(() => props.modelValue, (newVal) => {
  if (newVal !== inputValue.value) {
    inputValue.value = newVal || ''
    selectedDate.value = parseDate(newVal, activeFormat.value)
  }
}, { immediate: true })

// Cập nhật khi user chọn Date từ Calendar Popup
watch(selectedDate, (newDate) => {
  if (newDate) {
    inputValue.value = formatDate(newDate, activeFormat.value)
    emit('update:modelValue', inputValue.value)
    isOpen.value = false // Tự đóng sau khi chọn lịch
  }
})

// Khi user chủ động type (Manual input)
const handleManualInput = (e) => {
  const str = e.target.value
  const parsed = parseDate(str, activeFormat.value)
  if (parsed) {
    selectedDate.value = parsed // Render lên Calendar
    emit('update:modelValue', str)
  } else {
    emit('update:modelValue', str) // Vẫn trả về string thô nếu đang gõ dở
  }
}

// Xử lý khi blur ra ngoài nếu gõ sai định dạng -> reset hoặc clear
const handleBlur = () => {
  if (inputValue.value) {
    const parsed = parseDate(inputValue.value, activeFormat.value)
    if (parsed) {
      inputValue.value = formatDate(parsed, activeFormat.value)
    } else {
      // Tuỳ nghiệp vụ: Nếu sai format có thể báo đỏ hoặc clear. Giữ nguyên theo ý User
    }
  }
}

const toggleCalendar = () => {
  isOpen.value = !isOpen.value
}
const openCalendar = () => {
  isOpen.value = true
}
const closeCalendarMenu = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', closeCalendarMenu))
onUnmounted(() => document.removeEventListener('mousedown', closeCalendarMenu))
</script>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;

.base-datepicker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.base-input-label {
  font-size: 14px;
  font-weight: 500;
  color: #1e2633;
}

.required {
  color: #ff0000;
}

.date-input-container {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
  border: 1px solid $border-gray;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.2s ease;
  
  &:hover, &:focus-within {
    border-color: $primary-blue;
  }
}

.date-input-field {
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
}

.divider {
  width: 1px;
  height: 36px;
  background-color: #e0e0e0;
}

.btn-calendar {
  margin: 0 10px;
  cursor: pointer;
  background-color: #7a8188;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: $primary-blue;
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
  transform: translateY(4px);
}

.calendar-popup {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 1000;
}
</style>
