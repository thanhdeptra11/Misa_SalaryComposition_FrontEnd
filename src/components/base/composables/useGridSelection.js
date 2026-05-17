/*
GridData              -> báo đang chọn những dòng nào
useGridSelection      -> giữ selectedRows, selectedCount, clearSelection
GridDataToolbar       -> nếu selectedCount > 0 thì hiện cụm bulk-action và ẩn toolbar-right
*/ 
import { computed, ref } from 'vue';

export const useGridSelection = () => {
  const selectedRows = ref([]);

  const selectedCount = computed(() => selectedRows.value.length);
  const hasSelection = computed(() => selectedCount.value > 0);

  const setSelectedRows = (rows) => {
    selectedRows.value = rows;
  };

  const clearSelection = () => {
    selectedRows.value = [];
  };

  return {
    selectedRows,
    selectedCount,
    hasSelection,
    setSelectedRows,
    clearSelection
  };
};