<!-- Hiển thị badge hiển thị trạng thái hoạt động của thành phần lương trong bảng dữ liệu -->
<template>
  <span
    v-if="isTracking(status)"
    style="color: #00a85a; display: flex; align-items: start; gap: 4px"
  >
    Đang theo dõi
  </span>
  <span
    v-else-if="status !== null && status !== undefined"
    style="color: #ff9800; display: flex; align-items: start; gap: 4px"
  >
    Ngừng theo dõi
  </span>
  <span v-else>-</span>
</template>

<script setup>
import { isTracking } from '../utils/salaryCompositionList.helpers.js'

const props = defineProps({
  status: {
    type: [Number, Boolean, String],
    default: null,
  },
})
</script>
