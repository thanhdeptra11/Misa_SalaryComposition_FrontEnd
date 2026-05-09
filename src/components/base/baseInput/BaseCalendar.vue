<template>
  <div class="base-calendar shadow-box">
    <!-- Header -->
    <div class="calendar-header">
      <div class="calendar-nav icon_left" @click="prevMonth" title="Tháng trước"></div>
      <div class="calendar-title">THÁNG {{ currentMonth }} NĂM {{ currentYear }}</div>
      <div class="calendar-nav icon_right" @click="nextMonth" title="Tháng sau"></div>
    </div>
    
    <!-- Weekdays -->
    <div class="calendar-weekdays">
      <span v-for="day in weekDays" :key="day">{{ day }}</span>
    </div>
    
    <!-- Days Grid -->
    <div class="calendar-grid">
      <div 
        v-for="(day, index) in calendarDays" 
        :key="index"
        class="calendar-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'selected': isSelected(day.date),
          'today': isToday(day.date) && !isSelected(day.date)
        }"
        @click="selectDate(day.date)"
      >
        {{ day.dayNumber }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Date,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const currentDate = ref(new Date())

// Khởi tạo tháng view dựa trên modelValue hoặc hiện tại
onMounted(() => {
  if (props.modelValue) {
    currentDate.value = new Date(props.modelValue)
  }
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Chỉ đổi view tháng nếu ngày chọn nằm ngoài tháng view hiện hành
    if (newVal.getMonth() !== currentMonth.value - 1 || newVal.getFullYear() !== currentYear.value) {
      currentDate.value = new Date(newVal)
    }
  }
})

const currentMonth = computed(() => currentDate.value.getMonth() + 1)
const currentYear = computed(() => currentDate.value.getFullYear())

const weekDays = ['TH 2', 'TH 3', 'TH 4', 'TH 5', 'TH 6', 'TH 7', 'CN']

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
}

const selectDate = (date) => {
  emit('update:modelValue', date)
}

const isSelected = (date) => {
  if (!props.modelValue) return false
  return date.getDate() === props.modelValue.getDate() &&
         date.getMonth() === props.modelValue.getMonth() &&
         date.getFullYear() === props.modelValue.getFullYear()
}

const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value - 1 // 0-11
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Sun, 1 = Mon
  
  // Điều chỉnh để T2 là đầu tuần (0: T2, 6: CN)
  const startOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1
  
  const days = []
  
  // Các ngày của tháng trước
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({
      dayNumber: prevMonthLastDay - i,
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false
    })
  }
  
  // Các ngày trong tháng này
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      dayNumber: i,
      date: new Date(year, month, i),
      isCurrentMonth: true
    })
  }
  
  // Các ngày của tháng sau cho đủ hệ lưới 6 hàng x 7 ngày
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      dayNumber: i,
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    })
  }
  
  return days
})
</script>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;

.base-calendar {
  width: 290px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
  font-family: inherit;
  user-select: none;
}

.shadow-box {
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-title {
  font-weight: 700;
  font-size: 14px;
  color: #111;
  text-transform: uppercase;
}

.calendar-nav {
  cursor: pointer;
  background-color: #111; 
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: background-color 0.2s;
}
.calendar-nav:hover {
  background-color: $primary-blue;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #111;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 2px;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.calendar-cell:hover {
  background-color: #e5efff;
}

.calendar-cell.other-month {
  color: #ccc;
}

.calendar-cell.today {
  color: $primary-blue;
  font-weight: 500;
}

.calendar-cell.selected {
  background-color: $primary-blue;
  color: #ffffff !important;
  font-weight: 500;
}
</style>
