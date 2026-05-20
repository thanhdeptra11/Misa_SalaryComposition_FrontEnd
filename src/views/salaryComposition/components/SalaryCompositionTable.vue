<!-- Component chỉ phụ trách hiển thị bảng dữ liệu thành phần lương.
Cách hoạt động: 
Danh sách columns và data được truyền vào thông qua props từ component cha.
Bọc bên ngoài component GridData.
Định nghĩa cấu trúc cho cột công thức và trạng thái bằng 2 component 
con SalaryCompositionFormulaCell và SalaryCompositionStatusBadge. 
Emit ra sự kiện selection-change khi có thay đổi lựa chọn hàng 
và row-action khi có thao tác trên hàng (theo dõi, nhân bản, sửa, xóa) 
để component cha xử lý logic tiếp theo.
-->
<template>
  <GridData
    :columns="columns"
    :data="data"
    :actionButtons="actionButtons"
    @selectionChanged="$emit('selection-change', $event)"
    ref="gridRef"
  >
    <template #valueExpressionTemplate="{ value }">
      <SalaryCompositionFormulaCell :value="value" />
    </template>

    <template #statusTemplate="{ row }">
      <SalaryCompositionStatusBadge :status="row.status" />
    </template>
  </GridData>
</template>

<script setup>
import { ref } from 'vue'
import GridData from '@/components/base/baseGridData/GridData.vue'
import SalaryCompositionFormulaCell from './SalaryCompositionFormulaCell.vue'
import SalaryCompositionStatusBadge from './SalaryCompositionStatusBadge.vue'
import { isTracking } from '../utils/salaryCompositionList.helpers.js'

defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, required: true },
})

const emit = defineEmits(['selection-change', 'row-action'])

const gridRef = ref(null)

const actionButtons = [
  {
    hint: (row) => (isTracking(row.status) ? 'Ngừng theo dõi' : 'Theo dõi'),
    icon: (row) => (isTracking(row.status) ? 'icon_minus_yellow' : 'icon_check_green'),
    onClick: (row) => emit('row-action', { type: 'toggle-status', row }),
  },
  {
    hint: 'Nhân bản',
    icon: 'icon_copy_primary',
    onClick: (row) => emit('row-action', { type: 'clone', row }),
  },
  {
    hint: 'Sửa',
    icon: 'icon_pencil',
    onClick: (row) => emit('row-action', { type: 'edit', row }),
  },
  {
    hint: 'Xóa',
    icon: 'icon_trash_red',
    onClick: (row) => emit('row-action', { type: 'delete', row }),
  },
]

const clearSelection = () => {
  if (gridRef.value && gridRef.value.clearSelection) {
    gridRef.value.clearSelection()
  }
}

defineExpose({
  clearSelection,
})
</script>
