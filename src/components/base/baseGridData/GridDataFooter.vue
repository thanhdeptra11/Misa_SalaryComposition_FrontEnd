<template>
  <div class="grid_data_footer">
    <div class="grid_data_footer__left">
      Tổng: <strong>{{ totalRecords }}</strong> bản ghi
    </div>
    
    <div class="grid_data_footer__right">
      <span class="label">Số bản ghi/trang</span>
      
      <BaseSelectBox 
        v-model="internalPageSize"
        :options="pageSizeOptions"
      />
      
      <span class="grid_data_footer__page_info">
        {{ recordStart }} - {{ recordEnd }} bản ghi
      </span>
      
      <div class="grid_data_footer__button">
        <div 
          class="btn_arrow icon_left" 
          :class="{ 'icon_disabled': currentPage === 1 }"
          @click="prevPage"
        ></div>
        <div 
          class="btn_arrow icon_right" 
          :class="{ 'icon_disabled': currentPage >= totalPages }"
          @click="nextPage"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({
  totalRecords: { type: Number, default: 0 },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: [Number, String], default: 25 }
})

const emit = defineEmits(['update:currentPage', 'update:pageSize'])

const pageSizeOptions = [
  { label: '15', value: 15 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
]

const internalPageSize = ref(props.pageSize)

watch(internalPageSize, (newVal) => {
  if (newVal !== props.pageSize) {
    emit('update:pageSize', Number(newVal))
    emit('update:currentPage', 1) // Reset về trang 1 khi đổi số lượng hiển thị
  }
})

watch(() => props.pageSize, (newVal) => {
  internalPageSize.value = newVal
})

const totalPages = computed(() => {
  if (props.totalRecords === 0) return 1
  return Math.ceil(props.totalRecords / internalPageSize.value)
})

const recordStart = computed(() => {
  if (props.totalRecords === 0) return 0
  return (props.currentPage - 1) * internalPageSize.value + 1
})

const recordEnd = computed(() => {
  const end = props.currentPage * internalPageSize.value
  return end > props.totalRecords ? props.totalRecords : end
})

const prevPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('update:currentPage', props.currentPage + 1)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/variables.scss';
.grid_data_footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  background-color: #f9fafb;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;

  &__left {
    font-size: 14px;
    color: #555;
    strong {
      color: #111;
      font-weight: 600;
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    
    .label {
      color: #111;
    }
  }

  &__page_info {
    color: #111;
    margin-left: 8px;
    min-width: 90px;
    text-align: center;
  }

  &__button {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: 8px;

    .btn_arrow {
      cursor: pointer;
      color: #777; /* Màu xám mờ giống thiết kế */
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
      
      &:hover {
        color: #111;
      }
      &.icon_disabled {
        opacity: 0.3;
        cursor: default;
      }
    }
  }
}
</style>
