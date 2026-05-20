import { ref, computed, watch } from 'vue'
import enumService from '@/services/enumService'
import organizationService from '@/services/organizationService'
import { GLOBAL_CONSTANTS } from '@/constants/globalConstants'
import { getHighestSelectedOrgIds } from '../utils/salaryCompositionList.helpers.js'

// Summary: Quản lý các trạng thái và options cho bộ lọc (trạng thái, đơn vị) của danh sách thành phần lương.
// Params: Object chứa các hàm setDefaultableFilter, setMultiValueFilter từ useGridData
// Return: Object chứa các state và hàm để fetch dữ liệu cho bộ lọc (currentStatus, currentUnits, fetchStatusOptions, vv.)
export function useSalaryCompositionFilters({ setDefaultableFilter, setMultiValueFilter }) {
  const currentStatus = ref(99)
  const currentUnits = ref([])
  const statusOptions = ref([])
  const unitOptions = ref([])
  // Summary: Gọi API lấy danh sách trạng thái theo dõi từ enumService.
  // Params: None
  // Return: Promise<void>, cập nhật mảng statusOptions.
  const fetchStatusOptions = async () => {
    try {
      const data = await enumService.getEnumByName('FollowStatus')
      if (data && Array.isArray(data)) {
        statusOptions.value = data.map((item) => ({
          label: item.description,
          value: item.value,
        }))
        // Cập nhật giá trị hiện tại nếu giá trị đang có không nằm trong danh sách
        if (
          statusOptions.value.length > 0 &&
          !statusOptions.value.some((o) => o.value === currentStatus.value)
        ) {
          currentStatus.value = statusOptions.value[0].value
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu FollowStatus:', error)
    }
  }

  // Summary: Gọi API lấy danh sách phòng ban từ organizationService.
  // Params: None
  // Return: Promise<void>, cập nhật mảng unitOptions.
  const fetchUnitOptions = async () => {
    try {
      const data = await organizationService.getOrganizations()
      if (data && Array.isArray(data)) {
        unitOptions.value = data
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu phòng ban:', error)
    }
  }

  // Computed tính toán để chỉ lấy id các đơn vị cấp cao nhất
  const highestSelectedIds = computed(() => {
    return getHighestSelectedOrgIds(currentUnits.value, unitOptions.value)
  })

  // Watch để theo dõi đơn vị để build filter
  watch(highestSelectedIds, async (newVals) => {
    await setMultiValueFilter({
      property: 'organization_id',
      values: newVals,
      dataType: 'string',
    })
  })

  // Watch để theo dõi trạng thái để build filter
  watch(currentStatus, async (newVal) => {
    await setDefaultableFilter({
      property: 'status',
      value: newVal,
      defaultValue: GLOBAL_CONSTANTS.DEFAULT_STATUS_FILTER,
      dataType: 'number',
    })
  })

  return {
    currentStatus,
    currentUnits,
    statusOptions,
    unitOptions,
    fetchStatusOptions,
    fetchUnitOptions,
  }
}
