import { ref } from 'vue';
import { useGridSelection } from '@/components/base/composables/useGridSelection.js';

// Summary: Quản lý trạng thái chọn các dòng (checkbox) trên bảng dữ liệu.
// Params: None
// Return: Object chứa selectedRows, selectedCount, và các hàm hỗ trợ clearSelection.
export function useSalaryCompositionSelection() {
  const {
    selectedRows,
    selectedCount,
    setSelectedRows,
    clearSelection: baseClearSelection
  } = useGridSelection();

  const gridRef = ref(null);

  // Summary: Xóa các dòng đang chọn ở cả state của composable và grid UI.
  // Params: None
  // Return: void
  const handleClearSelection = () => {
    baseClearSelection();
    if (gridRef.value && gridRef.value.clearSelection) {
      gridRef.value.clearSelection();
    }
  };

  return {
    selectedRows,
    selectedCount,
    setSelectedRows,
    gridRef,
    handleClearSelection
  };
}
