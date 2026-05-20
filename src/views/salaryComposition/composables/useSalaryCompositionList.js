import { useGridData } from '@/components/base/composables/useGridData.js'
import salaryCompositionService from '@/services/salaryCompositionService'
import { enumConfigs } from '../constants/salaryCompositionEnums.js'

// Summary: Đóng vai trò trạm trung chuyển, quản lý danh sách thành phần lương, phân trang, tìm kiếm và lọc dữ liệu cho bảng.
// Params: None
// Return: Object chứa state và các hàm thao tác với bảng dữ liệu (tableData, fetchData, handleSearch, vv.)
export function useSalaryCompositionList() {
  const {
    tableData,
    totalRecords,
    searchResults,
    pagingPayload,
    currentPage,
    pageSize,
    fetchData,
    fetchSearchSuggestions,
    selectSearchItem,
    setDefaultableFilter,
    setMultiValueFilter,
  } = useGridData(salaryCompositionService, {
    defaultPageNumber: 1,
    defaultPageSize: 15,
    getSearchTermFromItem: (item) => item.compositionCode,
    enumConfigs,
  })

  const handleSearch = fetchSearchSuggestions
  const handleSelectSearchItem = selectSearchItem

  return {
    tableData,
    totalRecords,
    searchResults,
    pagingPayload,
    currentPage,
    pageSize,
    fetchData,
    handleSearch,
    handleSelectSearchItem,
    setDefaultableFilter,
    setMultiValueFilter,
  }
}
